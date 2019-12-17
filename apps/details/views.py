import ast
import json
import re
import tempfile
from datetime import datetime
from urllib.parse import urlparse
from typing import Any, Dict
import collections

from django.contrib.auth.decorators import login_required
from django.contrib.sitemaps import Sitemap
from django.core.cache import cache
from django.urls import reverse
from django.db import connection
from django.db.models.query import QuerySet
from django.forms import ModelForm
from django.contrib.gis.db.models import Model
from django.forms.utils import ErrorList
from django.template.loader import get_template
from django.http import HttpResponseNotFound, HttpResponse, HttpRequest
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic import CreateView
from django.views.generic.edit import UpdateView

from issf_admin.models import UserProfile
# replace * with specific references
from .forms import *
from issf_admin.forms import ProfileForm
from issf_admin.views import save_profile
from issf_base.utils import get_redirectname

import twitter
import twitter.error
import hardcopy
from issf_prod.settings import TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
from issf_prod.settings import TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET

api = twitter.Api(
    consumer_key=TWITTER_CONSUMER_KEY,
    consumer_secret=TWITTER_CONSUMER_SECRET,
    access_token_key=TWITTER_ACCESS_TOKEN,
    access_token_secret=TWITTER_ACCESS_TOKEN_SECRET
)
# Attempt to verify twitter credentials. Sets a variable saying whether or not it was successful
try:
    TWITTER_AUTHENTICATED = api.VerifyCredentials() is not None
except twitter.error.TwitterError:
    TWITTER_AUTHENTICATED = False


class AttributesCreateView(CreateView):
    """
    View for creating new attributes.
    Unused.
    """
    model = MainAttributeView
    form_class = MainAttributesViewInlineFormSet
    template_name = 'details/test.html'
    success_url = '/'


class AttributesUpdateView(UpdateView):
    """
    View for updating attributes.
    Unused.
    """
    model = SSFProfile
    form_class = MainAttributesViewInlineFormSet
    template_name = 'details/test.html'
    success_url = '/'


# sitemap
class DetailsSitemap(Sitemap):
    """
    Generates a sitemap.
    """
    changefreq = "weekly"
    priority = 0.5

    def items(self) -> QuerySet:
        """
        Gets all items to be displayed under the details part of the sitemap.

        :return: A queryset containing all ISSF_Core objects.
        """
        return ISSF_Core.objects.all()

    def lastmod(self, obj: ISSF_Core) -> datetime:
        """
        Gets the last modified date of an object.

        :param obj: The object to get the last modified date of.
        :return: The last modified date of the object.
        """
        return obj.edited_date


@login_required
def contribute(request: HttpRequest, who: str = '') -> HttpResponse:
    """
    View for the contribute page. It's initialized with blank forms for each dataset except that
    the contributor is automatically set to the currently logged in user.

    :param request: The incoming HTTP request.
    :param who: String provided in URL parameter. If set to \"who\", the contribute organization page will open by default.
    :return: The HTTP response to return to the user.
    """
    # determine if the current user already has a person record
    issf_core_id = None
    person = None
    profile_form = ProfileForm(instance=request.user)
    ssf_persons = SSFPerson.objects.filter(contributor_id__exact=request.user.id)
    if ssf_persons.count() > 0:
        person = ssf_persons[0]
        issf_core_id = person.issf_core_id
        person_form = SSFPersonForm(instance=ssf_persons[0])
    else:
        person_form = SSFPersonForm(initial={'contributor': request.user.id})

    is_active = ''
    if who == 'who':
        is_active = 'active'

    case_study_form = SSFCaseStudiesForm(initial={'contributor': request.user.id})
    capacity_need_form = SSFCapacityNeedForm(initial={'contributor': request.user.id})

    if not request.user.is_staff:
        del case_study_form.fields['tweet']
        del capacity_need_form.fields['tweet']

    return render(
        request,
        "details/contribute.html",
        {
            "profile_form": profile_form,
            "person_form": person_form,
            "person": person,
            "issf_core_id": issf_core_id,
            "organization_form": SSFOrganizationForm(prefix="org", initial={'contributor': request.user.id}),
            "knowledge_form": SSFKnowledgeForm(initial={'contributor': request.user.id}),
            "knowledge_authors_form": AuthorsInlineFormSet,
            "capacity_need_form": capacity_need_form,
            "fishery_profile_form": SSFProfileForm(initial={'contributor': request.user.id, 'data_end_year': 0}),
            "guidelines_form": SSFGuidelinesForm(initial={'contributor': request.user.id}),
            "experiences_form": SSFExperiencesForm(initial={'contributor': request.user.id}),
            "case_study_form": case_study_form,
            "is_active": is_active
        }
    )


# BEGIN DETAILS VIEWS

"""All of the views with names *_details are the GET request pages for each record type. They first initialize forms
and objects which are common to all datasets and then ones that are specific to that record type. There is a lot of
reused code that could be factored out to functions.
"""


