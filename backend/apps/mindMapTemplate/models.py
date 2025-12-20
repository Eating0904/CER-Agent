from django.db import models


class MindMapTemplate(models.Model):
    name = models.CharField(max_length=200)
    issue_topic = models.TextField()
    article_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mind_map_template'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
