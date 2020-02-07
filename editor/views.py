from django.shortcuts import render
from django.template import Context, Template
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from datetime import datetime
import json


def index(request):
    return render(request, "index.html", context={})


def renderTemplate(request):
    # log requests
    if request.method != "GET":
        return HttpResponseBadRequest("invalid request method: " + request.method)
    template = Template(request.GET.get("template", ""))
    context = Context(json.loads(request.GET.get("json", "{}")))
    rendered_template = template.render(context)
    data = {
        "rendered_template": rendered_template,
        "rendered_on": datetime.now(),
    }

    return JsonResponse(data, safe=False)  # TOFIX: why not httpresponse
    # return HttpResponse(data, content_type='application/json')
