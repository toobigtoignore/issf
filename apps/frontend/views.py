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
from django.templatetags.static import static
from djgeojson.views import GeoJSONLayerView

from issf_base.models import CommonAttributeView, Attribute, AdditionalValue, WhoFeature, SSFCaseStudies, \
    SSFExperiences, \
    KnowledgeAuthorSimple, ISSF_Core, GeographicScopeNation, SelectedThemeIssue, SelectedAttribute, CommonThemeIssueView
from issf_base.models import ISSFCoreMapPointUnique
from issf_base.models import Theme_Issue_Value

# from issf_base.models import Characteristic_Value
from issf_base.models import Country
from issf_admin.models import UserProfile
# from issf_base.models import TopContributors
from issf_base.models import RecentContributions
# from issf_base.models import TopRatedCapacityNeeds
from issf_base.models import ContributionsByRecordType
from issf_base.models import ContributionsByCountry
from issf_base.models import ContributionsByGeographicScope
from issf_base.models import AttributeValue
from issf_base.models import SSFOrganization
from issf_base.models import SSFProfile
from issf_base.models import SSFKnowledge
from issf_base.models import SSFPerson
from issf_base.models import SSFGuidelines
from issf_base.models import SSFCapacityNeed
from issf_base.models import MainAttributeView
from issf_base.models import Species
from issf_base.models import Geographic_Scope_Region
from issf_base.models import GeographicScopeLocalArea
from issf_base.models import GeographicScopeSubnation

from .forms import SearchForm, TipForm, FAQForm, WhosWhoForm, GeoJSONUploadForm
# from frontend.forms import EconomicThemesIssuesForm
# from frontend.forms import EcologicalThemesIssuesForm
# from frontend.forms import SocialCulturalThemesIssuesForm
# from frontend.forms import GovernanceThemesIssuesForm
# from frontend.forms import SsftermCharacteristicsForm
# from frontend.forms import FisherytypeCharacteristicsForm
# from frontend.forms import GeartypeCharacteristicsForm
# from frontend.forms import EcosystemHighlevelCharacteristicsForm
# from frontend.forms import EcosystemDetailedCharacteristicsForm
# from frontend.forms import MarketCharacteristicsForm
# from frontend.forms import GovernanceCharacteristicsForm
# from frontend.forms import ManagementCharacteristicsForm
from frontend.forms import SelectedAttributesFormSet
from frontend.forms import SelectedThemesIssuesFormSet


def parse_search_terms(input_search_terms):
    """
        Strip away special characters because they would cause the tsquery to fail
        and the search to hang.
    """
    search_array = input_search_terms.replace(u":", u" ").replace(u"'",
                                                                  u" ").replace(
        u"|", u" ").replace(u"!", u" ").replace(u"&", u" ").replace(u"%",
                                                                    u" ").replace(
        u"\"", u" ").split()
    for idx in range(0, len(search_array)):
        search_array[idx] = search_array[idx] + u":*"
    parsed_search_terms = u" ".join(search_array)

    if '"' in input_search_terms:
        return parsed_search_terms.replace(u" ", u" & ")
    return parsed_search_terms.replace(u" ", u" | ")


def index(request):
    # get data for dashboard panels
    # top_contributors = TopContributors.objects.all()
    recent_contributions = RecentContributions.objects.all()
    for recent_contribution in recent_contributions:
        lines = recent_contribution.core_record_summary.split('\\n')
        summary = ''
        for line in lines:
            summary += line + '<br/>'
        recent_contribution.core_record_summary = summary
    contributions_by_record_type = ContributionsByRecordType.objects.all()
    # countries with more than one record
    contributions_by_country = ContributionsByCountry.objects.filter(
        contribution_count__gt=1)
    # countries with exactly one record
    other_countries = ContributionsByCountry.objects.filter(
        contribution_count__exact=1)
    contributions_by_geographic_scope = \
        ContributionsByGeographicScope.objects.all()
    attribute_values = AttributeValue.objects.all()
    theme_issue_values = Theme_Issue_Value.objects.all()
    who_feature = WhoFeature.objects.latest('id')
    # top_rated_capacity_needs = TopRatedCapacityNeeds.objects.all()
    # return dashboard data and empty search forms
    return render(request, "frontend/index.html", {
        'contributions_by_record_type': contributions_by_record_type,
        'contributions_by_country': contributions_by_country,
        'other_countries': other_countries,
        'contributions_by_geographic_scope': contributions_by_geographic_scope,
        # 'top_contributors': top_contributors,
        'recent_contributions': recent_contributions,
        # 'top_rated_capacity_needs': top_rated_capacity_needs,
        'searchForm': SearchForm,  # 'econTIForm': EconomicThemesIssuesForm,
        # 'ecolTIForm': EcologicalThemesIssuesForm,
        # 'socTIForm': SocialCulturalThemesIssuesForm,
        # 'govTIForm': GovernanceThemesIssuesForm,
        'selected_themes_issues_formset': SelectedThemesIssuesFormSet,
        'selected_attributes_formset': SelectedAttributesFormSet,
        'attribute_values': attribute_values, 'theme_issue_values':
            theme_issue_values,
        'who_feature': who_feature,
        # 'stCharForm': SsftermCharacteristicsForm,
        # 'ftCharForm': FisherytypeCharacteristicsForm,
        # 'gtCharForm': GeartypeCharacteristicsForm,
        # 'ehCharForm': EcosystemHighlevelCharacteristicsForm,
        # 'edCharForm': EcosystemDetailedCharacteristicsForm,
        # 'mktCharForm': MarketCharacteristicsForm,
        # 'govCharForm': GovernanceCharacteristicsForm,
        # 'mgmtCharForm': ManagementCharacteristicsForm,
        'num_who_records': SSFPerson.objects.all().count(),
        'num_sota_records': SSFKnowledge.objects.all().count(),
        'num_profile_records': SSFProfile.objects.all().count(),
        'num_org_records': SSFOrganization.objects.all().count(),
        'num_cap_records': SSFCapacityNeed.objects.all().count(),
        'num_guide_records': SSFGuidelines.objects.all().count(),
        'num_case_records': SSFCaseStudies.objects.all().count(),
        'num_expe_records': SSFExperiences.objects.all().count(),
    })


