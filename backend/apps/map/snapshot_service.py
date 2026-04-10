import logging

import jsonpatch

from .snapshot_models import MapSnapshot

logger = logging.getLogger(__name__)

# 每 10 個 patch 存一次 full snapshot
CHECKPOINT_INTERVAL = 10


def create_snapshot(map_instance, new_nodes, new_edges):
    """
    比較 Map 目前的資料與新資料，建立適當的 snapshot（full 或 patch）。

    - diff 為空 → 跳過不存
    - 沒有 full snapshot 或已累積 CHECKPOINT_INTERVAL 個 patch → 存 full
    - 否則 → 存 patch

    Args:
        map_instance: Map model instance（包含舊的 nodes/edges）
        new_nodes: 前端送來的新 nodes
        new_edges: 前端送來的新 edges

    Returns:
        MapSnapshot instance 或 None（如果 diff 為空）
    """
    old_data = {'nodes': map_instance.nodes or [], 'edges': map_instance.edges or []}
    new_data = {'nodes': new_nodes or [], 'edges': new_edges or []}

    # 計算 diff
    patch = jsonpatch.make_patch(old_data, new_data)

    if not patch.patch:
        # diff 為空，跳過（學生重複按 Save）
        logger.debug(f'Snapshot skipped (no diff): map_id={map_instance.id}')
        return None

    # 取得下一個 sequence
    last_snapshot = (
        MapSnapshot.objects.filter(map=map_instance).order_by('-sequence').only('sequence').first()
    )
    next_sequence = (last_snapshot.sequence + 1) if last_snapshot else 1

    # 判斷是否需要存 full snapshot
    last_full = (
        MapSnapshot.objects.filter(map=map_instance, snapshot_type='full')
        .order_by('-sequence')
        .only('sequence')
        .first()
    )

    if last_full:
        patches_since = MapSnapshot.objects.filter(
            map=map_instance,
            sequence__gt=last_full.sequence,
            snapshot_type='patch',
        ).count()
    else:
        patches_since = 0

    need_full = (not last_full) or (patches_since >= CHECKPOINT_INTERVAL)

    if need_full:
        snapshot = MapSnapshot.objects.create(
            map=map_instance,
            snapshot_type='full',
            data=new_data,
            sequence=next_sequence,
            patches_since_full=0,
        )
        logger.info(
            f'Full snapshot created: map_id={map_instance.id}, sequence={next_sequence}'
        )
    else:
        snapshot = MapSnapshot.objects.create(
            map=map_instance,
            snapshot_type='patch',
            data=patch.patch,
            sequence=next_sequence,
            patches_since_full=patches_since + 1,
        )
        logger.info(
            f'Patch snapshot created: map_id={map_instance.id}, sequence={next_sequence}, '
            f'patches_since_full={patches_since + 1}'
        )

    return snapshot
