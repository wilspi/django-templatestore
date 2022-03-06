# Generated by Django 3.2.7 on 2022-03-06 19:48

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('templatestore', '0008_migrate_create_by'),
    ]

    operations = [
        migrations.AddField(
            model_name='templateversion',
            name='tiny_url',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=list),
        ),
    ]
