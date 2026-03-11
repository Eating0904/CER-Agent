import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.common.services.email_service import generate_verification_code, send_verification_email
from apps.user.models import EmailVerification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send verification emails to unverified users who have no pending verification code.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1,
            help='Number of emails to send in this batch (default: 1)',
        )
        parser.add_argument(
            '--workers',
            type=int,
            default=4,
            help='Number of concurrent workers (default: 4)',
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        workers = options['workers']
        User = get_user_model()

        expiry_hours = EmailVerification.EXPIRY_HOURS['email_verify_batch']
        expiry_threshold = timezone.now() - timezone.timedelta(hours=expiry_hours)

        users_with_pending = EmailVerification.objects.filter(
            purpose='email_verify',
            is_used=False,
            created_at__gte=expiry_threshold,
        ).values_list('user_id', flat=True)

        users = list(
            User.objects.filter(
                is_verified=False,
            ).exclude(
                id__in=users_with_pending,
            )[:batch_size]
        )

        if not users:
            self.stdout.write('No unverified users to send to.')
            return

        tasks = []
        for user in users:
            code = generate_verification_code()
            EmailVerification.objects.create(
                user=user,
                code=code,
                purpose='email_verify',
            )
            tasks.append((user, code))

        sent_count = 0
        with ThreadPoolExecutor(max_workers=min(workers, len(tasks))) as executor:
            futures = {
                executor.submit(
                    send_verification_email,
                    user.email,
                    code,
                    'email_verify',
                ): user
                for user, code in tasks
            }
            for future in as_completed(futures):
                user = futures[future]
                try:
                    future.result()
                    sent_count += 1
                    self.stdout.write(f'  Sent to {user.email}')
                except Exception as e:
                    logger.error(f'Failed to send to {user.email}: {e}')
                    self.stderr.write(self.style.ERROR(f'  Failed: {user.email} - {e}'))

        self.stdout.write(self.style.SUCCESS(f'Done. Sent {sent_count}/{len(tasks)} emails.'))
