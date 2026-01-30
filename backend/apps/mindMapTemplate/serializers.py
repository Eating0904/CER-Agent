from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.common.utils.deadline_checker import check_template_deadline

from .models import MindMapTemplate, TemplatePermission

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """用戶基本資訊"""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class MindMapTemplateSerializer(serializers.ModelSerializer):
    created_by = UserBasicSerializer(read_only=True)
    can_manage_permissions = serializers.SerializerMethodField()
    is_within_deadline = serializers.SerializerMethodField()

    class Meta:
        model = MindMapTemplate
        fields = [
            'id',
            'name',
            'issue_topic',
            'article_content',
            'created_by',
            'created_at',
            'updated_at',
            'start_date',
            'end_date',
            'can_manage_permissions',
            'is_within_deadline',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_can_manage_permissions(self, obj):
        """判斷當前用戶是否可以管理此 template 的權限（只有 admin 和建立者可以）"""
        request = self.context.get('request')
        if not request or not request.user:
            return False

        user = request.user
        return user.role == 'admin' or obj.created_by == user

    def get_is_within_deadline(self, obj):
        return check_template_deadline(obj)


class TemplatePermissionSerializer(serializers.ModelSerializer):
    assistant = UserBasicSerializer(read_only=True)
    granted_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = TemplatePermission
        fields = ['id', 'assistant', 'granted_by', 'created_at']


class GrantPermissionSerializer(serializers.Serializer):
    """授權助教的 input serializer"""

    assistant_id = serializers.IntegerField()

    def validate_assistant_id(self, value):
        try:
            user = User.objects.get(id=value)
            if user.role != 'assistant':
                raise serializers.ValidationError('只能授權給助教角色的用戶')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('找不到此用戶')
