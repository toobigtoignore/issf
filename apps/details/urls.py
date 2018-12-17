from django.conf.urls import url
# from django.contrib.auth.decorators import login_required

# replace * with specific references
from django.views.generic import TemplateView

from .views import *
from issf_base.models import *

urlpatterns = [  # display
    url(r'^contribute/$', contribute, name='contribute'),
    url(r'^contribute/(?P<who>\w+)/$', contribute, name='contribute'),
    url(r'^organization/(?P<issf_core_id>\d+)/$',
        organization_details,
        name='organization-details'),
    url(r'^who/(?P<issf_core_id>\d+)/$', who_details,
        name='who-details'),
    url(r'^sota/(?P<issf_core_id>\d+)/$', sota_details,
        name='sota-details'),
    url(r'^capacity/(?P<issf_core_id>\d+)/$',
        capacity_details, name='capacity-details'),
    url(r'^profile/(?P<issf_core_id>\d+)/$',
        profile_details, name='profile-details'),
    url(r'^guidelines/(?P<issf_core_id>\d+)/$',
        guidelines_details, name='guidelines-details'),
    url(r'^experiences/(?P<issf_core_id>\d+)/$',
        experiences_details, name='experiences-details'),
    url(r'^casestudy/(?P<issf_core_id>\d+)/$',
        case_study_details, name='case-studies-details'),

    # display geographic scope form
    url(r'geog-scope/(?P<issf_core_id>\d+)/$',
        geographic_scope_save,
        name='geographic-scope-save'),

    # display main attributes form
    url(r'main-attrs/(?P<issf_core_id>\d+)/$',
        main_attributes_save,
        name='main-attributes-save'),

    # changelog
    url(r'^changelog/$', changelog, name='changelog'),

    # core datasets
    url(r'^who/basic/$', who_basic, name='who-basic'),
    url(r'^who/researcher/$', who_researcher,
        name='who-researcher'),
    url(r'^organization/basic/$', organization_basic,
        name='organization-basic'),
    url(r'^geocode-address/$', geocode_address,
        name='geocode-address'),
    url(r'^sota/basic/$', sota_basic, name='sota-basic'),
    url(r'^sota/other/$', sota_other, name='sota-other'),
    url(r'^capacity/basic/$', capacity_basic,
        name='capacity-basic'),
    url(r'^profile/basic/$', profile_basic,
        name='profile-basic'),
    url(r'^profile/main-attributes/$',
        profile_main_attributes,
        name='profile-main-attributes'),
    url(r'^guidelines/basic/$', guidelines_basic,
        name='guidelines-basic'),
    url(r'^experiences/basic/$', experiences_basic,
        name='experiences-basic'),
    url(r'^casestudy/basic/$', case_study_basic,
        name='case-studies-basic'),
    # related datasets that can apply to any core dataset
    url(r'^themes-issues/$', themes_issues,
        name='themes-issues'),
    url(r'^common-themes-issues/$', common_themes_issues,
        name='common-themes-issues'),
    url(r'^common-attributes/$', common_attributes,
        name='common-attributes'),
    url(r'^geographic-scope/$', geographic_scope,
        name='geographic-scope'),
    url(r'^profile-organizations/$',
        profile_organizations,
        name='profile-organizations'),
    url(r'^species/$', species, name='species'),
    url(r'^species-landings/$', species_landings,
        name='species-landings'),
    url(r'^external-links/$', external_links,
        name='external-links'),

    # display and saving
    url(r'^capacity-need-rating/('
        r'?P<prev_capacity_need_id>\d+)/$',
        capacity_need_rating,
        name='capacity-need-rating'),

    url(r'^report/(?P<record_type>\w+)/('
        r'?P<issf_core_id>\d+)/$',
        report,
        name='report'),
    url(r'^report-pdf/(?P<record_type>\w+)/('
        r'?P<issf_core_id>\d+)/$',
        render_report_pdf,
        name='report-pdf'),

    url(r'^delete/(?P<issf_core_id>\d+)/$', delete_record,
        name='delete-record'),
    url(r'^delete-record/$',
        TemplateView.as_view(
            template_name='details/record_deleted.html'),
        name='delete-record'), ]
