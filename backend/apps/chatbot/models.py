from django.db import models

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]
    
    map_id = models.IntegerField(default=0)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_message'
        ordering = ['created_at']
    
    def __str__(self):
        return f"[Map {self.map_id}] {self.role}: {self.content[:50]}"
