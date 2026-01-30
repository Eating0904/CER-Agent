from django.conf import settings
from django.db import models


class MindMapTemplate(models.Model):
    name = models.CharField(max_length=200)
    issue_topic = models.TextField()
    article_content = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_templates',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateTimeField(null=True, blank=True, help_text='Task opening date and time')
    end_date = models.DateTimeField(null=True, blank=True, help_text='Task closing date and time')

    class Meta:
        db_table = 'mind_map_template'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class TemplatePermission(models.Model):
    """記錄助教對特定 template 的管理權限"""

    template = models.ForeignKey(
        MindMapTemplate, on_delete=models.CASCADE, related_name='permissions'
    )
    assistant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='template_permissions',
        limit_choices_to={'role': 'assistant'},
    )
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_template_permissions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'template_permission'
        unique_together = ('template', 'assistant')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.assistant.username} -> {self.template.name}'
