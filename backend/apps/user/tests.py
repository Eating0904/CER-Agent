import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

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
        assert 'password' not in response_data  # 密碼不應該在回應中
        assert 'id' in response_data

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
        expected_fields = {'id', 'username', 'email'}
        assert set(response_data.keys()) == expected_fields
        assert 'password' not in response_data
