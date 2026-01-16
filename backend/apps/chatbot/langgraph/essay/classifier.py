"""
Essay Intent Classifier
參考 mindmap classifier，使用 essay 專用的 prompt
"""

from typing import Any, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from apps.common.utils.json_parser import parse_llm_json_response
from apps.common.utils.message_filter import filter_messages

from .prompts import CLASSIFIER_PROMPT


class EssayIntentClassifier:
    """Essay 意圖分類器"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.5-pro',
            temperature=0.1,
        )
        self.system_prompt = CLASSIFIER_PROMPT

    def classify(self, messages: List[BaseMessage], callbacks: List[Any] = None) -> dict:
        """
        分類使用者意圖

        Args:
            messages: 完整對話歷史
            callbacks: LangChain callbacks for tracing

        Returns:
            dict: 包含 reasoning 和 next_action 的字典
                  next_action 為 "essay_support" 或 "essay_scoring"
        """
        filtered_messages = filter_messages(messages, context_fields_to_keep=[])

        final_messages = [SystemMessage(content=self.system_prompt)] + filtered_messages

        try:
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks, 'run_name': 'EssayIntentClassifier'}
            )
            print(f'\n💡 Essay 分類器回應: {response.content}')

            result = parse_llm_json_response(response.content)

            if 'next_action' not in result:
                raise ValueError('分類結果缺少 next_action 欄位')

            valid_actions = ['essay_support', 'essay_scoring']
            if result['next_action'] not in valid_actions:
                raise ValueError(f'無效的分類結果: {result["next_action"]}')

            return result

        except Exception as e:
            print(f'\n❌ Essay 分類器錯誤: {e}')
            if 'response' in locals():
                print(f'原始回應: {response.content}')
            return {
                'reasoning': f'發生錯誤: {str(e)}',
                'next_action': 'essay_support',
            }
