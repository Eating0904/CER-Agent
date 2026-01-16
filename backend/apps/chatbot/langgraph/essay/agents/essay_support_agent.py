"""Essay Support Agent - 文章寫作引導"""

from typing import List

from langchain_core.messages import BaseMessage, SystemMessage

from apps.common.utils.json_parser import parse_llm_json_response

from ..prompts import ESSAY_SUPPORT_PROMPT
from .base import BaseAgent


class EssaySupportAgent(BaseAgent):
    """Essay 寫作引導 Agent"""

    def __init__(self):
        super().__init__(temperature=0.5)
        self.prompt_template = ESSAY_SUPPORT_PROMPT

    def prepare_messages(
        self, messages: List[BaseMessage], article_content: str = '', **kwargs
    ) -> List[BaseMessage]:
        """
        準備訊息：格式化 prompt（注入 article_content），保留完整 context

        Args:
            messages: 原始對話歷史
            article_content: 文章內容（從 template 取得）
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ 原始訊息
        """
        system_message_content = self.prompt_template.format(article_content=article_content)

        return [SystemMessage(content=system_message_content)] + messages

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
                print(f'⚠️  回應中缺少 final_response 欄位，回傳原始內容')
                return response.content
            return result['final_response']
        except Exception as json_error:
            print(f'⚠️  JSON 解析失敗: {json_error}，回傳原始內容')
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
        except Exception as json_error:
            print(f'⚠️  Metadata 提取失敗: {json_error}')
            return {}
