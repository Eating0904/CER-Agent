"""
LangGraph 對話管理模組

此模組包含：
- classifier: 意圖分類器
- agents: 子 LLM 代理
- graph: LangGraph 工作流程圖
- service: LangGraph 服務封裝
"""

from .service import get_langgraph_service

__all__ = ['get_langgraph_service']
