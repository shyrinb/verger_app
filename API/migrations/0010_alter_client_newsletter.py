# Generated by Django 4.2.9 on 2024-01-12 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0009_remove_client_derniere_date_achat'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='newsletter',
            field=models.CharField(blank=True, choices=[('Oui', 'oui'), ('Non', 'non')], default='Non', max_length=3),
        ),
    ]
