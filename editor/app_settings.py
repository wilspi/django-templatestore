from django.conf import settings
import os

DIRNAME = os.path.dirname(__file__)
STATICFILES_DIRS = getattr(settings, "STATICFILES_DIRS", {})
STATICFILES_DIRS.append(os.path.join(DIRNAME, "frontend/dist/"))

TEMPLATE_ATTRIBUTES_KEYS = ["product", "plan", "team"]
