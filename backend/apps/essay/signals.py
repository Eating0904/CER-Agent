import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.map.models import Map

from .models import Essay

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Map)
def create_essay_for_new_map(sender, instance, created, **kwargs):
    if created:
        try:
            Essay.objects.create(map=instance, user=instance.user, content='')
        except Exception as e:
            logger.exception(f'Failed to create essay for map: map_id={instance.id}')
            raise
