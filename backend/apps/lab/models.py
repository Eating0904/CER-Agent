from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone


class Lab(models.Model):
    """用戶實驗分組模型"""

    GROUP_CHOICES = [
        ('active', 'Active'),
        ('passive', 'Passive'),
    ]

    user = models.OneToOneField(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='lab',
        verbose_name='用戶',
    )
    group = models.CharField(
        max_length=20,
        choices=GROUP_CHOICES,
        default='active',
        verbose_name='實驗組別',
    )
    log = models.JSONField(
        default=list,
        verbose_name='變更歷史',
        help_text='記錄所有組別變更的歷史',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lab'
        verbose_name = '實驗分組'
        verbose_name_plural = '實驗分組'

    def save(self, *args, **kwargs):
        """覆寫 save 方法，自動記錄組別變更"""
        # 取得當前請求的用戶（從 kwargs 傳入）
        changed_by = kwargs.pop('changed_by', None)

        if self.pk:  # 如果是更新操作
            old_instance = Lab.objects.get(pk=self.pk)
            if old_instance.group != self.group:
                # 組別有變更，記錄 log
                log_entry = {
                    'timestamp': timezone.now().isoformat(),
                    'old_group': old_instance.group,
                    'new_group': self.group,
                    'changed_by': changed_by.username if changed_by else 'system',
                }
                self.log.append(log_entry)
        else:
            # 新建記錄
            log_entry = {
                'timestamp': timezone.now().isoformat(),
                'old_group': None,
                'new_group': self.group,
                'changed_by': changed_by.username if changed_by else 'system',
            }
            self.log.append(log_entry)

        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} - {self.group}'
