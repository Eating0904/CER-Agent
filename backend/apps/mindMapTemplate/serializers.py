from rest_framework import serializers
from .models import MindMapTemplate

class MindMapTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMapTemplate
        fields = ['id', 'name', 'issue_topic', 'article_content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
