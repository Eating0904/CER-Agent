from rest_framework import routers

from .views import MindMapTemplateViewSet

router = routers.DefaultRouter()
router.register('', MindMapTemplateViewSet, basename='mind-map-template')
urlpatterns = router.urls
