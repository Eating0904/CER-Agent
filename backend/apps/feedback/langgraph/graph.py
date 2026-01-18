"""
Feedback Graph - 簡化版 LangGraph 流程
"""

import json
import operator
from typing import Annotated, Any, Dict, List, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.graph import END, START, StateGraph
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from .agent import FeedbackAgent


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


# 定義狀態結構
class FeedbackState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    article_content: str  # 新增此欄位


class FeedbackGraph:
    def __init__(self, db_url: str):
        """初始化 Feedback Graph"""
        self.agent = FeedbackAgent()
        self.checkpointer = create_checkpointer(db_url)
        self.graph = self._build_graph()

    def _feedback_node(self, state: FeedbackState, config: RunnableConfig) -> dict:
        """Node: 生成 feedback"""
        callbacks = config.get('callbacks', [])
        article_content = state.get('article_content', '')

        response = self.agent.process(
            state['messages'],
            article_content=article_content,
            callbacks=callbacks,
        )

        return {'messages': [AIMessage(content=response)]}

    def _build_graph(self):
        """建立 Graph 結構"""
        workflow = StateGraph(FeedbackState)

        # 加入節點
        workflow.add_node('feedback', self._feedback_node)

        # 設定流程：START -> feedback -> END
        workflow.add_edge(START, 'feedback')
        workflow.add_edge('feedback', END)

        return workflow.compile(checkpointer=self.checkpointer)

    def process_message(
        self,
        user_input: str,
        mind_map_data: Dict,
        article_content: str = '',
        thread_id: str = '',
        callbacks: List[Any] = None,
    ) -> Dict:
        """
        處理訊息並生成 feedback

        Args:
            user_input: 學生的操作描述（作為 query）
            mind_map_data: 簡化後的心智圖資料
            article_content: 文章內容
            thread_id: 對話執行緒 ID
            callbacks: LangChain callbacks

        Returns:
            dict: 包含處理結果的狀態
        """
        config = {
            'configurable': {'thread_id': thread_id},
            'callbacks': callbacks,
        }

        # 與 chatbot 相同的方式組成 inputs
        inputs = {
            'messages': [
                HumanMessage(
                    content=json.dumps(
                        {'query': user_input, 'context': {'mind_map_data': mind_map_data}},
                        ensure_ascii=False,
                    )
                )
            ],
            'article_content': article_content,
        }

        return self.graph.invoke(inputs, config=config)
