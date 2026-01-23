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
        super().__init__(temperature=0.3)
        self.prompt_template = SCORING_PROMPT

    def prepare_messages(
        self,
        messages: List[BaseMessage],
        article_content: str = '',
        **kwargs,
    ) -> List[BaseMessage]:
        """
        準備訊息：傳入 essay_content 和當前的 mind_map_data

        Args:
            messages: 原始對話歷史
            article_content: 文章內容
            **kwargs: 未使用的額外參數

        Returns:
            List[BaseMessage]: SystemMessage（已格式化）+ HumanMessage（只包含 essay_content）
        """
        last_message = messages[-1]
        essay_content = ''
        mind_map_data = {}

        try:
            content = json.loads(last_message.content)
            essay_content = content.get('context', {}).get('essay_content', '')
            mind_map_data = content.get('context', {}).get('mind_map_data', {})
        except (json.JSONDecodeError, AttributeError):
            pass

        system_message_content = self.prompt_template.format(
            article_content=article_content,
            cer_mind_map_data=json.dumps(mind_map_data, ensure_ascii=False),
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
                'Interpretation',
                'Analysis',
                'Evaluation',
                'Inference',
                'Explanation',
                'Disposition',
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
                'Interpretation',
                'Analysis',
                'Evaluation',
                'Inference',
                'Explanation',
                'Disposition',
            ]

            for key in required_keys:
                if key not in result:
                    return {}

            return {
                'interpretation_score': result['Interpretation'].get('score', ''),
                'interpretation_feedback': result['Interpretation'].get('feedback', ''),
                'analysis_score': result['Analysis'].get('score', ''),
                'analysis_feedback': result['Analysis'].get('feedback', ''),
                'evaluation_score': result['Evaluation'].get('score', ''),
                'evaluation_feedback': result['Evaluation'].get('feedback', ''),
                'inference_score': result['Inference'].get('score', ''),
                'inference_feedback': result['Inference'].get('feedback', ''),
                'explanation_score': result['Explanation'].get('score', ''),
                'explanation_feedback': result['Explanation'].get('feedback', ''),
                'disposition_score': result['Disposition'].get('score', ''),
                'disposition_feedback': result['Disposition'].get('feedback', ''),
            }

        except Exception as e:
            logger.warning(f'Failed to extract metadata: {str(e)[:100]}')
            return {}
