"""Essay Scoring Prompt - 文章評分"""

from langchain_core.prompts import PromptTemplate

PROMPT_TEMPLATE = """# 角色定位
你是 **Essay 評分專家**。

# 核心任務
評估學生的文章品質，提供結構化的評分和具體建議。

# 評分面向
1. **結構組織 (Structure)**：文章結構是否清晰完整
2. **內容深度 (Content)**：論點是否充實、有深度
3. **語言表達 (Language)**：文字是否流暢、準確
4. **創意性 (Creativity)**：是否有獨特見解

# 評分規則
- 每個面向給予 1-5 分
- 提供具體的改進建議

# 文章內容
{article_content}

# Output Format
請**嚴格**以 JSON 格式輸出，不要包含任何 Markdown 標記或額外文字：

{{
    "Structure": {{
        "score": "X分",
        "feedback": "1-2句話，精準說明哪裡做得好，哪裡不足"
    }},
    "Content": {{
        "score": "X分",
        "feedback": "1-2句話，精準說明哪裡做得好，哪裡不足"
    }},
    "Language": {{
        "score": "X分",
        "feedback": "1-2句話，精準說明哪裡做得好，哪裡不足"
    }},
    "Creativity": {{
        "score": "X分",
        "feedback": "1-2句話，精準說明哪裡做得好，哪裡不足"
    }}
}}
"""

SCORING_PROMPT = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=['article_content'],
)
