import logging

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserAction
from .serializers import UserActionSerializer

logger = logging.getLogger(__name__)


class UserActionViewSet(viewsets.ModelViewSet):
    """UserAction ViewSet - 提供建立和更新行為記錄功能"""

    queryset = UserAction.objects.all()
    serializer_class = UserActionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['post', 'patch']  # 允許 POST 和 PATCH 方法

    def create(self, request, *args, **kwargs):
        """建立行為記錄，返回包含 id 的資料"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            # 返回包含 id 的資料
            return Response(
                {'id': serializer.instance.id, **serializer.data}, status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f'Failed to create user action: {e}', exc_info=True)
            return Response(
                {'error': 'Failed to create user action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def partial_update(self, request, *args, **kwargs):
        """更新行為記錄的 metadata（僅允許更新 metadata 欄位）"""
        try:
            instance = self.get_object()

            # 只允許更新 metadata
            if 'metadata' not in request.data:
                return Response(
                    {'error': 'Only metadata field can be updated'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 合併現有 metadata 和新 metadata
            current_metadata = instance.metadata or {}
            new_metadata = request.data.get('metadata', {})
            updated_metadata = {**current_metadata, **new_metadata}

            instance.metadata = updated_metadata
            instance.save()

            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f'Failed to update user action: {e}', exc_info=True)
            return Response(
                {'error': 'Failed to update user action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
