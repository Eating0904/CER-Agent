from django.urls import path

from .views import essay_detail, view_essay_detail

urlpatterns = [
    path('<int:map_id>/', essay_detail, name='essay_detail'),
    path('view/<int:map_id>/', view_essay_detail, name='view_essay_detail'),
]