# display
def sota_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying details for a SOTA record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the SOTA record to display.
    :return: The HTTP response to return to the user.
    """
    # knowledge and related instances
    knowledge_instance = SSFKnowledge.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    authors = KnowledgeAuthorSimple.objects.filter(knowledge_core=issf_core_id)
    common_themes_issues = CommonThemeIssueView.objects.filter(issf_core=issf_core_id)
    common_attributes = CommonAttributeView.objects.filter(issf_core=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    species = Species.objects.filter(issf_core=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)

    # forms
    knowledge_form = SSFKnowledgeForm(instance=knowledge_instance)
    knowledge_authors_form = AuthorsInlineFormSet(instance=knowledge_instance)
    common_themes_issues_formset = CommonThemesIssuesViewInlineFormSet(instance=core_instance)
    common_attributes_formset = CommonAttributesViewInlineFormSet(instance=core_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    knowledge_other_details_form = KnowledgeOtherDetailsForm(instance=knowledge_instance)
    species_form = SpeciesInlineFormSet(instance=core_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)

    # check if user has rights to edit (record owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type knowledge
    if "State-of-the-Art in SSF Research" in knowledge_instance.core_record_type:
        return render(
            request,
            "details/ssfknowledge_details.html",
            {
                "knowledge_instance": knowledge_instance,
                "core_instance": core_instance,
                "authors": authors,
                "common_themes_issues": common_themes_issues,
                "common_attributes": common_attributes,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "species": species,
                "external_links": external_links,
                "knowledge_form": knowledge_form,
                "knowledge_authors_form": knowledge_authors_form,
                "common_themes_issues_formset": common_themes_issues_formset,
                "common_attributes_formset": common_attributes_formset,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "knowledge_other_details_form": knowledge_other_details_form,
                "species_form": species_form,
                "external_links_form": external_links_form,
                "editor": editor,
                'who_page': who_page
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def who_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of a Who's Who record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # person and related instances
    profile_form = None
    if request.user.is_authenticated:
        profile_form = ProfileForm(instance=request.user)
    person_instance = SSFPerson.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    common_themes_issues = CommonThemeIssueView.objects.filter(issf_core=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)
    species = Species.objects.filter(issf_core=issf_core_id)

    # forms
    person_form = SSFPersonForm(instance=person_instance)
    common_themes_issues_formset = CommonThemesIssuesViewInlineFormSet(instance=core_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    person_researcher_form = PersonResearcherForm(instance=person_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)
    species_form = SpeciesInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # ensure record is of type person
    if "Who's Who in SSF" in person_instance.core_record_type:
        return render(
            request,
            "details/ssfperson_details.html",
            {
                "profile_form": profile_form,
                "person_instance": person_instance,
                "core_instance": core_instance,
                "common_themes_issues": common_themes_issues,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "external_links": external_links,
                "species": species,
                "person_form": person_form,
                "common_themes_issues_formset": common_themes_issues_formset,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "person_researcher_form": person_researcher_form,
                "external_links_form": external_links_form,
                "species_form": species_form,
                "editor": editor
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def organization_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of an Organization record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # organization and related instances
    organization_instance = SSFOrganization.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    common_themes_issues = CommonThemeIssueView.objects.filter(issf_core=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)

    # forms
    organization_form = SSFOrganizationForm(instance=organization_instance, prefix='org')
    common_themes_issues_formset = CommonThemesIssuesViewInlineFormSet(instance=core_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type organization
    if "SSF Organization" in organization_instance.core_record_type:
        return render(
            request,
            "details/ssforganization_details.html",
            {
                "organization_instance": organization_instance,
                "core_instance": core_instance,
                "common_themes_issues": common_themes_issues,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "external_links": external_links,
                "species": species,
                "organization_form": organization_form,
                "common_themes_issues_formset": common_themes_issues_formset,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "external_links_form": external_links_form,
                "editor": editor,
                'who_page': who_page
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def capacity_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of a Capacity Development record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # Record instances
    capacity_need_instance = SSFCapacityNeed.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)

    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)

    # forms
    capacity_need_form = SSFCapacityNeedForm(instance=capacity_need_instance)
    del capacity_need_form.fields['tweet']
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type capacity
    if "Capacity Development" in capacity_need_instance.core_record_type:
        return render(
            request,
            "details/ssfcapacity_details.html",
            {
                "capacity_need_instance": capacity_need_instance,
                "core_instance": core_instance,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "external_links": external_links,
                "capacity_need_form": capacity_need_form,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "external_links_form": external_links_form,
                "editor": editor,
                'who_page': who_page
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def profile_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of a SSF Profile record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # Record instances
    profile_instance = SSFProfile.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    main_attributes = MainAttributeView.objects.filter(issf_core_id=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    species_landings = Species.objects.filter(issf_core=issf_core_id)
    profile_organizations = ProfileOrganization.objects.filter(ssfprofile=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)

    # calculate percentage of record completed and assign colour for sidebar
    #  container
    if profile_instance.percent >= 75:
        pct_colour = '#4CAF50'
    elif 35 < profile_instance.percent < 75:
        pct_colour = '#FF9900'
    else:
        pct_colour = '#F44336'

    # forms
    profile_form = SSFProfileForm(instance=profile_instance, initial={'data_end_year': 0})
    main_attributes_formset = MainAttributesViewInlineFormSet(instance=core_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    species_landings_formset = SpeciesLandingsInlineFormSet(instance=core_instance)
    profile_organization_formset = ProfileOrganizationInlineFormset(instance=profile_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type profile
    if "SSF Profile" in profile_instance.core_record_type:
        return render(
            request,
            "details/ssfprofile_details.html",
            {
                "profile_instance": profile_instance,
                "core_instance": core_instance,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "main_attributes": main_attributes,
                "profile_organizations": profile_organizations,
                "species_landings": species_landings,
                "external_links": external_links,
                "profile_form": profile_form,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "main_attributes_formset": main_attributes_formset,
                "species_landings_formset": species_landings_formset,
                "profile_organization_formset": profile_organization_formset,
                "external_links_form": external_links_form,
                "editor": editor,
                "pct_colour": pct_colour,
                'who_page': who_page
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def guidelines_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of a Guidelines record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # Record instances
    guidelines_instance = SSFGuidelines.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)

    # Generate date strings
    start_year = str(guidelines_instance.start_year) if guidelines_instance.start_year else ''
    start_month = '/' + str(guidelines_instance.start_month) if guidelines_instance.start_month else ''
    start_day = '/' + str(guidelines_instance.start_day) if guidelines_instance.start_day else ''
    end_year = str(guidelines_instance.end_year) if guidelines_instance.end_year else ''
    end_month = '/' + str(guidelines_instance.end_month) if guidelines_instance.end_month else ''
    end_day = '/' + str(guidelines_instance.end_day) if guidelines_instance.end_day else ''

    begin_date = start_year + start_month + start_day
    end_date = end_year + end_month + end_day

    # forms
    guidelines_form = SSFGuidelinesForm(instance=guidelines_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type guidelines
    if "SSF Guidelines" in guidelines_instance.core_record_type:
        return render(
            request,
            "details/ssfguidelines_details.html",
            {
                "guidelines_instance": guidelines_instance,
                "core_instance": core_instance,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "begin_date": begin_date,
                "end_date": end_date,
                "external_links": external_links,
                "guidelines_form": guidelines_form,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "editor": editor,
                'who_page': who_page
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def experiences_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of an Experiences record.
    
    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # Record instances
    experiences_instance = SSFExperiences.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)

    # Get video ids
    video_id = experiences_instance.video_url.split('=')[1].split('&')[0] if experiences_instance.video_url else ''
    vimeo_video_id = experiences_instance.vimeo_video_url.split('/')[3] if experiences_instance.vimeo_video_url else ''

    # forms
    experiences_form = SSFExperiencesForm(instance=experiences_instance)
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type experiences
    if "SSF Experiences" in experiences_instance.core_record_type:
        return render(
            request,
            "details/ssfexperiences_details.html",
            {
                "experiences_instance": experiences_instance,
                "core_instance": core_instance,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "external_links": external_links,
                "experiences_form": experiences_form,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "editor": editor,
                'who_page': who_page,
                "video_id": video_id,
                "vimeo_video_id": vimeo_video_id
            }
        )
    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


def case_study_details(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for displaying the details of a Case Study record.
    
    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display.
    :return: The HTTP response to return to the user.
    """
    # Record instances
    case_studies_instance = SSFCaseStudies.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)
    external_links = ExternalLink.objects.filter(issf_core=issf_core_id)

    # forms
    case_study_form = SSFCaseStudiesForm(instance=case_studies_instance)
    del case_study_form.fields['tweet']
    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)
    external_links_form = ExternalLinksInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = request.user.is_staff or request.user.id == core_instance.contributor_id

    # check if the contributor has a Who's Who record
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    # ensure record is of type capacity
    if "Case Study" in case_studies_instance.core_record_type:
        return render(
            request,
            "details/ssf_case_study_details.html",
            {
                "case_studies_instance": case_studies_instance,
                "core_instance": core_instance,
                "geographic_scope_region": geographic_scope_region,
                "geographic_scope_subnation": geographic_scope_subnation,
                "geographic_scope_local_area": geographic_scope_local_area,
                "external_links": external_links,
                "case_study_form": case_study_form,
                "geographic_scope_form": geographic_scope_form,
                "local_area_form": local_area_form,
                "subnation_form": subnation_form,
                "nation_form": nation_form,
                "region_form": region_form,
                "external_links_form": external_links_form,
                "editor": editor,
                'who_page': who_page
            }
        )

    else:
        return HttpResponseNotFound('<h1>Page not found</h1>')


