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
                    'id': 'topic',
                    'position': {'x': 80, 'y': 150},
                    'data': {
                        'content': template.article_topic,
                        'showDots': ['bottom', 'left', 'right'],
                        'customSize': {'width': '200px'},
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'claim',
                    'position': {'x': 0, 'y': 100},
                    'data': {
                        'content': 'Claim',
                        'customColor': {
                            'backgroundColor': '#D9F2D0',
                            'borderColor': '#00AE4C',
                            'dotColor': '#00AE4C',
                        },
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'evidence',
                    'position': {'x': 300, 'y': 100},
                    'data': {
                        'content': 'Evidence',
                        'customColor': {
                            'backgroundColor': '#FFEDCD',
                            'borderColor': '#EBA62B',
                            'dotColor': '#EBA62B',
                        },
                    },
                    'type': 'baseNode',
                },
                {
                    'id': 'reasoning',
                    'position': {'x': 146, 'y': 230},
                    'data': {
                        'content': 'Reasoning',
                        'customColor': {
                            'backgroundColor': '#DBE9F7',
                            'borderColor': '#0070C0',
                            'dotColor': '#0070C0',
                        },
                    },
                    'type': 'baseNode',
                },
            ]

            initial_edges = [
                {
                    'id': 'topic-claim',
                    'source': 'topic',
                    'target': 'claim',
                    'sourceHandle': 'left',
                    'targetHandle': 'bottom',
                },
                {
                    'id': 'topic-evidence',
                    'source': 'topic',
                    'target': 'evidence',
                    'sourceHandle': 'right',
                    'targetHandle': 'bottom',
                },
                {
                    'id': 'topic-reasoning',
                    'source': 'topic',
                    'target': 'reasoning',
                    'sourceHandle': 'bottom',
                    'targetHandle': 'top',
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
