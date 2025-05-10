from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_alter_bill_url_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='bankaccount',
            name='url',
            field=models.URLField(blank=True, max_length=2083),
        ),
    ] 