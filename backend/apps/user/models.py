from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('teacher', 'Teacher'),
            ('assistant', 'Assistant'),
            ('student', 'Student'),
        ],
        default='student',
    )
    is_verified = models.BooleanField(default=False)


class EmailVerification(models.Model):
    PURPOSE_CHOICES = [
        ('email_verify', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]
    EXPIRY_HOURS = {
        'email_verify': 24,
        'email_verify_batch': 168,  # 7 days
        'password_reset': 0,  # 10 minutes, handled separately
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.purpose} ({self.code})'
