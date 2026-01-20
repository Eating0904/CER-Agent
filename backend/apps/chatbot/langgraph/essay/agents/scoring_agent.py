"""Essay Scoring Agent - 文章評分"""

import json
from typing import List

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage

from apps.common.utils.json_parser import parse_llm_json_response

from ..prompts.scoring_prompt import SCORING_PROMPT
from .base import BaseAgent


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
            required_keys = ['Structure', 'Content', 'Language', 'Creativity']
            for key in required_keys:
                if key not in result:
                    print(f'⚠️  評分結果缺少 {key} 欄位，回傳原始內容')
                    return response.content

            return json.dumps(result, ensure_ascii=False, indent=2)

        except Exception as json_error:
            print(f'⚠️  JSON 解析失敗: {json_error}，回傳原始內容')
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
            required_keys = ['Structure', 'Content', 'Language', 'Creativity']

            for key in required_keys:
                if key not in result:
                    return {}

            return {
                'structure_score': result['Structure'].get('score', ''),
                'structure_feedback': result['Structure'].get('feedback', ''),
                'content_score': result['Content'].get('score', ''),
                'content_feedback': result['Content'].get('feedback', ''),
                'language_score': result['Language'].get('score', ''),
                'language_feedback': result['Language'].get('feedback', ''),
                'creativity_score': result['Creativity'].get('score', ''),
                'creativity_feedback': result['Creativity'].get('feedback', ''),
            }

        except Exception as json_error:
            print(f'⚠️  Metadata 提取失敗: {json_error}')
            return {}
