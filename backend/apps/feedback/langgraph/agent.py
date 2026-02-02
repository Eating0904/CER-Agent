"""
Feedback Agent - 處理節點編輯回饋的 LLM Agent
"""

import logging
from typing import Any, List, Tuple

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from apps.common.utils.json_parser import parse_llm_json_response
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

    def process_response(self, response) -> str:
        """
        處理回應：解析 JSON 並提取 final_response

        Args:
            response: LLM 的回應

        Returns:
            str: final_response 的內容，或完整回應（如果解析失敗）
        """
        try:
            result = parse_llm_json_response(response.content)
            if 'final_response' not in result:
                logger.warning('Response missing final_response field, using raw content')
                return response.content
            return result['final_response']
        except Exception as e:
            logger.warning(f'Failed to parse response: {str(e)[:100]}, using raw content')
            return response.content

    def extract_metadata(self, response) -> dict:
        """
        提取 metadata：從 JSON 回應中提取 reasoning, response_strategy, strategy_detail

        Args:
            response: LLM 的回應

        Returns:
            dict: metadata 包含 reasoning, response_strategy, strategy_detail
        """
        try:
            result = parse_llm_json_response(response.content)
            return {
                'reasoning': result.get('reasoning', ''),
                'response_strategy': result.get('response_strategy', ''),
                'strategy_detail': result.get('strategy_detail', ''),
            }
        except Exception as e:
            logger.warning(f'Failed to extract metadata: {str(e)[:100]}')
            return {}

    def process(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        callbacks: List[Any] = None,
    ) -> Tuple[str, dict]:
        """
        處理 feedback 生成

        Args:
            messages: 訊息列表 (包含學生操作的 HumanMessage)
            article_content: 文章內容
            callbacks: LangChain callbacks

        Returns:
            Tuple[str, dict]: (LLM 生成的回饋, metadata)
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
            final_response = self.process_response(response)
            metadata = self.extract_metadata(response)
            return final_response, metadata

        except Exception as e:
            logger.exception('Feedback agent failed')
            return 'Sorry, I am unable to provide feedback at this time.', {}
