from django.conf import settings
import os

DIRNAME = os.path.dirname(__file__)
STATICFILES_DIRS = getattr(settings, "STATICFILES_DIRS", {})
STATICFILES_DIRS.append(os.path.join(DIRNAME, "frontend/dist/"))

TE_TEMPLATE_ATTRIBUTES = getattr(settings, "TE_TEMPLATE_ATTRIBUTES", {})
TE_ROWLIMIT = getattr(settings, "TE_ROWLIMIT", 1000)
TE_BASEPATH = "/" + getattr(settings, "TE_BASEPATH", "").lstrip("/").rstrip("/")
TE_BASEPATH = "" if TE_BASEPATH == "/" else TE_BASEPATH
USER_SERVICE_URL = getattr(settings, "USER_SERVICE_URL", "")
WKPDFGEN_SERVICE_URL = getattr(settings, "WKPDFGEN_SERVICE_URL", "")
WKPDFGEN_ASSET_URL = getattr(settings, "WKPDFGEN_ASSET_URL", "")
TINY_URL = getattr(settings, "TINY_URL", "")
