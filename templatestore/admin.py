from django.contrib import admin
from .models import Template, TemplateVersion, SubTemplate, TemplateConfig

admin.site.register(Template)
admin.site.register(TemplateVersion)
admin.site.register(SubTemplate)
admin.site.register(TemplateConfig)
