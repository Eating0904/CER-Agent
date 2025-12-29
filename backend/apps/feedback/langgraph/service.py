"""
Feedback Service - 整合 LangGraph 的服務層
"""

from .graph import FeedbackGraph


class FeedbackService:
    """節點編輯回饋服務"""

    def __init__(self):
        """初始化 Feedback Service"""
        self.graph = FeedbackGraph()

    def generate_feedback(self, node_info: dict) -> str:
        """
        生成節點編輯的 feedback

        Args:
            node_info: 節點資訊，包含 node_id, node_type 等

        Returns:
            str: LLM 生成的回饋文字

        Raises:
            Exception: LLM 呼叫失敗時拋出
        """
        try:
            # 準備 prompt 內容
            user_input = f"""節點資訊：
- 節點 ID: {node_info.get('node_id', 'unknown')}
- 節點類型: {node_info.get('node_type', 'unknown')}"""

            # 呼叫 graph（未來可在此加入 Langfuse callbacks）
            result = self.graph.process_message(user_input=user_input, callbacks=None)

            # 取得最後的回應
            if result.get('messages'):
                return result['messages'][-1].content.strip()
            else:
                return '無法生成回饋'

        except Exception as e:
            raise Exception(f'LLM feedback 生成失敗: {str(e)}')


# Singleton instance
_feedback_service = None


def get_feedback_service() -> FeedbackService:
    """取得 FeedbackService 實例（單例模式）"""
    global _feedback_service
    if _feedback_service is None:
        _feedback_service = FeedbackService()
    return _feedback_service
