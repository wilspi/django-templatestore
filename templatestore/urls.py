from django.urls import path, re_path
from templatestore import views

urlpatterns = [
    # frontend
    path("", views.index, name="index"),
    # apis
    path("api/v1/template", views.post_template_view),
    path("api/v1/render", views.render_template_view),
    path("api/v1/templates", views.get_templates_view),
    re_path(
        "api/v1/template/(?P<name>[a-z|A-Z]+[a-z|A-Z|0-9|_]*)/versions$",
        views.get_template_versions_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-z|A-Z]+[a-z|A-Z|0-9|_]*)/render",
        views.get_render_template_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-z|A-Z]+[a-z|A-Z|0-9|_]*)/(?P<version>\d+\.\d+)$",
        views.get_template_details_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-z|A-Z]+[a-z|A-Z|0-9|_]*)/(?P<version>\d+\.\d+)/render",
        views.get_render_template_view,
    ),
    path("api/v1/config", views.get_config_view),
]
