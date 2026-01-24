from rest_framework import serializers

from .models import Lab


class LabSerializer(serializers.ModelSerializer):
    """Lab 序列化器"""

    class Meta:
        model = Lab
        fields = ['id', 'group', 'log', 'created_at', 'updated_at']
        read_only_fields = ['id', 'log', 'created_at', 'updated_at']
