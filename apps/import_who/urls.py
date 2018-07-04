from django.conf.urls import patterns, url
from . import views

urlpatterns = patterns('import_who.views',
                       url(r'^$', views.index, name='index'),
                       url(r'^genmail/$', 'genmail', name='genmail'),
                       url(r'^createuser/$', 'createuser', name='createuser'),
)