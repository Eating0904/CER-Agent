import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.common.utils.deadline_checker import check_template_deadline
from apps.map.models import Map
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

        # 取得 map 並檢查期限
        try:
            map_instance = Map.objects.get(id=map_id, user=request.user)
            if not map_instance.template or not check_template_deadline(map_instance.template):
                logger.warning(
                    f'Template expired, cannot use chat: map_id={map_id}, user={request.user.id}'
                )
                return Response(
                    {'success': False, 'error': 'This task has expired and chat is not available'},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except Map.DoesNotExist:
            logger.error(f'Map not found: map_id={map_id}, user={request.user.id}')
            return Response(
                {'success': False, 'error': 'Map not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

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

        # AI 成功回應後，更新 user action
        user_action_id = serializer.validated_data.get('user_action_id')
        if user_action_id and 'trace_id' in result:
            try:
                action = UserAction.objects.get(id=user_action_id, user=request.user)
                action.metadata = action.metadata or {}
                action.metadata['langfuse_trace_id'] = result['trace_id']
                action.save()
            except UserAction.DoesNotExist:
                logger.warning(f'UserAction {user_action_id} not found for user {request.user.id}')
            except Exception as e:
                logger.warning(f'Failed to update user action with trace_id: {e}')

        return Response(
            {
                'success': True,
                'message': result['message'],
                'message_type': result.get('message_type'),
            }
        )

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
