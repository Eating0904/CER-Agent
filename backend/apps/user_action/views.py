import logging

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserAction
from .serializers import UserActionSerializer

logger = logging.getLogger(__name__)


class UserActionViewSet(viewsets.ModelViewSet):
    """UserAction ViewSet - 只提供建立行為記錄功能"""

    queryset = UserAction.objects.all()
    serializer_class = UserActionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']  # 只允許 POST 方法

    def create(self, request, *args, **kwargs):
        """建立行為記錄"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f'Failed to create user action: {e}', exc_info=True)
            return Response(
                {'error': 'Failed to create user action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
