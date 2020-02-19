from django.contrib import admin
from .models import Template, TemplateVersion

admin.site.register(Template)
admin.site.register(TemplateVersion)
