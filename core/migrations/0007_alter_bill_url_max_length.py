from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_add_bankaccount_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bill',
            name='url',
            field=models.URLField(blank=True, max_length=2083),
        ),
    ] 