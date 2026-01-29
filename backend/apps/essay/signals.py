from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.map.models import Map

from .models import Essay


@receiver(post_save, sender=Map)
def create_essay_for_new_map(sender, instance, created, **kwargs):
    if created:
        Essay.objects.create(map=instance, user=instance.user, content='')
