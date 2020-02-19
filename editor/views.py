from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json
from .models import Template, TemplateVersion
from django.db.models import Max


def index(request):
    return render(request, "index.html", context={})


def renderViaJinja(template, context):
    from jinja2 import Template

    return Template(template).render(context)


def renderTemplate(request):
    # log requests
    if request.method != "GET":
        return HttpResponseBadRequest("invalid request method: " + request.method)
    template = request.GET.get("template", "")
    context = json.loads(request.GET.get("context", "{}"))
    handler = request.GET.get("handler", "")
    try:
        if handler == "jinja2":
            rendered_template = renderViaJinja(template, context)
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
        templates = Template.objects.all()
        template_list = []
        for template in templates:
            data = {
                "id": template.id,
                "name": template.name,
                "default_version": template.default_version
            }
            template_list.append(data)
        return JsonResponse(template_list, safe=False)

    elif request.method == "POST":
        data = json.loads(request.body)
        name = data["name"]
        template = Template.objects.filter(name=name)
        if len(template) == 0:
            data["version"] = "0.1"
            temp = Template.objects.create(
                name=name,
                default_version=0
            )
            try:
                temp.save()
            except Exception:
                return JsonResponse(Exception)

            data["template_id"] = temp

        else:
            template = Template.objects.get(name=name)
            max_version = TemplateVersion.objects.filter(template_id=template).aggregate(Max("version"))
            major_version, minor_version = max_version["version__max"].split(".")
            minor_version = str(int(minor_version)+1)
            data["version"] = major_version+"."+minor_version
            data["template_id"] = template

        temp = TemplateVersion.objects.create(
            template_id=data["template_id"],
            data=data["data"],
            version=data["version"],
            status=data["status"],
            sample_context_data=data["sample_context_data"]
        )

        try:
            temp.save()
            template_data = {
                "name": data["name"],
                "version": data["version"]
            }
            return JsonResponse(template_data, status=200)
        except Exception:
            return JsonResponse(Exception)

@csrf_exempt
def template_details(request, name, version):
    try:
        template = Template.objects.get(name=name)
    except Template.DoesNotExist:
        return HttpResponse(status=404)

    template_id = template
    try:
        template = TemplateVersion.objects.get(template_id=template_id, version=version)
    except Template.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == "GET":

        data = {
            "name": name,
            "version": version,
            "data": template.data,
            "sample_context_data": template.sample_context_data
        }
        return JsonResponse(data, status=200)

    elif request.method == "POST":
        tmp = Template.objects.get(name=name)
        max_version = TemplateVersion.objects.filter(template_id=tmp).aggregate(Max("version"))
        major_version, minor_version = max_version["version__max"].split(".")
        major_version = int(major_version)
        major_version = major_version+1
        major_version = str(float(major_version))



        temp = TemplateVersion.objects.create(
            template_id=tmp,
            data=template.data,
            version=major_version,
            status=template.status,
            sample_context_data=template.sample_context_data
        )

        try:
            temp.save()
        except Exception:
            return JsonResponse(Exception)

        temp2 = Template.objects.get(name=name)

        temp2.default_version = temp.id

        try:
            temp2.save()
        except Exception:
            return JsonResponse(Exception)
        template_data={
            "name": name,
            "version": temp.version,
        }
        return JsonResponse(template_data, status=200)























# @csrf_exempt
# def template_view(request):
#
#     # elif request.method == "POST":
#     if request.method == "POST":
#         data = json.loads(request.body)
#         name = data["name"]
#         templates = Template.objects.filter(name=name)
#         if len(templates) == 0:
#             data["version"] = "1.0"
#             template = Template.objects.create(
#                 name=name
#             )
#             data["template_id"] = template.id
#         # else:
#             #max_value = Template.objects.filter(name=name).aggregate(Max("version"))
#             #data["version"] = max_value["version__max"] + 1
#
#         u = TemplateVersion.objects.create(
#             template_id=data["template_id"],
#             version=data["version"],
#             data=data["data"],
#             status=data["status"],
#             sample_context_data=data["sample_context_data"],
#         )
#         try:
#             u.save()
#             template_data = {"name": data["name"], "version": data["version"]}
#             return JsonResponse(template_data, status=201)
#         except Exception:
#             return JsonResponse(Exception)
#
#


# @csrf_exempt
# def template_view(request):
#     if request.method == "GET":
#         templates = Template.objects.all()
#         template_list = []
#         for template in templates:
#             data = {
#                 "id": template.id,
#                 "name": template.name,
#                 "version": template.version,
#                 "data": template.data,
#                 "created_on": template.created_on,
#                 "created_by": template.created_by,
#                 "status": template.status,
#                 "sample_context_data": template.sample_context_data,
#             }
#             template_list.append(data)
#         return JsonResponse(template_list, safe=False)
#
#     elif request.method == "POST":
#         data = json.loads(request.body)
#         name = data["name"]
#         templates = Template.objects.filter(name=name)
#         if len(templates) == 0:
#             data["version"] = 1
#         else:
#             max_value = Template.objects.filter(name=name).aggregate(Max("version"))
#             data["version"] = max_value["version__max"] + 1
#
#         u = Template.objects.create(
#             name=data["name"],
#             version=data["version"],
#             data=data["data"],
#             status=data["status"],
#             sample_context_data=data["sample_context_data"],
#         )
#         try:
#             u.save()
#             template_data = {"name": data["name"], "version": data["version"]}
#             return JsonResponse(template_data, status=201)
#         except Exception:
#             return JsonResponse(Exception)
#


# @csrf_exempt
# def template_details(request, name, version):
#     try:
#         template = Template.objects.get(name=name, version=version)
#     except Template.DoesNotExist:
#         return HttpResponse(status=404)
#
#     if request.method == "GET":
#         data = {
#             "name": template.name,
#             "version": template.version,
#             "data": template.data,
#             "sample_context_data": template.sample_context_data,
#         }
#         return JsonResponse(data, status=200)
