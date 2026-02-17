"""
ScoringAgent - CER 評分 Agent

處理 CER 心智圖的評分請求，提供結構化的評分結果（Claim、Evidence、Reasoning）。
"""

import json
import logging
from typing import List

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage

from apps.common.utils.json_parser import parse_llm_json_response

from ..prompts.scoring_prompt import SCORING_PROMPT
from .base import BaseAgent

logger = logging.getLogger(__name__)


class ScoringAgent(BaseAgent):
    """CER 評分 Agent - 單一請求模式"""

    def __init__(self):
        """初始化 ScoringAgent"""
        super().__init__(temperature=0.5, model='gemini-3-pro-preview')
        self.prompt_template = SCORING_PROMPT

    def prepare_messages(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        **kwargs,
    ) -> List[BaseMessage]:
        """
        Args:
            messages: 原始對話歷史
            article_content: 文章內容
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ HumanMessage（只包含 mind_map_data）
        """
        last_message = messages[-1]
        mind_map_data = {}

        try:
            content = json.loads(last_message.content)
            mind_map_data = content.get('context', {}).get('mind_map_data', {})
        except (json.JSONDecodeError, AttributeError) as e:
            logger.warning(f'Failed to parse mind_map_data: {str(e)[:100]}')

        system_message_content = self.prompt_template.format(article_content=article_content)

        human_message_content = json.dumps(mind_map_data, ensure_ascii=False)

        return [
            SystemMessage(content=system_message_content),
            HumanMessage(content=human_message_content),
        ]

    def process_response(self, response) -> str:
        """
        處理回應：解析並驗證 JSON 評分結果

        期望 LLM 回傳 JSON 格式：
        {
            "Claim": {"score": "Y分", "feedback": "..."},
            "Evidence": {"score": "Y分", "feedback": "..."},
            "Reasoning": {"score": "Y分", "feedback": "..."}
        }

        Args:
            response: LLM 的回應

        Returns:
            str: 格式化的 JSON 字串（如果解析成功）或原始內容（如果解析失敗）
        """

        try:
            result = parse_llm_json_response(response.content)
            required_keys = ['Claim', 'Evidence', 'Reasoning']
            for key in required_keys:
                if key not in result:
                    logger.warning(f'Scoring result missing {key} field, using raw content')
                    return response.content

            return json.dumps(result, ensure_ascii=False, indent=2)

        except Exception as e:
            logger.warning(f'Failed to parse scoring result: {str(e)[:100]}, using raw content')
            return response.content

    def extract_metadata(self, response) -> dict:
        """
        提取 metadata：從 JSON 回應中提取完整的評分資訊

        Args:
            response: LLM 的回應

        Returns:
            dict: metadata 包含 Claim, Evidence, Reasoning 的評分資訊
        """
        try:
            result = parse_llm_json_response(response.content)
            required_keys = ['Claim', 'Evidence', 'Reasoning']

            for key in required_keys:
                if key not in result:
                    return {}

            return {
                'claim_score': result['Claim'].get('score', ''),
                'claim_feedback': result['Claim'].get('feedback', ''),
                'evidence_score': result['Evidence'].get('score', ''),
                'evidence_feedback': result['Evidence'].get('feedback', ''),
                'reasoning_score': result['Reasoning'].get('score', ''),
                'reasoning_feedback': result['Reasoning'].get('feedback', ''),
            }

        except Exception as e:
            logger.warning(f'Failed to extract metadata: {str(e)[:100]}')
            return {}
