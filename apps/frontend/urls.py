from django.conf.urls import url

from .views import MapLayer, frontend_data

urlpatterns = [url(r'^map-data/$', MapLayer.as_view(), name='map-data'),
               url(r'^frontend-data/$', frontend_data, name='frontend-data'),
               ]
