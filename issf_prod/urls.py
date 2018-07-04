import django

from django.urls import include, path, re_path
from django.contrib import admin

from issf_admin.views import return_sitemap, return_robots, return_google_site_verification, update_profile, \
    profile_saved, account_verified, custom_password_change, help_page, fact_archive, contributed_records
from django.contrib.auth.views import logout
from frontend.views import new_tip, new_faq, who_feature, geojson_upload, index, table_data_export, profile_csv, \
    country_records

admin.autodiscover()

urlpatterns = [  # admin
    # url(r'^admin/generate-sitemap/$',
    # 'issf_admin.views.generate_sitemap',
    # name="generate-sitemap"),
    # url(r'^admin/', include(admin.site.urls)),
    # url(r'^admin/generate-sitemap/$',
    # 'issf_admin.views.generate_sitemap',
    # name="generate-sitemap"),
    path('sitemap.xml/$', return_sitemap,
        name="return-sitemap"),
    path(r'^robots.txt/$', return_robots,
        name="return-robots"),
    path(r'^googlee9690f8983b8a350.html/$', return_google_site_verification,
        name="return-google-site-verification"),
    # url(r'^sitemap\.xml$', sitemap, {'sitemaps':
    # DetailsSitemap()},
    # name='django.contrib.sitemaps.views.sitemap'),
    # url(r'^sitemap\.xml$',
    # 'issf_admin.views.return_sitemap',
    # name="return-sitemap"),

    # auth
    path(r'^accounts/logout/$', logout,
        {'next_page': '/'}),
    path(r'^accounts/profile/$', update_profile,
        name="update-profile"),
    path(r'^accounts/profile-saved/$', profile_saved,
        name='profile-saved'),
    path(r'^accounts/verified/$', account_verified,
        name="account-verified"),
    path(r'^accounts/password/change/$', custom_password_change,
        name="custom-password-change"),
    # url(r'^accounts/temp/$', 'issf_admin.views.temp',
    # name="temp"),
    path(r'^accounts/', include('allauth.urls')),

    path(r'^help/', help_page,
        name='help'),

    path(r'^tip-archive/', fact_archive,
        name='fact-archive'),

    path(r'^accounts/contributed-records/$', contributed_records,
        name="contributed-records"),

    # django.js
    #url(r'^djangojs/', include('djangojs.urls')),
    # django-js-reverse 
    path('^jsreverse/$', 'django_js_reverse.views.urls_js', name='js_reverse'),

    # apps
    path(r'^$', index, name='index'),
    path(r'^frontend/', include('frontend.urls')),
    path(r'^details/', include('details.urls')),
    # url(r'^import-who/', include('import_who.urls')),

    path(r'^data-export/$', table_data_export,
        name='data-export'),

    path(r'^profile-csv/$', profile_csv,
        name='profile-csv'),
    path(r'^newtip/$', new_tip, name='new-tip'),
    path(r'^newfaq/$', new_faq, name='new-faq'),
    path(r'^whofeature/$', who_feature, name='who-feature'),
    path(r'^geojson/$', geojson_upload, name='geojson-upload'),
    path(r'^country-records/(?P<country_id>\d+)/$', country_records, name='country-records'), ]
