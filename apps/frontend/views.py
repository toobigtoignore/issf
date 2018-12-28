import datetime
import json
import re
import os.path

from zipfile import ZipFile

import djqscsv
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.core.management import call_command
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render
from djgeojson.views import GeoJSONLayerView
from django.views.decorators.gzip import gzip_page

from issf_base.models import *
from issf_admin.views import get_redirectname
from issf_admin.models import UserProfile

import bleach

from .forms import SearchForm, TipForm, FAQForm, WhosWhoForm, GeoJSONUploadForm
from frontend.forms import SelectedAttributesFormSet, SelectedThemesIssuesFormSet, SearchForm

from django.middleware.gzip import GZipMiddleware

gzip_middleware = GZipMiddleware()


@gzip_page
def index(request):
    # get data for dashboard panels
    recent_contributions = RecentContributions.objects.all()
    for recent_contribution in recent_contributions:
        lines = recent_contribution.core_record_summary.split('\\n')
        summary = ''
        for line in lines:
            summary += line + '<br/>'
        recent_contribution.core_record_summary = summary
    contributions_by_record_type = ContributionsByRecordType.objects.all()
    # countries with more than one record
    contributions_by_country = ContributionsByCountry.objects.filter(contribution_count__gt=1)
    # countries with exactly one record
    other_countries = ContributionsByCountry.objects.filter(contribution_count__exact=1)
    contributions_by_geographic_scope = ContributionsByGeographicScope.objects.all()
    attribute_values = AttributeValue.objects.all()
    theme_issue_values = Theme_Issue_Value.objects.all()
    who_feature = WhoFeature.objects.latest('id')
    # return dashboard data and empty search forms
    return render(
        request,
        "frontend/index.html",
        {
            'contributions_by_record_type': contributions_by_record_type,
            'contributions_by_country': contributions_by_country,
            'other_countries': other_countries,
            'contributions_by_geographic_scope': contributions_by_geographic_scope,
            'recent_contributions': recent_contributions,
            'searchForm': SearchForm,
            'selected_themes_issues_formset': SelectedThemesIssuesFormSet,
            'selected_attributes_formset': SelectedAttributesFormSet,
            'attribute_values': attribute_values,
            'theme_issue_values': theme_issue_values,
            'who_feature': who_feature,
            'num_who_records': SSFPerson.objects.all().count(),
            'num_sota_records': SSFKnowledge.objects.all().count(),
            'num_profile_records': SSFProfile.objects.all().count(),
            'num_org_records': SSFOrganization.objects.all().count(),
            'num_cap_records': SSFCapacityNeed.objects.all().count(),
            'num_guide_records': SSFGuidelines.objects.all().count(),
            'num_case_records': SSFCaseStudies.objects.all().count(),
            'num_expe_records': SSFExperiences.objects.all().count(),
        }
    )


def get_map_points(issf_core_ids):
    """
    Returns map points for all given IDs, if they exist.
    :param issf_core_ids: An iterator containing core ids.
    """
    points = []
    for core_id in issf_core_ids:
        points += list(ISSFCoreMapPointUnique.objects.filter(issf_core_id__exact=core_id))
    return points


