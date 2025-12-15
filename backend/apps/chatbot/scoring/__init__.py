"""
CER 評分模組

此模組包含：
- prompt_manager: CER 評分 prompt 管理
"""

from .prompt_manager import generate_scoring_prompt, load_prompt_template

__all__ = ['generate_scoring_prompt', 'load_prompt_template']
