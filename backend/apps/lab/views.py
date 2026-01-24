import logging

from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from .models import Lab
from .serializers import LabSerializer

logger = logging.getLogger(__name__)


class IsAdminUser(permissions.BasePermission):
    """只允許 admin 修改"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'


class LabViewSet(viewsets.ModelViewSet):
    """Lab ViewSet - 管理用戶實驗分組"""

    queryset = Lab.objects.all()
    serializer_class = LabSerializer
    permission_classes = [IsAdminUser]

    def update(self, request, *args, **kwargs):
        """更新分組，並記錄變更者"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            # 傳入 changed_by 給 save 方法
            serializer.save(changed_by=request.user)

            logger.info(
                f'Lab group updated: user_id={instance.user.id}, '
                f'new_group={instance.group}, changed_by={request.user.username}'
            )

            return Response(serializer.data)
        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
