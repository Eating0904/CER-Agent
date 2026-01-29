
from django.contrib import admin

from apps.common.utils.admin_helpers import format_json_field

from .models import Lab


@admin.register(Lab)
class LabAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'group', 'created_at', 'updated_at')
    list_filter = ('group', 'updated_at')
    search_fields = ('user__username', 'user__email')
    ordering = ('-created_at',)

    def formatted_log(self, obj):
        return format_json_field(obj, 'log')

    formatted_log.short_description = 'logs'

    fieldsets = (
        ('基本資訊', {'fields': ('user', 'group')}),
        ('變更歷史', {'fields': ('formatted_log',)}),
        ('時間資訊', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = ('user', 'group', 'formatted_log', 'created_at', 'updated_at')

    def has_change_permission(self, request, obj=...):
        return False

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
