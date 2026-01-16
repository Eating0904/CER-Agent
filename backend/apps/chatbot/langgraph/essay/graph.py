"""
Essay LangGraph 對話流程
採用全路由架構 + PostgreSQL 持久化：Classifier → Essay Support/Scoring Agents
"""

import json
import operator
from typing import Annotated, Any, Dict, List, Literal, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, START, StateGraph
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from .agents.manager import EssayAgentManager
from .classifier import EssayIntentClassifier


# 定義狀態結構
class EssayAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    classification: Dict[str, Any]
    article_content: str
    agent_metadata: Dict[str, Any]


def create_checkpointer(db_url: str) -> PostgresSaver:
    """建立 PostgreSQL checkpointer"""
    conn_pool = ConnectionPool(
        conninfo=db_url,
        max_size=20,
        kwargs={
            'autocommit': True,
            'prepare_threshold': 0,
            'row_factory': dict_row,
        },
    )
    checkpointer = PostgresSaver(conn_pool)
    checkpointer.setup()

    return checkpointer


class EssayConversationGraph:
    """Essay 對話處理流程圖"""

    def __init__(self, db_url: str):
        self.db_url = db_url
        self.checkpointer = create_checkpointer(db_url)
        self.classifier = EssayIntentClassifier()
        self.agent_manager = EssayAgentManager()
        self.graph = self._build_graph()

    def _classifier_node(self, state: EssayAgentState, config: RunnableConfig) -> dict:
        """Node: 意圖分類"""
        callbacks = config.get('callbacks', [])
        classification = self.classifier.classify(state['messages'], callbacks)

        return {'classification': classification}

    def _essay_support_node(self, state: EssayAgentState, config: RunnableConfig) -> dict:
        """Node: Essay 寫作引導"""
        agent = self.agent_manager.get_agent('essay_support')
        callbacks = config.get('callbacks', [])

        article_content = state.get('article_content', '')

        response, metadata = agent.process(
            state['messages'], callbacks, article_content=article_content
        )

        return {
            'messages': [
                AIMessage(content=response, additional_kwargs={'message_type': 'essay_support'})
            ],
            'agent_metadata': metadata,
        }

    def _essay_scoring_node(self, state: EssayAgentState, config: RunnableConfig) -> dict:
        """Node: Essay 評分"""
        agent = self.agent_manager.get_agent('essay_scoring')
        callbacks = config.get('callbacks', [])

        article_content = state.get('article_content', '')

        response, metadata = agent.process(
            state['messages'], callbacks, article_content=article_content
        )

        return {
            'messages': [
                AIMessage(content=response, additional_kwargs={'message_type': 'essay_scoring'})
            ],
            'agent_metadata': metadata,
        }

    def _route_decision(self, state: EssayAgentState) -> Literal['essay_support', 'essay_scoring']:
        """條件邊：根據分類結果決定路由"""
        classification = state.get('classification', {})
        intent = classification.get('next_action', 'essay_support')

        if intent in ['essay_support', 'essay_scoring']:
            return intent
        else:
            return 'essay_support'

    def _build_graph(self):
        workflow = StateGraph(EssayAgentState)

        # 加入節點
        workflow.add_node('classifier', self._classifier_node)
        workflow.add_node('essay_support', self._essay_support_node)
        workflow.add_node('essay_scoring', self._essay_scoring_node)

        # 設定流程
        workflow.add_edge(START, 'classifier')
        workflow.add_conditional_edges(
            'classifier',
            self._route_decision,
            {
                'essay_support': 'essay_support',
                'essay_scoring': 'essay_scoring',
            },
        )
        workflow.add_edge('essay_support', END)
        workflow.add_edge('essay_scoring', END)

        return workflow.compile(checkpointer=self.checkpointer)

    def process_message(
        self,
        user_input: str,
        mind_map_data: Dict[str, Any],
        essay_content: str,
        article_content: str,
        thread_id: str,
        callbacks: List[Any] = None,
    ) -> dict:
        """
        處理使用者訊息

        Args:
            user_input: 使用者輸入
            mind_map_data: 心智圖資料 (nodes 和 edges，簡化版)
            essay_content: Essay 內容
            article_content: 文章內容（從 template 取得）
            thread_id: 對話執行緒 ID (對應 essay-{map_id})
            callbacks: LangChain callbacks

        Returns:
            dict: 包含處理結果的狀態
        """
        config = {'configurable': {'thread_id': thread_id}, 'callbacks': callbacks}

        inputs = {
            'messages': [
                HumanMessage(
                    content=json.dumps(
                        {
                            'query': user_input,
                            'context': {
                                'mind_map_data': mind_map_data,
                                'essay_content': essay_content,
                            },
                        },
                        ensure_ascii=False,
                    )
                )
            ],
            'classification': {},
            'article_content': article_content,
            'agent_metadata': {},
        }

        return self.graph.invoke(inputs, config=config)
