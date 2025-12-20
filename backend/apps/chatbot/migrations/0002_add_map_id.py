# Generated migration to add map_id column

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('chatbot', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatmessage',
            name='map_id',
            field=models.IntegerField(default=0),
        ),
    ]
