from django.db import models
import jsonfield

class Template(models.Model):
    STATUS_CHOICES = [
        ("D", "Draft"),
        ("R", "Ready"),
        ("L", "Live"),
    ]

    name = models.CharField(max_length=100)
    data = models.TextField(blank=True)
    version = models.CharField(max_length=50)
    created_on = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    sample_context_data = jsonfield.JSONField()

    class Meta:
        db_table = "te_template"
        unique_together = ('name', 'version',)

    def __str__(self):
        return self.name
