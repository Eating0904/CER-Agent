import os
import re

from django.conf import settings
from django.core.management.base import CommandError
from django.core.management.commands.startapp import Command as StartAppCommand


class Command(StartAppCommand):
    help = 'Creates a Django app directory structure with a prefixed app name in apps.py, and put it in the apps directory.'

    def handle(self, *args, **options):
        self.app_name = options['name']
        self.target_dir = settings.APPS_DIR / self.app_name
        self.apps_folder_name = settings.APPS_DIR.as_posix().split('/')[-1]

        try:
            os.mkdir(self.target_dir)
        except FileExistsError:
            raise CommandError(f'App "{self.app_name}" already exists')

        super().handle(
            *args,
            **{
                **options,
                'name': self.app_name,
                'directory': self.target_dir,
            },
        )

        self.modify_apps_py_file()
        self.create_serializers_file()
        self.create_urls_file()
        self.add_app_to_installed_apps()
        self.remove_files()

    def modify_apps_py_file(self):
        apps_py_path = self.target_dir / 'apps.py'

        if not os.path.exists(apps_py_path):
            raise CommandError(f'Cant find apps.py in {self.target_dir}')

        old = f'name = "{self.app_name}"'
        new = f'name = "{self.apps_folder_name}.{self.app_name}"'
        with open(apps_py_path, 'r+') as f:
            content = f.read()
            f.seek(0)
            f.write(content.replace(old, new))
            f.truncate()

    def create_serializers_file(self):
        serializers_path = self.target_dir / 'serializers.py'

        with open(serializers_path, 'w') as f:
            f.write('from rest_framework import serializers\n\n')
            f.write('# Create your serializers here.\n')

    def create_urls_file(self, **kwargs: dict):
        urls_path = self.target_dir / 'urls.py'

        with open(urls_path, 'w') as f:
            f.write('from rest_framework import routers\n\n')
            f.write('# from .views import ...\n\n')
            f.write('router = routers.DefaultRouter()\n')
            f.write(f"# router.register('{self.app_name}', MyViewSet)\n")
            f.write('urlpatterns = router.urls\n')

    def add_app_to_installed_apps(self):
        app_path = f"'{self.apps_folder_name}.{self.app_name}',"
        settings_path = settings.BASE_DIR / 'config' / 'settings.py'

        if not settings_path.exists():
            raise CommandError(f'Cant find settings.py at {settings_path}')

        pattern = r'(INSTALLED_APPS\s*=\s*\[.*?)(\])'
        replace = r'\1    ' + app_path + r'\n\2'
        with open(settings_path, 'r+') as f:
            content = f.read()
            if app_path not in content:
                updated_content = re.sub(
                    pattern=pattern,
                    repl=replace,
                    string=content,
                    flags=re.DOTALL,
                )
                f.seek(0)
                f.write(updated_content)
                f.truncate()

    def remove_files(self):
        to_remove = [
            'tests.py',
            'admin.py',
        ]
        for file in to_remove:
            file_path = self.target_dir / file
            if file_path.exists():
                os.remove(file_path)
