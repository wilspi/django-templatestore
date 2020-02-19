from django.urls import path, re_path
from editor import views

urlpatterns = [
    # frontend
    path("", views.index, name="index"),
    # apis
    path("api/v1/render", views.render_template),
    path("api/v1/template", views.template_view),
    re_path(
        "api/v1/template/(?P<name>[a-zA-Z][a-zA-Z0-9\_]?)/(?P<version>\d+\.\d+)$",
        views.template_details,
    ),
]

# # https://stackoverflow.com/a/21805592
# urlpatterns += patterns(
#     #'django.contrib.staticfiles.views',
#     url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
#     #url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
# )
