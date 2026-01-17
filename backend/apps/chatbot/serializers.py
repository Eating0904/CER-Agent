from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    map_id = serializers.IntegerField(required=True)
    chat_history = serializers.ListField(
        child=serializers.DictField(), required=False, default=list
    )
    essay_plain_text = serializers.CharField(required=False, allow_blank=True, default='')
