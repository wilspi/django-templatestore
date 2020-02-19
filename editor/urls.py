from django.urls import path, re_path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/v1/render", views.renderTemplate, name="renderTemplate"),
    path("api/v1/template", views.template_view, name="get_post_api"),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z][a-zA-Z0-9]?)/(?P<version>\d+\.\d+)$",
        views.template_details,
        name="get_template_details",
    ),
]

# # https://stackoverflow.com/a/21805592
# urlpatterns += patterns(
#     #'django.contrib.staticfiles.views',
#     url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
#     #url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
# )
