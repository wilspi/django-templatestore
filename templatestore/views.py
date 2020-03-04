from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json
from templatestore.models import Template, TemplateVersion
from django.db.models.functions import Length
from django.db import transaction


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

        except Exception:
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
                template = Template.objects.get(name=name)
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

            t = Template.objects.get()

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

        except Exception:
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
            stpls = SubTemplate.objects.get(template_version_id=tv.id)

            res = {
                "version": tv.version,
                "type": t.type,
                "attributes": t.attributes,
                "sub_templates": [
                    {
                        "type": stpl.type,
                        "rendered_data": render_via_jinja(
                            stpl.data, data["context_data"]
                        ),
                    }
                    for stpl in stpls
                ],
            }

            return JsonResponse(res, safe=False)
        except Exception:
            return HttpResponse(status=400)

    else:
        return HttpResponse(status=404)


@csrf_exempt
def template_details_view(request, name, version):
    try:
        template = Template.objects.get(name=name)
    except Exception:
        return HttpResponse(status=404)

    template_id = template
    try:
        template = TemplateVersion.objects.get(template_id=template_id, version=version)
    except Exception:
        return HttpResponse(status=404)

    if request.method == "GET":
        default = False
        if template_id.default_version_id == template.id:
            default = True
        data = {
            "name": name,
            "version": version,
            "data": template.data,
            "sample_context_data": template.sample_context_data,
            "default": default,
        }
        return JsonResponse(data, status=200)

    elif request.method == "POST":
        data = json.loads(request.body)
        default = data["default"]
        if not default:
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

        try:
            temp.save()
        except Exception as e:
            print(e)
            return HttpResponse(status=400)

        temp2 = Template.objects.get(name=name)
        temp2.default_version_id = temp.id

        try:
            temp2.save()
        except Exception as e:
            print(e)
            return JsonResponse(Exception)

        template_data = {"name": name, "version": temp.version, "default": default}
        return JsonResponse(template_data, status=200)
    elif request.method == "PUT":
        data = json.loads(request.body)
        default = data["default"]
        if not default:
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

        try:
            temp.save()
        except Exception as e:
            print(e)
            return HttpResponse(status=400)

        temp2 = Template.objects.get(name=name)
        temp2.default_version_id = temp.id

        try:
            temp2.save()
        except Exception as e:
            print(e)
            return JsonResponse(Exception)

        template_data = {"name": name, "version": temp.version, "default": default}
        return JsonResponse(template_data, status=200)
    else:
        return HttpResponse(status=404)


@csrf_exempt
def config_view(request):
    if request.method == "GET":
        offset = int(request.GET.get("offset", 0))
        limit = int(request.GET.get("limit", 100))
        try:
            # templates = Template.objects.all()[offset : offset + limit]
            # template_list = []
            # for template in templates:
            #     default = False
            #     version = "0"
            #     if template.default_version_id != 0:
            #         default = True
            #         version = TemplateVersion.objects.get(
            #             pk=template.default_version_id
            #         ).version
            #
            #     data = {"name": template.name, "version": version, "default": default}
            #     template_list.append(data)
            # return JsonResponse(template_list, safe=False)
            pass
        except Exception:
            return HttpResponse(status=404)
    else:
        return HttpResponse(status=404)
