from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db.models.functions import Length
from django.db import transaction
from datetime import datetime
import json
from templatestore.models import Template, TemplateVersion, SubTemplate, TemplateConfig


def index(request):
    return render(request, "index.html", context={})


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
            limit = int(request.GET.get("limit", 100))

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
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=404)


@csrf_exempt
@transaction.atomic
def post_template_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # TODO: Validations

            templates = Template.objects.filter(name=data["name"])
            if not len(templates):
                temp = Template.objects.create(
                    name=data["name"], attributes=data["attributes"]
                )
                temp.save()

                version = "0.1"
                template_id = temp

            else:
                template = templates[0]  # only one template should exist
                max_version = TemplateVersion.objects.filter(
                    template_id=template
                ).order_by(-Length("version"), "-version")[:1]
                major_version, minor_version = max_version[0].version.split(".")
                minor_version = str(int(minor_version) + 1)

                version = major_version + "." + minor_version
                template_id = template

            temp = TemplateVersion.objects.create(
                template_id=template_id,
                data=data["data"],
                version=version,
                sample_context_data=data["sample_context_data"],
            )
            temp.save()
            template_data = {
                "name": data["name"],
                "version": version,
                "default": False,
            }
            return JsonResponse(template_data, status=201)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=404)


@csrf_exempt
def get_template_versions_view(request, name):
    if request.method == "GET":
        try:
            offset = int(request.GET.get("offset", 0))
            limit = int(request.GET.get("limit", 100))

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
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=404)


@csrf_exempt
def get_render_template_view(request, name, version=None):
    if request.method == "GET":
        try:
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
                        "sub_type": stpl.type,
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
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=404)


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
                        "sub_type": stpl.type,
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
            return HttpResponse(status=400)

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

            temp = TemplateVersion.objects.create(
                template_id=tmp,
                data=template.data,
                version=major_version,
                status=template.status,
                sample_context_data=template.sample_context_data,
            )
            temp.save()
            tmp.default_version_id = temp.id
            tmp.save(update_fields=['default_version_id'])

            template_data = {"name": name, "version": temp.version, "default": default}
            return JsonResponse(template_data, status=200)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=404)


@csrf_exempt
def get_config_view(request):
    if request.method == "GET":
        offset = int(request.GET.get("offset", 0))
        limit = int(request.GET.get("limit", 100))
        try:
            ts = TemplateConfig.objects.all()[offset : offset + limit]

            tes = {}
            for t in ts:
                if t["type"] in tes:
                    tes[t["type"]]["sub_type"].append(
                        {"type": t.sub_type, "render_mode": t.render_mode}
                    )
                else:
                    tes[t["type"]] = {
                        "sub_type": [{"type": t.sub_type, "render_mode": t.render_mode}]
                    }

            return JsonResponse(tes, safe=False)

        except Exception as e:
            print(e)
            return HttpResponse(status=404)

    else:
        return HttpResponse(status=404)
