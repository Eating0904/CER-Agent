from rest_framework import routers
from .views import MapViewSet

router = routers.DefaultRouter()
router.register('', MapViewSet, basename='map')
urlpatterns = router.urls
