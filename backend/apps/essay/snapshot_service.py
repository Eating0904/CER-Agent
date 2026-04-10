import logging

from .snapshot_models import EssaySnapshot

logger = logging.getLogger(__name__)


def create_essay_snapshot(essay_instance, new_content):
    """
    比較 Essay 目前的 content 與新 content，若有差異則建立快照。

    - 內容一致 → 跳過不存
    - 否則 → 儲存完整 content

    Args:
        essay_instance: Essay model instance（包含舊的 content）
        new_content: 前端送來的新 content

    Returns:
        EssaySnapshot instance 或 None（如果內容一致）
    """
    old_content = essay_instance.content or ''
    new_content = new_content or ''

    if old_content == new_content:
        logger.debug(f'Essay snapshot skipped (no diff): essay_id={essay_instance.id}')
        return None

    # 取得下一個 sequence
    last_snapshot = (
        EssaySnapshot.objects.filter(essay=essay_instance)
        .order_by('-sequence')
        .only('sequence')
        .first()
    )
    next_sequence = (last_snapshot.sequence + 1) if last_snapshot else 1

    snapshot = EssaySnapshot.objects.create(
        essay=essay_instance,
        content=new_content,
        sequence=next_sequence,
    )
    logger.info(
        f'Essay snapshot created: essay_id={essay_instance.id}, sequence={next_sequence}'
    )

    return snapshot