@gzip_page
def frontend_data(request):

    search_terms = []

    if request.method == 'GET':
        cached_map_data = cache.get('cached_map_data')
        if cached_map_data:
            map_queryset = cached_map_data
        else:
            map_queryset = ISSFCoreMapPointUnique.objects.all()
            cache.set('cached_map_data', map_queryset, 86400)
    else:
        form = SearchForm(request.POST)
        themes_form = SelectedThemesIssuesFormSet(request.POST)
        attributes_form = SelectedAttributesFormSet(request.POST)
        map_queryset = []
        if form.is_valid():
            keywords = form.cleaned_data['keywords']
            fulltext_keywords = form.cleaned_data['fulltext_keywords']
            contributor = form.cleaned_data['contributor']
            countries = form.cleaned_data['countries']
            contribution_begin_date = form.cleaned_data['contribution_begin_date']
            contribution_end_date = form.cleaned_data['contribution_end_date']
        else:
            keywords = None
            fulltext_keywords = None
            contributor = None
            countries = None
            contribution_begin_date = None
            contribution_end_date = None

        themes = []
        if themes_form.is_valid():
            for subform in themes_form.forms:
                try:
                    themes.append(subform.cleaned_data['theme_issue_value'])
                except KeyError:
                    # Occurs when form doesn't have a theme_issue_value value, meaning it isn't valid
                    pass

        attributes = []
        if attributes_form.is_valid():
            for subform in attributes_form:
                try:
                    attributes.append({
                        'attribute': subform.cleaned_data['attribute'],
                        'attribute_value': subform.cleaned_data['attribute_value']
                    })
                except KeyError:
                    # Occurs when form doesn't have an attribute set, meaning it actually isn't valid
                    pass

        models = [
            SSFPerson,
            SSFKnowledge,
            SSFProfile,
            SSFOrganization,
            SSFCapacityNeed,
            SSFGuidelines,
            SSFCaseStudies,
            SSFExperiences
        ]

        if keywords:
            if keywords == "":
                cached_map_data = cache.get('cached_map_data')
                if cached_map_data:
                    map_queryset = cached_map_data
                else:
                    map_queryset = ISSFCoreMapPointUnique.objects.all()
                    cache.set('cached_map_data', map_queryset, 86400)
                map_queryset = list(map_queryset)
            else:
                search_terms.append('Title: {}'.format(str(bleach.clean(keywords))))
                for model in models:
                    # Every object has different variables for "title"
                    if model == SSFPerson:
                        # SSFPerson has no name or title, so we retrieve all matching users from the map points and remove them from the users
                        results = list(model.objects.all())
                        filtered_ids = [i.issf_core_id for i in ISSFCoreMapPointUnique.objects.filter(core_record_summary__icontains=keywords)]
                        for result in results[:]:
                            if result.issf_core_id not in filtered_ids:
                                results.remove(result)
                    elif model == SSFKnowledge:
                        results = model.objects.filter(level1_title__icontains=keywords)
                    elif model == SSFProfile:
                        results = model.objects.filter(ssf_name__icontains=keywords)
                    elif model == SSFOrganization:
                        results = model.objects.filter(organization_name__icontains=keywords)
                    elif model == SSFCapacityNeed:
                        results = model.objects.filter(capacity_need_title__icontains=keywords)
                    elif model == SSFCaseStudies:
                        results = model.objects.filter(name__icontains=keywords)
                    else:
                        results = model.objects.filter(title__icontains=keywords)
                    ids = [result.issf_core_id for result in results]
                    map_queryset += get_map_points(ids)
        else:
            map_queryset = list(ISSFCoreMapPointUnique.objects.all())

        if fulltext_keywords:
            if fulltext_keywords != '':
                search_terms.append('Full text: {}'.format(fulltext_keywords))
                fulltext_matches = set(i.issf_core_id for i in ISSFCoreMapPointUnique.objects.filter(core_record_summary__icontains=fulltext_keywords))
                for item in map_queryset[:]:
                    if item.issf_core_id not in fulltext_matches:
                        map_queryset.remove(item)

        if contributor:
            contributor = int(contributor)
            contributor_instance = tuple(UserProfile.objects.filter(id__exact=contributor))[0]
            contributor_name = contributor_instance.username
            # If the user has defined a name, choose all components of the name that aren't none and add them to the username
            if any([contributor_instance.first_name, contributor_instance.initials, contributor_instance.last_name]):
                components = (i for i in [contributor_instance.first_name, contributor_instance.initials, contributor_instance.last_name] if i != None)
                contributor_name += ' ({})'.format(' '.join(components))
            search_terms.append('Contributor: {}'.format(contributor_name))
            for item in map_queryset[:]:
                if item.contributor_id != contributor:
                    map_queryset.remove(item)

        if countries:
            countries = [int(i) for i in countries]
            country_names = [list(Country.objects.filter(country_id__exact=country))[0].short_name for country in countries]
            # Underlying DB has a column for country id, but model itself doesn't
            # Therefore, we need to fall back to using plain SQL
            country_matches = set(i.issf_core_id for i in ISSFCoreMapPointUnique.objects.raw(
                'SELECT row_number, issf_core_id, contribution_date, contributor_id, edited_date, editor_id, \
                core_record_type, core_record_summary, core_record_status geographic_scope_type,\
                 map_point::bytea, lat, lon FROM issf_core_map_point_unique WHERE country_id = ANY(%(countries)s)',
                {'countries': countries}
            ))
            if len(countries) <= 5:
                search_terms.append('Countries: {}'.format(', '.join(country_names)))
            else:
                search_terms.append('Countries: {} (and {} more)'.format(
                    ', '.join(country_names[0:5]),
                    len(countries) - 5
                ))
            for item in map_queryset[:]:
                if item.issf_core_id not in country_matches:
                    map_queryset.remove(item)

        if contribution_begin_date:
            search_terms.append('Contribution date begin: {}'.format(contribution_begin_date))
            matches = set(i.issf_core_id for i in ISSFCoreMapPointUnique.objects.filter(contribution_date__gt=contribution_begin_date))
            for item in map_queryset[:]:
                if item.issf_core_id not in matches:
                    map_queryset.remove(item)

        if contribution_end_date:
            search_terms.append('Contribution date end: {}'.format(contribution_end_date))
            matches = set(i.issf_core_id for i in ISSFCoreMapPointUnique.objects.filter(contribution_date__lt=contribution_end_date))
            for item in map_queryset[:]:
                if item.issf_core_id not in matches:
                    map_queryset.remove(item)

        if len(themes) > 0:
            theme_ids = [theme.theme_issue_value_id for theme in themes]
            search_terms.append('Themes / Issues: {}'.format(', '.join((theme.theme_issue_label for theme in themes))))
            matches = set(i.issf_core_id for i in SelectedThemeIssue.objects.filter(theme_issue_value__in=theme_ids))
            for item in map_queryset[:]:
                if item.issf_core_id not in matches:
                    map_queryset.remove(item)

        if len(attributes) > 0:
            attribute_value_ids = []
            for attribute in attributes:
                search_terms.append(
                    '{} {}'.format(
                        attribute['attribute'].attribute_label,
                        attribute['attribute_value']
                    )
                )
                attribute_value_ids.append(attribute['attribute_value'].attribute_value_id)
            matches = set(i.issf_core_id for i in SelectedAttribute.objects.filter(attribute_value__in=attribute_value_ids))
            for item in map_queryset[:]:
                if item.issf_core_id not in matches:
                    map_queryset.remove(item)

    map_results = []

    for row in map_queryset:
        # This code was copied from the previous function
        temp = []
        temp.append(row.core_record_type)
        temp.append(row.geographic_scope_type)
        lines = row.core_record_summary.split('\\n')
        summary = ''
        for line in lines:
            if 'Timeframe: ' in line:
                line = line.replace('-0', '')
            summary += line + '<br/>'
        temp.append(summary)
        url = reverse(get_redirectname(row.core_record_type), kwargs={'issf_core_id': row.issf_core_id})
        temp.append('<a href="' + url + '">Details</a>')
        temp.append(str(row.lon))
        temp.append(str(row.lat))
        temp.append(row.edited_date.strftime("%Y-%m-%d"))
        # The table originally was sorted by the "relevance", which we no longer have, so we just use a value of 0
        # Removing this value results in errors with the DataTable library
        temp.append("0")
        map_results.append(temp)

    if len(search_terms) == 0:
        search_terms = ["None"]

    joined_terms = ", ".join(search_terms)

    response = json.dumps({
        'success': 'true',
        'msg': 'OK',
        'searchTerms': joined_terms[0].capitalize() + joined_terms[1:] + ' (',
        'mapData': map_results
    })
    return gzip_middleware.process_response(request, HttpResponse(response))


