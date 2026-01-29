from django.contrib import admin

from .models import MindMapTemplate, TemplatePermission


class TemplatePermissionInline(admin.TabularInline):
    model = TemplatePermission
    extra = 1
    fields = ('assistant', 'granted_by', 'created_at')
    readonly_fields = ['created_at']


@admin.register(MindMapTemplate)
class MindMapTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_by', 'maps_count', 'created_at')
    list_filter = ['name', 'created_at']
    search_fields = ('name', 'created_by__username')
    ordering = ('-created_at',)
    inlines = [TemplatePermissionInline]

    def maps_count(self, obj):
        return obj.maps.count()

    maps_count.short_description = '使用次數'

    fieldsets = (
        ('基本資訊', {'fields': ('name', 'created_by')}),
        ('內容資訊', {'fields': ('issue_topic', 'article_content')}),
        ('時間資訊', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = ('created_at', 'updated_at')
