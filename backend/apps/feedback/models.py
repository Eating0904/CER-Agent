from django.db import models

from apps.map.models import Map
from apps.user.models import User


class NodeFeedback(models.Model):
    """儲存 Node 編輯的 LLM feedback"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='node_feedbacks')
    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name='node_feedbacks')
    text = models.TextField(help_text='Alert 的 message 內容（例如：完成了 3 個操作）')
    operation_details = models.TextField(
        blank=True,
        default='',
        help_text='具體操作描述（例如：學生進行了以下操作：\n1. 編輯了節點 c1）',
    )
    feedback = models.TextField(blank=True, help_text='LLM 生成的回饋')
    metadata = models.JSONField(default=dict, help_text='操作資訊 JSON，例如 {"operations": [...]}')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback_nodefeedback'
        ordering = ['-created_at']

    def __str__(self):
        return f'Feedback for {self.map.name} - {self.text[:30]}'
