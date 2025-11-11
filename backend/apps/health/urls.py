from rest_framework.routers import DefaultRouter

from .views import HealthViewSet

router = DefaultRouter()
router.register('', HealthViewSet, basename='health')
urlpatterns = router.urls
