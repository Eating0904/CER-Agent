from rest_framework import serializers

from .models import NodeFeedback


class CreateFeedbackSerializer(serializers.Serializer):
    """建立 Feedback 的請求 Serializer"""

    map_id = serializers.IntegerField()
    operations = serializers.ListField(
        child=serializers.DictField(), min_length=1, help_text='操作列表'
    )
    alert_message = serializers.CharField(help_text='前端組成的 alert 訊息')

    def validate_operations(self, value):
        """驗證 operations 列表格式"""
        for op in value:
            action = op.get('action')
            if not action:
                raise serializers.ValidationError("Each operation must have an 'action' field")

            if action not in ['edit', 'connect']:
                raise serializers.ValidationError(f'Unknown action: {action}')

            if action == 'edit' and 'node_id' not in op:
                raise serializers.ValidationError("edit action requires 'node_id'")
            elif action == 'connect' and 'connected_nodes' not in op:
                raise serializers.ValidationError("connect action requires 'connected_nodes'")

        return value


class NodeFeedbackSerializer(serializers.ModelSerializer):
    """NodeFeedback 回應 Serializer"""

    class Meta:
        model = NodeFeedback
        fields = ['id', 'text', 'feedback', 'metadata', 'created_at']
