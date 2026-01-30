import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.utils.deadline_checker import check_template_deadline
from apps.mindMapTemplate.models import MindMapTemplate

from .models import Map
from .serializers import CreateMapFromTemplateSerializer, MapListSerializer, MapSerializer

logger = logging.getLogger(__name__)


class MapViewSet(viewsets.ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Map.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """列表使用輕量級序列化器，詳細頁面使用完整序列化器"""
        if self.action == 'list':
            return MapListSerializer
        return MapSerializer

    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        serializer = CreateMapFromTemplateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        template_id = serializer.validated_data['template_id']
        name = serializer.validated_data.get('name')

        try:
            template = MindMapTemplate.objects.get(id=template_id)
        except MindMapTemplate.DoesNotExist:
            logger.error(f'Template not found: template_id={template_id}')
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        # 檢查期限
        if not check_template_deadline(template):
            logger.warning(
                f'Template not available: template_id={template_id}, user={request.user.id}'
            )
            return Response(
                {'error': 'This task is not available'}, status=status.HTTP_403_FORBIDDEN
            )

        if not name:
            name = f'{template.name}'

        try:
            initial_nodes = [
                {
                    'id': 'c1',
                    'position': {'x': 0, 'y': 100},
                    'data': {
                        'type': 'C',
                        'content': 'Claim content...',
                        'showDots': ['right', 'bottom'],
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'e1',
                    'position': {'x': 300, 'y': 100},
                    'data': {
                        'type': 'E',
                        'content': 'Evidence content...',
                        'showDots': ['left', 'bottom'],
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'r1',
                    'position': {'x': 146, 'y': 230},
                    'data': {
                        'type': 'R',
                        'content': 'Reasoning content...',
                        'showDots': ['left', 'right'],
                    },
                    'type': 'baseNode',
                },
            ]

            initial_edges = [
                {
                    'id': 'c1-e1',
                    'source': 'c1',
                    'target': 'e1',
                    'sourceHandle': 'right',
                    'targetHandle': 'left',
                },
                {
                    'id': 'c1-r1',
                    'source': 'c1',
                    'target': 'r1',
                    'sourceHandle': 'bottom',
                    'targetHandle': 'left',
                },
                {
                    'id': 'e1-r1',
                    'source': 'e1',
                    'target': 'r1',
                    'sourceHandle': 'bottom',
                    'targetHandle': 'right',
                },
            ]

            map_instance = Map.objects.create(
                name=name,
                user=request.user,
                template=template,
                nodes=initial_nodes,
                edges=initial_edges,
            )

            map_serializer = MapSerializer(map_instance)
            logger.info(
                f'Map created from template: map_id={map_instance.id}, template_id={template_id}, user={request.user.id}'
            )
            return Response(map_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        """更新 map 之前檢查期限"""
        instance = self.get_object()

        if instance.template and not check_template_deadline(instance.template):
            logger.warning(
                f'Template expired, cannot update map: map_id={instance.id}, user={request.user.id}'
            )
            return Response(
                {'error': 'This task has expired and cannot be edited'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().partial_update(request, *args, **kwargs)
