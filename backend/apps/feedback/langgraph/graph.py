"""
Feedback Graph - 簡化版 LangGraph 流程
"""

import json
import operator
from typing import Annotated, Any, Dict, List, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from .agent import FeedbackAgent


# 定義狀態結構
class FeedbackState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    article_content: str  # 新增此欄位


class FeedbackGraph:
    def __init__(self):
        """初始化 Feedback Graph"""
        self.agent = FeedbackAgent()
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

        return workflow.compile()

    def process_message(
        self,
        user_input: str,
        mind_map_data: Dict,
        article_content: str = '',
        callbacks: List[Any] = None,
    ) -> Dict:
        """
        處理訊息並生成 feedback

        Args:
            user_input: 學生的操作描述（作為 query）
            mind_map_data: 簡化後的心智圖資料
            article_content: 文章內容
            callbacks: LangChain callbacks

        Returns:
            dict: 包含處理結果的狀態
        """
        config = {
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
