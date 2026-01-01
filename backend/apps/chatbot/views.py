from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.map.permissions import require_map_owner

from .langgraph import get_langgraph_service
from .serializers import ChatMessageSerializer


@api_view(['POST'])
@require_map_owner
def chat(request):
    """
    處理聊天訊息並返回 Gemini 的回應
    預設使用 LangGraph 分類流程
    """
    serializer = ChatMessageSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'success': False, 'error': 'Invalid request data'}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        message = serializer.validated_data['message']
        map_id = serializer.validated_data['map_id']

        # ============================================
        # LangGraph 分類模式（預設）
        # ============================================

        # 使用 LangGraph 服務處理訊息
        langgraph_service = get_langgraph_service()
        result = langgraph_service.process_user_message(
            user_input=message, map_id=map_id, user_id=str(request.user.id)
        )

        # 檢查處理結果
        if not result['success']:
            # 返回錯誤資訊（包含詳細錯誤給開發者，簡化訊息給使用者）
            return Response(
                {
                    'success': False,
                    'message': result['message'],  # 使用者友善訊息
                    'error': result.get('error', {}),  # 詳細錯誤資訊（開發者用）
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'success': True, 'message': result['message']})

    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@require_map_owner
def get_chat_history(request, map_id):
    """
    獲取指定心智圖的對話紀錄（從 LangGraph checkpointer）
    """
    try:
        langgraph_service = get_langgraph_service()
        result = langgraph_service.get_conversation_history(map_id)

        if not result['success']:
            return Response(
                {
                    'success': False,
                    'messages': [],
                    'error': result.get('error', {}),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'success': True, 'messages': result['messages']})

    except Exception as e:
        return Response(
            {'success': False, 'messages': [], 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