class MapLayer(GeoJSONLayerView):
    geometry_field = 'map_point'
    queryset = ISSFCoreMapPointUnique.objects.all()
    properties = ['issf_core_id', 'core_record_type', 'core_record_summary', 'geographic_scope_type']

    def get_context_data(self, **kwargs):
        # this case is called from details to show map points for one record
        context = super(MapLayer, self).get_context_data(**kwargs)
        issf_core_id = self.request.GET['issf_core_id']
        self.queryset = ISSFCoreMapPointUnique.objects.filter(issf_core_id=issf_core_id)
        return context


# This function groups all results currently displayed in the table by record type and exports the records to several
#  CSV files, one for each record type, and then serves them to user in a .zip file.
def table_data_export(request):
    table_data_file_name = "/tmp/tabledata.zip"

    if request.method == 'POST':
        map_data = request.POST.getlist('ids[]')
        # sort based on record type
        map_data.sort(key=lambda x: x[0])

        # Lists to hold core ids of each record
        # I'm not proud of this
        who_items = []
        sota_items = []
        profile_items = []
        org_items = []
        cap_items = []
        guide_items = []
        case_items = []
        expe_items = []

        for item in map_data:
            record = item.split('&')
            type = record[0]
            issf_core_id = record[1]

            if type == 'Capacity Development':
                cap_items.append(issf_core_id)
            elif type == 'SSF Guidelines':
                guide_items.append(issf_core_id)
            elif type == 'SSF Organization':
                org_items.append(issf_core_id)
            elif type == 'SSF Profile':
                profile_items.append(issf_core_id)
            elif type == 'State-of-the-Art in SSF Research':
                sota_items.append(issf_core_id)
            elif type == 'Who\'s Who in SSF':
                who_items.append(issf_core_id)
            elif type == 'Case Study':
                case_items.append(issf_core_id)
            elif type == 'SSF Experiences':
                expe_items.append(issf_core_id)

        zipfile = ZipFile(table_data_file_name, 'w')

        cap_records = SSFCapacityNeed.objects.filter(issf_core_id__in=cap_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'capacity_need_title',
            'capacity_need_description',
            'capacity_need_category',
            'capacity_need_type'
        )
        guide_records = SSFGuidelines.objects.filter(issf_core_id__in=guide_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'title',
            'location', 'start_day',
            'start_month', 'start_year',
            'end_day', 'end_month',
            'end_year', 'organizer',
            'purpose', 'link',
            'activity_type',
            'activity_coverage',
            'ongoing'
        )
        org_records = SSFOrganization.objects.filter(issf_core_id__in=org_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'organization_name',
            'mission',
            'address1',
            'address2',
            'prov_state',
            'country__short_name',
            'postal_code',
            'city_town',
            'year_established',
            'ssf_defined',
            'ssf_definition',
            'organization_type_union',
            'organization_type_support',
            'organization_type_coop',
            'organization_type_flag',
            'organization_type_other',
            'organization_type_other_text',
            'motivation_voice',
            'motivation_market',
            'motivation_sustainability',
            'motivation_economics',
            'motivation_rights',
            'motivation_collaboration',
            'motivation_other',
            'motivation_other_text',
            'activities_capacity',
            'activities_sustainability',
            'activities_networking',
            'activities_marketing',
            'activities_collaboration',
            'activities_other',
            'activities_other_text',
            'network_types_state',
            'network_types_ssfos',
            'network_types_community',
            'network_types_society',
            'network_types_ngos',
            'network_types_other',
            'network_types_other_text',
            'achievements',
            'success_factors', 'obstacles',
            'organization_point'
        )
        pro_records = SSFProfile.objects.filter(issf_core_id__in=profile_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'ssf_name',
            'ssf_defined',
            'ssf_definition',
            'data_day',
            'data_month',
            'data_year',
            'data_end_day',
            'data_end_month',
            'data_end_year',
            'comments',
            'sources',
            'percent'
        )

        sota_records = SSFKnowledge.objects.filter(issf_core_id__in=sota_items).values(
            'issf_core_id',
            'contribution_date',
            'contributor__first_name',
            'contributor__last_name',
            'geographic_scope_type',
            'publication_type__publication_type',
            'other_publication_type',
            'level1_title',
            'level2_title',
            'year',
            'nonenglish_language__language_name',
            'nonenglish_title',
            'ssf_defined',
            'ssf_definition',
            'lsf_considered',
            'fishery_type_details',
            'gear_type_details',
            'ecosystem_type_details',
            'demographics_na',
            'demographics_age',
            'demographics_education',
            'demographics_ethnicity',
            'demographics_gender',
            'demographics_health',
            'demographics_income',
            'demographics_religion',
            'demographics_unspecified',
            'demographics_other',
            'demographics_other_text',
            'demographic_details',
            'employment_na',
            'employment_full_time',
            'employment_part_time',
            'employment_seasonal',
            'employment_unspecified',
            'employment_details',
            'stage_na',
            'stage_pre_harvest',
            'stage_harvest',
            'stage_post_harvest',
            'stage_unspecified',
            'market_details',
            'governance_details',
            'management_details',
            'research_method',
            'method_specify_qualitative',
            'method_specify_quantitative',
            'method_specify_mixed',
            'aim_purpose_question',
            'theme_issue_details',
            'solutions_offered',
            'solution_details',
            'explicit_implications_recommendations',
            'implication_details',
            'comments'
        )
        case_records = SSFCaseStudies.objects.filter(issf_core_id__in=case_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'name',
            'role',
            'description_area',
            'description_fishery',
            'description_issues',
            'issues_challenges',
            'stakeholders',
            'transdisciplinary',
            'background_context',
            'activities_innovation'
        )
        expe_records = SSFExperiences.objects.filter(issf_core_id__in=expe_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'title',
            'name',
            'description'
        )
        who_records = SSFPerson.objects.filter(issf_core_id__in=who_items).values(
            'issf_core_id',
            'contributor_id__first_name',
            'contributor_id__last_name',
            'contribution_date',
            'geographic_scope_type',
            'number_publications',
            'education_level',
            'research_method',
            'issues_addressed',
            'url',
            'other_education_level',
            'affiliation',
            'address1',
            'address2',
            'city_town',
            'prov_state',
            'country__short_name',
            'postal_code',
            'is_researcher',
            'person_point'
        )

        write_file_csv('capacity.csv', cap_records, zipfile)
        write_file_csv('guidelines.csv', guide_records, zipfile)
        write_file_csv('organization.csv', org_records, zipfile)
        write_file_csv('profile.csv', pro_records, zipfile)
        write_file_csv('state_of_the_art.csv', sota_records, zipfile)
        write_file_csv('case_studies.csv', case_records, zipfile)
        write_file_csv('experiences.csv', expe_records, zipfile)
        write_file_csv('whos_who.csv', who_records, zipfile)

        main_attrs = MainAttributeView.objects.filter(issf_core_id__in=profile_items).values(
            'issf_core_id',
            'attribute__question_number',
            'attribute__attribute_label',
            'value',
            'attribute__units_label',
            'attribute_value__value_label',
            'other_value',
            'additional',
            'additional_value__value_label'
        )

        write_file_csv('main_attributes.csv', main_attrs, zipfile)
        author_records = KnowledgeAuthorSimple.objects.filter(knowledge_core__in=sota_items).values()
        write_file_csv('authors.csv', author_records, zipfile)
        all_ids = cap_items + guide_items + org_items + profile_items + sota_items + who_items + expe_items + case_items
        theme_issue_records = CommonThemeIssueView.objects.filter(issf_core_id__in=all_ids).values(
            'issf_core_id',
            'selected_theme_issue_id',
            'theme_issue_value__theme_issue_label',
            'theme_issue_value__theme_issue__theme_issue_category',
            'other_theme_issue'
        )

        characteristic_records = CommonAttributeView.objects.filter(issf_core_id__in=all_ids).values(
            'issf_core_id',
            'selected_attribute_id',
            'attribute__attribute_category',
            'attribute__attribute_label',
            'attribute__units_label',
            'attribute__additional_field',
            'attribute_value__value_label',
            'other_value'
        )

        write_file_csv('themes_issues.csv', theme_issue_records, zipfile)
        write_file_csv('characteristics.csv', characteristic_records, zipfile)

        geog_scope_local_records = GeographicScopeLocalArea.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_local_area_id',
            'issf_core_id',
            'local_area_name',
            'local_area_alternate_name',
            'country__short_name',
            'local_area_setting',
            'local_area_setting_other',
            'local_area_point'
        )
        geog_scope_regional_records = Geographic_Scope_Region.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_region_id',
            'issf_core_id',
            'region__region_name',
            'region_name_other'
        )
        geog_scope_subnational_records = GeographicScopeSubnation.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_subnation_id',
            'issf_core_id',
            'subnation_name',
            'country__short_name',
            'subnation_type',
            'subnation_type_other',
            'subnation_point'
        )
        geog_scope_national_records = GeographicScopeNation.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_nation_id',
            'issf_core_id',
            'country__short_name'
        )

        species_records = Species.objects.filter(issf_core_id__in=all_ids).defer('species_id').values()

        write_file_csv('geog_scope_local.csv', geog_scope_local_records, zipfile)
        write_file_csv('geog_scope_regional.csv', geog_scope_regional_records, zipfile)
        write_file_csv('geog_scope_subnational.csv', geog_scope_subnational_records, zipfile)
        write_file_csv('geog_scope_national.csv', geog_scope_national_records, zipfile)

        write_file_csv('species.csv', species_records, zipfile)

        zipfile.write('/issf/export/README within exported zip files.txt', 'README.txt')

        zipfile.close()

        return HttpResponse("Created tabledata.zip")

    else:
        if os.path.isfile(table_data_file_name):
            zipfile = open(table_data_file_name, 'rb')

            response = HttpResponse(zipfile, content_type='application/x-zip-compressed')
            response['Content-Disposition'] = 'attachment; filename="tabledata.zip"'

        else:
            response = HttpResponse("No tabledata.zip")

        return response


