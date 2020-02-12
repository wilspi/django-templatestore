from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json
from .serializers import *
from .models import Template
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
    if request.method == 'GET':
        template = Template.objects.all()
        serializer = TemplateSerializer(template, many=True)
        return JsonResponse(serializer.data, safe=False)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = TemplateSerializer(data=data)
        name = serializer.initial_data.get('name')
        templates = Template.objects.filter(name=name)
        if len(templates) == 0:
            serializer.initial_data['version'] = 1
        else:
            max_value = Template.objects.filter(name=name).aggregate(Max('version'))
            serializer.initial_data['version'] = str(int(max_value['version__max']) + 1)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


@csrf_exempt
def template_details(request, name, version):
    try:
        template = Template.objects.get(name=name, version=version)

    except Template.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = TemplateSerializer(template)
        return JsonResponse(serializer.data)
