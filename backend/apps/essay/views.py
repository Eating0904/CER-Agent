from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.map.models import Map
from apps.map.permissions import require_map_owner

from .models import Essay
from .serializers import EssayContentSerializer, EssaySerializer


@api_view(['GET', 'PUT'])
@require_map_owner
def essay_detail(request, map_id):
    """
    GET: 獲取 Essay（如果不存在則自動創建）
    PUT: 更新 Essay 內容
    """
    try:
        # 確保 Map 存在
        map_instance = Map.objects.get(id=map_id, user=request.user)
    except Map.DoesNotExist:
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
        # 更新 Essay 內容
        essay, created = Essay.objects.get_or_create(
            map=map_instance, defaults={'user': request.user}
        )

        serializer = EssayContentSerializer(essay, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'essay': serializer.data})

        return Response(
            {'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )
