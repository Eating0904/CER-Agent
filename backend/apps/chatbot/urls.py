from django.urls import path
from .views import chat, get_chat_history, clear_chat_history

urlpatterns = [
    path('chat/', chat, name='chat'),
    path('history/<int:map_id>/', get_chat_history, name='get_chat_history'),
    path('history/clear/', clear_chat_history, name='clear_chat_history'),
]
