from django.conf.urls import url

from .views import MapLayer, frontend_data

urlpatterns = [url(r'^map-data/$', MapLayer.as_view(), name='map-data'),
               url(r'^frontend-data/$', frontend_data, name='frontend-data'),
               # url(r'^frontend_search/$', search, name='frontend_search'),
               # url(r'^frontend_table/$', frontend_table, name='frontend_table'),
               ]
