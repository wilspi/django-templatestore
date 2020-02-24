from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json
from .models import Template, TemplateVersion
from django.db.models.functions import Length


def index(request):
    return render(request, "index.html", context={})


def render_via_jinja(template, context):
    from jinja2 import Template

    return Template(template).render(context)


# TODO: common logger


def render_template(request):
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
        raise e
        # return JsonResponse(data, safe=False)

    return JsonResponse(data, safe=False)  # TOFIX: why not httpresponse
    # return HttpResponse(data, content_type='application/json')


@csrf_exempt
def template_view(request):
    if request.method == "GET":
        offset = int(request.GET.get("offset", 0))
        limit = int(request.GET.get("limit", 100))
        try:
            templates = Template.objects.all()[offset : offset + limit]
            template_list = []
            for template in templates:
                default = False
                version = "0"
                if template.default_version_id != 0:
                    default = True
                    version = TemplateVersion.objects.get(
                        pk=template.default_version_id
                    ).version

                data = {"name": template.name, "version": version, "default": default}
                template_list.append(data)
            return JsonResponse(template_list, safe=False)
        except Exception:
            return HttpResponse(status=404)

    elif request.method == "POST":
        data = json.loads(request.body)
        name = data["name"]
        template = Template.objects.filter(name=name)
        flag = 0
        if len(template) == 0:
            data["version"] = "0.1"
            temp = Template.objects.create(
                name=name, default_version_id=0, attributes=data["attributes"]
            )
            flag = 1
            try:
                temp.save()
            except Exception:
                return HttpResponse(status=400)

            data["template_id"] = temp

        else:
            template = Template.objects.get(name=name)

            max_version = TemplateVersion.objects.filter(template_id=template).order_by(
                -Length("version"), "-version"
            )[:1]
            major_version, minor_version = max_version[0].version.split(".")

            minor_version = str(int(minor_version) + 1)

            data["version"] = major_version + "." + minor_version
            data["template_id"] = template
        try:
            temp = TemplateVersion.objects.create(
                template_id=data["template_id"],
                data=data["data"],
                version=data["version"],
                sample_context_data=data["sample_context_data"],
            )
            temp.save()
            template_data = {
                "name": data["name"],
                "version": data["version"],
                "default": False,
            }
            return JsonResponse(template_data, status=201)
        except Exception as e:
            print(e)
            if flag == 1:
                temp = Template.objects.get(name=name)
                temp.delete()
            return HttpResponse(status=400)


@csrf_exempt
def template_details(request, name, version):
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
        except Exception:
            return HttpResponse(status=400)

        temp2 = Template.objects.get(name=name)
        temp2.default_version_id = temp.id

        try:
            temp2.save()
        except Exception:
            return JsonResponse(Exception)
        template_data = {"name": name, "version": temp.version, "default": default}
        return JsonResponse(template_data, status=200)
