from django.urls import path, re_path
from templatestore import views

urlpatterns = [
    # frontend
    path("", views.index, name="index"),
    # apis
    path("api/v1/render", views.render_template),
    path("api/v1/template", views.template_view),
    re_path(
        "api/v1/template/(?P<name>[a-z|A-Z]+[a-z|A-Z|0-9|_]*)/(?P<version>\d+\.\d+)$",
        views.template_details,
    ),
]