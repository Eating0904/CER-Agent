"""
Chatbot 共用工具模組

此模組提供 chatbot 應用中常用的工具函數,包括:
- gemini_client: Gemini API 客戶端管理
- conversation_formatters: 對話歷史的格式化工具
"""

from .conversation_formatters import format_history_for_api, format_history_for_display
from .gemini_client import create_gemini_client, get_gemini_api_key

__all__ = [
    # Gemini Client
    'get_gemini_api_key',
    'create_gemini_client',
    # Conversation Formatters
    'format_history_for_api',
    'format_history_for_display',
]
