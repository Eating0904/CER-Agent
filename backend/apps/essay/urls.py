from django.urls import path

from .views import essay_detail

urlpatterns = [
    path('<int:map_id>/', essay_detail, name='essay_detail'),
]