# END DETAILS VIEWS


def get_other_theme_issue(themes_issues_form, field: str, issf_core_id: int, theme_issue_value_id: int) -> None:
    """
    Unused function to set values in a given themes and issues form based on data already stored in the database.

    :param theme_issues_form: The form to set values on.
    :param field: The field to set.
    :param issf_core_id: The ID of the record to use to set values.
    :param theme_value_id: The ID of the SelectedThemeIssue record to use.
    """
    if SelectedThemeIssue.objects.filter(issf_core=issf_core_id, theme_issue_value=theme_issue_value_id).exists():
        selected_theme_issue = SelectedThemeIssue.objects.get(issf_core=issf_core_id, theme_issue_value=theme_issue_value_id)
        if len(selected_theme_issue.other_theme_issue) > 0:
            themes_issues_form.initial[field] = selected_theme_issue.other_theme_issue


"""Most record types have a view associated with them called *_basic which just calls this method. It gets the
associated database object and form, then validates and saves them. It also updates the full-text search summary in the
database.
"""


def save_basic(request: HttpRequest, model_class: Model, form_class: ModelForm) -> HttpResponse:
    """
    View which handles the saving of most types of records.
    
    :param request: The incoming HTTP request.
    :param model_class: The class of the record we want to save.
    :param form_class: The class of the form we will be retrieving data from.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            instance = None
            existing = False
            if 'issf_core_id' in request.POST and request.POST['issf_core_id'] != 'None':
                # editing an existing record
                issf_core_id = request.POST['issf_core_id']
                instance = get_object_or_404(model_class, issf_core_id=issf_core_id)
                existing = True

            form = form_class(request.POST, instance=instance)
            if form.is_valid():
                instance = form.save()

                # clear cache to update front page data
                cache.delete('cached_map_data')
                cache.delete('cached_table_data')

                instance.editor_id = request.user.id
                instance.save()

                # Check if the user selected not to tweet this record
                if 'tweet' in form.cleaned_data:
                    tweet_disabled = form.cleaned_data['tweet']
                else:
                    tweet_disabled = False

                # Tweet the record if this is a new record that isn't a who's who, twitter is authenticated, and the editor didn't select to not tweet.
                if not existing and not instance.core_record_type == 'Who\'s Who in SSF' and not tweet_disabled and TWITTER_AUTHENTICATED:
                    # Get the record name to be used for the tweet and truncate it to 20 characters
                    name = ''
                    if instance.core_record_type == 'Capacity Development':
                        name = instance.capacity_need_title
                    elif instance.core_record_type == 'SSF Profile':
                        name = instance.ssf_name
                    elif instance.core_record_type == 'SSF Guidelines':
                        name = instance.title
                    elif instance.core_record_type == 'SSF Experiences':
                        name = instance.name
                    elif instance.core_record_type == 'Case Study':
                        name = instance.name
                    name = str(name)[:20]

                    # Get the id and url corresponding to this record
                    issf_id = str(instance.issf_core_id)
                    url = 'https://issfcloud.toobigtoignore.net' + reverse(get_redirectname(instance.core_record_type), kwargs={'issf_core_id': issf_id})

                    # Tweet out the record
                    api.PostUpdate('Check out the new #tbtiissf ' + instance.core_record_type + ' record for ' + name + '. ' + url)

                # Update the record's tsvector (now unused) and summary
                update_tsvector_summary(instance.core_record_type, str(instance.pk))

                # contributing new record, user must fill out Geographic Scope
                if not existing:
                    redirectname = 'geographic-scope-save'
                else:
                    redirectname = get_redirectname(instance.core_record_type)

                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': instance.pk
                })
                return HttpResponse(response)
            else:
                errors = form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


def update_tsvector_summary(core_record_type: str, issf_core_id: str) -> None:
    """
    Updates the tsrecord (now unused) and summary for a given record.

    :param core_record_type: The type of record to update the tsrecord and summary for.
    :param issf_core_id: The ID of the record we want to update.
    """
    # update summary and full-text search vector using direct db call
    cursor = connection.cursor()

    # issf_core_id is the instance pk converted to a string. pk is a value that is auto-generated by django
    # Therefore this should be safe from SQL injection

    # Check the record type and call the corresponding functions on the database

    if core_record_type == "State-of-the-Art in SSF Research":
        cursor.execute('SELECT * FROM knowledge_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM knowledge_summary_update(' + issf_core_id + ')')
    elif core_record_type == "Who's Who in SSF":
        cursor.execute('SELECT * FROM person_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM person_summary_update(' + issf_core_id + ')')
    elif core_record_type == "SSF Organization":
        cursor.execute('SELECT * FROM organization_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM organization_summary_update(' + issf_core_id + ')')
    elif core_record_type == "Capacity Development":
        cursor.execute('SELECT * FROM capacity_need_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM capacity_need_summary_update(' + issf_core_id + ')')
    elif core_record_type == "SSF Profile":
        cursor.execute('SELECT * FROM profile_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM profile_summary_update(' + issf_core_id + ')')
    elif core_record_type == "SSF Guidelines":
        cursor.execute('SELECT * FROM guidelines_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM guidelines_summary_update(' + issf_core_id + ')')
    elif core_record_type == "SSF Experiences":
        cursor.execute('SELECT * FROM experiences_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM experiences_summary_update(' + issf_core_id + ')')
    elif core_record_type == "Case Study":
        cursor.execute('SELECT * FROM casestudies_tsvector_update(' + issf_core_id + ')')
        cursor.execute('SELECT * FROM casestudies_summary_update(' + issf_core_id + ')')


def is_int(s: Any) -> bool:
    """
    Checks whether a provided value can be casted to an integer.
    Unused.

    :param s: The value to check.
    :return: Whether or not the value can be cast to int.
    """
    try:
        int(s)
        return True
    except ValueError:
        return False


@login_required
def sota_basic(request: HttpRequest) -> HttpResponse:
    """
    View for saving a SOTA record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    # does not use save_basic because the submit includes two django forms
    if request.method == 'POST':
        if request.is_ajax():
            knowledge_instance = None
            existing = False

            if 'issf_core_id' in request.POST:
                # editing an existing record
                knowledge_instance = get_object_or_404(SSFKnowledge, issf_core_id=request.POST['issf_core_id'])
                existing = True

            knowledge_form = SSFKnowledgeForm(request.POST, instance=knowledge_instance)
            knowledge_authors_form = AuthorsInlineFormSet(request.POST, instance=knowledge_instance)
            author_count = -1
            if knowledge_authors_form.is_valid():
                # ensure at least one author
                author_count = 0
                for frm in knowledge_authors_form.cleaned_data:
                    if 'knowledge_core' in frm:
                        author_count = author_count + 1
                author_count = author_count - len(knowledge_authors_form.deleted_forms)
            # If all forms are valid and there is at least one author, save the record
            if knowledge_form.is_valid() and knowledge_authors_form.is_valid() and author_count > 0:
                knowledge_instance = knowledge_form.save()

                # clear cache to update front page data
                cache.delete('cached_map_data')
                cache.delete('cached_table_data')

                if not existing:
                    # knowledge_instance.contributor_id = request.user.id
                    # reload and revalidate authors because it needs to be
                    # tied to
                    # knowledge_instance
                    knowledge_authors_form = AuthorsInlineFormSet(request.POST, instance=knowledge_instance)
                    knowledge_authors_form.is_valid()

                # Save the forms and instances
                knowledge_authors_form.save()
                knowledge_instance.editor_id = request.user.id
                knowledge_instance.save()

                # Check to see if the user set the flag to not tweet
                if 'tweet' in knowledge_form.cleaned_data:
                    tweet_disabled = knowledge_form.cleaned_data['tweet']
                else:
                    tweet_disabled = False

                # Tweet out the record if it is new, twitter is authenticated, and the user didn't specify to not tweet this record
                if not existing and TWITTER_AUTHENTICATED and not tweet_disabled:
                    name = str(knowledge_instance.level1_title)[:20]
                    issf_id = str(knowledge_instance.issf_core_id)
                    api.PostUpdate('Check out the new #tbtiissf SOTA record for ' + name + '. ' + 'https://issfcloud.toobigtoignore.net/details/sota/' + issf_id)

                # Update tsvector and summary
                update_tsvector_summary(knowledge_instance.core_record_type, str(knowledge_instance.pk))
                # contributing new record, user must fill out Geographic Scope
                if not existing:
                    redirectname = 'geographic-scope-save'
                else:
                    redirectname = get_redirectname(knowledge_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': knowledge_instance.pk
                })
                return HttpResponse(response)
            else:
                # Return errors from all forms
                if author_count == 0:
                    if '__ALL__' not in knowledge_form._errors:
                        knowledge_form._errors['__ALL__'] = []
                    knowledge_form._errors['__ALL__'].append('Please specify at least one author')
                if len(knowledge_form.errors) > 0:
                    errors = knowledge_form.errors
                else:
                    errors = knowledge_authors_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required
