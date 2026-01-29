import json

from django.urls import reverse
from django.utils.html import format_html


def format_json_field(obj, field_name):
    """
    格式化 JSONField 為美化的 HTML pre 標籤

    Args:
        obj: Model instance
        field_name: JSONField 的欄位名稱

    Returns:
        格式化的 HTML 或 '-'
    """
    if obj and obj.pk:
        field_value = getattr(obj, field_name, None)
        if field_value:
            formatted_json = json.dumps(field_value, indent=2, ensure_ascii=False)
            return format_html(
                '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; max-height: 400px; overflow-y: auto;">{}</pre>',
                formatted_json,
            )
    return '-'


def format_admin_link(model_name, app_label, obj_id, display_text):
    """
    創建 Admin 頁面的超連結

    Args:
        model_name: Model 名稱（小寫）
        app_label: App 名稱
        obj_id: 物件 ID
        display_text: 顯示文字

    Returns:
        HTML 超連結或顯示文字
    """
    try:
        url = reverse(f'admin:{app_label}_{model_name}_change', args=[obj_id])
        return format_html('<a href="{}">{}</a>', url, display_text)
    except Exception:
        return display_text
