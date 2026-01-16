from rest_framework import serializers

from .models import Essay


class EssaySerializer(serializers.ModelSerializer):
    """Essay 序列化器"""

    class Meta:
        model = Essay
        fields = ['id', 'map', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EssayContentSerializer(serializers.ModelSerializer):
    """輕量級序列化器，只處理內容更新"""

    class Meta:
        model = Essay
        fields = ['id', 'content', 'updated_at']
        read_only_fields = ['id', 'updated_at']
