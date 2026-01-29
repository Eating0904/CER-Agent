from django.contrib import admin
from django.utils.html import format_html

from apps.common.utils.admin_helpers import format_admin_link

from .models import Essay


@admin.register(Essay)
class EssayAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'map_name', 'template_name', 'word_count', 'created_at')
    list_filter = ('map__template', 'updated_at')
    search_fields = ('user__username', 'user__email', 'map__name')
    ordering = ('-created_at',)

    def map_name(self, obj):
        return obj.map.name if obj.map else '-'

    map_name.short_description = 'Map name'
    map_name.admin_order_field = 'map__name'

    def template_id(self, obj):
        return obj.map.template.id if obj.map and obj.map.template else '-'

    template_id.short_description = 'Template ID'

    def template_name(self, obj):
        if obj.map and obj.map.template:
            return format_admin_link(
                'mindmaptemplate', 'mindMapTemplate', obj.map.template.id, obj.map.template.name
            )
        return '-'

    template_name.short_description = 'Template name'

    def word_count(self, obj):
        return len(obj.content) if obj.content else 0

    word_count.short_description = '字數'

    def formatted_content(self, obj):
        if obj.content:
            return format_html(obj.content)
        return obj.content

    formatted_content.short_description = 'Content'

    fieldsets = (
        ('基本資訊', {'fields': ('user', 'map', 'template_name')}),
        ('內容資訊', {'fields': ('word_count', 'formatted_content')}),
        ('時間資訊', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = (
        'user',
        'map',
        'template_name',
        'word_count',
        'formatted_content',
        'created_at',
        'updated_at',
    )

    def has_change_permission(self, request, obj=...):
        return False

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
