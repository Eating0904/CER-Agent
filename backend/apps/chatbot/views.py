import logging

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.common.utils.deadline_checker import check_template_deadline
from apps.essay.models import Essay
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

        # 評分次數檢查
        is_scoring = message == '[scoring]'
        scoring_remaining = None

        if is_scoring:
            scoring_limit_reached = False
            if chat_type == 'mindmap':
                if map_instance.scoring_remaining <= 0:
                    scoring_limit_reached = True
                    scoring_remaining = 0
            elif chat_type == 'essay':
                try:
                    essay = Essay.objects.get(map=map_instance)
                    if essay.scoring_remaining <= 0:
                        scoring_limit_reached = True
                        scoring_remaining = 0
                except Essay.DoesNotExist:
                    logger.error(f'Essay not found for map: map_id={map_id}')
                    return Response(
                        {'success': False, 'error': 'Essay not found'},
                        status=status.HTTP_404_NOT_FOUND,
                    )

            if scoring_limit_reached:
                logger.info(
                    f'Scoring limit reached: chat_type={chat_type}, map_id={map_id}, user={request.user.id}'
                )
                return Response(
                    {
                        'success': True,
                        'message': 'Scoring limit reached.',
                        'message_type': f'{"cer_scoring" if chat_type == "mindmap" else "essay_scoring"}',
                        'scoring_remaining': 0,
                    }
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

        # 評分成功後扣減次數
        if is_scoring and result['success']:
            now = timezone.now()
            if chat_type == 'mindmap':
                map_instance.scoring_remaining = max(0, map_instance.scoring_remaining - 1)
                map_instance.scoring_updated_at = now
                map_instance.save(update_fields=['scoring_remaining', 'scoring_updated_at'])
                scoring_remaining = map_instance.scoring_remaining
            elif chat_type == 'essay':
                essay = Essay.objects.get(map=map_instance)
                essay.scoring_remaining = max(0, essay.scoring_remaining - 1)
                essay.scoring_updated_at = now
                essay.save(update_fields=['scoring_remaining', 'scoring_updated_at'])
                scoring_remaining = essay.scoring_remaining

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

        response_data = {
            'success': True,
            'message': result['message'],
            'message_type': result.get('message_type'),
        }
        if scoring_remaining is not None:
            response_data['scoring_remaining'] = scoring_remaining

        return Response(response_data)

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
