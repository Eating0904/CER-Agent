"""
訊息過濾工具模組
提供執行時 JSON 負載過濾機制，將持久化狀態與推論輸入脫鉤
"""

import json
from typing import List

from langchain_core.messages import BaseMessage, HumanMessage


def filter_messages(messages: List[BaseMessage], context_fields_to_keep: List[str]) -> List[BaseMessage]:
    """
    根據指定的欄位列表過濾訊息
    
    Args:
        messages: 原始訊息列表
        context_fields_to_keep: 要保留的 context 內部欄位列表
                               空列表表示完全移除 context
                               例如: [] 表示只保留 query
                                    ["map_data"] 表示保留 query + context.map_data
    
    """
    filtered = []
    
    for msg in messages:
        # 只處理 HumanMessage
        if not isinstance(msg, HumanMessage):
            filtered.append(msg)
            continue
        
        try:
            data = json.loads(msg.content)

            if isinstance(data, dict) and "query" in data:
                
                # 永遠保留 query
                filtered_data = {"query": data["query"]}
                
                if context_fields_to_keep and "context" in data and isinstance(data["context"], dict):
                    filtered_context = {}
                    for field in context_fields_to_keep:
                        if field in data["context"]:
                            filtered_context[field] = data["context"][field]
                    
                    if filtered_context:
                        filtered_data["context"] = filtered_context
                
                # 重新封裝
                filtered_content = json.dumps(filtered_data, ensure_ascii=False)
                filtered_msg = HumanMessage(content=filtered_content)
                                
                filtered.append(filtered_msg)
            else:
                filtered.append(msg)
                
        except json.JSONDecodeError:
            filtered.append(msg)
    
    return filtered
