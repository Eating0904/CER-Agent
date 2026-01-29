from django.apps import AppConfig


class EssayConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.essay'

    def ready(self):
        import apps.essay.signals  # noqa: F401
