from django.db import models
from django.contrib.postgres.fields import JSONField
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from templatestore import app_settings as ts_settings
import re


class Template(models.Model):
    def attributes_default():
        return {k: "" for k in ts_settings.TE_TEMPLATE_ATTRIBUTES_KEYS}

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=1000)
    type = models.CharField(max_length=1000)
    default_version_id = models.IntegerField(blank=True, null=True)
    attributes = JSONField(default=attributes_default)
    created_on = models.DateTimeField(auto_now_add=True)  # TODO: Timezone support check
    modified_on = models.DateTimeField(auto_now=True)
    deleted_on = models.DateTimeField(blank=True, null=True)
    created_by = models.IntegerField(null=True, blank=True)
    user_email = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        db_table = "templatestore_template"

    def clean(self):
        # all validations here
        if self.default_version_id and (
            not len(
                TemplateVersion.objects.filter(
                    id=self.default_version_id, template_id=self.id
                )
            )
        ):
            raise ValidationError(
                {
                    "default_version_id": _(
                        "specified id doesn't correspond to same template version"
                    )
                }
            )
        # add default attributes
        for k in ts_settings.TE_TEMPLATE_ATTRIBUTES.keys():
            if k not in self.attributes:
                self.attributes[k] = ""

    def save(self, *args, **kwargs):
        self.full_clean()
        super(Template, self).save(*args, **kwargs)


class TemplateVersion(models.Model):
    id = models.AutoField(primary_key=True)
    template_id = models.ForeignKey(Template, on_delete=models.PROTECT)
    version = models.CharField(max_length=50)
    sample_context_data = JSONField(default=dict)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    deleted_on = models.DateTimeField(null=True, blank=True)
    version_alias = models.CharField(blank=True, max_length=100)
    created_by = models.IntegerField(null=True, blank=True)
    user_email = models.CharField(max_length=200, null=True, blank=True)
    tiny_url = JSONField(blank=True, default=list)

    class Meta:
        db_table = "templatestore_template_version"
        unique_together = ("template_id", "version")

    def clean(self):
        # all validations here
        if self.version and not re.fullmatch("\d+\.\d+", self.version):
            raise ValidationError({"version": _("version must be specified like 1.3")})

    def save(self, *args, **kwargs):
        self.full_clean()
        super(TemplateVersion, self).save(*args, **kwargs)


class TemplateConfig(models.Model):
    type = models.CharField(max_length=1000)
    sub_type = models.CharField(max_length=1000)
    render_mode = models.CharField(max_length=1000)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    deleted_on = models.DateTimeField(null=True, blank=True)
    attributes = JSONField(default=dict, blank=True)

    class Meta:
        db_table = "templatestore_template_config"
        unique_together = ("type", "sub_type")


class SubTemplate(models.Model):
    id = models.AutoField(primary_key=True)
    template_version_id = models.ForeignKey(TemplateVersion, on_delete=models.PROTECT)
    config = models.ForeignKey(TemplateConfig, on_delete=models.PROTECT)
    data = models.TextField(blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    modified_on = models.DateTimeField(auto_now=True)
    deleted_on = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "templatestore_sub_template"
