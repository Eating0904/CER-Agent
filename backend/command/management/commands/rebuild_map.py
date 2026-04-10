import json
import sys

import jsonpatch
from django.core.management.base import BaseCommand, CommandError

from apps.map.snapshot_models import MapSnapshot


class Command(BaseCommand):
    help = '根據指定的 snapshot ID 還原出該時間點的完整 map 資料'

    def add_arguments(self, parser):
        parser.add_argument('snap_id', type=int, help='目標 MapSnapshot 的 ID')
        parser.add_argument(
            '--pretty',
            action='store_true',
            help='以 indent 格式輸出 JSON',
        )

    def handle(self, *args, **options):
        snap_id = options['snap_id']

        try:
            target = MapSnapshot.objects.select_related('map').get(pk=snap_id)
        except MapSnapshot.DoesNotExist:
            raise CommandError(f'MapSnapshot id={snap_id} 不存在')

        map_instance = target.map
        target_seq = target.sequence

        # 找到 sequence <= target_seq 的最近一個 full snapshot
        base_full = (
            MapSnapshot.objects.filter(
                map=map_instance,
                snapshot_type='full',
                sequence__lte=target_seq,
            )
            .order_by('-sequence')
            .first()
        )

        if not base_full:
            raise CommandError(
                f'找不到 map_id={map_instance.id} 在 sequence<={target_seq} 範圍內的 full snapshot，無法還原'
            )

        # 從 base_full 開始，收集到 target_seq 為止的所有 patch
        patches = list(
            MapSnapshot.objects.filter(
                map=map_instance,
                snapshot_type='patch',
                sequence__gt=base_full.sequence,
                sequence__lte=target_seq,
            )
            .order_by('sequence')
            .values_list('sequence', 'data')
        )

        # 以 full snapshot 為起點
        result = base_full.data

        # 依序 apply patches
        for seq, patch_data in patches:
            try:
                patch = jsonpatch.JsonPatch(patch_data)
                result = patch.apply(result)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'  [FAIL] patch seq={seq} apply failed: {e}'))
                self.stderr.write(f'    patch data: {json.dumps(patch_data, ensure_ascii=False)}')
                raise CommandError(f'Patch apply 失敗，停止還原 (seq={seq})')

        # 輸出結果
        indent = 2 if options['pretty'] else None
        output = json.dumps(result, ensure_ascii=False, indent=indent)
        self.stdout.write(output)
