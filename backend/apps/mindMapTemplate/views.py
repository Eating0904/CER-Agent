import logging

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MindMapTemplate, TemplatePermission
from .permissions import TemplatePermission as TemplatePermissionClass
from .serializers import (
    GrantPermissionSerializer,
    MindMapTemplateSerializer,
    TemplatePermissionSerializer,
)

logger = logging.getLogger(__name__)


class MindMapTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = MindMapTemplateSerializer
    permission_classes = [IsAuthenticated, TemplatePermissionClass]

    def get_queryset(self):
        """根據用戶角色和操作類型過濾 template 列表"""
        user = self.request.user

        # list action: 所有人都能看到所有 template（用於 template list 頁面）
        if self.action == 'list':
            return MindMapTemplate.objects.select_related('created_by').all()

        # my action: 返回用戶可以管理的 template（用於 management 頁面）
        if self.action == 'my':
            if user.role == 'admin':
                return MindMapTemplate.objects.select_related('created_by').all()

            if user.role == 'teacher':
                return MindMapTemplate.objects.select_related('created_by').filter(created_by=user)

            if user.role == 'assistant':
                return MindMapTemplate.objects.select_related('created_by').filter(permissions__assistant=user).distinct()

            return MindMapTemplate.objects.none()

        # retrieve: 所有人都能查看單一 template
        if self.action == 'retrieve':
            return MindMapTemplate.objects.select_related('created_by').all()

        # create/update/delete 等管理操作：根據角色過濾
        if user.role == 'admin':
            return MindMapTemplate.objects.select_related('created_by').all()

        if user.role == 'teacher':
            return MindMapTemplate.objects.select_related('created_by').filter(created_by=user)

        if user.role == 'assistant':
            return MindMapTemplate.objects.select_related('created_by').filter(permissions__assistant=user).distinct()

        return MindMapTemplate.objects.none()

    def perform_create(self, serializer):
        """建立 template 時自動設定 created_by"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my(self, request):
        """取得當前用戶可以管理的 templates"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def assistants(self, request, pk=None):
        """取得某個 template 的助教列表"""
        template = self.get_object()
        permissions = template.permissions.select_related('assistant', 'granted_by').all()
        serializer = TemplatePermissionSerializer(permissions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def grant_permission(self, request, pk=None):
        """授權助教管理此 template"""
        template = self.get_object()
        serializer = GrantPermissionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            assistant_id = serializer.validated_data['assistant_id']
            permission, created = TemplatePermission.objects.get_or_create(
                template=template, assistant_id=assistant_id, defaults={'granted_by': request.user}
            )

            if created:
                logger.info(
                    f'Permission granted: template_id={template.id}, assistant_id={assistant_id}, granted_by={request.user.id}'
                )
                return Response({'message': '授權成功'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': '此助教已被授權'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='revoke_permission/(?P<assistant_id>[^/.]+)')
    def revoke_permission(self, request, pk=None, assistant_id=None):
        """移除助教的管理權限"""
        template = self.get_object()

        try:
            permission = TemplatePermission.objects.get(
                template=template, assistant_id=assistant_id
            )
            permission.delete()
            logger.info(
                f'Permission revoked: template_id={template.id}, assistant_id={assistant_id}, revoked_by={request.user.id}'
            )
            return Response(status=status.HTTP_204_NO_CONTENT)

        except TemplatePermission.DoesNotExist:
            logger.warning(
                f'Permission not found: template_id={template.id}, assistant_id={assistant_id}'
            )
            return Response({'error': '找不到此授權記錄'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
