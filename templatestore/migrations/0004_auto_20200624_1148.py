# Generated by Django 3.0.7 on 2020-06-24 11:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("templatestore", "0003_templateversion_version_alias"),
    ]

    operations = [
        migrations.AddField(
            model_name="template",
            name="created_by",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="templateversion",
            name="created_by",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
