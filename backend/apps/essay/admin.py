from bs4 import BeautifulSoup
from django.contrib import admin
from django.utils.html import format_html

from apps.common.utils.admin_helpers import format_admin_link

from .models import Essay


@admin.register(Essay)
class EssayAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'map_name',
        'template_name',
        'word_count',
        'scoring_remaining',
        'scoring_updated_at',
        'created_at',
    )
    list_filter = ('map__template', 'updated_at')
    list_select_related = ('user', 'map', 'map__template')
    search_fields = ('=id', 'user__username', 'user__email', 'map__name')
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
        if not obj.content:
            return 0
        soup = BeautifulSoup(obj.content, 'html.parser')
        plain_text = soup.get_text()
        return len(plain_text)

    word_count.short_description = '字數'

    def formatted_content(self, obj):
        if obj.content:
            return format_html(obj.content)
        return obj.content

    formatted_content.short_description = 'Content'

    fieldsets = (
        ('基本資訊', {'fields': ('user', 'map', 'template_name')}),
        ('內容資訊', {'fields': ('word_count', 'content')}),
        ('評分資訊', {'fields': ('scoring_remaining', 'scoring_updated_at')}),
        ('時間資訊', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = (
        'user',
        'map',
        'template_name',
        'word_count',
        'scoring_remaining',
        'scoring_updated_at',
        'created_at',
        'updated_at',
    )

    def save_model(self, request, obj, form, change):
        """儲存前無條件建立快照"""
        if change:
            try:
                from .snapshot_models import EssaySnapshot

                last_snapshot = (
                    EssaySnapshot.objects.filter(essay=obj)
                    .order_by('-sequence')
                    .only('sequence')
                    .first()
                )
                next_sequence = (last_snapshot.sequence + 1) if last_snapshot else 1

                EssaySnapshot.objects.create(
                    essay=obj,
                    content=obj.content,
                    sequence=next_sequence,
                )
            except Exception as e:
                import logging

                logger = logging.getLogger(__name__)
                logger.error(
                    f'Failed to create essay snapshot from admin: essay_id={obj.id}, error={e}',
                    exc_info=True,
                )
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=...):
        return True

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
