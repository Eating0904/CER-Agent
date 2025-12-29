from rest_framework import serializers

from .models import NodeFeedback


class CreateFeedbackSerializer(serializers.Serializer):
    """建立 Feedback 的請求 Serializer"""

    map_id = serializers.IntegerField()
    node_id = serializers.CharField(max_length=50)
    node_type = serializers.CharField(max_length=10, required=False)
    text = serializers.CharField()


class NodeFeedbackSerializer(serializers.ModelSerializer):
    """NodeFeedback 回應 Serializer"""

    class Meta:
        model = NodeFeedback
        fields = ['id', 'text', 'feedback', 'metadata', 'created_at']
