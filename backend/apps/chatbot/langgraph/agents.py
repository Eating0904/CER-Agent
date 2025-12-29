"""
專家 LLM 處理器 (Expert Agents)
根據分類結果，使用對應的專家處理使用者請求
"""

from typing import Any, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from .json_parser import parse_llm_json_response
from .message_filter import filter_messages
from .prompts import CER_COGNITIVE_SUPPORT_PROMPT, OPERATOR_SUPPORT_PROMPT


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
        self, messages: List[BaseMessage], callbacks: List[Any] = None, article_content: str = ''
    ) -> str:
        """
        處理使用者請求

        Args:
            messages: 完整對話歷史
                     每則 HumanMessage 的 content 是 JSON 字串：{"query": "使用者問題", "context": {...心智圖資料...}}
            callbacks: LangChain callbacks for tracing
            article_content: 文章內容（用於 cer_cognitive_support agent）

        Returns:
            str: Expert 的回應
        """

        if self.agent_type == 'operator_support':
            system_message_content = self.system_prompt
            filtered_messages = filter_messages(messages, context_fields_to_keep=[])
            print('operator_support:', filtered_messages)
        elif self.agent_type == 'cer_cognitive_support':
            system_message_content = self.system_prompt.format(article_content=article_content)
            filtered_messages = messages
            print('cer_cognitive_support:', filtered_messages)
        else:
            system_message_content = self.system_prompt
            filtered_messages = messages

        final_messages = [SystemMessage(content=system_message_content)] + filtered_messages

        try:
            # 呼叫 LLM（直接傳遞 List[BaseMessage]）
            response = self.llm.invoke(
                final_messages,
                config={'callbacks': callbacks, 'run_name': f'{self.agent_type}_Agent'},
            )

            if self.agent_type == 'cer_cognitive_support':
                try:
                    result = parse_llm_json_response(response.content)
                    if 'final_response' not in result:
                        print(f'⚠️  回應中缺少 final_response 欄位，回傳原始內容')
                        return response.content
                    return result['final_response']
                except Exception as json_error:
                    print(f'⚠️  JSON 解析失敗: {json_error}，回傳原始內容')
                    return response.content

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
