from django import forms
from django.db.models import Q
from django.forms import ModelForm, CheckboxSelectMultiple, Select, CharField
from django.forms.models import formset_factory
from issf_admin.models import UserProfile
from issf_base.models import Country, ISSFCore, ISSF_Core, SelectedAttribute, \
    SelectedThemeIssue, DidYouKnow, FAQ, FAQCategory, WhoFeature, SSFPerson, SSFKnowledge


class SearchForm(forms.Form):
    keywords = forms.CharField(label='Full text')
    # contributor_id=1 is the ISSF Staff account
    existing_contributors = ISSFCore.objects.all().values(
        'contributor')  # .exclude(contributor_id=1)
    # existing_editors = ISSFCore.objects.all().values(
    #     'editor')  # .exclude(editor_id=1)
    contributor_choices = [(u.id, '%s (%s %s %s)' % (
        u.username, u.first_name, u.initials, u.last_name)) for u in
                           UserProfile.objects.filter(
                               Q(id__in=existing_contributors)).order_by(
                               'username')]
    contributor_choices.insert(0, ('', '------------------'))
    contributor = forms.ChoiceField(choices=contributor_choices,
                                    label='Contributor/editor')
    contribution_begin_date = forms.DateField()
    contribution_end_date = forms.DateField()
    # edited_begin_date = forms.DateField()
    # edited_end_date = forms.DateField()
    countries = forms.MultipleChoiceField(
        choices=[(c.country_id, c.short_name) for c in
                 Country.objects.order_by('short_name')],
        help_text='Hold down "Control", or "Command" on a Mac, to select '
                  'more than one.')


# class EconomicThemesIssuesForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['economic_themes_issues']
#         widgets = {'economic_themes_issues': CheckboxSelectMultiple}
#         labels = {'economic_themes_issues': ''}
#
#
# class EcologicalThemesIssuesForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['ecological_themes_issues']
#         widgets = {'ecological_themes_issues': CheckboxSelectMultiple}
#         labels = {'ecological_themes_issues': ''}
#
#
# class SocialCulturalThemesIssuesForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['social_cultural_themes_issues']
#         widgets = {'social_cultural_themes_issues': CheckboxSelectMultiple}
#         labels = {'social_cultural_themes_issues': ''}
#
#
# class GovernanceThemesIssuesForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['governance_themes_issues']
#         widgets = {'governance_themes_issues': CheckboxSelectMultiple}
#         labels = {'governance_themes_issues': ''}


class SelectedAttributeForm(ModelForm):
    class Meta:
        fields = '__all__'
        model = SelectedAttribute
        widgets = {'attribute_value': Select}


class SelectedThemeIssueForm(ModelForm):
    class Meta:
        model = SelectedThemeIssue
        fields = '__all__'
        widgets = {'theme_issue_value': Select}


class TipForm(ModelForm):
    fact = forms.CharField()

    class Meta:
        model = DidYouKnow
        fields = '__all__'


class FAQForm(ModelForm):
    # faq_category = forms.ModelChoiceField(queryset=FAQCategory.objects.all())

    class Meta:
        model = FAQ
        fields = '__all__'


class WhosWhoForm(ModelForm):
    name = forms.CharField()
    about = forms.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super(WhosWhoForm, self).__init__(*args, **kwargs)
        self.fields['ssf_person'].queryset = SSFPerson.objects.all().order_by('contributor__last_name',
                                                                              'contributor__first_name')
        self.fields['ssf_knowledge'].queryset = SSFKnowledge.objects.all().order_by('level2_title', 'level1_title')

    class Meta:
        model = WhoFeature
        fields = '__all__'
        labels = {'ssf_person': 'Who\'s Who Page', 'ssf_knowledge': 'Select Publication'}
        widgets = {'ssf_knowledge': Select(attrs={'id': 'sota-select'}),
                   'ssf_person': Select(attrs={'id': 'who-select'})}


class GeoJSONUploadForm(forms.Form):
    file = forms.FileField(required=False)


SelectedAttributesFormSet = formset_factory(SelectedAttributeForm, extra=1)
SelectedThemesIssuesFormSet = formset_factory(SelectedThemeIssueForm, extra=1)

# class SsftermCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['ssfterm_characteristics']
#         widgets = {'ssfterm_characteristics': CheckboxSelectMultiple}
#         labels = {'ssfterm_characteristics': 'Term(s) used to describe
# small-scale fisheries'}
#
#
# class FisherytypeCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['fisherytype_characteristics']
#         widgets = {'fisherytype_characteristics': CheckboxSelectMultiple}
#         labels = {'fisherytype_characteristics': ''}
#
#
# class GeartypeCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['geartype_characteristics']
#         widgets = {'geartype_characteristics': CheckboxSelectMultiple}
#         labels = {'geartype_characteristics': ''}
#
#
# class EcosystemHighlevelCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['ecosystem_highlevel_characteristics']
#         widgets = {'ecosystem_highlevel_characteristics':
# CheckboxSelectMultiple}
#         labels = {'ecosystem_highlevel_characteristics': ''}
#
#
# class EcosystemDetailedCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['ecosystem_detailed_characteristics']
#         widgets = {'ecosystem_detailed_characteristics':
# CheckboxSelectMultiple}
#         labels = {'ecosystem_detailed_characteristics': ''}
#
#
# class MarketCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['market_characteristics']
#         widgets = {'market_characteristics': CheckboxSelectMultiple}
#         labels = {'market_characteristics': ''}
#
#
# class GovernanceCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['governance_characteristics']
#         widgets = {'governance_characteristics': CheckboxSelectMultiple}
#         labels = {'governance_characteristics': ''}
#
#
# class ManagementCharacteristicsForm(ModelForm):
#     class Meta:
#         model = ISSF_Core
#         fields = ['management_characteristics']
#         widgets = {'management_characteristics': CheckboxSelectMultiple}
#         labels = {'management_characteristics': ''}
