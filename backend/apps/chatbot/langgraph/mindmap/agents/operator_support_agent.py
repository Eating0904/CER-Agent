"""
OperatorSupportAgent - 介面操作支援 Agent

處理使用者的介面操作相關問題，引導他們學會如何使用心智圖編輯器的各種功能。
"""

from typing import List

from langchain_core.messages import BaseMessage, SystemMessage

from apps.common.utils.message_filter import filter_messages

from ..prompts import OPERATOR_SUPPORT_PROMPT
from .base import BaseAgent


class OperatorSupportAgent(BaseAgent):
    """介面操作支援 Agent"""

    def __init__(self):
        """初始化 OperatorSupportAgent"""
        super().__init__(temperature=0.3)
        self.system_prompt = OPERATOR_SUPPORT_PROMPT

    def prepare_messages(self, messages: List[BaseMessage], **kwargs) -> List[BaseMessage]:
        """
        準備訊息：過濾掉 context 欄位，只保留 query

        Args:
            messages: 原始對話歷史
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage + 過濾後的訊息
        """
        filtered_messages = filter_messages(messages, context_fields_to_keep=[])
        return [SystemMessage(content=self.system_prompt)] + filtered_messages

    def process_response(self, response) -> str:
        """
        處理回應：直接回傳 LLM 的內容

        Args:
            response: LLM 的回應

        Returns:
            str: LLM 回應的內容
        """
        return response.content

    def extract_metadata(self, response) -> dict:
        """
        提取 metadata：OperatorSupportAgent 沒有結構化輸出

        Args:
            response: LLM 的回應

        Returns:
            dict: 空字典
        """
        return {}
