from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.common.utils.admin_helpers import format_json_field
from apps.lab.models import Lab

from .models import User


class LabGroupFilter(SimpleListFilter):
    title = 'Lab 分組'
    parameter_name = 'lab_group'

    def lookups(self, request, model_admin):
        return (
            ('active', 'Active'),
            ('passive', 'Passive'),
            ('none', '無分組'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(lab__group='active')
        elif self.value() == 'passive':
            return queryset.filter(lab__group='passive')
        elif self.value() == 'none':
            return queryset.filter(lab__isnull=True)
        return queryset


class LabInline(admin.StackedInline):
    model = Lab
    can_delete = False
    fields = ('group', 'formatted_log', 'created_at', 'updated_at')
    readonly_fields = ('formatted_log', 'created_at', 'updated_at')
    verbose_name = '實驗分組'
    verbose_name_plural = 'lab group'

    def formatted_log(self, obj):
        return format_json_field(obj, 'log')

    formatted_log.short_description = '變更歷史'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'id',
        'username',
        'email',
        'role',
        'lab_group',
        'maps_count',
        'essays_count',
        'is_staff',
        'is_active',
    )
    list_filter = ('role', LabGroupFilter)
    search_fields = ('username', 'email', 'role')
    ordering = ('username',)

    inlines = [LabInline]

    def get_inline_instances(self, request, obj=None):
        if obj is None:
            return []
        return super().get_inline_instances(request, obj)

    def lab_group(self, obj):
        try:
            return obj.lab.group
        except Lab.DoesNotExist:
            return '-'

    lab_group.short_description = 'Lab group'
    lab_group.admin_order_field = 'lab__group'

    def maps_count(self, obj):
        return obj.maps.count()

    maps_count.short_description = 'Maps 數量'

    def essays_count(self, obj):
        return obj.essays.count()

    essays_count.short_description = 'Essays 數量'

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)

        for instance in instances:
            if isinstance(instance, Lab):
                instance.save(changed_by=request.user)
            else:
                instance.save()

        for obj in formset.deleted_objects:
            obj.delete()

        formset.save_m2m()

    fieldsets = BaseUserAdmin.fieldsets + (('角色資訊', {'fields': ('role',)}),)

    add_fieldsets = BaseUserAdmin.add_fieldsets + (('角色資訊', {'fields': ('email', 'role')}),)