def write_file_csv(filename, records, zipfile):
    if len(records) > 0:
        csvfile = open('/issf/issf_prod/' + filename, 'wb+')
        djqscsv.write_csv(records, csvfile, use_verbose_names=False)
        csvfile.close()
        zipfile.write(csvfile.name, os.path.basename(csvfile.name))
    else:
        return


# "Secret" csv exporting URL for GCPC. Only does SSF Profile records and associated characteristics.
# DO NOT MODIFY, THIS URL IS AUTOMATICALLY HIT.
# If any change is made to the database, test this URL to make sure everything still works.
def profile_csv(request):
    profile_records = SSFProfile.objects.all().values(
        'issf_core_id',
        'contributor_id__first_name',
        'contributor_id__last_name',
        'contribution_date',
        'geographic_scope_type',
        'ssf_name',
        'ssf_defined',
        'ssf_definition',
        'data_day',
        'data_month',
        'data_year',
        'data_end_day',
        'data_end_month',
        'data_end_year',
        'comments',
        'sources',
        'percent'
    )
    zipfile = ZipFile('profile_data.zip', 'w')

    main_attrs = MainAttributeView.objects.all().values(
        'issf_core_id',
        'attribute__question_number',
        'attribute__attribute_label',
        'value',
        'attribute__units_label',
        'attribute_value__value_label',
        'other_value',
        'additional',
        'additional_value__value_label'
    )

    write_file_csv('profile.csv', profile_records, zipfile)
    write_file_csv('main_attributes.csv', main_attrs, zipfile)

    geog_scope_local_records = GeographicScopeLocalArea.objects.filter(issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_local_area_id',
        'issf_core_id',
        'local_area_name',
        'local_area_alternate_name',
        'country__short_name',
        'local_area_setting',
        'local_area_setting_other',
        'local_area_point'
    )
    geog_scope_regional_records = Geographic_Scope_Region.objects.filter(issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_region_id',
        'issf_core_id',
        'region__region_name',
        'region_name_other'
    )
    geog_scope_subnational_records = GeographicScopeSubnation.objects.filter(issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_subnation_id',
        'issf_core_id',
        'subnation_name',
        'country__short_name',
        'subnation_type',
        'subnation_type_other',
        'subnation_point'
    )
    geog_scope_national_records = GeographicScopeNation.objects.filter(issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_nation_id',
        'issf_core_id',
        'country__short_name'
    )

    write_file_csv('geog_scope_local.csv', geog_scope_local_records, zipfile)
    write_file_csv('geog_scope_regional.csv', geog_scope_regional_records, zipfile)
    write_file_csv('geog_scope_subnational.csv', geog_scope_subnational_records, zipfile)
    write_file_csv('geog_scope_national.csv', geog_scope_national_records, zipfile)

    zipfile.close()
    zipfile = open('profile_data.zip', 'rb')

    response = HttpResponse(zipfile, content_type='application/x-zip-compressed')
    response['Content-Disposition'] = 'attachment; filename="profile_data.zip"'

    return response


