from rest_framework import serializers
from .models import Map


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ['id', 'name', 'user', 'template', 'nodes', 'edges', 'article_topic', 'article_content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateMapFromTemplateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    name = serializers.CharField(max_length=200, required=False)