def frontend_data(request):
    # sleep(3)
    queryset = None
    map_queryset = None
    search_terms = u""
    search_results = []
    map_results = []

    if request.method != 'POST':  # Could cause bugs, should be == 'GET'?

        # default page load with all records
        cached_map_data = cache.get('cached_map_data')

        if cached_map_data:
            map_queryset = cached_map_data
        else:
            map_queryset = ISSFCoreMapPointUnique.objects.extra(
                select={"relevance": "0"})
            cache.set('cached_map_data', map_queryset, 86400)
    else:
        # user hit search
        select = {}
        where = []

        keywords = request.POST['keywords']
        if len(keywords) > 0:
            # append to search_terms display string
            if len(search_terms) > 0:
                search_terms = search_terms + u" AND "
            # search_terms = search_terms + u"(Full text = " +
            # keywords.replace(u" ",
            # u" OR ") + u")"
            parsed_keywords = parse_search_terms(keywords)

            where.append(
                u"core_record_tsvector @@ to_tsquery('english', unaccent('{"
                u"0}'))".format(parsed_keywords))

            select = {
                "relevance": u"round(CAST(ts_rank(core_record_tsvector, "
                             u"to_tsquery('{0}')) AS "
                             u"NUMERIC), 3)".format(parsed_keywords)
            }

            search_terms = search_terms + u"(Full text = " + \
                           parsed_keywords.replace(
                               u" | ", u" OR ").replace(u" & ", u" AND ") + u"; returned "
            search_terms = search_terms.replace(u":*", u"")
        else:
            select = {"relevance": u"0"}

        if len(request.POST['contributor']) > 0:
            contributor_id = request.POST['contributor']
            user_profile = UserProfile.objects.get(pk=contributor_id)
            # append to search_terms display string
            if len(search_terms) > 0:
                search_terms = search_terms + u" AND "
            search_terms = search_terms + u"(Contributor/editor = " + (
                user_profile.username + u" (" + user_profile.first_name + u" " + user_profile.initials + u" " +
                user_profile.last_name + u")").replace(
                u"  ", u" ") + u")"
            where.append(
                u"contributor_id = " + contributor_id + u" OR editor_id = "
                + contributor_id)

        r = re.compile('.*/.*/.*')
        if len(request.POST['contribution_begin_date']) > 0:
            date_string = request.POST['contribution_begin_date']
            if r.match(date_string) is not None:
                # append to search_terms display string
                if len(search_terms) > 0:
                    search_terms = search_terms + u" AND "
                search_terms = search_terms + u"(Contribution begin date = " \
                               + date_string + u")"
                date_string = datetime.datetime.strptime(date_string,
                                                         '%m/%d/%Y').strftime(
                    '%Y-%m-%d')
                where.append(
                    u"contribution_date >= date '" + date_string + u"'")
        if len(request.POST['contribution_end_date']) > 0:
            date_string = request.POST['contribution_end_date']
            if r.match(date_string) is not None:
                # append to search_terms display string
                if len(search_terms) > 0:
                    search_terms = search_terms + u" AND "
                search_terms = search_terms + u"(Contribution end date = " + \
                               date_string + u")"
                date_string = datetime.datetime.strptime(date_string,
                                                         '%m/%d/%Y').strftime(
                    '%Y-%m-%d')
                where.append(
                    u"contribution_date <= date '" + date_string + u"'")
        # if len(request.POST['edited_begin_date']) > 0:
        #     date_string = request.POST['edited_begin_date']
        #     if r.match(date_string) is not None:
        #         # append to search_terms display string
        #         if len(search_terms) > 0:
        #             search_terms = search_terms + u" AND "
        #         search_terms = search_terms + u"(Edited begin date = " + \
        #                        date_string + ")"
        #         date_string = datetime.datetime.strptime(date_string,
        #
        # '%m/%d/%Y').strftime(
        #             '%Y-%m-%d')
        #         where.append(u"edited_date >= date '" + date_string + u"'")
        # if len(request.POST['edited_end_date']) > 0:
        #     date_string = request.POST['edited_end_date']
        #     if r.match(date_string) is not None:
        #         # append to search_terms display string
        #         if len(search_terms) > 0:
        #             search_terms = search_terms + u" AND "
        #         search_terms = search_terms + u"(Edited end date = " + \
        #                        date_string + u")"
        #         date_string = datetime.datetime.strptime(date_string,
        #
        # '%m/%d/%Y').strftime(
        #             '%Y-%m-%d')
        #         where.append(u"edited_date <= date '" + date_string + u"'")

        if 'countries' in request.POST:
            # append to search_terms display string
            if len(search_terms) > 0:
                search_terms = search_terms + u" AND "
            country_list = request.POST.getlist('countries')
            search_terms = search_terms + u"(Country = "
            country_where = (
                u"country_id IN (" + u",".join(country_list) + u")")
            inner_where = []
            inner_where.append(country_where)
            countries = Country.objects.extra(where=inner_where)
            first = True
            for country in countries:
                if not first:
                    search_terms = search_terms + u" OR "
                search_terms = search_terms + country.short_name
                first = False
            search_terms = search_terms + u")"
            where.append(u"issf_core_id IN (SELECT issf_core_id FROM "
                         u"issf_core_map_point_unique WHERE " +
                         country_where + u")")

        # themes_issues_list = []
        # if 'economic_themes_issues' in request.POST:
        # themes_issues_list.append(u",".join(request.POST.getlist(
        # 'economic_themes_issues')))
        # if 'ecological_themes_issues' in request.POST:
        # themes_issues_list.append(u",".join(request.POST.getlist(
        # 'ecological_themes_issues')))
        # if 'social_cultural_themes_issues' in request.POST:
        # themes_issues_list.append(
        # u",".join(request.POST.getlist('social_cultural_themes_issues')))
        # if 'governance_themes_issues' in request.POST:
        #     themes_issues_list.append(u",".join(request.POST.getlist(
        # 'governance_themes_issues')))
        # if themes_issues_list:
        #     # append to search_terms display string
        #     if len(search_terms) > 0:
        #         search_terms = search_terms + u" AND "
        #     search_terms = search_terms + u"(Themes/issues = "
        #     themes_issues_where = (u"theme_issue_value_id IN (" + u",
        # ".join(themes_issues_list) +
        #                            u")")
        #     inner_where = []
        #     inner_where.append(themes_issues_where)
        #     theme_issue_values = Theme_Issue_Value.objects.extra(
        # where=inner_where)
        #     first = True
        #     for theme_issue_value in theme_issue_values:
        #         if not first:
        #             search_terms = search_terms + u" OR "
        #         search_terms = search_terms +
        # theme_issue_value.theme_issue_label
        #         first = False
        #     search_terms = search_terms + u")"
        #     where.append(
        #         u"issf_core_id IN (SELECT issf_core_id FROM
        # selected_theme_issue WHERE " +
        #         themes_issues_where + u")")

        # characteristics_list = []
        # if 'ssfterm_characteristics' in request.POST:
        # characteristics_list.append(u",".join(request.POST.getlist(
        # 'ssfterm_characteristics')))
        # if 'fisherytype_characteristics' in request.POST:
        # characteristics_list.append(
        # u",".join(request.POST.getlist('fisherytype_characteristics')))
        # if 'geartype_characteristics' in request.POST:
        # characteristics_list.append(
        # u",".join(request.POST.getlist('geartype_characteristics')))
        # if 'ecosystem_highlevel_characteristics' in request.POST:
        # characteristics_list.append(
        # u",".join(request.POST.getlist(
        # 'ecosystem_highlevel_characteristics')))
        # if 'ecosystem_detailed_characteristics' in request.POST:
        #     characteristics_list.append(
        #         u",".join(request.POST.getlist(
        # 'ecosystem_detailed_characteristics')))
        # if 'market_characteristics' in request.POST:
        #     characteristics_list.append(u",".join(request.POST.getlist(
        # 'market_characteristics')))
        # if 'governance_characteristics' in request.POST:
        #     characteristics_list.append(
        #         u",".join(request.POST.getlist(
        # 'governance_characteristics')))
        # if 'management_characteristics' in request.POST:
        #     characteristics_list.append(
        #         u",".join(request.POST.getlist(
        # 'management_characteristics')))
        # if characteristics_list:
        #     # append to search_terms display string
        #     if len(search_terms) > 0:
        #         search_terms = search_terms + u" AND "
        #     search_terms = search_terms + u"(Characteristics = "
        #     characteristics_where = (
        #         u"characteristic_value_id IN (" + u",".join(
        # characteristics_list) + u")")
        #     inner_where = []
        #     inner_where.append(characteristics_where)
        #     characteristic_values = Characteristic_Value.objects.extra(
        # where=inner_where)
        #     first = True
        #     for characteristic_value in characteristic_values:
        #         if not first:
        #             search_terms = search_terms + u" OR "
        #         # search_terms = search_terms +
        # characteristic.characteristic_category + " - " +
        #         # characteristic.characteristic_label
        #         search_terms = search_terms +
        # characteristic_value.characteristic_label
        #         first = False
        #     search_terms = search_terms + u")"
        #     where.append(
        #         u"issf_core_id IN (SELECT issf_core_id FROM
        # selected_characteristic WHERE " +
        #         characteristics_where + u")")

        # Qualitative and ordinal characteristics
        selected_themes_issues_formset = SelectedThemesIssuesFormSet(
            request.POST)
        theme_issue_value_ids = []
        if selected_themes_issues_formset.is_valid():
            for form in selected_themes_issues_formset.forms:
                if len(form.cleaned_data) > 0:
                    theme_issue_value_ids.append(
                        str(form.cleaned_data['theme_issue_value']))

            if theme_issue_value_ids:
                theme_issue_value_ids = ','.join(theme_issue_value_ids)
                where.append(u"issf_core_id IN (SELECT issf_core_id FROM "
                             u"selected_theme_issue WHERE " +
                             u"theme_issue_value_id IN (" +
                             theme_issue_value_ids + u"))")

        selected_attributes_formset = SelectedAttributesFormSet(request.POST)
        attribute_value_ids = []
        if selected_attributes_formset.is_valid():
            for form in selected_attributes_formset.forms:
                if len(form.cleaned_data) > 0:
                    attribute_value_ids.append(
                        str(form.cleaned_data['attribute_value']))

            if attribute_value_ids:
                attribute_value_ids = ','.join(attribute_value_ids)
                where.append(u"issf_core_id IN (SELECT issf_core_id FROM "
                             u"selected_attribute WHERE " +
                             u"attribute_value_id IN (" +
                             attribute_value_ids + u"))")

        # queryset = ISSFCore.objects.extra(where=where, select=select)
        map_queryset = ISSFCoreMapPointUnique.objects.extra(where=where,
                                                            select=select)

    if map_queryset:
        """The following code block is commented out because the table on the homepage now uses the same data as the
        map. This is a significant reduce in the amount of data being transferred. It could probably be removed but
        I've left it for posterity.
        """
        # data found
        # for row in queryset:
        #     temp = []
        #     temp.append(row.core_record_type)
        #     url = ''
        #     if row.core_record_type == "Who's Who in SSF":
        #         url = reverse('who-details', kwargs={'issf_core_id':
        # row.issf_core_id})
        #     elif row.core_record_type == "State-of-the-Art in SSF Research":
        #         url = reverse('sota-details', kwargs={'issf_core_id':
        # row.issf_core_id})
        #     elif row.core_record_type == "Capacity Development":
        #         url = reverse('capacity-details', kwargs={'issf_core_id':
        # row.issf_core_id})
        #     elif row.core_record_type == "SSF Organization":
        #         url = reverse('organization-details', kwargs={
        # 'issf_core_id': row.issf_core_id})
        #     elif row.core_record_type == "SSF Profile":
        #         url = reverse('profile-details', kwargs={'issf_core_id':
        # row.issf_core_id})
        #     elif row.core_record_type == "SSF Guidelines":
        #         url = reverse('guidelines-details', kwargs={
        # 'issf_core_id': row.issf_core_id})
        #     # temp.append('<a href="' + url + '">' + escape(
        # row.core_record_summary) + '</a>')
        #     lines = row.core_record_summary.split('\\n')
        #     summary = ''
        #     for line in lines:
        #         summary += line + '<br/>'
        #     temp.append('<a href="' + url + '">' + summary + '</a>')
        #     temp.append(row.edited_date.strftime("%Y-%m-%d"))
        #     temp.append(str(row.relevance))
        #     search_results.append(temp)

        # Put data for each record into map data array. This probably won't scale well. Would probably be better off
        # calculating a record's URL when it's contributed and then storing it as a column in the database.
        for row in map_queryset:
            temp = []
            temp.append(row.core_record_type)
            temp.append(row.geographic_scope_type)
            lines = row.core_record_summary.split('\\n')
            summary = ''
            for line in lines:
                summary += line + '<br/>'
            temp.append(summary)
            url = ''
            if row.core_record_type == "Who's Who in SSF":
                url = reverse('who-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "State-of-the-Art in SSF Research":
                url = reverse('sota-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "Capacity Development":
                url = reverse('capacity-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "SSF Organization":
                url = reverse('organization-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "SSF Profile":
                url = reverse('profile-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "SSF Guidelines":
                url = reverse('guidelines-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "SSF Experiences":
                url = reverse('experiences-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            elif row.core_record_type == "Case Study":
                url = reverse('case-studies-details',
                              kwargs={'issf_core_id': row.issf_core_id})
            temp.append('<a href="' + url + '">Details</a>')
            temp.append(str(row.lon))
            temp.append(str(row.lat))
            temp.append(row.edited_date.strftime("%Y-%m-%d"))
            temp.append(str(row.relevance))
            map_results.append(temp)

    if len(search_terms) == 0:
        search_terms = u"None (showing all "

    if not map_queryset and len(search_terms) > 0:
        search_terms = u"No records found."

    response = json.dumps({
        'success': 'true',  # 'data': search_results,
        'mapData': map_results, 'searchTerms': search_terms, 'msg': 'OK', })
    return HttpResponse(response)


class MapLayer(GeoJSONLayerView):
    geometry_field = 'map_point'
    queryset = ISSFCoreMapPointUnique.objects.all()
    properties = ['issf_core_id', 'core_record_type', 'core_record_summary',
                  'geographic_scope_type']

    def get_context_data(self, **kwargs):
        # this case is called from details to show map points for one record
        context = super(MapLayer, self).get_context_data(**kwargs)
        issf_core_id = self.request.GET['issf_core_id']
        self.queryset = ISSFCoreMapPointUnique.objects.filter(
            issf_core_id=issf_core_id)
        return context


# This function groups all results currently displayed in the table by record type and exports the records to several
#  CSV files, one for each record type, and then serves them to user in a .zip file.
def table_data_export(request):
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

        zipfile = ZipFile('/home/projects/issf/issf_prod/tabledata.zip', 'w')

        cap_records = SSFCapacityNeed.objects.filter(issf_core_id__in=cap_items).values('issf_core_id',
                                                                                        'contributor_id__first_name',
                                                                                        'contributor_id__last_name',
                                                                                        'contribution_date',
                                                                                        'geographic_scope_type',
                                                                                        'capacity_need_title',
                                                                                        'capacity_need_description',
                                                                                        'capacity_need_category',
                                                                                        'capacity_need_type')
        guide_records = SSFGuidelines.objects.filter(issf_core_id__in=guide_items).values('issf_core_id',
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
                                                                                          'ongoing')
        org_records = SSFOrganization.objects.filter(issf_core_id__in=org_items).values('issf_core_id',
                                                                                        'contributor_id__first_name',
                                                                                        'contributor_id__last_name',
                                                                                        'contribution_date',
                                                                                        'geographic_scope_type',
                                                                                        'organization_name', 'mission',
                                                                                        'address1', 'address2',
                                                                                        'prov_state',
                                                                                        'country__short_name',
                                                                                        'postal_code', 'city_town',
                                                                                        'year_established',
                                                                                        'ssf_defined', 'ssf_definition',
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
                                                                                        'organization_point')
        pro_records = SSFProfile.objects.filter(issf_core_id__in=profile_items).values('issf_core_id',
                                                                                       'contributor_id__first_name',
                                                                                       'contributor_id__last_name',
                                                                                       'contribution_date',
                                                                                       'geographic_scope_type',
                                                                                       'ssf_name',
                                                                                       'ssf_defined', 'ssf_definition',
                                                                                       'data_day', 'data_month',
                                                                                       'data_year', 'data_end_day',
                                                                                       'data_end_month',
                                                                                       'data_end_year', 'comments',
                                                                                       'sources', 'percent')

        sota_records = SSFKnowledge.objects.filter(issf_core_id__in=sota_items).values(
            'issf_core_id', 'contribution_date',
            'contributor__first_name', 'contributor__last_name',
            'geographic_scope_type',
            'publication_type__publication_type', 'other_publication_type',
            'level1_title', 'level2_title', 'year',
            'nonenglish_language__language_name', 'nonenglish_title',
            'ssf_defined', 'ssf_definition', 'lsf_considered',
            'fishery_type_details', 'gear_type_details',
            'ecosystem_type_details', 'demographics_na',
            'demographics_age', 'demographics_education',
            'demographics_ethnicity', 'demographics_gender',
            'demographics_health', 'demographics_income',
            'demographics_religion', 'demographics_unspecified',
            'demographics_other', 'demographics_other_text',
            'demographic_details', 'employment_na',
            'employment_full_time', 'employment_part_time',
            'employment_seasonal', 'employment_unspecified',
            'employment_details', 'stage_na',
            'stage_pre_harvest', 'stage_harvest', 'stage_post_harvest',
            'stage_unspecified', 'market_details', 'governance_details',
            'management_details', 'research_method',
            'method_specify_qualitative', 'method_specify_quantitative',
            'method_specify_mixed', 'aim_purpose_question',
            'theme_issue_details', 'solutions_offered',
            'solution_details', 'explicit_implications_recommendations',
            'implication_details', 'comments')
        case_records = SSFCaseStudies.objects.filter(issf_core_id__in=case_items).values('issf_core_id',
                                                                                         'contributor_id__first_name',
                                                                                         'contributor_id__last_name',
                                                                                         'contribution_date',
                                                                                         'geographic_scope_type',
                                                                                         'name',
                                                                                         'role', 'description_area',
                                                                                         'description_fishery',
                                                                                         'description_issues',
                                                                                         'issues_challenges',
                                                                                         'stakeholders',
                                                                                         'transdisciplinary',
                                                                                         'background_context',
                                                                                         'activities_innovation')
        expe_records = SSFExperiences.objects.filter(issf_core_id__in=expe_items).values('issf_core_id',
                                                                                         'contributor_id__first_name',
                                                                                         'contributor_id__last_name',
                                                                                         'contribution_date',
                                                                                         'geographic_scope_type',
                                                                                         'title',
                                                                                         'name', 'description')
        who_records = SSFPerson.objects.filter(issf_core_id__in=who_items).values(
            'issf_core_id', 'contributor_id__first_name', 'contributor_id__last_name', 'contribution_date',
            'geographic_scope_type',
            'number_publications', 'education_level', 'research_method', 'issues_addressed',
            'url',
            'other_education_level', 'affiliation', 'address1', 'address2', 'city_town', 'prov_state',
            'country__short_name',
            'postal_code', 'is_researcher', 'person_point')

        write_file_csv('capacity.csv', cap_records, zipfile)
        write_file_csv('guidelines.csv', guide_records, zipfile)
        write_file_csv('organization.csv', org_records, zipfile)
        write_file_csv('profile.csv', pro_records, zipfile)
        write_file_csv('state_of_the_art.csv', sota_records, zipfile)
        write_file_csv('case_studies.csv', case_records, zipfile)
        write_file_csv('experiences.csv', expe_records, zipfile)
        write_file_csv('whos_who.csv', who_records, zipfile)

        main_attrs = MainAttributeView.objects.filter(issf_core_id__in=profile_items).values('issf_core_id',
                                                                                             'attribute__question_number',
                                                                                             'attribute__attribute_label',
                                                                                             'value',
                                                                                             'attribute__units_label',
                                                                                             'attribute_value__value_label',
                                                                                             'other_value',
                                                                                             'additional',
                                                                                             'additional_value__value_label')

        write_file_csv('main_attributes.csv', main_attrs, zipfile)

        author_records = KnowledgeAuthorSimple.objects.filter(knowledge_core__in=sota_items).values()

        write_file_csv('authors.csv', author_records, zipfile)

        all_ids = cap_items + guide_items + org_items + profile_items + sota_items + who_items + expe_items + case_items

        theme_issue_records = CommonThemeIssueView.objects.filter(issf_core_id__in=all_ids).values('issf_core_id',
                                                                                                   'selected_theme_issue_id',
                                                                                                   'theme_issue_value__theme_issue_label',
                                                                                                   'theme_issue_value__theme_issue__theme_issue_category',
                                                                                                   'other_theme_issue')

        characteristic_records = CommonAttributeView.objects.filter(issf_core_id__in=all_ids).values('issf_core_id',
                                                                                                     'selected_attribute_id',
                                                                                                     'attribute__attribute_category',
                                                                                                     'attribute__attribute_label',
                                                                                                     'attribute__units_label',
                                                                                                     'attribute__additional_field',
                                                                                                     'attribute_value__value_label',
                                                                                                     'other_value')

        write_file_csv('themes_issues.csv', theme_issue_records, zipfile)
        write_file_csv('characteristics.csv', characteristic_records, zipfile)

        geog_scope_local_records = GeographicScopeLocalArea.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_local_area_id', 'issf_core_id', 'local_area_name', 'local_area_alternate_name',
            'country__short_name', 'local_area_setting', 'local_area_setting_other', 'local_area_point')
        geog_scope_regional_records = Geographic_Scope_Region.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_region_id', 'issf_core_id', 'region__region_name', 'region_name_other')
        geog_scope_subnational_records = GeographicScopeSubnation.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_subnation_id', 'issf_core_id', 'subnation_name', 'country__short_name', 'subnation_type',
            'subnation_type_other', 'subnation_point')
        geog_scope_national_records = GeographicScopeNation.objects.filter(issf_core_id__in=all_ids).values(
            'geographic_scope_nation_id', 'issf_core_id', 'country__short_name')

        species_records = Species.objects.filter(issf_core_id__in=all_ids).defer('species_id').values()

        write_file_csv('geog_scope_local.csv', geog_scope_local_records, zipfile)
        write_file_csv('geog_scope_regional.csv', geog_scope_regional_records, zipfile)
        write_file_csv('geog_scope_subnational.csv', geog_scope_subnational_records, zipfile)
        write_file_csv('geog_scope_national.csv', geog_scope_national_records, zipfile)

        write_file_csv('species.csv', species_records, zipfile)

        zipfile.write('/home/projects/issf/issf_prod/docs/README.txt', 'README.txt')

        zipfile.close()

    else:
        zipfile = open('/home/projects/issf/issf_prod/tabledata.zip', 'rb')

        response = HttpResponse(zipfile,
                                content_type='application/x-zip-compressed')
        response[
            'Content-Disposition'] = 'attachment; filename="tabledata.zip"'

        return response


# def nstr(s):
#     # returns s if it is not None, otherwise returns an empty string
#     if not s:
#         return ''
#     return s


def write_file_csv(filename, records, zipfile):
    if len(records) > 0:
        csvfile = open('/home/projects/issf/issf_prod/' + filename, 'wb+')
        djqscsv.write_csv(records, csvfile, use_verbose_names=False)
        csvfile.close()
        zipfile.write(csvfile.name)
    else:
        return


# "Secret" csv exporting URL for GCPC. Only does SSF Profile records and associated characteristics.
# DO NOT MODIFY, THIS URL IS AUTOMATICALLY HIT.
# If any change is made to the database, test this URL to make sure everything still works.
def profile_csv(request):
    profile_records = SSFProfile.objects.all().values('issf_core_id',
                                                      'contributor_id__first_name',
                                                      'contributor_id__last_name',
                                                      'contribution_date',
                                                      'geographic_scope_type',
                                                      'ssf_name',
                                                      'ssf_defined', 'ssf_definition',
                                                      'data_day', 'data_month',
                                                      'data_year', 'data_end_day',
                                                      'data_end_month',
                                                      'data_end_year', 'comments',
                                                      'sources', 'percent')
    zipfile = ZipFile('profile_data.zip', 'w')

    main_attrs = MainAttributeView.objects.all().values('issf_core_id',
                                                        'attribute__question_number',
                                                        'attribute__attribute_label',
                                                        'value',
                                                        'attribute__units_label',
                                                        'attribute_value__value_label',
                                                        'other_value',
                                                        'additional',
                                                        'additional_value__value_label')

    write_file_csv('profile.csv', profile_records, zipfile)
    write_file_csv('main_attributes.csv', main_attrs, zipfile)

    geog_scope_local_records = GeographicScopeLocalArea.objects.filter(
        issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_local_area_id', 'issf_core_id', 'local_area_name', 'local_area_alternate_name',
        'country__short_name', 'local_area_setting', 'local_area_setting_other', 'local_area_point')
    geog_scope_regional_records = Geographic_Scope_Region.objects.filter(
        issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_region_id', 'issf_core_id', 'region__region_name', 'region_name_other')
    geog_scope_subnational_records = GeographicScopeSubnation.objects.filter(
        issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_subnation_id', 'issf_core_id', 'subnation_name', 'country__short_name', 'subnation_type',
        'subnation_type_other', 'subnation_point')
    geog_scope_national_records = GeographicScopeNation.objects.filter(
        issf_core__core_record_type='SSF Profile').values(
        'geographic_scope_nation_id', 'issf_core_id', 'country__short_name')

    write_file_csv('geog_scope_local.csv', geog_scope_local_records, zipfile)
    write_file_csv('geog_scope_regional.csv', geog_scope_regional_records, zipfile)
    write_file_csv('geog_scope_subnational.csv', geog_scope_subnational_records, zipfile)
    write_file_csv('geog_scope_national.csv', geog_scope_national_records, zipfile)

    zipfile.close()

    zipfile = open('profile_data.zip', 'rb')

    response = HttpResponse(zipfile,
                            content_type='application/x-zip-compressed')
    response[
        'Content-Disposition'] = 'attachment; filename="profile_data.zip"'

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

    return render(request, 'frontend/country_records.html',
                  {'records': records, 'country_name': country.short_name})


# For staff members only, used to submit new tips for the help page.
@login_required()
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

            return render(request, 'frontend/new_tip.html', {'tip_form': tip_form})

        tip_form = TipForm()
        faq_form = FAQForm()

        return render(request, 'frontend/new_tip.html',
                      {'tip_form': tip_form, 'faq_form': faq_form, 'is_staff': is_staff})
    else:
        raise Http404("Insufficient permission.")


# For staff members only, used to submit new FAQs for the help page.
@login_required()
def new_faq(request):
    if request.method == 'POST':
        form = FAQForm(request.POST)

        if form.is_valid():
            form.save()

        return HttpResponseRedirect(reverse('new-tip'))


# For staff members only, used to replace the current Who's Who feature.
@login_required()
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
                    with open(os.path.join(BASE, "static/frontend/js/chorodata.geojson"),
                              'wb') as destination:
                        destination.write("var choroData = ".encode(encoding='UTF-8'))
                        for chunk in request.FILES['file'].chunks():
                            destination.write(chunk)
                    call_command('collectstatic', verbosity=0, interactive=False)
                    return HttpResponseRedirect(reverse('geojson-upload'))
                else:
                    return render(request, 'frontend/geojson_upload.html',
                                  {'form': form, 'form_error': 'File must be of type GeoJSON.'})
        else:
            form = GeoJSONUploadForm()
            return render(request, 'frontend/geojson_upload.html', {'form': form})


# here be dragons
"""I think it's best if we never speak of the following code block."""

# def write_zip_csv(filename, table, ids, zip_object):
#     if len(ids) > 0:
#         with open(filename, 'wb+') as csvfile:
#             string_buffer = StringIO()
#             writer = unicodecsv.writer(string_buffer)
#
#             """ The following code is the exact opposite of DRY.
#             I swear it was the only way."""
#
#             if filename == 'capacity.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#
#                 writer.writerow(
#                     field_names + geog_scope_local_field_names +
#                     geog_scope_subnational_field_names +
#                     geog_scope_regional_field_names)
#
#                 for record, local, subnat, regional in izip_longest(records,
#                                                                     geog_scope_local,
#                                                                     geog_scope_subnational,
#                                                                     geog_scope_regional,
#                                                                     fillvalue=' '):
#                     # Somehow a record sometimes might be None. This is
#                     # baffling.
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] + [getattr(local, field, ' ') for
#                                              field in
#                                              geog_scope_local_field_names if
#                                              local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional])
#                     except AttributeError:
#                         pass
#             elif filename == 'guidelines.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#
#                 writer.writerow(
#                     field_names + geog_scope_local_field_names +
#                     geog_scope_subnational_field_names +
#                     geog_scope_regional_field_names)
#
#                 for record, local, subnat, regional in izip_longest(records,
#                                                                     geog_scope_local,
#                                                                     geog_scope_subnational,
#                                                                     geog_scope_regional,
#                                                                     fillvalue=' '):
#
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] + [getattr(local, field, ' ') for
#                                              field in
#                                              geog_scope_local_field_names if
#                                              local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional])
#                     except AttributeError:
#                         pass
#             elif filename == 'organization.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#                 # themes_issues = CommonThemeIssueView.objects.select_related(
#                 #
#                 # ).filter(issf_core__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#
#                 # themes_issues_field_names = [field.name for field in
#                 #
#                 # themes_issues.model._meta.fields]
#
#                 if geog_scope_local_field_names:
#                     geog_scope_local_field_names[
#                         geog_scope_local_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_subnational_field_names:
#                     geog_scope_subnational_field_names[
#                         geog_scope_subnational_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_regional_field_names:
#                     geog_scope_regional_field_names[
#                         geog_scope_regional_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 # if themes_issues_field_names:
#                 #     themes_issues_field_names[
#                 # themes_issues_field_names.index(
#                 #         'issf_core')] = 'issf_core_id'
#
#                 writer.writerow(
#                     field_names + geog_scope_local_field_names +
#                     geog_scope_subnational_field_names +
#                     geog_scope_regional_field_names)
#
#                 for record, local, subnat, regional in izip_longest(records,
#                                                                     geog_scope_local,
#                                                                     geog_scope_subnational,
#                                                                     geog_scope_regional,
#                                                                     fillvalue=' '):
#
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] + [getattr(local, field, ' ') for
#                                              field in
#                                              geog_scope_local_field_names if
#                                              local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional])
#                     except AttributeError:
#                         pass
#
#             elif filename == 'profile.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#                 species = Species.objects.select_related().filter(
#                     issf_core__in=ids)
#                 orgs = ProfileOrganization.objects.select_related().filter(
#                     ssfprofile__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#                 species_field_names = [field.name for field in
#                                        species.model._meta.fields]
#                 org_field_names = [field.name for field in
#                                    orgs.model._meta.fields]
#
#                 if geog_scope_local_field_names:
#                     geog_scope_local_field_names[
#                         geog_scope_local_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_subnational_field_names:
#                     geog_scope_subnational_field_names[
#                         geog_scope_subnational_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_regional_field_names:
#                     geog_scope_regional_field_names[
#                         geog_scope_regional_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if species_field_names:
#                     species_field_names[species_field_names.index(
#                         'issf_core')] = 'issf_core_id'
#
#                 writer.writerow(
#                     field_names + geog_scope_local_field_names +
#                     geog_scope_subnational_field_names +
#                     geog_scope_regional_field_names + species_field_names +
#                     org_field_names)
#
#                 for record, local, subnat, regional, spec, org in izip_longest(
#                         records, geog_scope_local, geog_scope_subnational,
#                         geog_scope_regional, species, orgs, fillvalue=' '):
#
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] + [getattr(local, field, ' ') for
#                                              field in
#                                              geog_scope_local_field_names if
#                                              local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional] + [
#                                 getattr(spec, field, ' ') for field in
#                                 species_field_names] + [
#                                 getattr(org, field, ' ') for field in
#                                 org_field_names])
#                     except:
#                         pass
#             elif filename == 'state_of_the_art.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#                 # themes_issues = CommonThemeIssueView.objects.select_related(
#                 #
#                 # ).filter(issf_core__in=ids)
#                 # attrs = CommonAttributeView.objects.select_related().filter(
#                 #     issf_core__in=ids)
#                 species = Species.objects.select_related().filter(
#                     issf_core__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#                 # themes_issues_field_names = [field.name for field in
#                 #
#                 # themes_issues.model._meta.fields]
#                 #
#                 # attrs_field_names = [field.name for field in
#                 #                      attrs.model._meta.fields]
#
#                 species_field_names = [field.name for field in
#                                        species.model._meta.fields]
#
#                 if geog_scope_local_field_names:
#                     geog_scope_local_field_names[
#                         geog_scope_local_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_subnational_field_names:
#                     geog_scope_subnational_field_names[
#                         geog_scope_subnational_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_regional_field_names:
#                     geog_scope_regional_field_names[
#                         geog_scope_regional_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 # if attrs_field_names:
#                 #     attrs_field_names[
#                 #         attrs_field_names.index('issf_core')] =
#                 # 'issf_core_id'
#                 # if themes_issues_field_names:
#                 #     themes_issues_field_names[
#                 # themes_issues_field_names.index(
#                 #         'issf_core')] = 'issf_core_id'
#                 if species_field_names:
#                     species_field_names[species_field_names.index(
#                         'issf_core')] = 'issf_core_id'
#
#                 writer.writerow(field_names +  # themes_issues_field_names +
#                                 # attrs_field_names +
#                                 geog_scope_local_field_names +
#                                 geog_scope_subnational_field_names +
#                                 geog_scope_regional_field_names +
#                                 species_field_names)
#
#                 for record, local, subnat, regional, spec in izip_longest(
#                         records,  # themes_issues, attrs,
#                         geog_scope_local, geog_scope_subnational,
#                         geog_scope_regional, species, fillvalue=' '):
#
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] +  # [getattr(ti, field, ' ') for
#                             # field
#                             #                  in themes_issues_field_names] +
#                             # [
#                             #     getattr(attr, field, ' ') for field in
#                             #     attrs_field_names] +
#                             [getattr(local, field, ' ') for field in
#                              geog_scope_local_field_names if local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional] + [
#                                 getattr(spec, field, ' ') for field in
#                                 species_field_names])
#                     except:
#                         pass
#             elif filename == 'whos_who.csv':
#                 records = table.objects.select_related().filter(pk__in=ids)
#                 geog_scope_local = \
#                     GeographicScopeLocalArea.objects.select_related().filter(
#                     issf_core__in=ids)
#                 geog_scope_subnational = \
#                     GeographicScopeSubnation.objects.select_related(
#
#                 ).filter(issf_core__in=ids)
#                 geog_scope_regional = \
#                     Geographic_Scope_Region.objects.select_related().filter(
#                     issf_core__in=ids)
#                 # themes_issues = CommonThemeIssueView.objects.select_related(
#                 #
#                 # ).filter(issf_core__in=ids)
#
#                 field_names = [field.name for field in
#                                records.model._meta.fields]
#
#                 if geog_scope_local:
#                     geog_scope_local_field_names = [field.name for field in
#                                                     geog_scope_local.model._meta.fields]
#                 else:
#                     geog_scope_local_field_names = []
#                 if geog_scope_subnational:
#                     geog_scope_subnational_field_names = [field.name for field
#                                                           in
#                                                           geog_scope_subnational.model._meta.fields]
#                 else:
#                     geog_scope_subnational_field_names = []
#                 if geog_scope_regional:
#                     geog_scope_regional_field_names = [field.name for field in
#                                                        geog_scope_regional.model._meta.fields]
#                 else:
#                     geog_scope_regional_field_names = []
#
#                 # themes_issues_field_names = [field.name for field in
#                 #
#                 # themes_issues.model._meta.fields]
#
#                 if geog_scope_local_field_names:
#                     geog_scope_local_field_names[
#                         geog_scope_local_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_subnational_field_names:
#                     geog_scope_subnational_field_names[
#                         geog_scope_subnational_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 if geog_scope_regional_field_names:
#                     geog_scope_regional_field_names[
#                         geog_scope_regional_field_names.index(
#                             'issf_core')] = 'issf_core_id'
#                 # if themes_issues_field_names:
#                 #     themes_issues_field_names[
#                 # themes_issues_field_names.index(
#                 #         'issf_core')] = 'issf_core_id'
#
#                 writer.writerow(
#                     field_names + geog_scope_local_field_names +
#                     geog_scope_subnational_field_names +
#                     geog_scope_regional_field_names)
#
#                 for record, local, subnat, regional in izip_longest(records,
#                                                                     geog_scope_local,
#                                                                     geog_scope_subnational,
#                                                                     geog_scope_regional,
#                                                                     fillvalue=' '):
#
#                     try:
#                         writer.writerow(
#                             [getattr(record, field, ' ') for field in
#                              field_names] + [getattr(local, field, ' ') for
#                                              field in
#                                              geog_scope_local_field_names if
#                                              local] + [
#                                 getattr(subnat, field, ' ') for field in
#                                 geog_scope_subnational_field_names if
#                                 subnat] + [getattr(regional, field, ' ') for
#                                            field in
#                                            geog_scope_regional_field_names if
#                                            regional])
#                     except AttributeError:
#                         pass
#             else:
#                 writer.writerow(
#                     ['issf_core_id', 'question_number', 'attribute_label',
#                      'value', 'attribute_value', 'units', 'other_value',
#                      'additional', 'additional_value'])
#
#                 main_attrs = table.objects.filter(
#                     issf_core__in=ids).select_related().order_by('issf_core',
#                                                                  'label_order')
#                 for attr in main_attrs:
#                     # have to check if some values are not None, else an error
#                     # will be thrown
#                     writer.writerow(
#                         [attr.issf_core_id, attr.attribute.question_number,
#                          attr.attribute.attribute_label, nstr(attr.value),
#                          # requires an additional check because if
#                          # attribute_value
#                          # is None then it will throw an error
#                          # before the string
#                          # can even be checked
#                          nstr(
#                              attr.attribute_value.value_label) if
#                          attr.attribute_value else '',
#                          attr.attribute.units_label, attr.other_value,
#                          nstr(attr.additional), nstr(attr.additional_value)])
#
#         zip_object.writestr(csvfile.name, string_buffer.getvalue())
