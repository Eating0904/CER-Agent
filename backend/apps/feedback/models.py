from django.db import models

from apps.map.models import Map
from apps.user.models import User


class NodeFeedback(models.Model):
    """儲存 Node 編輯的 LLM feedback"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='node_feedbacks')
    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name='node_feedbacks')
    text = models.TextField(help_text='Alert 的 message 內容')
    feedback = models.TextField(blank=True, help_text='LLM 生成的回饋')
    metadata = models.JSONField(
        default=dict, help_text='操作資訊，例如 {"action": "edit", "node_id": "c1"}'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback_nodefeedback'
        ordering = ['-created_at']

    def __str__(self):
        return f'Feedback for {self.map.name} - {self.text[:30]}'
