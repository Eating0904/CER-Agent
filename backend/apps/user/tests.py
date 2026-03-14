from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.user.models import EmailVerification

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_data():
    return {'username': 'testuser', 'email': 'test@example.com', 'password': 'testpassword123'}


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='existinguser', email='existing@example.com', password='existingpassword123'
    )


@pytest.mark.django_db
class TestUserRegister:
    def test_register_user_success(self, api_client, user_data):
        """測試成功註冊用戶"""
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username=user_data['username']).exists()

        response_data = response.json()
        assert response_data['username'] == user_data['username']
        assert response_data['email'] == user_data['email']
        assert response_data['is_verified'] is False
        assert 'password' not in response_data  # 密碼不應該在回應中
        assert 'id' in response_data

    def test_register_creates_verification_record(self, api_client, user_data):
        """測試註冊後自動建立驗證碼"""
        url = reverse('user-register')
        api_client.post(url, user_data)

        user = User.objects.get(username=user_data['username'])
        assert EmailVerification.objects.filter(user=user, purpose='email_verify').exists()

    def test_register_user_missing_username(self, api_client, user_data):
        """測試缺少 username 的註冊"""
        user_data.pop('username')
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.json()

    def test_register_user_missing_email(self, api_client, user_data):
        """測試缺少 email 的註冊"""
        user_data.pop('email')
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.json()

    def test_register_user_missing_password(self, api_client, user_data):
        """測試缺少 password 的註冊"""
        user_data.pop('password')
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()

    def test_register_user_invalid_email(self, api_client, user_data):
        """測試無效 email 格式的註冊"""
        user_data['email'] = 'invalid-email'
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.json()

    def test_register_user_weak_password(self, api_client, user_data):
        """測試弱密碼的註冊"""
        user_data['password'] = '123'  # 過於簡單的密碼
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()

    def test_register_user_duplicate_username(self, api_client, user_data, user):
        """測試重複 username 的註冊"""
        user_data['username'] = user.username
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.json()

    def test_register_user_duplicate_email(self, api_client, user_data, user):
        """測試重複 email 的註冊"""
        user_data['email'] = user.email
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.json()


