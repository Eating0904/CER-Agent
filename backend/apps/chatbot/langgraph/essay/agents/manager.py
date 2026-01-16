"""Essay Agent Manager"""

from .essay_support_agent import EssaySupportAgent
from .scoring_agent import EssayScoringAgent


class EssayAgentManager:
    """Essay Agent 管理器"""

    def __init__(self):
        self._agents = {
            'essay_support': EssaySupportAgent(),
            'essay_scoring': EssayScoringAgent(),
        }

    def get_agent(self, agent_type: str):
        """獲取指定的 Agent"""
        return self._agents.get(agent_type)
