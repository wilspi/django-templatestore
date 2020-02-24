from django.urls import path, re_path
from templatestore import views

urlpatterns = [
    path("", views.index, name="index"),
    # apis
    path("api/v1/render", views.render_template),
]

# # https://stackoverflow.com/a/21805592
# urlpatterns += patterns(
#     #'django.contrib.staticfiles.views',
#     url(r'^(?:index.html)?$', 'serve', kwargs={'path': 'index.html'}),
#     #url(r'^(?P<path>(?:js|css|img)/.*)$', 'serve'),
# )
