# Generated by Django 3.0.7 on 2022-06-21 10:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('templatestore', '0010_templateconfig_optional'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='templateconfig',
            unique_together=set(),
        ),
    ]