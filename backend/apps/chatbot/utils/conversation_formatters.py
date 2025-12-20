from typing import Any, Dict, List


def format_history_for_api(messages: Any, exclude_roles: List[str] = None) -> List[Dict[str, str]]:
    """
    1. 過濾掉 classifier 的記錄
    2. 將資料轉為 List[Dict] 格式 (符合 LangGraph 框架)

    """
    if exclude_roles is None:
        exclude_roles = ['classifier']

    formatted = []

    for msg in messages:
        if hasattr(msg, 'role'):
            role = msg.role
            content = msg.content
        else:
            role = msg.get('role', '')
            content = msg.get('content', '')

        if role in exclude_roles:
            continue

        formatted.append({'role': role, 'content': content})

    return formatted


def format_history_for_display(
    messages: List[Dict[str, str]],
    max_messages: int = 50,
) -> str:
    """
    1. 將 List[Dict] 格式的對話紀錄，轉換成文字格式 (為了讓 LLM 更好理解)
    2. 只取最近的 max_messages 條記錄
    """
    if not messages:
        return '無對話歷史'

    recent_messages = messages[-max_messages:] if len(messages) > max_messages else messages

    formatted_lines = []

    for msg in recent_messages:
        role = msg.get('role', '')
        content = msg.get('content', '')
        formatted_lines.append(f'{role}: {content}')

    return '\n'.join(formatted_lines)
