# Generated by Django 3.2.7 on 2022-02-10 08:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('templatestore', '0009_templateversion_tiny_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='templateversion',
            name='tiny_url',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
