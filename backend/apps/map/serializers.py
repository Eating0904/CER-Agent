from rest_framework import serializers

from apps.mindMapTemplate.serializers import MindMapTemplateSerializer

from .models import Map


class MapListSerializer(serializers.ModelSerializer):
    """輕量級序列化器，用於列表頁面（只返回 id 和 name）"""

    class Meta:
        model = Map
        fields = ['id', 'name', 'scoring_remaining', 'created_at', 'updated_at']
        read_only_fields = ['id', 'scoring_remaining', 'created_at', 'updated_at']


class MapSerializer(serializers.ModelSerializer):
    """完整序列化器，用於詳細頁面"""

    template = MindMapTemplateSerializer(read_only=True)

    class Meta:
        model = Map
        fields = [
            'id',
            'name',
            'user',
            'template',
            'nodes',
            'edges',
            'scoring_remaining',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'scoring_remaining', 'created_at', 'updated_at']


class CreateMapFromTemplateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    name = serializers.CharField(max_length=200, required=False)


class MapViewUserSerializer(serializers.Serializer):
    """view_list 用：只取 username"""

    id = serializers.IntegerField()
    username = serializers.CharField()


class MapViewTemplateSerializer(serializers.Serializer):
    """view_list 用：只取 template id 和 name"""

    id = serializers.IntegerField()
    name = serializers.CharField()


class MapViewListSerializer(serializers.ModelSerializer):
    """view_list 用：輕量級序列化器，供查看所有學生 maps 使用"""

    user = MapViewUserSerializer(read_only=True)
    template = MapViewTemplateSerializer(read_only=True)

    class Meta:
        model = Map
        fields = ['id', 'name', 'user', 'template', 'created_at', 'updated_at']
        read_only_fields = ['id', 'name', 'created_at', 'updated_at']
