# Generated by Django 3.0.3 on 2020-05-28 20:00

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("templatestore", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="templateconfig",
            name="attributes",
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=dict),
        ),
    ]