def unique_chain(*iterables):
    known_ids = set()
    for it in iterables:
        for element in it:
            if element['issf_core_id'] not in known_ids:
                known_ids.add(element['issf_core_id'])
                yield element['issf_core_id']


def convert_records(records):
    records = list(records)
    for i, record in enumerate(records):
        type = record['core_record_type']

        if type == 'SSF Organization':
            record['url'] = 'organization'
            record['title'] = SSFOrganization.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'SSF Organization'
        elif type == "Who's Who in SSF":
            record['url'] = 'who'
            record['title'] = SSFPerson.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = "Who's Who in SSF"
        elif type == "State-of-the-Art in SSF Research":
            record['url'] = 'sota'
            record['title'] = SSFKnowledge.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'State-of-the-Art in SSF Research'
        elif type == "SSF Profile":
            record['url'] = 'profile'
            record['title'] = SSFProfile.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'SSF Profile'
        elif type == "Case Study":
            record['url'] = 'casestudy'
            record['title'] = SSFCaseStudies.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'Case Study'
        elif type == "Capacity Development":
            record['url'] = 'capacity'
            record['title'] = SSFCapacityNeed.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'Capacity Development'
        elif type == "SSF Experiences":
            record['url'] = 'experiences'
            record['title'] = SSFExperiences.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'SSF Experiences'
        elif type == "SSF Guidelines":
            record['url'] = 'guidelines'
            record['title'] = SSFGuidelines.objects.get(issf_core_id=record['issf_core_id'])
            record['record_type'] = 'SSF Guidelines'

        records[i] = record

    return records


