import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.map.permissions import require_map_owner
from apps.user_action.models import UserAction

from .langgraph.essay import get_essay_langgraph_service
from .langgraph.mindmap import get_langgraph_service
from .serializers import ChatMessageSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@require_map_owner
def chat(request, chat_type):
    """
    統一的聊天訊息處理 endpoint
    根據 chat_type 路由到不同的 LangGraph service
    """
    serializer = ChatMessageSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'success': False, 'error': 'Invalid request data'}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        message = serializer.validated_data['message']
        map_id = serializer.validated_data['map_id']
        essay_plain_text = serializer.validated_data.get('essay_plain_text', '')

        # 根據 chat_type 選擇對應的 service
        if chat_type == 'mindmap':
            service = get_langgraph_service()
            result = service.process_user_message(
                user_input=message, map_id=map_id, user_id=str(request.user.id)
            )
        elif chat_type == 'essay':
            service = get_essay_langgraph_service()
            result = service.process_user_message(
                user_input=message,
                map_id=map_id,
                user_id=str(request.user.id),
                essay_plain_text=essay_plain_text,
            )
        else:
            return Response(
                {'success': False, 'error': f'Unknown chat type: {chat_type}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 檢查處理結果
        if not result['success']:
            # 返回錯誤資訊
            return Response(
                {
                    'success': False,
                    'message': result['message'],  # 使用者友善訊息
                    'error': result.get('error', {}),  # 詳細錯誤資訊（開發者用）
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # AI 成功回應後，記錄聊天行為
        # 注意：前端已先記錄一次（無 trace_id），這裡記錄第二次以保存 trace_id
        try:
            action_type = 'chat_in_mindmap' if chat_type == 'mindmap' else 'chat_in_essay'
            metadata = {}
            
            # 獲取 langfuse_trace_id
            if 'trace_id' in result:
                metadata['langfuse_trace_id'] = result['trace_id']
            
            UserAction.objects.create(
                user=request.user,
                action_type=action_type,
                map_id=map_id,
                metadata=metadata
            )
        except Exception as e:
            logger.warning(f"Failed to record chat action with trace_id: {e}")

        return Response({'success': True, 'message': result['message']})

    except Exception as e:
        logger.exception(e)
        return Response(
            {'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@require_map_owner
def get_chat_history(request, chat_type, map_id):
    """
    統一的聊天歷史獲取 endpoint
    根據 chat_type 路由到不同的 LangGraph service
    """
    try:
        # 根據 chat_type 選擇對應的 service
        if chat_type == 'mindmap':
            service = get_langgraph_service()
        elif chat_type == 'essay':
            service = get_essay_langgraph_service()
        else:
            return Response(
                {'success': False, 'error': f'Unknown chat type: {chat_type}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = service.get_conversation_history(map_id)

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
        logger.exception(e)
        return Response(
            {'success': False, 'messages': [], 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
