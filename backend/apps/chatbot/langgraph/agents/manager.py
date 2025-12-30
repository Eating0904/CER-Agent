"""
AgentManager - Agent 管理器（工廠模式）

管理所有可用的 agent 實例，提供統一的介面取得對應的 agent。
"""

from .base import BaseAgent
from .cer_cognitive_support_agent import CERCognitiveSupportAgent
from .operator_support_agent import OperatorSupportAgent
from .scoring_agent import ScoringAgent


class AgentManager:
    """Agent 管理器 - 使用工廠模式管理所有 agent"""

    def __init__(self):
        """初始化 AgentManager，創建所有 agent 實例"""
        self.agents = {
            'operator_support': OperatorSupportAgent(),
            'cer_cognitive_support': CERCognitiveSupportAgent(),
            'cer_scoring': ScoringAgent(),
        }

    def get_agent(self, agent_type: str) -> BaseAgent:
        """
        取得指定類型的 agent

        Args:
            agent_type: agent 類型（"operator_support" 或 "cer_cognitive_support"）

        Returns:
            BaseAgent: 對應的 agent 實例

        Raises:
            ValueError: 當 agent_type 不存在時
        """
        if agent_type not in self.agents:
            raise ValueError(f'未知的代理類型: {agent_type}')

        return self.agents[agent_type]
