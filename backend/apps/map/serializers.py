from rest_framework import serializers
from .models import Map


class MapListSerializer(serializers.ModelSerializer):
    """輕量級序列化器，用於列表頁面（只返回 id 和 name）"""
    class Meta:
        model = Map
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class MapSerializer(serializers.ModelSerializer):
    """完整序列化器，用於詳細頁面"""
    class Meta:
        model = Map
        fields = ['id', 'name', 'user', 'template', 'nodes', 'edges', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateMapFromTemplateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    name = serializers.CharField(max_length=200, required=False)
