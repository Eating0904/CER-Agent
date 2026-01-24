from rest_framework.routers import DefaultRouter

from .views import UserActionViewSet

router = DefaultRouter()
router.register(r'', UserActionViewSet, basename='user-action')

urlpatterns = router.urls
