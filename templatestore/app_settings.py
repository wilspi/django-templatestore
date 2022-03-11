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
QUERY="Select * from (with v2 as (select * from templatestore_template_version where version='0.1') select t.name as t_name, v2.version as vt_version, t.default_version_id as t_default_version_id, t.type as t_type, t.attributes as t_attributes, t.created_on as t_created_on, t.modified_on as t_modified_on, t.user_email as t_user_email from templatestore_template as t inner join v2 on t.id=v2.template_id_id and t.default_version_id is null UNION ALL select t.name as t_name, vt.version as vt_version, t.default_version_id as t_default_version_id, t.type as t_type, t.attributes as t_attributes, t.created_on as t_created_on, t.modified_on as t_modified_on, t.user_email as t_user_email from templatestore_template as t inner join templatestore_template_version as vt on t.id=vt.template_id_id where t.default_version_id=vt.id ) as temp order by temp.t_modified_on desc;" 
