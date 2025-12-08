from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    chat_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )


class ChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField(required=False)
    error = serializers.CharField(required=False)
