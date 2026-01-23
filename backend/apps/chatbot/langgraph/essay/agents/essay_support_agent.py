"""Essay Support Agent - 文章寫作引導"""

import json
import logging
from typing import List

from langchain_core.messages import BaseMessage, SystemMessage

from apps.common.utils.json_parser import parse_llm_json_response
from apps.common.utils.message_filter import filter_messages

from ..prompts import ESSAY_SUPPORT_PROMPT
from .base import BaseAgent

logger = logging.getLogger(__name__)


class EssaySupportAgent(BaseAgent):
    """Essay 寫作引導 Agent"""

    def __init__(self):
        super().__init__(temperature=0.5)
        self.prompt_template = ESSAY_SUPPORT_PROMPT

    def prepare_messages(
        self, messages: List[BaseMessage], article_content: str = '', **kwargs
    ) -> List[BaseMessage]:
        """
        準備訊息：格式化 prompt（注入 article_content 和當前的 mind_map_data），過濾歷史中的 mind_map_data

        Args:
            messages: 原始對話歷史
            article_content: 文章內容（從 template 取得）
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ 過濾後的訊息
        """
        # 從最後一則訊息提取當前的 mind_map_data
        last_message = messages[-1]
        mind_map_data = {}

        try:
            content = json.loads(last_message.content)
            mind_map_data = content.get('context', {}).get('mind_map_data', {})
        except (json.JSONDecodeError, AttributeError):
            pass

        # 將 mind_map_data 注入到 system prompt 中
        system_message_content = self.prompt_template.format(
            article_content=article_content,
            cer_mind_map_data=json.dumps(mind_map_data, ensure_ascii=False),
        )

        # 過濾歷史訊息，只保留 essay_content，移除重複的 mind_map_data
        filtered_messages = filter_messages(messages, context_fields_to_keep=['essay_content'])

        return [SystemMessage(content=system_message_content)] + filtered_messages

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
        提取 metadata：從 JSON 回應中提取 reasoning, response_strategy

        Args:
            response: LLM 的回應

        Returns:
            dict: metadata
        """
        try:
            result = parse_llm_json_response(response.content)
            return {
                'reasoning': result.get('reasoning', ''),
                'response_strategy': result.get('response_strategy', ''),
            }
        except Exception as e:
            logger.warning(f'Failed to extract metadata: {str(e)[:100]}')
            return {}
