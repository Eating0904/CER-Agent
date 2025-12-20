"""
專家 LLM 處理器 (Expert Agents)
根據分類結果，使用對應的專家處理使用者請求
"""

from typing import Any, Dict, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from .prompts import OPERATOR_SUPPORT_PROMPT, CER_COGNITIVE_SUPPORT_PROMPT


class SubLLMAgent:
    """專家 LLM 代理 - 處理特定類型的請求"""

    def __init__(self, agent_type: str):
        """
        初始化專家 LLM 代理

        Args:
            agent_type: 代理類型 ("operator_support" 或 "cer_cognitive_support")
        """
        # 使用 LangChain 的 ChatGoogleGenerativeAI
        # API key 會自動從環境變數 GOOGLE_API_KEY 讀取
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-pro',
            temperature=0.7,  # 適度的創造性
        )

        self.agent_type = agent_type

        # 使用預定義的 prompt
        prompt_map = {
            'operator_support': OPERATOR_SUPPORT_PROMPT,
            'cer_cognitive_support': CER_COGNITIVE_SUPPORT_PROMPT,
        }
        self.system_prompt = prompt_map[agent_type]

    def process(
        self, messages: List[BaseMessage], user_map: Dict[str, Any], callbacks: List[Any] = None
    ) -> str:
        """
        處理使用者請求

        Args:
            messages: 完整對話歷史
                     每則 HumanMessage 的 content 是 JSON 字串：{"query": "使用者問題", "context": {...心智圖資料...}}
            user_map: 使用者地圖資訊（保留用於未來可能的用途）
            callbacks: LangChain callbacks for tracing

        Returns:
            str: Expert 的回應
        """
        # 使用 List Injection，LLM 會自動讀取 JSON 中的 query 和 context
        final_messages = [SystemMessage(content=self.system_prompt)] + messages

        try:
            # 呼叫 LLM（直接傳遞 List[BaseMessage]）
            response = self.llm.invoke(
                final_messages,
                config={'callbacks': callbacks, 'run_name': f'{self.agent_type}_Agent'},
            )
            return response.content

        except Exception as e:
            print(f'❌ {self.agent_type} Agent 錯誤: {e}')
            return f'抱歉，我遇到了一些技術問題。錯誤訊息: {str(e)}'


class SubLLMManager:
    """管理多個專家 LLM 代理"""

    def __init__(self):
        """
        初始化專家 LLM 管理器
        """
        self.agents = {
            'operator_support': SubLLMAgent('operator_support'),
            'cer_cognitive_support': SubLLMAgent('cer_cognitive_support'),
        }

    def get_agent(self, agent_type: str) -> SubLLMAgent:
        """
        取得指定類型的代理

        Args:
            agent_type: 代理類型 ("operator_support" 或 "cer_cognitive_support")

        Returns:
            SubLLMAgent: 對應的代理
        """
        if agent_type not in self.agents:
            raise ValueError(f'未知的代理類型: {agent_type}')

        return self.agents[agent_type]
