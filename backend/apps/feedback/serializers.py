from rest_framework import serializers

from .models import NodeFeedback


class CreateFeedbackSerializer(serializers.Serializer):
    """建立 Feedback 的請求 Serializer"""

    map_id = serializers.IntegerField()
    text = serializers.CharField()
    meta = serializers.JSONField()

    def validate_meta(self, value):
        action = value.get('action')

        if action == 'edit':
            if 'node_id' not in value:
                raise serializers.ValidationError("edit action requires 'node_id'")
        elif action == 'connect':
            if 'connected_nodes' not in value or len(value['connected_nodes']) != 2:
                raise serializers.ValidationError(
                    "connect action requires 'connected_nodes' with 2 nodes"
                )
        else:
            raise serializers.ValidationError(f'Unknown action: {action}')

        return value


class NodeFeedbackSerializer(serializers.ModelSerializer):
    """NodeFeedback 回應 Serializer"""

    class Meta:
        model = NodeFeedback
        fields = ['id', 'text', 'feedback', 'metadata', 'created_at']