def who_basic(request: HttpRequest) -> HttpResponse:
    """
    View that saves a Who's Who record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    # Attempt to save the profile before saving the record.
    # If saving the profile fails, return a different response and don't save the record.
    saved, response = save_profile(request)
    if saved:
        return save_basic(request, SSFPerson, SSFPersonForm)
    else:
        return HttpResponse(response)


@login_required
def organization_basic(request: HttpRequest) -> HttpResponse:
    """
    View for saving an organization record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    # cannot use save_basic because of prefix
    # return save_basic(request, SSFOrganization, SSFOrganizationForm)
    if request.method == 'POST':
        if request.is_ajax():
            instance = None
            existing = False
            if 'issf_core_id' in request.POST and request.POST['issf_core_id'] != 'None':
                # editing an existing record
                issf_core_id = request.POST['issf_core_id']
                instance = get_object_or_404(SSFOrganization, issf_core_id=issf_core_id)
                existing = True
            form = SSFOrganizationForm(request.POST, instance=instance, prefix="org")
            if form.is_valid():
                instance = form.save()

                # clear cache to update front page data
                cache.delete('cached_map_data')
                cache.delete('cached_table_data')

                instance.editor_id = request.user.id
                instance.save()

            if not existing:

                # Check to see if the flag to not tweet has been set
                if 'tweet' in form.cleaned_data:
                    tweet_disabled = form.cleaned_data['tweet']
                else:
                    tweet_disabled = False

                # Tweet if twitter is authenticated and the flag to disable tweeting was not set
                if TWITTER_AUTHENTICATED and not tweet_disabled:
                    name = str(instance.organization_name)[:20]

                    issf_id = str(instance.issf_core_id)

                    api.PostUpdate('Check out the new #tbtiissf SSF Organization record for ' + name + '. ' + 'https://issfcloud.toobigtoignore.net/details/organization/' + issf_id)

                # Update tsvector and summary
                update_tsvector_summary(instance.core_record_type, str(instance.pk))
                # contributing new record, user must fill out Geographic Scope
                if not existing:
                    redirectname = 'geographic-scope-save'
                else:
                    redirectname = get_redirectname(instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': instance.pk
                })
                return HttpResponse(response)
            else:
                errors = form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


def urlEncodeNonAscii(b: str) -> str:
    """
    Encodes non-ascii characters in urls so that they can be used.

    :param b: The string to encode.
    :return: The encoded string.
    """
    return re.sub('[\x80-\xFF]', lambda c: '%%%02x' % ord(c.group(0)), b)


def iriToUri(iri: str) -> str:
    """
    Converts an iri to a uri.

    :param iri: The iri to convert.
    :return: The converted uri.
    """
    parts = urlparse.urlparse(iri)
    return urlparse.urlunparse(part.encode('idna') if parti == 1 else urlEncodeNonAscii(part.encode('utf-8')) for parti, part in enumerate(parts))


@login_required
def geocode_address(request: HttpRequest) -> HttpResponse:
    """
    View that geocodes an address using bing's service.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            at_least_one = False
            # get submitted data
            organization_form = SSFOrganizationForm(request.POST)
            geocoding_url = 'http://dev.virtualearth.net/REST/v1/Locations?'
            # ensure we have at least one of the address fields, and add all components to url
            if len(organization_form.data['country']) > 0:
                if at_least_one:
                    geocoding_url = geocoding_url + '&'
                iso2 = get_object_or_404(Country, country_id=organization_form.data['country']).iso2
                geocoding_url = geocoding_url + 'countryRegion=' + iso2
                at_least_one = True
            if len(organization_form.data['postal_code']) > 0:
                if at_least_one:
                    geocoding_url = geocoding_url + '&'
                geocoding_url = geocoding_url + 'postalCode=' + organization_form.data['postal_code']
                at_least_one = True
            if len(organization_form.data['prov_state']) > 0:
                if at_least_one:
                    geocoding_url = geocoding_url + '&'
                geocoding_url = geocoding_url + 'adminDistrict=' + organization_form.data['prov_state']
                at_least_one = True
            if len(organization_form.data['city_town']) > 0:
                if at_least_one:
                    geocoding_url = geocoding_url + '&'
                geocoding_url = geocoding_url + 'locality=' + organization_form.data['city_town']
                at_least_one = True
            if len(organization_form.data['address1']) > 0 or len(organization_form.data['address2']) > 0:
                if at_least_one:
                    geocoding_url = geocoding_url + '&'
                geocoding_url = geocoding_url + 'addressLine=' + organization_form.data['address1'] + ', ' + organization_form.data['address2']
                at_least_one = True
                # geocode address using Bing
            if at_least_one:
                # Encode url, send request to bing, and parse response to send back to user
                geocoding_url = geocoding_url + '&maxResults=1&key=Al1mXkJObbAqh8s8TkCwTnIYZOemobAiJZSVaPklNXPS_ErYDtPButHlPDJrznFf'
                geocoding_dict = ast.literal_eval(request(iriToUri(geocoding_url)).read())
                if geocoding_dict['statusDescription'] == 'OK':
                    if geocoding_dict['resourceSets'][0]['estimatedTotal'] > 0:

                        # This needs a more serious look in another refactor.
                        return HttpResponse(str(
                            geocoding_dict['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][1]) + ',' + str(
                            geocoding_dict['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][0])
                        )

            return HttpResponse('')


@login_required
def capacity_basic(request: HttpRequest) -> HttpResponse:
    """
    View to save a Capacity Development record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFCapacityNeed, SSFCapacityNeedForm)


