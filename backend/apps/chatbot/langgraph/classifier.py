"""
意圖分類器 (Context-Aware Router)
使用 ChatGoogleGenerativeAI 分析完整對話歷史，判斷使用者意圖
"""

import json
from typing import Any, List
from .prompts import CLASSIFIER_PROMPT
from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI


class IntentClassifier:
    """意圖分類器 - Context-Aware Router"""

    def __init__(self):
        """
        初始化分類器
        """
        # 使用 LangChain 的 ChatGoogleGenerativeAI
        # API key 會自動從環境變數 GOOGLE_API_KEY 讀取
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-pro',
            temperature=0.1,  # 降低隨機性，使分類更穩定
        )

        # 使用預定義的 prompt
        self.system_prompt = CLASSIFIER_PROMPT

    def _extract_json(self, text: str) -> str:
        """從文本中提取 JSON"""
        # 找第一個 { 的位置
        start = text.find('{')
        if start == -1:
            return text.strip()

        # 找最後一個 } 的位置
        end = text.rfind('}')
        if end == -1:
            return text.strip()

        # 提取 { 到 } 之間的內容（包含 { 和 }）
        json_str = text[start : end + 1]

        return json_str

    def classify(self, messages: List[BaseMessage], callbacks: List[Any] = None) -> dict:
        """
        分類使用者意圖

        Args:
            messages: 完整對話歷史
                     每則 HumanMessage 的 content 是 JSON 字串：{"query": "使用者問題", "context": {...心智圖資料...}}
            callbacks: LangChain callbacks for tracing

        Returns:
            dict: 包含 reasoning 和 next_action 的字典
                  next_action 為 "operator_support" 或 "cer_cognitive_support"
        """
        # 使用 List Injection，LLM 會自動讀取 JSON 中的 query
        final_messages = [SystemMessage(content=self.system_prompt)] + messages

        try:
            # 呼叫 LLM（直接傳遞 List[BaseMessage]）
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks, 'run_name': 'IntentClassifier'}
            )
            print(f'\n💡 分類器回應: {response.content}')

            # 提取並解析 JSON
            json_text = self._extract_json(response.content)
            result = json.loads(json_text)

            # 驗證回應格式
            if 'next_action' not in result:
                raise ValueError('分類結果缺少 next_action 欄位')


            # 驗證分類結果是否合法
            valid_actions = ['operator_support', 'cer_cognitive_support']
            if result['next_action'] not in valid_actions:
                raise ValueError(f'無效的分類結果: {result["next_action"]}')

            return result

        except json.JSONDecodeError as e:
            print(f'\n⚠️  JSON 解析錯誤: {e}')
            print(f'原始回應: {response.content}')
            print(f'提取的 JSON: {json_text[:200] if "json_text" in locals() else "N/A"}')
            # 預設回傳 operator_support
            return {
                'reasoning': 'JSON 解析失敗，預設為介面支援',
                'next_action': 'operator_support',
            }
        except Exception as e:
            print(f'\n❌ 分類器錯誤: {e}')
            if 'response' in locals():
                print(f'原始回應: {response.content}')
            # 預設回傳 operator_support
            return {
                'reasoning': f'發生錯誤: {str(e)}',
                'next_action': 'operator_support',
            }
