"""
Feedback Service - 整合 LangGraph 的服務層
"""

from apps.map.models import Map

from .graph import FeedbackGraph


def _get_node_content(nodes: list, node_id: str) -> str:
    """
    從 nodes 列表中找到對應 node_id 的 content

    Args:
        nodes: Map 的 nodes JSONField 資料
        node_id: 要查找的 node ID

    Returns:
        str: 對應的 node content，若找不到則返回錯誤訊息
    """
    for node in nodes:
        if node.get('id') == node_id:
            data = node.get('data', {})
            return data.get('content', '')
    return f'[找不到 Node {node_id}]'


class FeedbackService:
    """節點編輯回饋服務"""

    def __init__(self):
        """初始化 Feedback Service"""
        self.graph = FeedbackGraph()

    def generate_feedback(self, map_id: int, text: str, meta: dict) -> str:
        """
        生成節點編輯的 feedback

        Args:
            map_id: 地圖 ID
            text: 前端傳來的 alert message
            meta: 包含操作資訊的字典，例如:
                - {"action": "edit", "node_id": "c1", "node_type": "C"}
                - {"action": "connect", "connected_nodes": ["c1", "e1"]}

        Returns:
            str: LLM 生成的回饋文字

        Raises:
            Exception: 當 Map 不存在或 LLM 呼叫失敗時拋出
        """
        try:
            # 1. 從資料庫取得 Map 和相關的 Template
            try:
                map_instance = Map.objects.select_related('template').get(id=map_id)
            except Map.DoesNotExist:
                raise Exception(f'Map with id {map_id} does not exist')

            # 2. 取得文章內容
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content

            # 3. 根據 action 類型構建學生操作訊息
            action = meta.get('action', '')

            if action == 'edit':
                # 編輯操作
                node_id = meta.get('node_id', '')
                node_content = _get_node_content(map_instance.nodes, node_id)
                user_input = f'學生操作: {text}\nNode {node_id} Content: {node_content}'

            elif action == 'connect':
                # 連線操作
                connected_nodes = meta.get('connected_nodes', [])
                if len(connected_nodes) >= 2:
                    node_1_id = connected_nodes[0]
                    node_2_id = connected_nodes[1]
                    node_1_content = _get_node_content(map_instance.nodes, node_1_id)
                    node_2_content = _get_node_content(map_instance.nodes, node_2_id)
                    user_input = (
                        f'學生操作: {text}\n'
                        f'Node {node_1_id} Content: {node_1_content}\n'
                        f'Node {node_2_id} Content: {node_2_content}'
                    )
                else:
                    raise Exception('connect action requires at least 2 nodes in connected_nodes')
            else:
                raise Exception(f'Unknown action type: {action}')

            # 4. 呼叫 graph 生成 feedback（未來可在此加入 Langfuse callbacks）
            result = self.graph.process_message(
                user_input=user_input,
                article_content=article_content,
                callbacks=None,
            )

            # 5. 取得最後的回應
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
