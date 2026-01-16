from django.urls import path

from .views import chat, get_chat_history

urlpatterns = [
    # Mind Map chat
    path('mindmap/chat/', chat, {'chat_type': 'mindmap'}, name='mindmap_chat'),
    path(
        'mindmap/history/<int:map_id>/',
        get_chat_history,
        {'chat_type': 'mindmap'},
        name='mindmap_chat_history',
    ),
    # Essay chat
    path('essay/chat/', chat, {'chat_type': 'essay'}, name='essay_chat'),
    path(
        'essay/history/<int:map_id>/',
        get_chat_history,
        {'chat_type': 'essay'},
        name='essay_chat_history',
    ),
]