@login_required
def capacity_need_rating(request: HttpRequest, prev_capacity_need_id: int) -> HttpResponse:
    """
    View to rate a capacity need.
    No longer used.

    :param request: The incoming HTTP request.
    :param prev_capacity_need_id: The ID of the previous capacity need.
    :return: The HTTP response to return to the user.
    """
    if request.method != 'POST':
        # Display
        # Randomly choose any need but the previous one
        capacity_need_instance = SSFCapacityNeed.objects.all().exclude(
            issf_core_id__exact=prev_capacity_need_id).exclude(
            capacity_need_type__exact='Existing').order_by('?')[0]
        capacity_need_rating_id = '0'

        # Determine is user has already rated this one
        capacity_need_rating_instance = CapacityNeedRating.objects.filter(
            capacity_need_id__exact=capacity_need_instance.issf_core_id,
            rater__exact=request.user.id
        )

        if len(capacity_need_rating_instance) > 0:
            # Existing
            capacity_need_rating_id = capacity_need_rating_instance[0].capacity_need_rating_id
            capacity_need_rating_form = CapacityNeedRatingForm(instance=capacity_need_rating_instance[0])
        else:
            # new
            rater_instance = get_object_or_404(UserProfile, id=request.user.id)
            capacity_need_rating_form = CapacityNeedRatingForm(
                initial={
                    'capacity_need': capacity_need_instance,
                    'rater': rater_instance
                }
            )

        return render(
            request,
            "details/capacityneedrating.html",
            {
                'capacity_need_rating_form': capacity_need_rating_form,
                'capacity_need_rating_id': capacity_need_rating_id,
                'capacity_need_instance': capacity_need_instance
            }
        )

    else:
        # save
        capacity_need_rating_instance = None
        capacity_need_rating_id = request.POST['capacity_need_rating_id']
        capacity_need_rating_form = CapacityNeedRatingForm(request.POST, instance=capacity_need_rating_instance)

        if capacity_need_rating_id != '0':
            # editing an existing rating
            capacity_need_rating_instance = get_object_or_404(CapacityNeedRating, capacity_need_rating_id=capacity_need_rating_id)
        if capacity_need_rating_form.data['rating'] != '0' and capacity_need_rating_form.data['rating'] != 0:
            if capacity_need_rating_id == '0':
                # new record
                capacity_need_instance = get_object_or_404(SSFCapacityNeed, issf_core_id=capacity_need_rating_form.data['capacity_need'])
                rater_instance = get_object_or_404(UserProfile, id=capacity_need_rating_form.data['rater'])
                capacity_need_rating_instance = CapacityNeedRating(capacity_need=capacity_need_instance, rater=rater_instance)

            capacity_need_rating_instance.rating = capacity_need_rating_form.data['rating']
            capacity_need_rating_instance.save()
            response = json.dumps({'success': 'true'})
            return HttpResponse(response)

        else:
            errors = capacity_need_rating_form.errors
            response = json.dumps({'success': 'false', 'errors': errors})
            return HttpResponse(response)


@login_required
def sota_other(request: HttpRequest) -> HttpResponse:
    """
    View for saving other details for a SOTA record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            # Get SOTA instance and create form instance
            issf_core_id = request.POST['issf_core_id']
            knowledge_instance = get_object_or_404(SSFKnowledge, issf_core_id=issf_core_id)
            knowledge_other_details_form = KnowledgeOtherDetailsForm(request.POST, instance=knowledge_instance)

            if knowledge_other_details_form.is_valid():
                # Save form and instance
                knowledge_other_details_form.save()
                knowledge_instance.editor_id = request.user.id
                knowledge_instance.save()
                # Update tsvector and summary
                update_tsvector_summary(knowledge_instance.core_record_type, issf_core_id)
                redirectname = get_redirectname(knowledge_instance.core_record_type)

                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': knowledge_instance.pk
                })

                return HttpResponse(response)

            else:
                errors = knowledge_other_details_form.errors
                response = json.dumps({
                    'success': 'false',
                    'errors': errors
                })

                return HttpResponse(response)


@login_required
def who_researcher(request: HttpRequest) -> HttpResponse:
    """
    View for saving the record for a researcher who's who.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFPerson, PersonResearcherForm)


def is_filled(field: Dict[str, Any]) -> bool:
    """
    Ensures that at least one item in the field is filled.

    :param field: The field to check.
    :return bool: Whether or not at least one item in the field is filled.
    """
    for (key, value) in field.items():
        if value and not (key in ['attribute', 'issf_core', 'label_order', 'row_number', 'value_order', 'selected_attribute_id', 'DELETE']):
            return True

    return False


@login_required
def profile_main_attributes(request: HttpRequest) -> HttpResponse:
    """
    View to save the characteristics form for an SSF Profile.
    Described as a 'house of cards' by the last person to document it.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            # Get record and form instances
            issf_core_id = request.POST['issf_core_id']
            profile_instance = get_object_or_404(SSFProfile, issf_core_id=issf_core_id)
            data_end_year = profile_instance.data_end_year
            core_instance = get_object_or_404(ISSF_Core, issf_core_id=issf_core_id)
            main_attributes_formset = MainAttributesViewInlineFormSet(request.POST, instance=core_instance)
            profile_form = SSFProfileForm(request.POST, instance=profile_instance)

            # for some reason data_end_year gets set to None when
            # contributing a Profile so it gets manually set again here.
            # This is a bandaid fix.
            profile_instance.data_end_year = data_end_year
            if main_attributes_formset.is_valid():
                # BEGIN PERCENTAGE CALCULATION
                percent = 0
                i = 0
                index = 0
                # This flag gets set to True if any of the percentages have
                # a non-null value so
                # that percent variable only gets checked if at least one of
                #  the percentages
                # have a value in them
                flag = False
                for form in main_attributes_formset.forms:
                    if form.cleaned_data and form.cleaned_data['attribute'].attribute_id == 38:
                        if form.cleaned_data['DELETE'] is False:
                            if form.cleaned_data['additional']:
                                percent += int(form.cleaned_data['additional'])
                            flag = True
                            index = i
                    i += 1

                if flag and percent is not 100:
                    errors = main_attributes_formset._errors
                    errors[index]['__all__'] = ErrorList([u'Percents must add to 100%'])

                    response = json.dumps({
                        'success': 'false',
                        'errors': errors
                    })

                    return HttpResponse(response)

                fields_filled = 0.0  # have to make floating point because
                # int division with result < 1 returns 0
                total_fields = 32

                # make sure same attributes with different values aren't counted more than once
                seen_fields = set()
                for field in main_attributes_formset.cleaned_data:
                    if (field['attribute'] not in seen_fields) and is_filled(field):
                        fields_filled += 1
                        seen_fields.add(field['attribute'])

                percentage = (fields_filled / total_fields) * 100
                profile_instance.percent = percentage
                profile_instance.save()
                main_attributes_formset.save()

                # END PERCENTAGE CALCULATION

                if profile_form.is_valid():
                    profile_form.save()

                update_tsvector_summary(profile_instance.core_record_type, str(profile_instance.pk))

                redirectname = get_redirectname(profile_instance.core_record_type)

                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': profile_instance.pk
                })

                return HttpResponse(response)
            else:
                errors = main_attributes_formset.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


def main_attributes_save(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View for saving the main attributes form for an ssf profile.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to save the main attributes for.
    :return: The HTTP response to return to the user.
    """
    # Get record and form instances
    profile_instance = SSFProfile.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)

    profile_form = SSFProfileForm(instance=profile_instance)
    main_attributes_formset = MainAttributesViewInlineFormSet(
        instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = False
    if request.user.is_staff or request.user.id == core_instance.contributor_id:
        editor = True

    return render(
        request,
        "details/main_attributes_save.html",
        {
            "profile_instance": profile_instance,
            "core_instance": core_instance,
            "profile_form": profile_form,
            "main_attributes_formset": main_attributes_formset,
            "editor": editor
        }
    )


@login_required
def profile_basic(request: HttpRequest) -> HttpResponse:
    """
    View to save an SSF profile.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFProfile, SSFProfileForm)


@login_required
def guidelines_basic(request: HttpRequest) -> HttpResponse:
    """
    View to save a Guidelines record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFGuidelines, SSFGuidelinesForm)


