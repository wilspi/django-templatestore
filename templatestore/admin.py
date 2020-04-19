from django.contrib import admin

from templatestore.models import SubTemplate, TemplateVersion, Template, TemplateConfig

admin.site.register(SubTemplate)
admin.site.register(Template)
admin.site.register(TemplateVersion)
admin.site.register(TemplateConfig)
