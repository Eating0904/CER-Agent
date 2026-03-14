import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.common.services.email_service import generate_verification_code, send_verification_email
from apps.user_action.models import UserAction

from .models import EmailVerification
from .serializers import (
    ForgotPasswordSerializer,
    RegisterSerializer,
    ResendVerificationSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)

logger = logging.getLogger(__name__)

COOLDOWN_SECONDS = 60
PASSWORD_RESET_EXPIRY_MINUTES = 10


class UserViewSet(viewsets.GenericViewSet):
    queryset = get_user_model().objects.all()

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        if self.action == 'verify_email':
            return VerifyEmailSerializer
        if self.action == 'resend_verification':
            return ResendVerificationSerializer
        if self.action == 'forgot_password':
            return ForgotPasswordSerializer
        if self.action == 'reset_password':
            return ResetPasswordSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in (
            'register',
            'verify_email',
            'resend_verification',
            'verification_status',
            'forgot_password',
            'reset_password',
        ):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = serializer.save()
            logger.info(f'User registered: user_id={user.id}, username={user.username}')

            # 記錄註冊行為
            UserAction.objects.create(user=user, action_type='register', metadata={})

            # 寄送驗證碼
            self._send_verification_code(user, 'email_verify')

            data = UserSerializer(user).data
            data['cooldown_remaining'] = COOLDOWN_SECONDS
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='verify-email')
    def verify_email(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({'message': 'Email already verified.'})

        try:
            expiry_threshold = timezone.now() - timedelta(
                hours=EmailVerification.EXPIRY_HOURS['email_verify']
            )
            verification = EmailVerification.objects.filter(
                user=user,
                code=code,
                purpose='email_verify',
                is_used=False,
                created_at__gte=expiry_threshold,
            ).first()

            if not verification:
                return Response(
                    {'error': 'Invalid or expired verification code.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            verification.is_used = True
            verification.save()
            user.is_verified = True
            user.save()

            logger.info(f'Email verified: user_id={user.id}, email={email}')
            return Response({'message': 'Email verified successfully.'})
        except Exception as e:
            logger.exception(f'Email verification failed: email={email}, error={e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='resend-verification')
    def resend_verification(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({'message': 'If the email exists, a verification code has been sent.'})

        if user.is_verified:
            return Response({'message': 'Email already verified.'})

        try:
            remaining = self._check_cooldown(user, 'email_verify')
            if remaining > 0:
                return Response(
                    {
                        'error': 'Please wait before requesting a new code.',
                        'cooldown_remaining': remaining,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            self._send_verification_code(user, 'email_verify')
            logger.info(f'Verification code resent: user_id={user.id}, email={email}')
            return Response(
                {'message': 'Verification code sent.', 'cooldown_remaining': COOLDOWN_SECONDS}
            )
        except Exception as e:
            logger.exception(f'Resend verification failed: email={email}, error={e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='verification-status')
    def verification_status(self, request: Request):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({'is_verified': False, 'cooldown_remaining': 0})

        try:
            if user.is_verified:
                return Response({'is_verified': True, 'cooldown_remaining': 0})

            latest = EmailVerification.objects.filter(
                user=user,
                purpose='email_verify',
            ).first()

            if latest:
                elapsed = (timezone.now() - latest.created_at).total_seconds()
                remaining = max(0, int(COOLDOWN_SECONDS - elapsed))
            else:
                remaining = 0

            return Response({'is_verified': False, 'cooldown_remaining': remaining})
        except Exception as e:
            logger.exception(f'Verification status check failed: email={email}, error={e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request: Request):
        try:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            logger.exception(f'Failed to get user info: user_id={request.user.id}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def search(self, request: Request):
        """搜尋用戶（支援角色過濾）"""
        try:
            query = request.query_params.get('q', '')
            role = request.query_params.get('role', None)

            users = get_user_model().objects.select_related('lab').all()

            # 角色過濾
            if role:
                users = users.filter(role=role)

            # 關鍵字搜尋
            if query:
                users = users.filter(Q(username__icontains=query) | Q(email__icontains=query))

            users = users[:10]  # 限制回傳數量
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.exception(f'User search failed: user_id={request.user.id}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _send_verification_code(self, user, purpose):
        code = generate_verification_code()
        try:
            EmailVerification.objects.create(user=user, code=code, purpose=purpose)
        except Exception as e:
            logger.exception(f'Failed to create verification record: user_id={user.id}, error={e}')
            raise
        try:
            send_verification_email(user.email, code, purpose)
        except Exception as e:
            logger.error(f'Failed to send verification email to {user.email}: {e}')

    def _check_cooldown(self, user, purpose):
        try:
            cooldown_threshold = timezone.now() - timedelta(seconds=COOLDOWN_SECONDS)
            latest = EmailVerification.objects.filter(
                user=user,
                purpose=purpose,
                created_at__gte=cooldown_threshold,
            ).first()

            if latest:
                elapsed = (timezone.now() - latest.created_at).total_seconds()
                return max(0, int(COOLDOWN_SECONDS - elapsed))
            return 0
        except Exception as e:
            logger.exception(
                f'Cooldown check failed: user_id={user.id}, purpose={purpose}, error={e}'
            )
            raise

    @action(detail=False, methods=['post'], url_path='forgot-password')
    def forgot_password(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({'message': 'If the email exists, a reset code has been sent.'})

        try:
            remaining = self._check_cooldown(user, 'password_reset')
            if remaining > 0:
                return Response(
                    {
                        'error': 'Please wait before requesting a new code.',
                        'cooldown_remaining': remaining,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            self._send_verification_code(user, 'password_reset')
            logger.info(f'Password reset code sent: user_id={user.id}, email={email}')
            return Response({'message': 'Reset code sent.', 'cooldown_remaining': COOLDOWN_SECONDS})
        except Exception as e:
            logger.exception(f'Forgot password failed: email={email}, error={e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            expiry_threshold = timezone.now() - timedelta(minutes=PASSWORD_RESET_EXPIRY_MINUTES)
            verification = EmailVerification.objects.filter(
                user=user,
                code=code,
                purpose='password_reset',
                is_used=False,
                created_at__gte=expiry_threshold,
            ).first()

            if not verification:
                return Response(
                    {'error': 'Invalid or expired reset code.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            verification.is_used = True
            verification.save()
            user.set_password(new_password)
            user.is_verified = True
            user.save()

            logger.info(f'Password reset: user_id={user.id}, email={email}')
            return Response({'message': 'Password reset successfully.'})
        except Exception as e:
            logger.exception(f'Password reset failed: email={email}, error={e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
