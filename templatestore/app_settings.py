from django.conf import settings
import os

DIRNAME = os.path.dirname(__file__)
STATICFILES_DIRS = getattr(settings, "STATICFILES_DIRS", {})
STATICFILES_DIRS.append(os.path.join(DIRNAME, "frontend/dist/"))

TE_TEMPLATE_ATTRIBUTES_KEYS = getattr(settings, "TE_TEMPLATE_ATTRIBUTES_KEYS", {})
TE_ROWLIMIT = getattr(settings, "TE_ROWLIMIT", 1000)
