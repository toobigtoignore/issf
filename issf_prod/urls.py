from issf_admin.views import return_robots, return_google_site_verification, update_profile, \
    profile_saved, account_verified, custom_password_change, help_page, fact_archive, contributed_records, logout_view

from frontend.views import new_tip, new_faq, who_feature, geojson_upload, index, table_data_export, profile_csv, country_records
from details.views import DetailsSitemap

from django.conf.urls import include, url
from django.urls import reverse
from django.contrib.sitemaps.views import sitemap
from django.contrib.sitemaps import Sitemap

from django.contrib import admin


admin.autodiscover()


class StaticSitemap(Sitemap):
    priority = 0.5
    changefreq = 'weekly'

    def items(self):
        return ['help', 'fact-archive', 'index', 'contribute', 'changelog']

    def location(self, item):
        return reverse(item)


sitemaps = {
    'details': DetailsSitemap,
    'static': StaticSitemap
}


def return_sitemap(request):
    response = sitemap(request, sitemaps)
    response.render()
    response.content = response.content.replace(b"http://dory.creait.mun.ca", b"https://issfcloud.toobigtoignore.net")
    return response


urlpatterns = [
    url(
        r'^sitemap.xml/$',
        return_sitemap,
        name='django.contrib.sitemaps.views.sitemap'
    ),
    url(r'^robots.txt/$', return_robots, name="return-robots"),
    url(r'^googlee9690f8983b8a350.html/$', return_google_site_verification, name="return-google-site-verification"),

    # auth
    url(r'^accounts/logout/$', logout_view),
    url(r'^accounts/profile/$', update_profile, name="update-profile"),
    url(r'^accounts/profile-saved/$', profile_saved, name='profile-saved'),
    url(r'^accounts/verified/$', account_verified, name="account-verified"),
    url(r'^accounts/password/change/$', custom_password_change, name="custom-password-change"),
    url(r'^accounts/', include('allauth.urls')),

    url(r'^help/', help_page, name='help'),

    url(r'^tip-archive/', fact_archive, name='fact-archive'),

    url(r'^accounts/contributed-records/$', contributed_records, name="contributed-records"),

    # apps
    url(r'^$', index, name='index'),
    url(r'^frontend/', include('frontend.urls')),
    url(r'^details/', include('details.urls')),

    url(r'^data-export/$', table_data_export, name='data-export'),

    url(r'^profile-csv/$', profile_csv,
        name='profile-csv'),
    url(r'^newtip/$', new_tip, name='new-tip'),
    url(r'^newfaq/$', new_faq, name='new-faq'),
    url(r'^whofeature/$', who_feature, name='who-feature'),
    url(r'^geojson/$', geojson_upload, name='geojson-upload'),
    url(r'^country-records/(?P<country_id>\d+)/$', country_records, name='country-records'), ]
