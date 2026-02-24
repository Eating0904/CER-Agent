"""Essay Scoring Agent - 文章評分"""

import json
import logging
from typing import List

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage

from apps.common.utils.json_parser import parse_llm_json_response

from ..prompts.scoring_prompt import SCORING_PROMPT
from .base import BaseAgent

logger = logging.getLogger(__name__)


class EssayScoringAgent(BaseAgent):
    """Essay 評分 Agent"""

    def __init__(self):
        super().__init__(temperature=0.5, model='gemini-3-pro-preview')
        self.prompt_template = SCORING_PROMPT

    def prepare_messages(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        **kwargs,
    ) -> List[BaseMessage]:
        """
        準備訊息：傳入 essay_content

        Args:
            messages: 原始對話歷史
            article_content: 文章內容
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ HumanMessage（只包含 essay_content）
        """
        last_message = messages[-1]
        essay_content = ''

        try:
            content = json.loads(last_message.content)
            essay_content = content.get('context', {}).get('essay_content', '')
        except (json.JSONDecodeError, AttributeError):
            pass

        system_message_content = self.prompt_template.format(
            article_content=article_content,
        )

        human_message_content = essay_content if essay_content else '（尚未撰寫）'

        return [
            SystemMessage(content=system_message_content),
            HumanMessage(content=human_message_content),
        ]

    def process_response(self, response) -> str:
        """
        處理回應：解析並驗證 JSON 評分結果

        Args:
            response: LLM 的回應

        Returns:
            str: 格式化的 JSON 字串（如果解析成功）或原始內容（如果解析失敗）
        """

        try:
            result = parse_llm_json_response(response.content)
            required_keys = [
                'Explanation_of_Issues',
                'Evidence_Integration',
                'Influence_of_Context',
                'Students_Position',
                'Conclusions',
            ]
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
            dict: metadata 包含各面向評分資訊
        """
        try:
            result = parse_llm_json_response(response.content)
            required_keys = [
                'Explanation_of_Issues',
                'Evidence_Integration',
                'Influence_of_Context',
                'Students_Position',
                'Conclusions',
            ]

            for key in required_keys:
                if key not in result:
                    return {}

            return {
                'explanation_of_issues_score': result['Explanation_of_Issues'].get('score', ''),
                'explanation_of_issues_feedback': result['Explanation_of_Issues'].get(
                    'feedback', ''
                ),
                'evidence_integration_score': result['Evidence_Integration'].get('score', ''),
                'evidence_integration_feedback': result['Evidence_Integration'].get('feedback', ''),
                'influence_of_context_score': result['Influence_of_Context'].get('score', ''),
                'influence_of_context_feedback': result['Influence_of_Context'].get('feedback', ''),
                'students_position_score': result['Students_Position'].get('score', ''),
                'students_position_feedback': result['Students_Position'].get('feedback', ''),
                'conclusions_score': result['Conclusions'].get('score', ''),
                'conclusions_feedback': result['Conclusions'].get('feedback', ''),
            }

        except Exception as e:
            logger.warning(f'Failed to extract metadata: {str(e)[:100]}')
            return {}
