import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.common.utils.deadline_checker import check_template_deadline
from apps.map.models import Map
from apps.map.permissions import require_map_owner

from .models import Essay
from .serializers import EssayContentSerializer, EssaySerializer

logger = logging.getLogger(__name__)


@api_view(['GET', 'PUT'])
@require_map_owner
def essay_detail(request, map_id):
    """
    GET: 獲取 Essay（如果不存在則自動創建）
    PUT: 更新 Essay 內容
    """
    try:
        map_instance = Map.objects.get(id=map_id, user=request.user)
    except Map.DoesNotExist:
        logger.error(f'Map not found: map_id={map_id}, user={request.user.id}')
        return Response(
            {'success': False, 'error': 'Map not found'}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        # 獲取或創建 Essay
        essay, created = Essay.objects.get_or_create(
            map=map_instance, defaults={'user': request.user}
        )
        serializer = EssaySerializer(essay)
        return Response({'success': True, 'essay': serializer.data, 'created': created})

    elif request.method == 'PUT':
        try:
            # 檢查期限
            if not map_instance.template or not check_template_deadline(map_instance.template):
                logger.warning(
                    f'Template expired, cannot update essay: map_id={map_id}, user={request.user.id}'
                )
                return Response(
                    {'success': False, 'error': 'This task has expired and cannot be edited'},
                    status=status.HTTP_403_FORBIDDEN,
                )

            essay, created = Essay.objects.get_or_create(
                map=map_instance, defaults={'user': request.user}
            )

            serializer = EssayContentSerializer(essay, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(
                    {'success': False, 'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer.save()
            return Response({'success': True, 'essay': serializer.data})

        except Exception as e:
            logger.exception(e)
            return Response(
                {'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


VIEW_ALLOWED_ROLES = ['admin']


@api_view(['GET'])
def view_essay_detail(request, map_id):
    """
    GET: 查看任意學生的 Essay（僅限特定 role，唯讀）
    若 essay 不存在，回傳空內容
    """
    if request.user.role not in VIEW_ALLOWED_ROLES:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        map_instance = Map.objects.get(id=map_id)
    except Map.DoesNotExist:
        logger.error(f'Map not found: map_id={map_id}')
        return Response(
            {'success': False, 'error': 'Map not found'}, status=status.HTTP_404_NOT_FOUND
        )

    essay = Essay.objects.filter(map=map_instance).first()
    if essay:
        serializer = EssaySerializer(essay)
        return Response({'success': True, 'essay': serializer.data})
    else:
        return Response({'success': True, 'essay': None})
