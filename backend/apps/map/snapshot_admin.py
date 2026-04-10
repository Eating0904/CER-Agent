from django.contrib import admin

from .snapshot_models import MapSnapshot


@admin.register(MapSnapshot)
class MapSnapshotAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'map',
        'snapshot_type',
        'sequence',
        'patches_since_full',
        'created_at',
    )
    list_filter = ('snapshot_type', 'created_at')
    list_select_related = ('map',)
    search_fields = ('=map__id', 'map__user__username')
    ordering = ('-created_at',)
    readonly_fields = (
        'map',
        'snapshot_type',
        'data',
        'sequence',
        'patches_since_full',
        'created_at',
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