def country_records(request, country_id):
    nation_records = GeographicScopeNation.objects.filter(country_id=country_id).values()
    region_records = Geographic_Scope_Region.objects.filter(countries__country_id=country_id).values()
    subnation_records = GeographicScopeSubnation.objects.filter(country_id=country_id).values()
    local_records = GeographicScopeLocalArea.objects.filter(country_id=country_id).values()

    record_ids = list(unique_chain(nation_records, region_records, subnation_records, local_records))

    records = ISSF_Core.objects.filter(issf_core_id__in=record_ids).values().order_by('core_record_type')
    records = convert_records(records)

    country = Country.objects.filter(country_id=country_id)
    if country:
        country = country[0]
    else:
        country.short_name = ''

    return render(request, 'frontend/country_records.html', {'records': records, 'country_name': country.short_name})


# For staff members only, used to submit new tips for the help page.
@login_required()
@gzip_page
def new_tip(request):
    is_staff = False
    if request.user.is_staff:
        is_staff = True
    if is_staff:
        if request.method == 'POST':
            tip_form = TipForm(request.POST)

            if tip_form.is_valid():
                tip_form.save()
                tip_form = TipForm()

            return render(
                request,
                'frontend/new_tip.html',
                {'tip_form': tip_form}
            )

        tip_form = TipForm()
        faq_form = FAQForm()

        return render(
            request,
            'frontend/new_tip.html',
            {
                'tip_form': tip_form,
                'faq_form': faq_form,
                'is_staff': is_staff
            }
        )
    else:
        raise Http404("Insufficient permission.")