@login_required
def experiences_basic(request: HttpRequest) -> HttpResponse:
    """
    View to save an Experiences record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFExperiences, SSFExperiencesForm)


@login_required
def case_study_basic(request: HttpRequest) -> HttpResponse:
    """
    View to save a Case Study record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    return save_basic(request, SSFCaseStudies, SSFCaseStudiesForm)


# reusable saves attached to issf_core
@login_required
def themes_issues(request: HttpRequest) -> HttpResponse:
    """
    View for saving themes/issues for a record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            # Get form and record instances
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(ISSF_Core,
                                              issf_core_id=issf_core_id)
            themes_issues_form = ThemesIssuesForm(request.POST,
                                                  instance=core_instance)
            if themes_issues_form.is_valid():
                # Save form
                themes_issues_form.save()
                core_instance.editor_id = request.user.id
                core_instance.save()
                # also save Other text
                save_other_theme_issue(themes_issues_form,
                                       'other_economic_theme_issue',
                                       issf_core_id, 145)
                save_other_theme_issue(themes_issues_form,
                                       'other_ecological_theme_issue',
                                       issf_core_id, 146)
                save_other_theme_issue(themes_issues_form,
                                       'other_social_cultural_theme_issue',
                                       issf_core_id, 147)
                save_other_theme_issue(themes_issues_form,
                                       'other_governance_theme_issue',
                                       issf_core_id, 148)
                update_tsvector_summary(core_instance.core_record_type,
                                        issf_core_id)
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = themes_issues_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


def save_other_theme_issue(themes_issues_form, field: str, issf_core_id: int, theme_issue_value_id: int) -> None:
    """
    Saves 'other' values for theme/issue forms.

    :param themes_issues_form: The form to save other values from.
    :param field: The name of the other field.
    :param issf_core_id: The ID of the record to save to.
    :param theme_issue_value_id: The ID of the SelectedThemeIssue record to save to.
    """
    if len(themes_issues_form.cleaned_data[field]) > 0:
        # other text can only be saved if other was checked; otherwise the
        # record does not exist
        # to store the other text in
        selected_themes_issues = SelectedThemeIssue.objects.filter(
            issf_core__exact=issf_core_id,
            theme_issue_value__exact=theme_issue_value_id
        )
        if len(selected_themes_issues) > 0:
            selected_theme_issue = selected_themes_issues[0]
            selected_theme_issue = SelectedThemeIssue.objects.get(
                issf_core=issf_core_id, theme_issue_value=theme_issue_value_id)
            selected_theme_issue.other_theme_issue = themes_issues_form.cleaned_data[field]
            selected_theme_issue.save()
    return


@login_required
def common_themes_issues(request: HttpRequest) -> HttpResponse:
    """
    View to save common themes/issues.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(ISSF_Core,
                                              issf_core_id=issf_core_id)
            common_themes_issues_formset = CommonThemesIssuesViewInlineFormSet(
                request.POST, instance=core_instance)
            if common_themes_issues_formset.is_valid():
                common_themes_issues_formset.save()
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = common_themes_issues_formset.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required
def common_attributes(request: HttpRequest) -> HttpResponse:
    """
    View to save common attributes.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(ISSF_Core,
                                              issf_core_id=issf_core_id)
            common_attributes_formset = CommonAttributesViewInlineFormSet(
                request.POST, instance=core_instance)
            if common_attributes_formset.is_valid():
                common_attributes_formset.save()
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = common_attributes_formset.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required
def geographic_scope(request: HttpRequest) -> HttpResponse:
    """
    View to save geographic scope form.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(ISSF_Core,
                                              issf_core_id=issf_core_id)
            geographic_scope_form = GeographicScopeForm(request.POST,
                                                        instance=core_instance)
            if geographic_scope_form.is_valid():
                # should always be valid, because just radio button
                geographic_scope_form.save()
                core_instance.editor_id = request.user.id
                core_instance.save()

            """ Validate each geog. scope form type."""
            valid_subform = True
            if core_instance.geographic_scope_type == 'Local':
                local_area_form = GeographicScopeLocalAreaInlineFormSet(
                    request.POST,
                    instance=core_instance
                )
                if local_area_form.is_valid():
                    # the formset is valid with no subforms filled in,
                    # so ensure at least one
                    # subform
                    subform_count = 0
                    for frm in local_area_form.cleaned_data:
                        if 'issf_core' in frm:
                            subform_count = subform_count + 1
                    subform_count = subform_count - len(local_area_form.deleted_forms)
                    if subform_count < 1:
                        valid_subform = False
                        if '__ALL__' not in geographic_scope_form._errors:
                            geographic_scope_form._errors['__ALL__'] = []
                        geographic_scope_form._errors['__ALL__'].append('Please specify the details for at least one local area')
                    else:
                        local_area_form.save()
                else:
                    valid_subform = False
            elif core_instance.geographic_scope_type == 'Sub-national':
                subnation_form = GeographicScopeSubnationInlineFormSet(
                    request.POST, instance=core_instance)
                if subnation_form.is_valid():
                    # the formset is valid with no subforms filled in,
                    # so ensure at least one
                    # subform
                    subform_count = 0
                    for frm in subnation_form.cleaned_data:
                        if 'issf_core' in frm:
                            subform_count = subform_count + 1
                    subform_count = subform_count - len(subnation_form.deleted_forms)
                    if subform_count < 1:
                        valid_subform = False
                        if '__ALL__' not in geographic_scope_form._errors:
                            geographic_scope_form._errors['__ALL__'] = []
                        geographic_scope_form._errors['__ALL__'].append('Please specify the details for at least one sub-national area')
                    else:
                        subnation_form.save()
                else:
                    valid_subform = False
            elif core_instance.geographic_scope_type == 'National':
                # https://stackoverflow.com/a/18287039
                nation_form = GeographicScopeNationForm(
                    request.POST
                )
                if nation_form.is_valid():
                    scope = nation_form.save(commit=False)
                    scope.issf_core = core_instance
                    scope.save()
                else:
                    valid_subform = False
            elif core_instance.geographic_scope_type == 'Regional':
                region_form = GeographicScopeRegionInlineFormSet(
                    request.POST,
                    instance=core_instance
                )
                if region_form.is_valid():
                    # the formset is valid with no subforms filled in,
                    # so ensure at least one
                    # subform
                    subform_count = 0
                    for frm in region_form.cleaned_data:
                        if 'issf_core' in frm:
                            subform_count = subform_count + 1
                    subform_count = subform_count - len(region_form.deleted_forms)
                    if subform_count < 1:
                        valid_subform = False
                        if '__ALL__' not in geographic_scope_form._errors:
                            geographic_scope_form._errors['__ALL__'] = []
                        geographic_scope_form._errors['__ALL__'].append('Please specify the details for at least one region')
                    else:
                        region_form.save()
                else:
                    valid_subform = False

            if valid_subform:
                # clear cache to update front page data
                cache.delete('cached_map_data')
                cache.delete('cached_table_data')

                update_tsvector_summary(core_instance.core_record_type,
                                        issf_core_id)

                # If this is an ssf profile that is being created for the first time, redirect to the main attributes form
                if 'geog-scope' in request.META['HTTP_REFERER'] and core_instance.core_record_type == u'SSF Profile':
                    redirectname = 'main-attributes-save'
                else:
                    redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })

                return HttpResponse(response)
            else:
                if len(geographic_scope_form.errors) > 0:
                    errors = geographic_scope_form.errors
                else:
                    if core_instance.geographic_scope_type == 'Local':
                        errors = local_area_form.errors
                    elif core_instance.geographic_scope_type == 'Sub-national':
                        errors = subnation_form.errors
                    elif core_instance.geographic_scope_type == 'National':
                        errors = nation_form.errors
                    elif core_instance.geographic_scope_type == 'Regional':
                        errors = region_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required