@pytest.mark.django_db
class TestVerifyEmail:
    def test_verify_email_success(self, api_client, user_data):
        """測試成功驗證 email"""
        register_url = reverse('user-register')
        api_client.post(register_url, user_data)

        user = User.objects.get(username=user_data['username'])
        verification = EmailVerification.objects.get(user=user, purpose='email_verify')

        url = reverse('user-verify-email')
        response = api_client.post(url, {'email': user_data['email'], 'code': verification.code})

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.is_verified is True

    def test_verify_email_wrong_code(self, api_client, user_data):
        """測試錯誤的驗證碼"""
        register_url = reverse('user-register')
        api_client.post(register_url, user_data)

        url = reverse('user-verify-email')
        response = api_client.post(url, {'email': user_data['email'], 'code': '000000'})

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_email_nonexistent_user(self, api_client):
        """測試不存在的用戶"""
        url = reverse('user-verify-email')
        response = api_client.post(url, {'email': 'nobody@example.com', 'code': '123456'})

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_verify_email_already_verified(self, api_client, user):
        """測試已驗證的用戶"""
        user.is_verified = True
        user.save()

        url = reverse('user-verify-email')
        response = api_client.post(url, {'email': user.email, 'code': '123456'})

        assert response.status_code == status.HTTP_200_OK
        assert 'already' in response.json()['message'].lower()

    def test_verify_email_expired_code(self, api_client, user_data):
        """測試過期的驗證碼"""
        register_url = reverse('user-register')
        api_client.post(register_url, user_data)

        user = User.objects.get(username=user_data['username'])
        verification = EmailVerification.objects.get(user=user, purpose='email_verify')

        # 手動將 created_at 設為 25 小時前
        EmailVerification.objects.filter(id=verification.id).update(
            created_at=timezone.now() - timedelta(hours=25)
        )

        url = reverse('user-verify-email')
        response = api_client.post(url, {'email': user_data['email'], 'code': verification.code})

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestResendVerification:
    def test_resend_verification_success(self, api_client, user_data):
        """測試成功重寄驗證碼"""
        register_url = reverse('user-register')
        api_client.post(register_url, user_data)

        # 手動將上一次的 created_at 設為 61 秒前（繞開冷卻）
        user = User.objects.get(username=user_data['username'])
        EmailVerification.objects.filter(user=user).update(
            created_at=timezone.now() - timedelta(seconds=61)
        )

        url = reverse('user-resend-verification')
        response = api_client.post(url, {'email': user_data['email']})

        assert response.status_code == status.HTTP_200_OK
        assert EmailVerification.objects.filter(user=user, purpose='email_verify').count() == 2

    def test_resend_verification_cooldown(self, api_client, user_data):
        """測試 60 秒冷卻"""
        register_url = reverse('user-register')
        api_client.post(register_url, user_data)

        url = reverse('user-resend-verification')
        response = api_client.post(url, {'email': user_data['email']})

        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_resend_verification_already_verified(self, api_client, user):
        """測試已驗證用戶不會收到驗證碼"""
        user.is_verified = True
        user.save()

        url = reverse('user-resend-verification')
        response = api_client.post(url, {'email': user.email})

        assert response.status_code == status.HTTP_200_OK
        assert 'already' in response.json()['message'].lower()

    def test_resend_verification_nonexistent_email(self, api_client):
        """測試不存在的 email（不洩漏資訊）"""
        url = reverse('user-resend-verification')
        response = api_client.post(url, {'email': 'nobody@example.com'})

        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestUserMe:
    def test_me_authenticated_user(self, api_client, user):
        """測試已認證用戶獲取自己的資訊"""
        api_client.force_authenticate(user=user)
        url = reverse('user-me')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

        response_data = response.json()
        assert response_data['id'] == user.id
        assert response_data['username'] == user.username
        assert response_data['email'] == user.email
        assert 'is_verified' in response_data
        assert 'password' not in response_data

    def test_me_unauthenticated_user(self, api_client):
        """測試未認證用戶獲取資訊"""
        url = reverse('user-me')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_endpoint_only_supports_get(self, api_client, user):
        """測試 me endpoint 只支援 GET 方法"""
        api_client.force_authenticate(user=user)
        url = reverse('user-me')

        # 測試 POST 方法不被允許
        response = api_client.post(url, {})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # 測試 PUT 方法不被允許
        response = api_client.put(url, {})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # 測試 DELETE 方法不被允許
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
class TestUserViewSetPermissions:
    def test_register_allows_anonymous_users(self, api_client, user_data):
        """測試 register endpoint 允許匿名用戶"""
        url = reverse('user-register')
        response = api_client.post(url, user_data)

        # 應該成功，不需要認證
        assert response.status_code == status.HTTP_201_CREATED

    def test_me_requires_authentication(self, api_client):
        """測試 me endpoint 需要認證"""
        url = reverse('user-me')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserViewSetSerializerClass:
    def test_register_action_uses_register_serializer(self, api_client, user_data):
        """測試 register action 使用 RegisterSerializer"""
        url = reverse('user-register')

        # 測試 RegisterSerializer 的特有驗證
        invalid_data = user_data.copy()
        invalid_data['password'] = '123'  # 弱密碼，RegisterSerializer 會驗證

        response = api_client.post(url, invalid_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.json()

    def test_me_action_uses_user_serializer(self, api_client, user):
        """測試 me action 使用 UserSerializer"""
        api_client.force_authenticate(user=user)
        url = reverse('user-me')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()

        # UserSerializer 的特定欄位
        assert 'is_verified' in response_data
        assert 'password' not in response_data
