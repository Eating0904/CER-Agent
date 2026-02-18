from django.db import models

from apps.mindMapTemplate.models import MindMapTemplate
from apps.user.models import User


class Map(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maps')
    template = models.ForeignKey(
        MindMapTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='maps'
    )
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    scoring_remaining = models.IntegerField(default=5, help_text='心智圖評分剩餘次數')
    scoring_updated_at = models.DateTimeField(
        null=True, blank=True, help_text='上次評分次數變動時間（供未來重置機制使用）'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'map'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
