"""
Feedback Service - 整合 LangGraph 的服務層
"""

from langfuse import Langfuse, propagate_attributes
from langfuse.langchain import CallbackHandler

from apps.common.utils.map_data_utils import simplify_map_data
from apps.map.models import Map
from config.settings import DATABASE_URL

from ..models import NodeFeedback
from .graph import FeedbackGraph


class FeedbackService:
    """節點編輯回饋服務"""

    def __init__(self):
        """初始化 Feedback Service"""
        self.graph = FeedbackGraph(DATABASE_URL)
        self.langfuse = Langfuse()

    def generate_feedback(
        self,
        map_id: int,
        metadata: list,
        alert_title: str,
        operation_details: str,
        user_id: str,
    ) -> str:
        """
        生成節點編輯的 feedback

        Args:
            map_id: 地圖 ID
            metadata: 操作列表（包含詳細資訊）
            alert_title: 前端傳來的 alert title (例如："完成了 3 個操作")
            operation_details: 前端組裝的具體操作描述
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

            # 3. 直接使用前端傳來的操作描述（作為 query）
            query = operation_details

            # 4. 取得文章內容
            article_content = ''
            if map_instance.template:
                article_content = map_instance.template.article_content

            # 5. 設定 thread_id 和 session_id
            thread_id = f'feedback-{map_id}'
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
                        metadata=metadata,
                        article_content=article_content,
                        thread_id=thread_id,
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
                        alert_title=alert_title,
                        operation_details=operation_details,
                        feedback=feedback_response,
                        metadata={'operations': metadata},
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
