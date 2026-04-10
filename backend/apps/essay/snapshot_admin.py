from django.contrib import admin

from .snapshot_models import EssaySnapshot


@admin.register(EssaySnapshot)
class EssaySnapshotAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'essay',
        'sequence',
        'created_at',
    )
    list_filter = ('created_at',)
    list_select_related = ('essay',)
    search_fields = ('=essay__id', 'essay__user__username')
    ordering = ('-created_at',)
    readonly_fields = (
        'essay',
        'content',
        'sequence',
        'created_at',
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
