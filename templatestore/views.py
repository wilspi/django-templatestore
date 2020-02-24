from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from datetime import datetime
import json


def index(request):
    return render(request, "index.html", context={})

def render_via_jinja(template, context):
    from jinja2 import Template

    return Template(template).render(context)


def render_template(request):
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
