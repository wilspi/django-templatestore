from django.db import models
import jsonfield


class Template(models.Model):

    name = models.CharField(max_length=100)
    default_version = models.IntegerField(null=True)

    class Meta:
        db_table = "template"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.full_clean()
        super(Template, self).save(*args, **kwargs)


class TemplateVersion(models.Model):
    STATUS_CHOICES = [
        ("D", "Draft"),
        ("R", "Ready"),
        ("L", "Live"),
    ]

    template_id = models.ForeignKey(Template, on_delete=models.CASCADE)
    data = models.TextField(blank=True)
    version = models.CharField(max_length=100)
    created_on = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    sample_context_data = jsonfield.JSONField()

    class Meta:
        db_table = "template_version"
        unique_together = ("template_id", "version")

    def __str__(self):
        return self.template_id

    def save(self, *args, **kwargs):
        self.full_clean()
        super(TemplateVersion, self).save(*args, **kwargs)


# from django.db import models
# import jsonfield
#
#
# class Template(models.Model):
#     STATUS_CHOICES = [
#         ("D", "Draft"),
#         ("R", "Ready"),
#         ("L", "Live"),
#     ]
#
#     name = models.CharField(max_length=100)
#     data = models.TextField(blank=True)
#     version = models.IntegerField()
#     created_on = models.DateTimeField(auto_now_add=True)
#     created_by = models.CharField(max_length=100, blank=True)
#     status = models.CharField(max_length=1, choices=STATUS_CHOICES)
#     sample_context_data = jsonfield.JSONField()
#
#     class Meta:
#         db_table = "te-template"
#         unique_together = (
#             "name",
#             "version",
#         )
#
#     def __str__(self):
#         return self.name
#
#     def save(self, *args, **kwargs):
#         self.full_clean()
#         super(Template, self).save(*args, **kwargs)
