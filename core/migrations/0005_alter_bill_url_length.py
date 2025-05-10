from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_bill_total_balance_duebill_total_balance_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bill',
            name='url',
            field=models.URLField(blank=True, max_length=2083),
        ),
    ] 