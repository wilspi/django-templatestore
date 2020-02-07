from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/v1/render", views.renderTemplate, name="renderTemplate"),
]

# # https://stackoverflow.com/a/21805592
# urlpatterns += patterns(
#     #'django.contrib.staticfiles.views',
#     url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
#     #url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
# )
