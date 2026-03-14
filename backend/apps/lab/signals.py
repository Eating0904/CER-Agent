import logging

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Lab

logger = logging.getLogger(__name__)

User = get_user_model()


@receiver(post_save, sender=User)
def create_lab_for_new_user(sender, instance, created, **kwargs):
    if created:
        try:
            Lab.objects.create(user=instance, group='active')
        except Exception as e:
            logger.exception(f'Failed to create lab for user: user_id={instance.id}')
            raise
