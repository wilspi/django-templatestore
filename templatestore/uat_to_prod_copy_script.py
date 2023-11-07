import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "example.settings")
django.setup()

"""
Steps to run the script:
1. Add templates list in TEMPLATES
2. Update ackodev DB details here - https://github.com/ackotech/django-templatestore/blob/451e05893e13f8d3b984433b76b7224937ceeb61/example/settings.py#L76
3. Add prod DB details after this line - https://github.com/ackotech/django-templatestore/blob/451e05893e13f8d3b984433b76b7224937ceeb61/example/settings.py#L81
4. Update ENV to prod
5. Run the script
"""


# TODO Be careful with prod
ENV = "local"

from templatestore.models import *

TEMPLATES = []

UAT_TO_PROD_SUBTEMPLATE_ID_MAPPING = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 6,
    6: 8,
    7: 9,
    8: 10,
    9: 11,
    10: 14,
    11: 15,
    12: 16,
    13: 12,
    14: 13,
}


def clone_template(template_name):
    template = Template.objects.filter(name=template_name).first()

    TEMPLATE = {
        "name": template.name,
        "type": template.type,
        "attributes": template.attributes,
        "created_by": template.created_by,
        "user_email": template.user_email,
    }

    t = Template.objects.using(ENV).create(**TEMPLATE)

    versions = TemplateVersion.objects.filter(template_id=template).all()

    for version in versions:
        VERSION = {
            "template_id_id": t.id,
            "version": version.version,
            "sample_context_data": version.sample_context_data,
            "version_alias": version.version_alias,
            "created_by": version.created_by,
            "user_email": version.user_email,
            "tiny_url": version.tiny_url,
        }
        v = TemplateVersion.objects.using(ENV).create(**VERSION)

        if template.default_version_id and version.id == template.default_version_id:
            t.default_version_id = v.id
            t.save()

        sub_templates = SubTemplate.objects.filter(template_version_id=version.id).all()
        for sub_template in sub_templates:
            SUB_TEMPLATE = {
                "template_version_id_id": v.id,
                # TODO template_template_config are different in uat and prod databases
                "config_id": UAT_TO_PROD_SUBTEMPLATE_ID_MAPPING.get(
                    sub_template.config_id
                ),
                "data": sub_template.data,
            }

            SubTemplate.objects.using(ENV).create(**SUB_TEMPLATE)


if __name__ == "__main__":
    for name in TEMPLATES:
        clone_template(name)
        print("template cloned: ", name)
