import django

from django import urls as urlresolvers
from django_js_reverse.views import urls_js
from django.urls import re_path

from django.conf.urls import include, url 
#from django.conf.urls import include, url
from django.contrib import admin

from issf_admin.views import return_sitemap, return_robots, return_google_site_verification, update_profile, \
    profile_saved, account_verified, custom_password_change, help_page, fact_archive, contributed_records
from django.contrib.auth.views import logout
from frontend.views import new_tip, new_faq, who_feature, geojson_upload, index, table_data_export, profile_csv, \
    country_records

admin.autodiscover()

urlpatterns = (  # admin
    
    re_path(r'^sitemap.xml/$', return_sitemap, name="return-sitemap"),
    re_path(r'^robots.txt/$', return_robots, name="return-robots"),
    re_path(r'googlee9690f8983b8a350.html/', return_google_site_verification,
        name="return-google-site-verification"),
    # auth
    re_path(r'accounts/logout/', logout,
        {'next_page': '/'}),
    re_path(r'accounts/profile/', update_profile,
        name="update-profile"),
    re_path(r'accounts/profile-saved/', profile_saved,
        name='profile-saved'),
    re_path(r'accounts/verified/', account_verified,
        name="account-verified"),
    re_path(r'accounts/password/change/', custom_password_change,
        name="custom-password-change"),
    re_path(r'accounts/', include('allauth.urls')),

    re_path(r'help/', help_page,
        name='help'),

    re_path(r'tip-archive/', fact_archive,
        name='fact-archive'),

    re_path(r'accounts/contributed-records/', contributed_records,
        name="contributed-records"),

    # django.js
    #url(r'djangojs/', include('djangojs.urls')),
    # django-js-reverse 
    re_path(r'^jsreverse/$', urls_js, name='js_reverse'),

    # apps
    re_path(r'^$', index, name='index'),
    re_path(r'frontend/', include('frontend.urls')),
    re_path(r'details/', include('details.urls')),
    # url(r'import-who/', include('import_who.urls')),

    re_path(r'data-export/', table_data_export, name='data-export'),

    re_path(r'profile-csv/', profile_csv, name='profile-csv'),
    re_path(r'newtip/', new_tip, name='new-tip'),
    re_path(r'newfaq/', new_faq, name='new-faq'),
    re_path(r'whofeature/', who_feature, name='who-feature'),
    re_path(r'geojson/', geojson_upload, name='geojson-upload'),
    re_path(r'country-records/(<country_id>\d+)/', country_records, name='country-records'),
)
