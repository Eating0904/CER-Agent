from django.db import models

from apps.essay.models import Essay
from apps.map.models import Map
from apps.user.models import User


class UserAction(models.Model):
    """記錄使用者的所有操作行為，用於行為分析"""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='actions', help_text='執行操作的使用者'
    )
    action_type = models.CharField(max_length=50, help_text='操作類型')
    timestamp = models.DateTimeField(auto_now_add=True, help_text='操作發生時間')

    # 關聯的資源（可為 null）
    map = models.ForeignKey(
        Map,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_actions',
        help_text='關聯的 Map',
    )
    essay = models.ForeignKey(
        Essay,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_actions',
        help_text='關聯的 Essay',
    )

    # 額外詳細資料
    metadata = models.JSONField(default=dict, blank=True, help_text='額外的詳細資料（JSON 格式）')

    class Meta:
        db_table = 'user_action'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action_type']),
            models.Index(fields=['map']),
        ]

    def __str__(self):
        return f'{self.user.username} - {self.action_type} at {self.timestamp}'
