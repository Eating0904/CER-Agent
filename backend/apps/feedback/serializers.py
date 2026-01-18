from rest_framework import serializers

from .models import NodeFeedback


class CreateFeedbackSerializer(serializers.Serializer):
    """建立 Feedback 的請求 Serializer"""

    map_id = serializers.IntegerField()
    metadata = serializers.ListField(
        child=serializers.DictField(), min_length=1, help_text='操作列表（metadata）'
    )
    alert_title = serializers.CharField(help_text='前端組成的 alert 標題')
    operation_details = serializers.CharField(help_text='前端組成的具體操作描述')

    def validate_metadata(self, value):
        """驗證 metadata 列表格式"""
        for op in value:
            action = op.get('action')
            if not action:
                raise serializers.ValidationError("Each operation must have an 'action' field")

            if action not in ['edit', 'connect', 'delete_node', 'delete_edge']:
                raise serializers.ValidationError(f'Unknown action: {action}')

            # 驗證 edit 動作的必要欄位
            if action == 'edit':
                required_fields = ['node_id', 'node_type', 'original_content', 'updated_content']
                for field in required_fields:
                    if field not in op:
                        raise serializers.ValidationError(f"edit action requires '{field}'")

            # 驗證 connect 動作的必要欄位
            elif action == 'connect':
                if 'connected_nodes' not in op:
                    raise serializers.ValidationError("connect action requires 'connected_nodes'")
                if 'nodes_content' not in op:
                    raise serializers.ValidationError("connect action requires 'nodes_content'")

            # 驗證 delete_node 動作的必要欄位
            elif action == 'delete_node':
                required_fields = ['node_id', 'node_type', 'node_content']
                for field in required_fields:
                    if field not in op:
                        raise serializers.ValidationError(f"delete_node action requires '{field}'")
                # deleted_connections 是選填的（可能沒有連接的邊）

            # 驗證 delete_edge 動作的必要欄位
            elif action == 'delete_edge':
                if 'connected_nodes' not in op:
                    raise serializers.ValidationError(
                        "delete_edge action requires 'connected_nodes'"
                    )
                if 'nodes_content' not in op:
                    raise serializers.ValidationError("delete_edge action requires 'nodes_content'")

        return value


class NodeFeedbackSerializer(serializers.ModelSerializer):
    """NodeFeedback 回應 Serializer"""

    class Meta:
        model = NodeFeedback
        fields = ['id', 'alert_title', 'operation_details', 'feedback', 'metadata', 'created_at']
