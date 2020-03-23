from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db.models.functions import Length
from django.db import transaction
from django.conf import settings
from datetime import datetime
import json
from templatestore.models import Template, TemplateVersion, SubTemplate, TemplateConfig


def index(request):
    export_settings = {
        "TE_TEMPLATE_ATTRIBUTE_KEYS": settings.TE_TEMPLATE_ATTRIBUTES_KEYS
    }
    return render(
        request, "index.html", context={"settings": json.dumps(export_settings)}
    )


def render_via_jinja(template, context):
    from jinja2 import Template

    return Template(template).render(context)


@csrf_exempt
def render_template_view(request):
    # log requests
    if request.method != "GET":
        return HttpResponseBadRequest("invalid request method: " + request.method)
    template = request.GET.get("template", "")
    context = json.loads(request.GET.get("context", "{}"))
    handler = request.GET.get("handler", "")
    try:
        if handler == "jinja2":
            rendered_template = render_via_jinja(template, context)
            data = {
                "rendered_template": rendered_template,
                "rendered_on": datetime.now(),
            }
        else:
            raise Exception("Invalid Template Handler: %s", handler)  # TOTEST
    except Exception as e:
        print(e)
        raise e

    return JsonResponse(data, safe=False)


@csrf_exempt
def get_templates_view(request):
    if request.method == "GET":
        try:
            offset = int(request.GET.get("offset", 0))
            limit = int(request.GET.get("limit", settings.TE_ROWLIMIT))

            templates = Template.objects.all()[offset : offset + limit]
            template_list = [
                {
                    "name": t.name,
                    "version": TemplateVersion.objects.get(
                        pk=t.default_version_id
                    ).version
                    if t.default_version_id
                    else "0.1",
                    "default": True if t.default_version_id else False,
                    "type": t.type,
                    "attributes": t.attributes,
                }
                for t in templates
            ]

            return JsonResponse(template_list, safe=False)

        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )

    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )


@csrf_exempt
@transaction.atomic
def post_template_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # TODO: Validations

            cfgs = TemplateConfig.objects.filter(type=data["type"])
            sub_types = {cfg.sub_type: cfg for cfg in cfgs}

            diff_keys = set(sub_types.keys()).difference(
                set([s["sub_type"] for s in data["sub_template"]])
            )
            if len(diff_keys):
                raise (
                    Exception(
                        "Validation: missing `"
                        + str(diff_keys)
                        + "` for type `"
                        + data["type"]
                        + "`"
                    )
                )

            templates = Template.objects.filter(name=data["name"])
            if not len(templates):
                tmp = Template.objects.create(
                    name=data["name"], attributes=data["attributes"], type=data["type"]
                )
                tmp.save()

                version = "0.1"
                template = tmp

            else:
                template = templates[0]  # only one template should exist
                max_version = TemplateVersion.objects.filter(
                    template_id=template
                ).order_by(-Length("version"), "-version")[:1]
                major_version, minor_version = max_version[0].version.split(".")
                minor_version = str(int(minor_version) + 1)

                version = major_version + "." + minor_version

            tmp_ver = TemplateVersion.objects.create(
                template_id=template,
                version=version,
                sample_context_data=data["sample_context_data"],
            )
            tmp_ver.save()

            for sub_tmp in data["sub_template"]:
                st = SubTemplate.objects.create(
                    template_version_id=tmp_ver,
                    config=sub_types[sub_tmp["sub_type"]],
                    data=sub_tmp["data"],
                )
                st.save()

            template_data = {
                "name": data["name"],
                "version": version,
                "default": False,
                "attributes": template.attributes,
            }
            return JsonResponse(template_data, status=201)

        except Exception as e:
            print(e)

            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )

    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )


@csrf_exempt
def get_template_versions_view(request, name):
    if request.method == "GET":
        try:
            offset = int(request.GET.get("offset", 0))
            limit = int(request.GET.get("limit", settings.TE_ROWLIMIT))

            t = Template.objects.get(name=name)
            tvs = TemplateVersion.objects.filter(template_id=t.id).order_by("-id")[
                offset : offset + limit
            ]

            version_list = [
                {
                    "version": tv.version,
                    "default": True if t.default_version_id == tv.id else False,
                    "created_on": tv.created_on,
                }
                for tv in tvs
            ]

            return JsonResponse(version_list, safe=False)

        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )

    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )


