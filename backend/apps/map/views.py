from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Map
from .serializers import MapSerializer, CreateMapFromTemplateSerializer
from apps.mindMapTemplate.models import MindMapTemplate


class MapViewSet(viewsets.ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Map.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        serializer = CreateMapFromTemplateSerializer(data=request.data)
        if serializer.is_valid():
            template_id = serializer.validated_data['template_id']
            name = serializer.validated_data.get('name')

            try:
                template = MindMapTemplate.objects.get(id=template_id)
            except MindMapTemplate.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not name:
                name = f"{template.name}"

            initial_nodes = [
                {
                    'id': 'c1',
                    'position': {'x': 0, 'y': 100},
                    'data': {
                        'type': 'C',
                        'content': 'Claim content...',
                        'showDots' : ['right', 'bottom'],
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'e1',
                    'position': {'x': 300, 'y': 100},
                    'data': {
                        'type': 'E',
                        'content': 'Evidence content...',
                        'showDots' : ['left', 'bottom'],
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'r1',
                    'position': {'x': 146, 'y': 230},
                    'data': {
                        'type': 'R',
                        'content': 'Reasoning content...',
                        'showDots' : ['left', 'right'],
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
                article_topic=template.article_topic,
                article_content=template.article_content,
                nodes=initial_nodes,
                edges=initial_edges
            )

            map_serializer = MapSerializer(map_instance)
            return Response(map_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
