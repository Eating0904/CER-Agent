from django.db import models

from .models import Essay


class EssaySnapshot(models.Model):
    """記錄 Essay 的歷史版本（每次都存完整 content）"""

    essay = models.ForeignKey(Essay, on_delete=models.CASCADE, related_name='snapshots')
    content = models.TextField(help_text='快照時的完整 Essay 內容')
    sequence = models.PositiveIntegerField(help_text='每個 essay 內的自增序號，保證順序')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'essay_snapshot'
        ordering = ['sequence']
        indexes = [
            models.Index(fields=['essay', 'sequence']),
        ]

    def __str__(self):
        return f'Essay {self.essay_id} - snapshot #{self.sequence}'