@csrf_exempt
def get_render_template_view(request, name, version=None):
    if request.method == "GET":
        try:
            # Validations
            # if no version in params and no default_version_id exists, validation fails
            data = json.loads(request.body)

            t = Template.objects.get(name=name)
            tv = (
                TemplateVersion.objects.get(template_id=t.id, version=version)
                if version
                else TemplateVersion.objects.get(id=t.default_version_id)
            )
            stpls = SubTemplate.objects.filter(template_version_id=tv.id)

            res = {
                "version": tv.version,
                "type": t.type,
                "attributes": t.attributes,
                "sub_templates": [
                    {
                        "sub_type": stpl.config.sub_type,
                        "rendered_data": render_via_jinja(
                            stpl.data, data["context_data"]
                        ),
                    }
                    for stpl in stpls
                ],
            }

            return JsonResponse(res, safe=False)
        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )

    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )


@csrf_exempt
@transaction.atomic
def get_template_details_view(request, name, version):
    if request.method == "GET":
        try:
            t = Template.objects.get(name=name)
            tv = TemplateVersion.objects.get(template_id=t.id, version=version)
            stpls = SubTemplate.objects.filter(template_version_id=tv.id)

            res = {
                "name": t.name,
                "version": tv.version,
                "type": t.type,
                "sub_templates": [
                    {
                        "sub_type": stpl.config.sub_type,
                        "data": stpl.data,
                        "render_mode": stpl.config.render_mode,
                    }
                    for stpl in stpls
                ],
                "default": True if t.default_version_id == tv.id else False,
                "attributes": t.attributes,
                "sample_context_data": tv.sample_context_data,
            }

            return JsonResponse(res, safe=False)
        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            if not data.get("default", False):
                return HttpResponse(status=400)

            tmp = Template.objects.get(name=name)
            max_version = TemplateVersion.objects.filter(template_id=tmp).order_by(
                -Length("version"), "-version"
            )[:1]
            major_version, minor_version = max_version[0].version.split(".")
            major_version = str(float(int(major_version) + 1))

            tmp_ver = TemplateVersion.objects.get(template_id=tmp.id, version=version)
            sts = SubTemplate.objects.filter(template_version_id=tmp_ver.id)

            tmp_ver_new = TemplateVersion.objects.create(
                template_id=tmp,
                version=major_version,
                sample_context_data=tmp_ver.sample_context_data,
            )
            tmp_ver_new.save()
            for st in sts:
                SubTemplate.objects.create(
                    template_version_id=tmp_ver_new, config=st.config, data=st.data
                ).save()
            tmp.default_version_id = tmp_ver_new.id
            tmp.save(update_fields=["default_version_id", "modified_on"])

            template_data = {
                "name": tmp.name,
                "version": tmp_ver_new.version,
                "default": True if tmp.default_version_id == tmp_ver_new.id else False,
                "attributes": tmp.attributes,
            }
            return JsonResponse(template_data, status=200)

        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=400,
            )
    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )


@csrf_exempt
def get_config_view(request):
    if request.method == "GET":
        offset = int(request.GET.get("offset", 0))
        limit = int(request.GET.get("limit", settings.TE_ROWLIMIT))
        try:
            ts = TemplateConfig.objects.all()[offset : offset + limit]

            tes = {}
            for t in ts:
                if t.type in tes:
                    tes[t.type]["sub_type"].append(
                        {"type": t.sub_type, "render_mode": t.render_mode}
                    )
                else:
                    tes[t.type] = {
                        "sub_type": [{"type": t.sub_type, "render_mode": t.render_mode}]
                    }

            return JsonResponse(tes, safe=False)

        except Exception as e:
            print(e)
            return HttpResponse(
                json.dumps({"message": str(e)}),
                content_type="application/json",
                status=404,
            )

    else:
        return HttpResponse(
            json.dumps({"message": "no method found"}),
            content_type="application/json",
            status=404,
        )
