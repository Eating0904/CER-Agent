"""
BaseAgent 抽象基類

定義所有 agent 的共用介面和行為，提供 LLM 初始化和錯誤處理框架。
"""

from abc import ABC, abstractmethod
from typing import Any, List

from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI


class BaseAgent(ABC):
    """所有 Agent 的抽象基類"""

    def __init__(self, temperature: float = 0.7):
        """
        初始化 BaseAgent

        Args:
            temperature: LLM 的溫度參數，控制輸出的隨機性
        """
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-pro',
            temperature=temperature,
        )

    @abstractmethod
    def prepare_messages(self, messages: List[BaseMessage], **kwargs) -> List[BaseMessage]:
        """
        準備要傳給 LLM 的訊息（子類必須實作）

        Args:
            messages: 原始對話歷史
            **kwargs: 額外參數（如 article_content）

        Returns:
            List[BaseMessage]: 準備好的訊息列表（包含 SystemMessage）
        """
        pass

    @abstractmethod
    def process_response(self, response) -> str:
        """
        處理 LLM 的回應（子類必須實作）

        Args:
            response: LLM 的原始回應

        Returns:
            str: 處理後的回應內容
        """
        pass

    def process(self, messages: List[BaseMessage], callbacks: List[Any] = None, **kwargs) -> str:
        """
        統一的處理流程

        Args:
            messages: 對話歷史
            callbacks: LangChain callbacks for tracing
            **kwargs: 額外參數（傳遞給 prepare_messages）

        Returns:
            str: 處理後的回應
        """
        try:
            # 準備訊息
            final_messages = self.prepare_messages(messages, **kwargs)

            # 呼叫 LLM
            agent_name = self.__class__.__name__
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks, 'run_name': agent_name}
            )

            # 處理回應
            return self.process_response(response)

        except Exception as e:
            agent_name = self.__class__.__name__
            print(f'❌ {agent_name} 錯誤: {e}')
            return f'抱歉，我遇到了一些技術問題。錯誤訊息: {str(e)}'
