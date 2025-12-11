"""
CER 評分 Prompt 管理模組

此模組負責：
1. 載入 CER 評分的 prompt 範本
2. 格式化學生的 nodes 和 edges 資料
3. 將資料插入到 prompt 範本中
4. 生成完整的評分 prompt
"""

import os
import json
from typing import Dict, List


def load_prompt_template() -> str:
    """
    載入 CER 評分 prompt 範本檔案
    
    Returns:
        str: prompt 範本內容
    
    Raises:
        FileNotFoundError: 如果範本檔案不存在
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_file = os.path.join(current_dir, 'prompts', 'cer_scoring_prompt.md')
    
    with open(prompt_file, 'r', encoding='utf-8') as f:
        return f.read()


def format_nodes_for_prompt(nodes: List[Dict]) -> str:
    """
    將學生的 nodes 資料格式化為 prompt 所需的格式
    
    只保留 id 和 content 欄位，過濾掉其他欄位（如位置、樣式等）
    
    Args:
        nodes: 學生撰寫的節點資料列表
    
    Returns:
        str: 格式化後的節點資料字串
    
    Example:
        輸入: [{"id": "c1", "data": {"content": "某主張", "position": {...}, "type": "..."}}]
        輸出:
        ```
        #Node
        [
          {
            "id": "c1",
            "content": "某主張"
          }
        ]
        ```
    """
    # 只保留 id 和 content 欄位
    # 同時移除換行符號 \n，將多行內容合併為單行
    filtered_nodes = [
        {
            "id": node.get("id", ""),
            "content": node.get("data", {}).get("content", "").replace("\n", " ")
        }
        for node in nodes
    ]
    
    # 使用 JSON 格式化，設定縮排為 2 個空格
    formatted_json = json.dumps(filtered_nodes, ensure_ascii=False, indent=2)
    
    # 加上 #Node 標題
    result = f"#Node\n{formatted_json}"
    
    return result


def format_edges_for_prompt(edges: List[Dict]) -> str:
    """
    將學生的 edges 資料格式化為 prompt 所需的格式
    
    只保留 source 和 target 欄位，過濾掉其他欄位（如樣式、標籤等）
    
    Args:
        edges: 學生撰寫的連線資料列表
    
    Returns:
        str: 格式化後的連線資料字串
    
    Example:
        輸入: [{"source": "r1", "target": "c1", "type": "...", "style": {...}}]
        輸出:
        ```
        #Edge
        [
          {
            "source": "r1",
            "target": "c1"
          }
        ]
        ```
    """
    # 只保留 source 和 target 欄位
    filtered_edges = [
        {
            "source": edge.get("source", ""),
            "target": edge.get("target", "")
        }
        for edge in edges
    ]
    
    # 使用 JSON 格式化，設定縮排為 2 個空格
    formatted_json = json.dumps(filtered_edges, ensure_ascii=False, indent=2)
    
    # 加上 #Edge 標題
    result = f"#Edge\n{formatted_json}"
    
    return result


def generate_scoring_prompt(map_data: Dict) -> str:
    """
    生成完整的 CER 評分 prompt
    
    將 Map 資料插入到 prompt 範本的對應位置，生成可直接傳給 AI 的 prompt
    
    Args:
        map_data: 包含以下鍵值的字典
            - article_topic: 文章主題
            - article_content: 文章內容
            - nodes: 學生撰寫的節點資料 (list)
            - edges: 學生撰寫的連線資料 (list)
    
    Returns:
        str: 完整的評分 prompt
    
    Raises:
        KeyError: 如果 map_data 缺少必要的鍵值
    """
    # 載入範本
    template = load_prompt_template()
    
    # 格式化 nodes 和 edges
    formatted_nodes = format_nodes_for_prompt(map_data['nodes'])
    formatted_edges = format_edges_for_prompt(map_data['edges'])
    
    # 替換範本中的佔位符號
    prompt = template.replace('{ARTICLE_TOPIC}', map_data['article_topic'])
    prompt = prompt.replace('{ARTICLE_CONTENT}', map_data['article_content'])
    prompt = prompt.replace('{STUDENT_NODES}', formatted_nodes)
    prompt = prompt.replace('{STUDENT_EDGES}', formatted_edges)
    
    # print("Generated Scoring Prompt:")
    # print(prompt)
    return prompt
