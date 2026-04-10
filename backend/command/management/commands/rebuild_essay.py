from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.essay.snapshot_models import EssaySnapshot


class Command(BaseCommand):
    help = '根據指定的 snapshot ID 還原出該時間點的完整 essay 資料，輸出為 txt 檔案'

    def add_arguments(self, parser):
        parser.add_argument('snap_id', type=int, help='目標 EssaySnapshot 的 ID')
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='輸出檔案路徑（預設: essay_{essay_id}_snapshot_{snap_id}.txt）',
        )

    def handle(self, *args, **options):
        snap_id = options['snap_id']

        try:
            target = EssaySnapshot.objects.select_related('essay', 'essay__map').get(pk=snap_id)
        except EssaySnapshot.DoesNotExist:
            raise CommandError(f'EssaySnapshot id={snap_id} 不存在')

        # 決定輸出路徑
        if options['output']:
            output_path = Path(options['output'])
        else:
            output_path = Path(f'essay_{target.essay_id}_snapshot_{snap_id}.txt')

        output_path.write_text(target.content, encoding='utf-8')
        self.stdout.write(self.style.SUCCESS(f'已輸出至 {output_path.resolve()}'))
