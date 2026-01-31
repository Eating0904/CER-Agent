import os
import sys

import django
from django.db import transaction

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lab.models import Lab
from apps.mindMapTemplate.models import MindMapTemplate
from apps.user.models import User
from seeder.test_data.lab_data import LABS
from seeder.test_data.mind_map_template_data import TEMPLATES
from seeder.test_data.password_config import get_password
from seeder.test_data.user_data import USERS


@transaction.atomic
def seed_users():
    for user_data in USERS:
        password = get_password(user_data['username'])

        user, created = User.objects.update_or_create(
            username=user_data['username'],
            defaults={'email': user_data['email'], 'role': user_data['role'], 'is_active': True},
        )

        user.set_password(password)
        user.save()


@transaction.atomic
def seed_templates():
    for template_data in TEMPLATES:
        creator = User.objects.get(username=template_data['created_by'])

        template, created = MindMapTemplate.objects.update_or_create(
            name=template_data['name'],
            created_by=creator,
            defaults={
                'issue_topic': template_data['issue_topic'],
                'article_content': template_data['article_content'],
                'start_date': template_data['start_date'],
                'end_date': template_data['end_date'],
            },
        )


@transaction.atomic
def seed_labs():
    for lab_data in LABS:
        user = User.objects.get(username=lab_data['username'])
        lab, created = Lab.objects.update_or_create(
            user=user, defaults={'group': lab_data['group']}
        )


@transaction.atomic
def seed_test():
    seed_users()
    seed_templates()
    seed_labs()


if __name__ == '__main__':
    seed_test()
