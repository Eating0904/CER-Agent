from django.contrib import admin
from django.db.models import Func, IntegerField, OuterRef, Subquery

from apps.common.utils.admin_helpers import format_admin_link, format_json_field
from apps.essay.models import Essay

from .models import Map


class JSONBArrayLength(Func):
    function = 'JSONB_ARRAY_LENGTH'
    output_field = IntegerField()


@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'name',
        'show',
        'template_name',
        'nodes_count',
        'edges_count',
        'essay_id',
        'scoring_remaining',
        'scoring_updated_at',
        'created_at',
        'updated_at',
    )
    list_filter = ('user', 'template', 'show', 'updated_at')
    list_editable = ('show',)
    list_select_related = ('user', 'template')
    search_fields = ('=id', 'name', 'user__username', 'user__email', 'template__name')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        essay_subquery = Essay.objects.filter(map=OuterRef('pk')).values('id')[:1]
        return (
            super()
            .get_queryset(request)
            .select_related('user', 'template')
            .annotate(
                _nodes_count=JSONBArrayLength('nodes'),
                _edges_count=JSONBArrayLength('edges'),
                _essay_id=Subquery(essay_subquery),
            )
        )

    def nodes_count(self, obj):
        return len(obj.nodes) if obj.nodes else 0

    nodes_count.short_description = '節點數量'
    nodes_count.admin_order_field = '_nodes_count'

    def edges_count(self, obj):
        return len(obj.edges) if obj.edges else 0

    edges_count.short_description = '邊數量'
    edges_count.admin_order_field = '_edges_count'

    def essay_id(self, obj):
        if hasattr(obj, '_essay_id'):
            if obj._essay_id:
                return format_admin_link('essay', 'essay', obj._essay_id, obj._essay_id)
            return '-'
        return '-'

    essay_id.short_description = 'Essay ID'

    def template_name(self, obj):
        if obj.template:
            return format_admin_link(
                'mindmaptemplate', 'mindMapTemplate', obj.template.id, obj.template.name
            )
        return '-'

    template_name.short_description = 'Template'
    template_name.admin_order_field = 'template__name'

    def formatted_nodes(self, obj):
        return format_json_field(obj, 'nodes')

    formatted_nodes.short_description = '節點資料'

    def formatted_edges(self, obj):
        return format_json_field(obj, 'edges')

    formatted_edges.short_description = '邊資料'

    fieldsets = (
        ('基本資訊', {'fields': ('id', 'user', 'name', 'show', 'essay_id', 'template_name')}),
        ('節點和邊資料', {'fields': ('nodes', 'edges')}),
        ('評分資訊', {'fields': ('scoring_remaining', 'scoring_updated_at')}),
        ('時間資訊', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = (
        'id',
        'user',
        'name',
        'essay_id',
        'template_name',
        'scoring_remaining',
        'scoring_updated_at',
        'created_at',
        'updated_at',
    )

    def has_change_permission(self, request, obj=None):
        return True

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
