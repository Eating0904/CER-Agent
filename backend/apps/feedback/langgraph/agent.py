"""
Feedback Agent - 處理節點編輯回饋的 LLM Agent
"""

from typing import Any, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from .prompts import NODE_EDIT_FEEDBACK_PROMPT


class FeedbackAgent:
    """節點編輯回饋 Agent"""

    def __init__(self):
        """初始化 Feedback Agent"""
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.0-flash-exp',
            temperature=0.7,
        )

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
            callbacks: LangChain callbacks (未來可用於 Langfuse 追蹤)

        Returns:
            str: LLM 生成的回饋
        """
        formatted_prompt = NODE_EDIT_FEEDBACK_PROMPT.format(article_content=article_content)

        system_message = SystemMessage(content=formatted_prompt)
        final_messages = [system_message] + messages

        try:
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks} if callbacks else {}
            )
            return response.content

        except Exception as e:
            print(f'❌ Feedback Agent 錯誤: {e}')
            return '抱歉，生成回饋時遇到問題'
