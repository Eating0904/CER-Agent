from django.db import models

from .models import Map


class MapSnapshot(models.Model):
    """記錄 Map 的歷史版本（Full snapshot 或 JSON Patch）"""

    SNAPSHOT_TYPE_CHOICES = [
        ('full', 'Full Snapshot'),
        ('patch', 'JSON Patch'),
    ]

    map = models.ForeignKey(Map, on_delete=models.CASCADE, related_name='snapshots')
    snapshot_type = models.CharField(max_length=5, choices=SNAPSHOT_TYPE_CHOICES)
    data = models.JSONField(
        help_text='full: {"nodes": [...], "edges": [...]} / patch: [{"op": ..., "path": ..., "value": ...}, ...]'
    )
    sequence = models.PositiveIntegerField(help_text='每個 map 內的自增序號，保證 apply 順序')
    patches_since_full = models.PositiveIntegerField(
        help_text='距離上次 full snapshot 累積了幾個 patch'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'map_snapshot'
        ordering = ['sequence']
        indexes = [
            models.Index(fields=['map', 'sequence']),
            models.Index(fields=['map', 'snapshot_type']),
        ]

    def __str__(self):
        return f'Map {self.map_id} - {self.snapshot_type} #{self.sequence}'
