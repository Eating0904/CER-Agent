from django.db import models

from apps.map.models import Map
from apps.user.models import User


class Essay(models.Model):
    map = models.OneToOneField(
        Map, on_delete=models.CASCADE, related_name='essay', help_text='關聯的心智圖'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='essays', help_text='擁有者'
    )
    content = models.TextField(blank=True, default='', help_text='Essay 內容')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'essay'
        ordering = ['-created_at']

    def __str__(self):
        return f'Essay for Map {self.map.name}'
