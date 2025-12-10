from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    map_id = serializers.IntegerField(required=True)
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )


class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'map_id', 'role', 'content', 'created_at']