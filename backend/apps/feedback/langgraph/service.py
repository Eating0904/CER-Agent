"""
Feedback Service - 整合 LangGraph 的服務層
"""

from langfuse import Langfuse, propagate_attributes
from langfuse.langchain import CallbackHandler

from apps.common.utils.map_data_utils import simplify_map_data
from apps.map.models import Map

from ..models import NodeFeedback
from .graph import FeedbackGraph


class FeedbackService:
    """節點編輯回饋服務"""

    def __init__(self):
        """初始化 Feedback Service"""
        self.graph = FeedbackGraph()
        self.langfuse = Langfuse()

    def _build_operation_description(self, operations: list) -> str:
        """
        組成操作描述文字

        Args:
            operations: 操作列表

        Returns:
            str: 格式化的操作描述
        """
        if not operations:
            return '學生進行了操作'

        description_lines = ['學生進行了以下操作：']
        for idx, op in enumerate(operations, 1):
            action = op.get('action', '')
            if action == 'edit':
                node_id = op.get('node_id', '')
                description_lines.append(f'{idx}. 編輯了節點 {node_id}')
            elif action == 'connect':
                nodes = op.get('connected_nodes', [])
                if len(nodes) >= 2:
                    description_lines.append(f'{idx}. 連接了 {nodes[0]} 和 {nodes[1]}')

        return '\n'.join(description_lines)

    def generate_feedback(
        self, map_id: int, operations: list, alert_message: str, user_id: str
    ) -> str:
        """
        生成節點編輯的 feedback

        Args:
            map_id: 地圖 ID
            operations: 操作列表
            alert_message: 前端傳來的 alert message (例如："完成了 3 個操作")
            user_id: 使用者 ID

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

            # 2. 簡化 map 資料（與 chatbot 相同處理）
            simplified_map = simplify_map_data(
                {'nodes': map_instance.nodes, 'edges': map_instance.edges}
            )

            # 3. 組成操作描述（作為 query）
            query = self._build_operation_description(operations)

            # 4. 取得文章內容
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content

            # 5. 設定 thread_id 和 session_id
            thread_id = str(map_id)
            session_id = thread_id

            # 6. 使用 Langfuse Context Manager 建立 Trace 並設定 Session ID 和 User ID
            with self.langfuse.start_as_current_observation(
                name='feedback_generation',
                as_type='span',
            ) as trace_span:
                # 設定 Trace 層級屬性 (Session ID 和 User ID) 並向下傳遞
                with propagate_attributes(session_id=session_id, user_id=user_id):
                    # 更新 Trace Input
                    trace_span.update_trace(input=query)

                    # 初始化 CallbackHandler (會自動繼承當前 Context)
                    langfuse_handler = CallbackHandler()

                    # 7. 調用 graph
                    result = self.graph.process_message(
                        user_input=query,
                        mind_map_data=simplified_map,
                        article_content=article_content,
                        callbacks=[langfuse_handler],
                    )

                    # 8. 取得最後的回應
                    if result.get('messages'):
                        feedback_response = result['messages'][-1].content.strip()
                    else:
                        feedback_response = '無法生成回饋'

                    # 更新 Trace Output
                    trace_span.update_trace(output=feedback_response)

                    # 9. 儲存到資料庫
                    NodeFeedback.objects.create(
                        user_id=user_id,
                        map=map_instance,
                        text=alert_message,
                        feedback=feedback_response,
                        metadata={'operations': operations},
                    )

                    return feedback_response

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