def geographic_scope_save(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    View that returns the geographic scope forms when creating a new record.

    :param request: The incoming HTTP request.
    :param issf_core_id: The ID of the record to display geographic scope forms for.
    :return: The HTTP response to return to the user.
    """
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)

    geographic_scope_form = GeographicScopeForm(instance=core_instance)
    local_area_form = GeographicScopeLocalAreaInlineFormSet(instance=core_instance)
    subnation_form = GeographicScopeSubnationInlineFormSet(instance=core_instance)
    nation_form = GeographicScopeNationForm(instance=core_instance)
    region_form = GeographicScopeRegionInlineFormSet(instance=core_instance)

    # check if user has rights to edit (owner or staff)
    editor = False
    if request.user.is_staff or request.user.id == core_instance.contributor_id:
        editor = True

    return render(
        request,
        "details/geographic_scope_save.html",
        {
            "core_instance": core_instance,
            "geographic_scope_form": geographic_scope_form,
            "local_area_form": local_area_form,
            "subnation_form": subnation_form,
            "nation_form": nation_form,
            "region_form": region_form,
            "editor": editor
        }
    )


@login_required()
def profile_organizations(request: HttpRequest) -> HttpResponse:
    """
    View to save organization associated with an SSF Profile.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(
                ISSF_Core,
                issf_core_id=issf_core_id
            )
            profile_instance = get_object_or_404(
                SSFProfile,
                issf_core_id=issf_core_id
            )
            profile_organization_formset = ProfileOrganizationInlineFormset(
                request.POST,
                instance=profile_instance
            )
            if profile_organization_formset.is_valid():
                core_instance.editor_id = request.user.id
                core_instance.save()
                profile_organization_formset.save()
                update_tsvector_summary(
                    core_instance.core_record_type,
                    issf_core_id
                )
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = profile_organization_formset.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required()
def species(request: HttpRequest) -> HttpResponse:
    """
    View to save species associated with a record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(
                ISSF_Core,
                issf_core_id=issf_core_id
            )
            species_form = SpeciesInlineFormSet(
                request.POST,
                instance=core_instance
            )
            if species_form.is_valid():
                core_instance.editor_id = request.user.id
                core_instance.save()
                species_form.save()
                update_tsvector_summary(
                    core_instance.core_record_type,
                    issf_core_id
                )
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = species_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required()
def species_landings(request: HttpRequest) -> HttpResponse:
    """
    View to save species form with landings.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(
                ISSF_Core,
                issf_core_id=issf_core_id
            )
            species_landings_form = SpeciesLandingsInlineFormSet(
                request.POST,
                instance=core_instance
            )
            if species_landings_form.is_valid():
                core_instance.editor_id = request.user.id
                core_instance.save()
                species_landings_form.save()
                update_tsvector_summary(
                    core_instance.core_record_type,
                    issf_core_id
                )
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = species_landings_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


@login_required()
def external_links(request: HttpRequest) -> HttpResponse:
    """
    View to save external links associated with a record.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    if request.method == 'POST':
        if request.is_ajax():
            issf_core_id = request.POST['issf_core_id']
            core_instance = get_object_or_404(
                ISSF_Core,
                issf_core_id=issf_core_id
            )
            external_links_form = ExternalLinksInlineFormSet(
                request.POST,
                instance=core_instance
            )
            if external_links_form.is_valid():
                external_links_form.save()
                core_instance.editor_id = request.user.id
                core_instance.save()
                update_tsvector_summary(
                    core_instance.core_record_type,
                    issf_core_id
                )
                redirectname = get_redirectname(core_instance.core_record_type)
                response = json.dumps({
                    'success': 'true',
                    'redirectname': redirectname,
                    'record': core_instance.pk
                })
                return HttpResponse(response)
            else:
                errors = external_links_form.errors
                response = json.dumps({'success': 'false', 'errors': errors})
                return HttpResponse(response)


def changelog(request: HttpRequest) -> HttpResponse:
    """
    View to render changelogs for the site.

    :param request: The incoming HTTP request.
    :return: The HTTP response to return to the user.
    """
    site_versions = SiteVersion.objects.all()

    return render(
        request,
        'details/changelog.html',
        {'site_versions': site_versions}
    )


def generate_report(record_type: str, issf_core_id: int) -> Dict[str, Any]:
    """
    Handles the retrieval and generation of data to be used in reports.

    :param record_type: The type of record to generate a report for.
    :param issf_core_id: The ID of the record to generate a report for.
    :return: A dict containing parameters to be passed in when rendering the report template.
    """
    # Retrieve the instances associated with this record
    record = SSFProfile.objects.get(issf_core_id=issf_core_id)
    core_instance = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    main_attributes = MainAttributeView.objects.filter(issf_core=issf_core_id)
    species = Species.objects.filter(issf_core=issf_core_id).values("species_common", "species_scientific", "landings")[:4]

    distribution = {}
    for entry in main_attributes:
        if entry.attribute_id == 38 and entry.attribute_value is not None:
            distribution[entry.attribute_value] = (entry.additional if entry.additional else 0)

    # Retrieve geographic scope instances for this record
    geographic_scope_region = Geographic_Scope_Region.objects.filter(issf_core=issf_core_id)
    geographic_scope_nation = GeographicScopeNation.objects.filter(issf_core=issf_core_id)
    geographic_scope_subnation = GeographicScopeSubnation.objects.filter(issf_core=issf_core_id)
    geographic_scope_local_area = GeographicScopeLocalArea.objects.filter(issf_core=issf_core_id)

    # Get the location name for the geographic scope
    location = ''
    if core_instance.geographic_scope_type == 'Regional':
        for geo_record in geographic_scope_region:
            location = geo_record.region.region_name + ", "
        zoom_level = 3
    elif core_instance.geographic_scope_type == 'National':
        for geo_record in geographic_scope_nation:
            location = geo_record.country.short_name + ", "
        zoom_level = 5
    elif core_instance.geographic_scope_type == 'Sub-national':
        for geo_record in geographic_scope_subnation:
            location = geo_record.subnation_name + ", "
        zoom_level = 5
    elif core_instance.geographic_scope_type == 'Local':
        for geo_record in geographic_scope_local_area:
            location = ""
        zoom_level = 6
    else:
        zoom_level = 3

    try:
        location += str(geo_record.country.short_name)
    except UnboundLocalError:
        location = 'No location provided.'
    except AttributeError:
        if geographic_scope == geographic_scope_region:
            location = geo_record.region

    colors = ['#A6CD94', '#9FBFE5', '#95A8D8', '#F5AF92']
    colors = colors[:len(species)]

    species_colors = zip(species, colors)

    attrs = collections.defaultdict(list)
    # Get the main attributes of the record
    for attr in main_attributes:
        attr.attribute.attribute_label = attr.attribute.attribute_label.split(':')[0]

        if len(attrs) > 5 and attr.attribute.attribute_label not in attrs.keys():
            break

        if attr.attribute_value:
            attrs[attr.attribute.attribute_label].append(attr.attribute_value.value_label + (": " + attr.other_value if attr.other_value else ''))  # this right here is why I love Python <3
        elif attr.value:
            attrs[attr.attribute.attribute_label] = str(attr.value)

    # Get up to 10 issues for the record
    attrs_issues = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=10)
    issues = []
    for issue in attrs_issues:
        if len(issues) >= 10:
            break
        if issue.attribute_value:
            # Refactor
            issues.append(issue.attribute_value.value_label.split('(')[0] + (': ' + issue.other_value if issue.other_value else ''))

    # Get up to 6 key rules & regulations
    key_rules_regs = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=42)
    krr = []
    for rule_reg in key_rules_regs:
        if len(krr) >= 6:
            break
        if rule_reg.attribute_value:
            krr.append(rule_reg.attribute_value.value_label + (': ' + rule_reg.other_value if rule_reg.other_value else ''))

    # Get household income
    hh_income = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=13).values()[0]['value']

    # Get up to 4 pieces of governance info
    governance = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=39)
    gov_modes = []
    for gov in governance:
        if len(gov_modes) >= 4:
            break
        if gov.attribute_value:
            gov_modes.append(gov.attribute_value.value_label + (': ' + gov.other_value if gov.other_value else ''))

    # Get up to 6 non-fishing livelihood activities
    non_fish = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=23)
    non_fish_act = [None] * 6
    i = 0
    for act in non_fish:
        if i >= 6:
            break
        if act.attribute_value:
            non_fish_act[i] = act.attribute_value.value_label
            i += 1

    # Get the number of fishers
    num_fishers = MainAttributeView.objects.filter(issf_core_id=issf_core_id, attribute_id=7)
    if num_fishers:
        num_fishers = num_fishers[0]
    else:
        num_fishers = None

    # Get the url for the record
    record_url = reverse(get_redirectname(record.core_record_type), kwargs={'issf_core_id': record.issf_core_id})

    # Get the who's who page for the contributor, if it exists
    contrib_who = SSFPerson.objects.filter(contributor_id=core_instance.contributor_id)
    if contrib_who:
        who_page = contrib_who[0]
    else:
        who_page = None

    return {
        'id': issf_core_id,
        'record': record,
        'location': location,
        'zoom': zoom_level,
        'distribution': distribution,
        'attrs': dict(attrs),
        'species_colors': species_colors,
        'colors': colors,
        'issues': issues,
        'key_rules_regs': krr,
        'hh_income': hh_income,
        'governance': gov_modes,
        'non_fish_act': non_fish_act,
        'url': record_url,
        'who_page': who_page,
        'num_fishers': num_fishers
    }


def report(request: HttpRequest, record_type: str, issf_core_id: int) -> HttpResponse:
    """
    Renders a webpage containing a report on a given item.

    :param request: The incoming HTTP request.
    :param record_type: The type of record to generate a report for.
    :param issf_core id: The ID of the record to generate a report for.
    :return: The HTTP response to return to the user.
    """
    return render(
        request,
        'details/record_report.html',
        generate_report(record_type, issf_core_id)
    )


def render_report_pdf(request: HttpRequest, record_type: str, issf_core_id: int) -> HttpResponse:
    """
    Renders a report for a given item and returns it to the user as a PDF.

    :param request: The incoming HTTP request.
    :param record_type: The type of record to generate a report for.
    :param issf_core id: The ID of the record to generate a report for.
    :return: The HTTP response to return to the user.
    """
    # Render the template
    template = get_template("details/record_report.html")
    html = template.render(generate_report(record_type, issf_core_id))
    # Use hardcopy to print html to temporary pdf file, and return said file to the user
    with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
        hardcopy.bytestring_to_pdf(html.encode("utf8"), f)
        return HttpResponse(f.read(), content_type='application/pdf')


def get_record_type(record_type: str) -> Model:
    """
    Gets the model object for a record type.

    :param record_type: The record type to get the model object for.
    :return: The model object for the specified record type.
    """
    record_types = {
        'who': SSFPerson,
        'sota': SSFKnowledge,
        'profile': SSFProfile,
        'organization': SSFOrganization,
        'guidelines': SSFGuidelines,
        'capacity': SSFCapacityNeed,
        'experiences': SSFExperiences
    }

    return record_types[record_type]


# Delete specified record
def delete_record(request: HttpRequest, issf_core_id: int) -> HttpResponse:
    """
    Deletes a specified record.

    :param request: The incoming HTTP request.
    :param issf_core id: The ID of the record to delete.
    :return: The HTTP response to return to the user.
    """
    record = ISSF_Core.objects.get(issf_core_id=issf_core_id)
    # if record is sota then delete author record first to avoid integrity
    # errors
    if record.core_record_type == 'State-of-the-Art in SSF Research':
        KnowledgeAuthorSimple.objects.filter(knowledge_core=issf_core_id).delete()

    # if record is organization then delete profile org record first to
    # avoid integrity errors
    if record.core_record_type == 'SSF Organization':
        ProfileOrganization.objects.filter(ssforganization=issf_core_id).delete()

    # if record is person then delete org record first to
    # avoid integrity errors
    if record.core_record_type == 'Who\'s Who in SSF':
        SSFPerson.objects.filter(organizations__persons__issf_core_id=issf_core_id).delete()

    # if record is profile then delete profile org record first to
    # avoid integrity errors
    if record.core_record_type == 'SSF Profile':
        ProfileOrganization.objects.filter(ssfprofile=issf_core_id).delete()

    record.delete()

    # clear cache to update front page data
    cache.delete('cached_map_data')
    cache.delete('cached_table_data')

    return redirect('/details/delete-record/')
