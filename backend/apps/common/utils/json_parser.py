"""
JSON 解析工具模組

提供共用的 JSON 提取和解析函數，用於處理 LLM 回應中可能被 Markdown 包裹的 JSON 內容。
"""

import json


def extract_json(text: str) -> str:
    """
    從文本中提取 JSON 字串

    處理可能被 Markdown 代碼塊或其他文字包裹的 JSON 內容，
    提取第一個 { 到最後一個 } 之間的內容。

    Args:
        text: 包含 JSON 的文本

    Returns:
        str: 提取的 JSON 字串
    """
    # 找第一個 { 的位置
    start = text.find('{')
    if start == -1:
        return text.strip()

    # 找最後一個 } 的位置
    end = text.rfind('}')
    if end == -1:
        return text.strip()

    # 提取 { 到 } 之間的內容（包含 { 和 }）
    json_str = text[start : end + 1]

    return json_str


def parse_llm_json_response(text: str) -> dict:
    """
    解析 LLM 回應的 JSON

    結合提取和解析邏輯，從 LLM 回應中提取並解析 JSON。

    Args:
        text: LLM 回應的文本

    Returns:
        dict: 解析後的 JSON 物件

    Raises:
        json.JSONDecodeError: 當 JSON 解析失敗時
    """
    json_str = extract_json(text)
    return json.loads(json_str)
