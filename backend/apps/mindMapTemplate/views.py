from rest_framework import viewsets

from .models import MindMapTemplate
from .serializers import MindMapTemplateSerializer


class MindMapTemplateViewSet(viewsets.ModelViewSet):
    queryset = MindMapTemplate.objects.all()
    serializer_class = MindMapTemplateSerializer
