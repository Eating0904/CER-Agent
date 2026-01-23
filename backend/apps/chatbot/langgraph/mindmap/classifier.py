"""
意圖分類器 (Context-Aware Router)
使用 ChatGoogleGenerativeAI 分析完整對話歷史，判斷使用者意圖
"""

import json
import logging
from typing import Any, List

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from apps.common.utils.json_parser import parse_llm_json_response
from apps.common.utils.message_filter import filter_messages

from .prompts import CLASSIFIER_PROMPT

logger = logging.getLogger(__name__)


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
        filtered_messages = filter_messages(messages, context_fields_to_keep=[])

        # 使用 List Injection，LLM 會自動讀取 JSON 中的 query
        final_messages = [SystemMessage(content=self.system_prompt)] + filtered_messages

        try:
            # 呼叫 LLM（直接傳遞 List[BaseMessage]）
            logger.info('Invoking classifier LLM')
            response = self.llm.invoke(
                final_messages, config={'callbacks': callbacks, 'run_name': 'IntentClassifier'}
            )
            # 提取並解析 JSON
            result = parse_llm_json_response(response.content)

            # 驗證回應格式
            if 'next_action' not in result:
                raise ValueError('分類結果缺少 next_action 欄位')

            # 驗證分類結果是否合法
            valid_actions = ['operator_support', 'cer_cognitive_support', 'cer_scoring']
            if result['next_action'] not in valid_actions:
                raise ValueError(f'無效的分類結果: {result["next_action"]}')

            logger.info(f'Classification result: {result.get("next_action")}')
            return result

        except json.JSONDecodeError as e:
            logger.warning(f'JSON parsing error: {str(e)[:100]}')
            # 預設回傳 operator_support
            return {
                'reasoning': 'JSON 解析失敗，預設為介面支援',
                'next_action': 'operator_support',
            }
        except Exception as e:
            logger.exception('Classifier failed')
            # 預設回傳 operator_support
            return {
                'reasoning': f'發生錯誤: {str(e)}',
                'next_action': 'operator_support',
            }
