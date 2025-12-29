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
        - map_id: int
        - node_id: str
        - node_type: str (optional)
        - text: str (Alert message)

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
    node_id = serializer.validated_data['node_id']
    node_type = serializer.validated_data.get('node_type', '')
    text = serializer.validated_data['text']

    # 2. 驗證 Map 存在
    try:
        map_instance = Map.objects.get(id=map_id)
    except Map.DoesNotExist:
        return Response(
            {'success': False, 'error': f'Map with id {map_id} not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # 3. 建立 feedback record（先不含 LLM feedback）
    feedback_record = NodeFeedback.objects.create(
        user=request.user,
        map=map_instance,
        text=text,
        metadata={'action': 'edit', 'node_id': node_id, 'node_type': node_type},
    )

    # 4. 同步呼叫 LLM 生成 feedback
    try:
        feedback_service = get_feedback_service()
        feedback_text = feedback_service.generate_feedback(
            {'node_id': node_id, 'node_type': node_type}
        )

        feedback_record.feedback = feedback_text
        feedback_record.save()

        # 5. 回傳成功結果
        return Response(
            {
                'success': True,
                'data': NodeFeedbackSerializer(feedback_record).data,
            }
        )

    except Exception as e:
        # LLM 呼叫失敗，仍保留 record 但標記錯誤
        error_message = '生成回饋失敗，請稍後再試'

        # 將錯誤訊息存入 metadata
        feedback_record.metadata['error'] = str(e)
        feedback_record.save()

        return Response(
            {
                'success': False,
                'error': error_message,
                'data': NodeFeedbackSerializer(feedback_record).data,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
