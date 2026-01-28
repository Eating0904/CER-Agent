"""
Feedback Agent - 處理節點編輯回饋的 LLM Agent
"""

import logging
from typing import Any, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from apps.common.utils.message_filter import filter_messages

from .prompts import FEEDBACK_PROMPT

logger = logging.getLogger(__name__)


class FeedbackAgent:
    """節點編輯回饋 Agent"""

    def __init__(self):
        """初始化 Feedback Agent"""
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-3-flash-preview',
            temperature=0.7,
        )
        self.prompt_template = FEEDBACK_PROMPT

    def process(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        callbacks: List[Any] = None,
    ) -> str:
        """
        處理 feedback 生成

        Args:
            messages: 訊息列表 (包含學生操作的 HumanMessage)
            article_content: 文章內容
            callbacks: LangChain callbacks

        Returns:
            str: LLM 生成的回饋
        """
        filtered_messages = filter_messages(
            messages, context_fields_to_keep=['mind_map_data', 'metadata']
        )
        system_message_content = self.prompt_template.format(article_content=article_content)

        final_messages = [SystemMessage(content=system_message_content)] + filtered_messages

        try:
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks, 'run_name': 'FeedbackAgent'}
            )
            return response.content

        except Exception as e:
            logger.exception('Feedback agent failed')
            return 'Sorry, I am unable to provide feedback at this time.'
