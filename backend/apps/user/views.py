import logging

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.user_action.models import UserAction

from .serializers import RegisterSerializer, UserSerializer

logger = logging.getLogger(__name__)


class UserViewSet(viewsets.GenericViewSet):
    queryset = get_user_model().objects.all()

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'register':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request: Request):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            logger.info(f'User registered: user_id={user.id}, username={user.username}')

            # 記錄註冊行為
            UserAction.objects.create(user=user, action_type='register', metadata={})

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request: Request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request: Request):
        """搜尋用戶（支援角色過濾）"""
        query = request.query_params.get('q', '')
        role = request.query_params.get('role', None)

        users = get_user_model().objects.all()

        # 角色過濾
        if role:
            users = users.filter(role=role)

        # 關鍵字搜尋
        if query:
            users = users.filter(Q(username__icontains=query) | Q(email__icontains=query))

        users = users[:10]  # 限制回傳數量
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)
