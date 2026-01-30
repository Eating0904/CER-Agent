from django.utils import timezone


def check_template_deadline(template):
    """
    檢查 template 是否在有效期限內

    Args:
        template: MindMapTemplate instance

    Returns:
        bool: True 表示在期限內，False 表示不在期限內
    """
    now = timezone.now()

    # 如果沒有設定完整期限（開始和結束都必須設定），預設為不可用（安全考量）
    if not template.start_date or not template.end_date:
        return False

    # 檢查是否在期限內
    if now < template.start_date:
        return False
    if now > template.end_date:
        return False

    return True
