from django.db import models

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('classifier', 'Intent Classifier'),
        ('operator_support', 'Operator Support'),
        ('cer_cognitive_support', 'CER Cognitive Support'),
    ]
    
    map_id = models.IntegerField(default=0)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(blank=True, null=True)  # 儲存分類推理等額外資訊
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_message'
        ordering = ['created_at']
    
    def __str__(self):
        return f"[Map {self.map_id}] {self.role}: {self.content[:50]}"
