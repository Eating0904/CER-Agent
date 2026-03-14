"""
心智圖資料處理工具
提供心智圖資料的簡化和轉換功能
"""

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


def simplify_map_data(input_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    try:
        transformed_nodes = [
            {'id': node['id'], 'content': node['data']['content']}
            for node in input_data.get('nodes', [])
        ]

        transformed_edges = [
            {'node1': edge['source'], 'node2': edge['target']}
            for edge in input_data.get('edges', [])
        ]

        return {'nodes': transformed_nodes, 'edges': transformed_edges}
    except (KeyError, TypeError) as e:
        logger.exception(f'Failed to simplify map data: {e}')
        raise ValueError(f'Invalid map data structure: {e}')
