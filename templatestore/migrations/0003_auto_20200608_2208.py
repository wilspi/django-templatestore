# Generated by Django 3.0.3 on 2020-06-08 22:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('templatestore', '0002_templateconfig_attributes'),
    ]

    operations = [
        migrations.AddField(
            model_name='template',
            name='created_by',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='templateversion',
            name='created_by',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
