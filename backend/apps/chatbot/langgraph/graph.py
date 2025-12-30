"""
LangGraph 對話流程
採用全路由架構 + PostgreSQL 持久化：Classifier → Expert Agents
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

from .agents import AgentManager
from .classifier import IntentClassifier


# 定義狀態結構
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    classification: Dict[str, Any]
    article_content: str


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


class ConversationGraph:
    """對話處理流程圖 - 全路由架構 + 持久化記憶"""

    def __init__(self, db_url: str):
        """
        初始化對話流程圖

        Args:
            db_url: PostgreSQL 連線字串
        """
        self.db_url = db_url
        self.checkpointer = create_checkpointer(db_url)
        self.classifier = IntentClassifier()
        self.agent_manager = AgentManager()
        self.graph = self._build_graph()

    def _classifier_node(self, state: AgentState, config: RunnableConfig) -> dict:
        """Node: 意圖分類"""
        callbacks = config.get('callbacks', [])
        classification = self.classifier.classify(state['messages'], callbacks)

        return {'classification': classification}

    def _operator_support_node(self, state: AgentState, config: RunnableConfig) -> dict:
        """Node: 介面支援 Agent"""
        agent = self.agent_manager.get_agent('operator_support')
        callbacks = config.get('callbacks', [])
        response = agent.process(state['messages'], callbacks)

        return {'messages': [AIMessage(content=response)]}

    def _cer_cognitive_support_node(self, state: AgentState, config: RunnableConfig) -> dict:
        """Node: 認知支援 Agent"""
        agent = self.agent_manager.get_agent('cer_cognitive_support')
        callbacks = config.get('callbacks', [])

        article_content = state.get('article_content', '')

        response = agent.process(state['messages'], callbacks, article_content=article_content)

        return {'messages': [AIMessage(content=response)]}

    def _scoring_node(self, state: AgentState, config: RunnableConfig) -> dict:
        """Node: CER 評分 Agent"""
        agent = self.agent_manager.get_agent('cer_scoring')
        callbacks = config.get('callbacks', [])

        article_content = state.get('article_content', '')

        response = agent.process(state['messages'], callbacks, article_content=article_content)

        return {'messages': [AIMessage(content=response)]}

    def _route_decision(
        self, state: AgentState
    ) -> Literal['operator_support', 'cer_cognitive_support', 'cer_scoring']:
        """條件邊：根據分類結果決定路由"""
        classification = state.get('classification', {})
        intent = classification.get('next_action', 'operator_support')

        # 直接回傳分類結果,預設為 operator_support
        if intent in ['operator_support', 'cer_cognitive_support', 'cer_scoring']:
            return intent
        else:
            return 'operator_support'

    def _build_graph(self):
        workflow = StateGraph(AgentState)

        # 加入節點
        workflow.add_node('classifier', self._classifier_node)
        workflow.add_node('operator_support', self._operator_support_node)
        workflow.add_node('cer_cognitive_support', self._cer_cognitive_support_node)
        workflow.add_node('cer_scoring', self._scoring_node)

        # 設定流程
        workflow.add_edge(START, 'classifier')
        workflow.add_conditional_edges(
            'classifier',
            self._route_decision,
            {
                'operator_support': 'operator_support',
                'cer_cognitive_support': 'cer_cognitive_support',
                'cer_scoring': 'cer_scoring',
            },
        )
        workflow.add_edge('operator_support', END)
        workflow.add_edge('cer_cognitive_support', END)
        workflow.add_edge('cer_scoring', END)

        return workflow.compile(checkpointer=self.checkpointer)

    def process_message(
        self,
        user_input: str,
        mind_map_data: Dict[str, Any],
        article_content: str,
        thread_id: str,
        callbacks: List[Any] = None,
    ) -> dict:
        """
        處理使用者訊息

        Args:
            user_input: 使用者輸入
            mind_map_data: 心智圖資料 (nodes 和 edges)
            article_content: 文章內容（從 template 取得）
            thread_id: 對話執行緒 ID (對應 map_id)
            callbacks: LangChain callbacks

        Returns:
            dict: 包含處理結果的狀態
        """
        config = {'configurable': {'thread_id': thread_id}, 'callbacks': callbacks}

        inputs = {
            'messages': [
                HumanMessage(
                    content=json.dumps(
                        {'query': user_input, 'context': {'mind_map_data': mind_map_data}},
                        ensure_ascii=False,
                    )
                )
            ],
            'classification': {},
            'article_content': article_content,
        }

        return self.graph.invoke(inputs, config=config)
