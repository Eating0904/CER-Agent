from rest_framework import serializers

from apps.essay.models import Essay
from apps.feedback.models import NodeFeedback
from apps.map.models import Map

from .models import UserAction


class UserActionSerializer(serializers.ModelSerializer):
    """UserAction 序列化器"""

    map_id = serializers.PrimaryKeyRelatedField(
        queryset=Map.objects.all(), source='map', required=False, allow_null=True
    )
    essay_id = serializers.PrimaryKeyRelatedField(
        queryset=Essay.objects.all(), source='essay', required=False, allow_null=True
    )
    feedback_id = serializers.PrimaryKeyRelatedField(
        queryset=NodeFeedback.objects.all(),
        source='feedback',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = UserAction
        fields = [
            'id',
            'user',
            'action_type',
            'timestamp',
            'map_id',
            'essay_id',
            'feedback_id',
            'metadata',
        ]
        read_only_fields = ['id', 'user', 'timestamp']

    def validate_action_type(self, value):
        """驗證 action_type 是否合法"""
        valid_action_types = [
            'register',
            'login',
            'click_add_new_button',
            'create_map',
            'rename_map',
            'switch_map',
            'switch_view',
            'add_node',
            'delete_node',
            'node_edit_start',
            'node_edit_end',
            'adjust_font_style',
            'adjust_node_style',
            'adjust_handle',
            'delete_edge',
            'manual_save_map',
            'auto_save_map',
            'auto_save_essay',
            'ai_feedback_shown',
            'click_feedback_ask',
            'chat_in_mindmap',
            'click_scoring_mindmap',
            'chat_in_essay',
            'click_save_essay_with_scoring',
            'essay_edit_start',
            'essay_edit_end',
            'page_view_start',
            'page_view_end',
        ]

        if value not in valid_action_types:
            raise serializers.ValidationError(f'Invalid action_type: {value}')

        return value

    def create(self, validated_data):
        """建立 UserAction，自動填入 user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
