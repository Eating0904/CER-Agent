from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LabViewSet

router = DefaultRouter()
router.register(r'', LabViewSet, basename='lab')

urlpatterns = [
    path('', include(router.urls)),
]
