"""
ScoringAgent - CER 評分 Agent

處理 CER 心智圖的評分請求，提供結構化的評分結果（Claim、Evidence、Reasoning）。
"""

from typing import List

from langchain_core.messages import BaseMessage, SystemMessage

from ..prompts.scoring_prompt import (
    SCORING_PROMPT,
)
from .base import BaseAgent


class ScoringAgent(BaseAgent):
    """CER 評分 Agent - 單一請求模式"""

    def __init__(self):
        """初始化 ScoringAgent"""
        super().__init__(temperature=0.3)
        self.prompt_template = SCORING_PROMPT

    def prepare_messages(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        **kwargs,
    ) -> List[BaseMessage]:
        """
        準備訊息：單一請求模式，不讀取歷史對話

        Args:
            messages: 原始對話歷史
            article_content: 文章內容
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ 最新的使用者訊息
        """
        filtered_messages = messages[-1]
        system_message_content = self.prompt_template.format(article_content=article_content)

        return [SystemMessage(content=system_message_content), filtered_messages]

    def process_response(self, response) -> str:
        """
        處理回應：解析 JSON 並格式化為易讀的評分結果

        LLM 應該回傳 Markdown 格式的評分結果，包含 Claim、Evidence、Reasoning 的分數與評語

        Args:
            response: LLM 的回應

        Returns:
            str: 格式化的評分結果
        """
        return response.content
