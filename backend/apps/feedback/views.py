from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.map.models import Map
from apps.map.permissions import require_map_owner

from .langgraph import get_feedback_service
from .models import NodeFeedback
from .serializers import CreateFeedbackSerializer, NodeFeedbackSerializer


@api_view(['POST'])
@require_map_owner
def create_feedback(request):
    """
    建立 Node 編輯的 feedback 並同步呼叫 LLM 生成回饋

    Request Body:
        - mapId: int
        - operations: list (操作列表)
        - alertMessage: str (前端組成的 alert 訊息，例如："完成了 3 個操作")

    Returns:
        NodeFeedback object with generated feedback
    """
    # 1. 驗證請求
    serializer = CreateFeedbackSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'success': False, 'error': 'Invalid request data', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    map_id = serializer.validated_data['map_id']
    operations = serializer.validated_data['operations']
    alert_message = serializer.validated_data['alert_message']
    operation_details = serializer.validated_data['operation_details']

    # 2. 驗證 Map 存在
    try:
        Map.objects.get(id=map_id)
    except Map.DoesNotExist:
        return Response(
            {'success': False, 'error': f'Map with id {map_id} not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # 3. 同步呼叫 LLM 生成 feedback（service 會自動儲存到資料庫）
    try:
        feedback_service = get_feedback_service()
        user_id = str(request.user.id)
        feedback_text = feedback_service.generate_feedback(
            map_id, operations, alert_message, operation_details, user_id
        )

        # 4. 查詢剛才儲存的 feedback record
        feedback_record = NodeFeedback.objects.filter(map_id=map_id, user=request.user).latest(
            'created_at'
        )

        # 5. 回傳成功結果
        return Response(
            {
                'success': True,
                'data': {'feedback': feedback_text, **NodeFeedbackSerializer(feedback_record).data},
            }
        )

    except Exception as e:
        error_message = '生成回饋失敗，請稍後再試'

        return Response(
            {
                'success': False,
                'error': error_message,
                'details': str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
