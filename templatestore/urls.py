from django.urls import path, re_path
from templatestore import views

urlpatterns = [
    # apis
    path("api/v1/template", views.post_template_view),
    path("api/v1/render", views.render_template_view),
    path("api/v1/templates", views.get_templates_view),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z]+[a-zA-Z0-9_]*)/versions$",
        views.get_template_versions_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z]+[a-zA-Z0-9_]*)/render",
        views.get_render_template_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z]+[a-zA-Z0-9_]*)/(?P<version>\d+\.\d+)$",
        views.get_template_details_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z]+[a-zA-Z0-9_]*)/(?P<version>\d+\.\d+)/render",
        views.get_render_template_view,
    ),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z]+[a-zA-Z0-9_]*)/attributes",
        views.patch_attributes_view,
    ),
    path("api/v1/config", views.get_config_view),
    # frontend
    re_path(r"^(?:.*)/?$", views.index, name="index"),
]