# For staff members only, used to submit new FAQs for the help page.
@login_required()
@gzip_page
def new_faq(request):
    if request.method == 'POST':
        form = FAQForm(request.POST)

        if form.is_valid():
            form.save()

        return HttpResponseRedirect(reverse('new-tip'))


# For staff members only, used to replace the current Who's Who feature.
@login_required()
@gzip_page
def who_feature(request):
    is_staff = False
    if request.user.is_staff:
        is_staff = True
    if is_staff:
        if request.method == 'POST':
            form = WhosWhoForm(request.POST)

            if form.is_valid():
                form.save()

                return HttpResponseRedirect(reverse('who-feature'))

        form = WhosWhoForm()

        return render(request, 'frontend/who_feature.html', {'form': form})
    else:
        raise Http404("Insufficient permission.")


@login_required()
@gzip_page
def geojson_upload(request):
    is_staff = False
    if request.user.is_staff:
        is_staff = True
    if is_staff:
        if request.method == 'POST':
            form = GeoJSONUploadForm(request.POST, request.FILES)
            if form.is_valid():
                # process uploaded file
                file_ext = form.cleaned_data['file'].name.split('.')[-1]
                if file_ext == 'geojson':
                    BASE = os.path.dirname(os.path.abspath(__file__))
                    with open(os.path.join(BASE, "static/frontend/js/chorodata.json"), 'wb') as destination:
                        destination.write("var choroData = ".encode(encoding='UTF-8'))
                        for chunk in request.FILES['file'].chunks():
                            destination.write(chunk)
                    call_command('collectstatic', verbosity=0, interactive=False)
                    return HttpResponseRedirect(reverse('geojson-upload'))
                else:
                    return render(request, 'frontend/geojson_upload.html', {'form': form, 'form_error': 'File must be of type GeoJSON.'})
        else:
            form = GeoJSONUploadForm()
            return render(request, 'frontend/geojson_upload.html', {'form': form})
