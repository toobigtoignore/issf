from django import forms
from django.forms import ModelForm, CheckboxSelectMultiple, RadioSelect, \
    HiddenInput, TextInput, SelectMultiple
from django.forms.models import inlineformset_factory, formset_factory
from leaflet.forms.widgets import LeafletWidget
# replace * with specific references
from issf_base.models import *


class ISSFMapWidget(LeafletWidget):
    geometry_field_class = 'ISSFGeometryField'


# django "generated" forms
class SSFKnowledgeForm(ModelForm):
    class Meta:
        model = SSFKnowledge
        fields = ['publication_type', 'other_publication_type', 'level1_title',
                  'level2_title', 'nonenglish_language', 'nonenglish_title',
                  'year', 'contributor', ]
        labels = {
            'publication_type': '*Publication type', 'level1_title':
                '*Journal/book/report/newsletter/conference',
            'level2_title': '*Article/chapter/item title',
            'nonenglish_language': 'If the study was published in a language '
                                   'other than English, '
                                   'please specify', 'nonenglish_title': 'Title in original language', 'year': '*Year',
            'contributor': '*Contributor (note: this is the only person, other than ISSF staff, '
                           'who can edit the record)', }
        widgets = {
            'level1_title': forms.Textarea(
                attrs={'rows': 3}), 'level2_title': forms.Textarea(
                attrs={'rows': 3}), 'nonenglish_title': forms.Textarea(
                attrs={'rows': 3}), }

    # # override __init__ to set readonly fields (may be a better place to
    # do this)
    # def __init__(self, *args, **kwargs):
    # super(SSFKnowledgeForm, self).__init__(*args, **kwargs)
    # self.fields['core_record_type'].widget.attrs['readonly'] = True

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(SSFKnowledgeForm, self).clean()
        # make safe text entered by user

        # other publication type and text must be provided in combination
        other_text = False
        if len(cleaned_data['other_publication_type']) > 0:
            other_text = True
        other_selected = False
        if cleaned_data.has_key('publication_type'):
            if cleaned_data[
                'publication_type'].publication_type == 'Other (specify)':
                other_selected = True
                # if other_text and not other_selected:
        # raise forms.ValidationError('Other publication type requires Other
        #  to be checked.')
        # could auto-set checkbox
        if not other_text and other_selected:
            raise forms.ValidationError(
                'Please specify other publication type, or uncheck '
                'Other.')
        return cleaned_data


class SSFPersonForm(ModelForm):
    class Meta:
        model = SSFPerson
        fields = ['affiliation', 'address1', 'address2', 'city_town',
                  'prov_state', 'postal_code', 'country', 'person_point',
                  'url', 'organizations', 'contributor', 'img_url']
        labels = {
            'affiliation': 'Primary institutional/organizational '
                           'affiliation', 'address1': 'Address', 'address2':
                'Address', 'city_town': 'City/town', 'prov_state':
                'Province/state', 'person_point': 'Address location (use the '
                                                  'draw, edit and delete '
                                                  'controls to '
                                                  'set/modify)',
            'url': 'Please include a link to your homepage or online profile (Google Scholar, '
                   'LinkedIn, etc.)',
            'organizations': 'Select all SSF Organizations/Networks/Associations that you are a '
                             'member of (use Contribute to add)',
            'contributor': '*Contributor (note: this is the only person, other than ISSF staff, '
                           'who can edit the record)', 'img_url': 'Your picture (direct links only)'}
        help_texts = {
            'organizations': 'Hold down "Control", or "Command" on a Mac, '
                             'to select more than '
                             'one.', }
        widgets = {
            'person_point': ISSFMapWidget(), 'contributor':
                forms.widgets.HiddenInput, }


class SSFOrganizationForm(ModelForm):
    # organization_point = PointField()
    class Meta:
        model = SSFOrganization
        fields = (
            'organization_name', 'year_established', 'organization_type_union',
            'organization_type_support', 'organization_type_coop',
            'organization_type_flag', 'organization_type_other',
            'organization_type_other_text', 'ssf_defined', 'ssf_definition',
            'motivation_voice', 'motivation_market',
            'motivation_sustainability', 'motivation_economics',
            'motivation_rights', 'motivation_collaboration',
            'motivation_other', 'motivation_other_text', 'mission',
            'activities_capacity', 'activities_sustainability',
            'activities_networking', 'activities_marketing',
            'activities_collaboration', 'activities_other',
            'activities_other_text', 'network_types_state',
            'network_types_ssfos', 'network_types_community',
            'network_types_society', 'network_types_ngos',
            'network_types_other', 'network_types_other_text', 'achievements',
            'success_factors', 'obstacles', 'address1', 'address2',
            'city_town', 'prov_state', 'postal_code', 'country',
            'organization_point', 'contributor',)
        labels = {
            'organization_name': '*Organization name', 'address1':
                'Address', 'address2': 'Address', 'city_town': 'City/town',
            'prov_state': 'Province/state', 'organization_point': 'Address '
                                                                  'location '
                                                                  '(use the '
                                                                  'draw, '
                                                                  'edit and '
                                                                  'delete '
                                                                  'controls '
                                                                  'to '
                                                                  'set/modify)',
            'contributor': '*Contributor (note: this is the only person, other than ISSF staff, '
                           'who can edit the record)', }
        widgets = {
            'organization_point': ISSFMapWidget(), 'ssf_definition':
                forms.Textarea(
                    attrs={'rows': 3}), 'mission': forms.Textarea(
                attrs={'rows': 3}), 'achievements': forms.Textarea(
                attrs={'rows': 3}), 'success_factors': forms.Textarea(
                attrs={'rows': 3}), 'obstacles': forms.Textarea(
                attrs={'rows': 3}), }

    def clean(self):
        cleaned_data = super(SSFOrganizationForm, self).clean()

        if 'ssf_defined' in cleaned_data:
            if cleaned_data['ssf_defined'] == 'Yes' and not cleaned_data[
                'ssf_definition']:
                raise forms.ValidationError('Please provide an SSF defintion.')

        if not confirm_other_text('organization_type_other_text',
                                  'organization_type_other', cleaned_data):
            raise forms.ValidationError(
                'Please specify Other organization type, or uncheck Other.')

        if not confirm_other_text('motivation_other_text', 'motivation_other',
                                  cleaned_data):
            raise forms.ValidationError(
                'Please specify Other motivation/goal, or uncheck Other.')

        if not confirm_other_text('activities_other_text', 'activities_other',
                                  cleaned_data):
            raise forms.ValidationError(
                'Please specify Other activity, or uncheck Other.')

        if not confirm_other_text('network_types_other_text',
                                  'network_types_other', cleaned_data):
            raise forms.ValidationError(
                'Please specify Other networks/partnerships/collaborations, '
                'or uncheck Other.')

        return cleaned_data


class SSFCapacityNeedForm(ModelForm):
    class Meta:
        model = SSFCapacityNeed
        fields = ['capacity_need_category', 'capacity_need_type',
                  'capacity_need_title', 'capacity_need_description',
                  'contributor', ]
        labels = {
            'capacity_need_category': '*Category', 'capacity_need_type':
                '*Type', 'capacity_need_title': '*Short title',
            'capacity_need_description': '*Description', 'contributor':
                '*Contributor (note: this is the only person, other than '
                'ISSF staff, '
                'who can edit the record)', }
        widgets = {
            'capacity_need_description': forms.Textarea(attrs={'rows': 3}), }


class SSFProfileForm(ModelForm):
    class Meta:
        model = SSFProfile
        fields = ['ssf_name', 'ssf_defined', 'ssf_definition', 'data_year',
                  # 'data_month',
                  # 'data_day',
                  'data_end_year',  # 'data_end_month',
                  # 'data_end_day',
                  'sources', 'comments', 'contributor', 'img_url']
        widgets = {
            'data_year': forms.NumberInput(attrs={'placeholder': 'Year'}),
            # 'data_month': forms.NumberInput(attrs={'placeholder': 'Month'}),
            # 'data_day': forms.NumberInput(attrs={'placeholder': 'Day'}),
            'data_end_year': forms.NumberInput(attrs={'placeholder': 'Year'}),
            # 'data_end_month': forms.NumberInput(attrs={'placeholder':
            # 'Month'}),
            # 'data_end_day': forms.NumberInput(attrs={'placeholder': 'Day'}),
            'ssf_definition': forms.Textarea(
                attrs={'rows': 3}), 'comments': forms.Textarea(
                attrs={'rows': 3}), 'sources': forms.Textarea(
                attrs={'rows': 3}), }

        labels = {
            'ssf_name': '1A. *Name of fishery', 'ssf_defined': '4B. *SSF '
                                                               'defined?',
            'ssf_definition': 'SSF Definition (if applicable)', 'sources':
                'Sources', 'comments': 'Comments', 'description':
                'Description/history of the fishery', 'contributor':
                '*Contributor (note: this is the only person, other than '
                'ISSF staff, '
                'who can edit the record)',
            'img_url': 'Image URL (direct links only)'
        }

    def clean(self):
        cleaned_data = super(SSFProfileForm, self).clean()
        return cleaned_data


class SSFGuidelinesForm(ModelForm):
    class Meta:
        model = SSFGuidelines
        fields = ['title', 'activity_type', 'activity_coverage', 'location',
                  'start_day', 'start_month', 'start_year', 'end_day',
                  'end_month', 'end_year', 'ongoing', 'organizer', 'purpose',
                  'link', 'contributor']

        widgets = {'purpose': forms.Textarea(attrs={'rows': 3})}

        labels = {
            'contributor': '*Contributor (note: this is the only person, '
                           'other than ISSF staff, '
                           'who can edit the record)', 'title': '*Title',
            'activity_type': '*Activity type', 'activity_coverage':
                '*Activity coverage', 'location': '*Location', 'start_year':
                '*Year', 'start_month': 'Month', 'start_day': 'Day',
            'end_year': 'Year', 'end_month': 'Month', 'end_day': 'Day',
            'ongoing': '*Ongoing?', 'organizer': '*Organizer', 'purpose':
                '*Purpose'
        }


class SSFExperiencesForm(ModelForm):
    class Meta:
        model = SSFExperiences
        fields = ['name', 'title', 'video_url', 'vimeo_video_url', 'description', 'img_url', 'contributor']
        labels = {'name': '*Presenter name', 'title': 'Video title',
                  'video_url': 'YouTube video URL (no shortened links)',
                  'description': '*Describe the experience',
                  'img_url': 'Image URL (direct links only)',
                  'contributor': '*Contributor (note: this is the only person, '
                                 'other than ISSF staff, '
                                 'who can edit the record)', 'vimeo_video_url': 'Vimeo video URL (no shortened links)'}


class SSFCaseStudiesForm(ModelForm):
    class Meta:
        model = SSFCaseStudies
        fields = ['name', 'role', 'description_area', 'description_fishery', 'description_issues', 'issues_challenges',
                  'stakeholders', 'transdisciplinary', 'background_context', 'activities_innovation', 'contributor']
        labels = {'name': '*Case study name', 'role': '*Your role in the case study',
                  'description_area': '*Describe case study area',
                  'description_fishery': '*Describe case study fishery',
                  'description_issues': '*Describe case study issues', 'major_issues': '*Major issues',
                  'stakeholders': '*Stakeholders involved',
                  'issues_challenges': '*Issues addressed?/Remaining challenges',
                  'transdisciplinary': '*Was the transdisciplinary perspective applied? Explain how.',
                  'background_context': '*Background and context',
                  'activities_innovation': '*Key activities/innovation',
                  'contributor': '*Contributor (note: this is the only person, '
                                 'other than ISSF staff, '
                                 'who can edit the record)'}
        widgets = {
            'description_area': forms.Textarea(attrs={'rows': 4}),
            'description_fishery': forms.Textarea(attrs={'rows': 4}),
            'description_issues': forms.Textarea(attrs={'rows': 4}),
            'stakeholders': forms.Textarea(attrs={'rows': 4}),
            'issues_challenges': forms.Textarea(attrs={'rows': 4}),
            'transdisciplinary': forms.Textarea(attrs={'rows': 4}),
            'background_context': forms.Textarea(attrs={'rows': 4}),
            'activities_innovation': forms.Textarea(attrs={'rows': 4}),
        }


class CapacityNeedRatingForm(ModelForm):
    class Meta:
        fields = '__all__'
        model = CapacityNeedRating
        labels = {
            'rating': '*Your rating'
        }
        widgets = {
            'capacity_need': HiddenInput, 'rater': HiddenInput
            # 'rating': TextInput(attrs={'type':'range', 'min':'1',
            # 'max':'5', 'step':'1'})
        }

    def clean(self):
        cleaned_data = super(CapacityNeedRatingForm, self).clean()
        if cleaned_data['rating'] == 0:
            raise forms.ValidationError(
                'Please select a rating between 1 and 5')


class MainAttributeForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(MainAttributeForm, self).__init__(*args, **kwargs)
        if len(self.initial) > 0:
            self.fields['attribute_value'] = forms.ModelChoiceField(label='',
                                                                    required=False,
                                                                    queryset=AttributeValue.objects.filter(
                                                                        attribute=
                                                                        self.initial[
                                                                            'attribute']))
            self.fields['additional_value'] = forms.ModelChoiceField(label='',
                                                                     required=False,
                                                                     queryset=AdditionalValue.objects.filter(
                                                                         attribute=
                                                                         self.initial[
                                                                             'attribute']))
            self.fields['value'].widget.attrs[
                'placeholder'] = self.instance.attribute.units_label
            self.fields['additional'].widget.attrs[
                'placeholder'] = self.instance.attribute.additional_field

    class Meta:
        model = MainAttributeView
        fields = '__all__'
        widgets = {
            'attribute': HiddenInput, 'row_number': HiddenInput,
            'selected_attribute_id': HiddenInput, 'issf_core': HiddenInput,
            'other_value': HiddenInput,
            # 'additional': HiddenInput,
            # 'additional_value': HiddenInput,
        }

    def clean(self):
        cleaned_data = super(MainAttributeForm, self).clean()

        if not cleaned_data['value'] and not cleaned_data['attribute_value']:
            # if a user provided an additional value but no attribute
            if cleaned_data['additional'] or cleaned_data['additional_value']:
                raise forms.ValidationError(
                    'Please provide a value for the attribute.')
            else:
                # if a field has no data, mark it for deletion
                cleaned_data['DELETE'] = True

        # if a user selected "Other" but didn't provide a value
        # have to use this if-chain to avoid a rare bug where django would
        # throw a key-error
        if 'attribute_value' in cleaned_data and str(cleaned_data[
                                                         'attribute_value']) \
                == 'Other' and 'other_value' in cleaned_data and str(
            cleaned_data['other_value']) == '':
            raise forms.ValidationError('Please provide a value for Other. ')

        return cleaned_data


class CommonThemeIssueForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(CommonThemeIssueForm, self).__init__(*args, **kwargs)
        if len(self.initial) > 0:
            self.fields['theme_issue_value'] = forms.ModelChoiceField(label='',
                                                                      required=False,
                                                                      queryset=Theme_Issue_Value.objects.filter(
                                                                          theme_issue=
                                                                          self.initial[

                                                                              'theme_issue']))

    class Meta:
        model = CommonThemeIssueView
        fields = '__all__'
        widgets = {
            'theme_issue': HiddenInput, 'row_number': HiddenInput,
            'selected_theme_issue_id': HiddenInput, 'issf_core':
                HiddenInput, 'other_theme_issue': HiddenInput, }

    def clean(self):
        cleaned_data = super(CommonThemeIssueForm, self).clean()

        # if a field has no data, mark it for deletion
        if not cleaned_data['theme_issue_value']:
            cleaned_data['DELETE'] = True

        # if a user selected "Other" but didn't provide a value
        if str(cleaned_data['theme_issue_value']) == 'Other' and str(
                cleaned_data['other_theme_issue']) == '':
            raise forms.ValidationError('Please provide a value for Other. ')

        return cleaned_data


# class ThemesIssuesForm(ModelForm):
# other_economic_theme_issue = forms.CharField(required=False,
# label='Other economic theme/issue')
# other_ecological_theme_issue = forms.CharField(required=False,
# label='Other ecological theme/issue')
# other_social_cultural_theme_issue = forms.CharField(required=False,
# label='Other social/cultural
# theme/issue')
# other_governance_theme_issue = forms.CharField(required=False,
# label='Other governance theme/issue')
#
# class Meta:
# model = ISSF_Core
# fields = [
# 'core_record_type',
# 'economic_themes_issues',
# 'other_economic_theme_issue',
# 'ecological_themes_issues',
# 'other_ecological_theme_issue',
# 'social_cultural_themes_issues',
# 'other_social_cultural_theme_issue',
# 'governance_themes_issues',
# 'other_governance_theme_issue'
# ]
# widgets = {
#             'core_record_type': HiddenInput,
#             'economic_themes_issues': CheckboxSelectMultiple,
#             'ecological_themes_issues': CheckboxSelectMultiple,
#             'social_cultural_themes_issues': CheckboxSelectMultiple,
#             'governance_themes_issues': CheckboxSelectMultiple,
#         }
#         labels = {
#             'core_record_type': 'Record type',
#             'economic_themes_issues': 'Economic themes/issues (check all
# that apply)',
#             'ecological_themes_issues': 'Ecological themes/issues (check
# all that apply)',
#             'social_cultural_themes_issues': 'Social/Cultural
# themes/issues (check all that '
#                                              'apply)',
#             'governance_themes_issues': 'Governance themes/issues (check
# all that apply)',
#         }
#
#     # probably don't need to set to readonly because widget is now hidden
#     def __init__(self, *args, **kwargs):
#         super(ThemesIssuesForm, self).__init__(*args, **kwargs)
#         self.fields['core_record_type'].widget.attrs['readonly'] = True
#
#     def check_other(self, cleaned_data, other_field, checks_field, category):
#         other_text = False
#         if len(cleaned_data[other_field]) > 0:
#             other_text = True
#         other_check = False
#         if cleaned_data[checks_field]._result_cache:
#             for theme_issue in cleaned_data[checks_field]._result_cache:
#                 if theme_issue.theme_issue_label == 'Other':
#                     other_check = True
#         # if other_text and not other_check:
#         # raise forms.ValidationError('Other ' + category + ' theme/issue
# requires Other to be
#         # checked.') # could auto-set checkbox
#         if not other_text and other_check:
#             raise forms.ValidationError(
#                 'Please specify other ' + category + ' theme/issue,
# or uncheck Other.')
#
#     # override clean to check combinations of fields
#     def clean(self):
#         cleaned_data = super(ThemesIssuesForm, self).clean()
#         # other check and text must be provided in combination
#         self.check_other(cleaned_data, 'other_economic_theme_issue',
# 'economic_themes_issues',
#                          'economic')
#         self.check_other(cleaned_data, 'other_ecological_theme_issue',
# 'ecological_themes_issues',
#                          'ecological')
#         self.check_other(cleaned_data, 'other_social_cultural_theme_issue',
#                          'social_cultural_themes_issues', 'social/cultural')
#         self.check_other(cleaned_data, 'other_governance_theme_issue',
# 'governance_themes_issues',
#                          'governance')
#         return cleaned_data


class ProfileOrganizationForm(ModelForm):
    class Meta:
        model = ProfileOrganization
        fields = '__all__'
        labels = {
            'ssforganization': 'SSF Organization already in ISSF',
            'organization_name': 'Other organization name',
            'organization_type': 'Other organization type',
            'geographic_scope': 'Other organization geographic scope', }

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(ProfileOrganizationForm, self).clean()
        # either select organizaton or type a name
        if not cleaned_data['ssforganization'] and not cleaned_data[
            'organization_name']:
            raise forms.ValidationError(
                'Please select or name an organization.')
        if cleaned_data['ssforganization'] and cleaned_data[
            'organization_name']:
            raise forms.ValidationError(
                'Please select or name an organization, but not both.')
        if cleaned_data['organization_name'] and not cleaned_data[
            'organization_type']:
            raise forms.ValidationError('Please select an organization type.')
        if cleaned_data['organization_name'] and not cleaned_data[
            'geographic_scope']:
            raise forms.ValidationError('Please select a geographic scope.')
        return cleaned_data


# class CharacteristicsForm(ModelForm):
# other_ssfterm = forms.CharField(required=False, label='Other SSF term')
# other_fisherytype = forms.CharField(required=False, label='Other fishery
# type')
# other_geartype = forms.CharField(required=False, label='Other gear type')
# other_ecosystem_detailed = forms.CharField(required=False,
# label='Other detailed ecosystem type')
# other_market = forms.CharField(required=False, label='Other market channel')
# other_governance = forms.CharField(required=False, label='Other governance
#  system')
# other_management = forms.CharField(required=False, label='Other management
#  instrument')
#
# class Meta:
# model = ISSF_Core
# fields = [
# 'core_record_type',
# 'ssfterm_characteristics',
# 'other_ssfterm',
# 'fisherytype_characteristics',
#             'other_fisherytype',
#             'geartype_characteristics',
#             'other_geartype',
#             'ecosystem_highlevel_characteristics',
#             'ecosystem_detailed_characteristics',
#             'other_ecosystem_detailed',
#             'market_characteristics',
#             'other_market',
#             'governance_characteristics',
#             'other_governance',
#             'management_characteristics',
#             'other_management'
#         ]
#         widgets = {
#             'core_record_type': HiddenInput,
#             'ssfterm_characteristics': CheckboxSelectMultiple,
#             'fisherytype_characteristics': CheckboxSelectMultiple,
#             'geartype_characteristics': CheckboxSelectMultiple,
#             'ecosystem_highlevel_characteristics': CheckboxSelectMultiple,
#             'ecosystem_detailed_characteristics': CheckboxSelectMultiple,
#             'market_characteristics': CheckboxSelectMultiple,
#             'governance_characteristics': CheckboxSelectMultiple,
#             'management_characteristics': CheckboxSelectMultiple,
#         }
#         labels = {
#             'core_record_type': 'Record type',
#             'ssfterm_characteristics': 'What term is used to describe
# small-scale fisheries ('
#                                        'check all that apply)?',
#             'fisherytype_characteristics': 'Type(s) of fishery (check all
# that apply)',
#             'geartype_characteristics': 'Main gear type(s) (check all that
#  apply)',
#             'ecosystem_highlevel_characteristics': 'Ecosystem high-level
# type(s) (check all
# that '
#                                                    'apply)',
#             'ecosystem_detailed_characteristics': 'Ecosystem detailed
# type(s) (check all that '
#                                                   'apply)',
#             'market_characteristics': 'Market channel(s) used by
# small-scale fisheries (check
# all '
#                                       'that apply):',
#             'governance_characteristics': 'Governance system(s) in
# small-scale fisheries (check '
#                                           'all that apply)',
#             'management_characteristics': 'Management instruments(s) in
# small-scale fisheries ('
#                                           'check all that apply):',
#         }
#
#     # probably don't need to set to readonly because widget is now hidden
#     def __init__(self, *args, **kwargs):
#         super(CharacteristicsForm, self).__init__(*args, **kwargs)
#         self.fields['core_record_type'].widget.attrs['readonly'] = True
#
#     def check_other(self, cleaned_data, other_field, checks_field, category):
#         other_text = False
#         if len(cleaned_data[other_field]) > 0:
#             other_text = True
#         other_check = False
#         if cleaned_data[checks_field]._result_cache:
#             for characteristic in cleaned_data[checks_field]._result_cache:
#                 if characteristic.characteristic_label == 'Other':
#                     other_check = True
#         # if other_text and not other_check:
#         # raise forms.ValidationError(
#         # 'Other ' + category + ' requires Other to be check.')  # could
# auto-set checkbox
#         if not other_text and other_check:
#             raise forms.ValidationError('Please specify other ' + category
#  + ', or uncheck '
#
#    'Other.')
#
#     # override clean to check combinations of fields
#     def clean(self):
#         cleaned_data = super(CharacteristicsForm, self).clean()
#         # other check and text must be provided in combination
#         self.check_other(cleaned_data, 'other_ssfterm',
# 'ssfterm_characteristics', 'SSF term')
#         self.check_other(cleaned_data, 'other_fisherytype',
# 'fisherytype_characteristics',
#                          'fishery type')
#         self.check_other(cleaned_data, 'other_geartype',
# 'geartype_characteristics', 'gear type')
#         self.check_other(cleaned_data, 'other_ecosystem_detailed',
#                          'ecosystem_detailed_characteristics', 'ecosystem
# detailed term')
#         self.check_other(cleaned_data, 'other_market',
# 'market_characteristics',
# 'market channel')
#         self.check_other(cleaned_data, 'other_governance',
# 'governance_characteristics',
#                          'governance system')
#         self.check_other(cleaned_data, 'other_management',
# 'management_characteristics',
#                          'management instrument')
#         return cleaned_data


class CommonAttributeForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(CommonAttributeForm, self).__init__(*args, **kwargs)
        if len(self.initial) > 0:
            self.fields['attribute_value'] = forms.ModelChoiceField(label='',
                                                                    required=False,
                                                                    queryset=AttributeValue.objects.filter(
                                                                        attribute=
                                                                        self.initial[
                                                                            'attribute']))

    class Meta:
        model = CommonAttributeView
        fields = '__all__'
        widgets = {
            'attribute': HiddenInput, 'row_number': HiddenInput,
            'selected_attribute_id': HiddenInput, 'issf_core': HiddenInput,
            'other_value': HiddenInput, }

    def clean(self):
        cleaned_data = super(CommonAttributeForm, self).clean()

        # if a field has no data, mark it for deletion
        if not cleaned_data['attribute_value']:
            cleaned_data['DELETE'] = True

        # if a user selected "Other" but didn't provide a value
        if str(cleaned_data['attribute_value']) == 'Other' and str(
                cleaned_data['other_value']) == '':
            raise forms.ValidationError('Please provide a value for Other. ')

        return cleaned_data


class KnowledgeOtherDetailsForm(ModelForm):
    class Meta:
        # model = KnowledgeOtherDetails
        model = SSFKnowledge
        fields = ['core_record_type', 'demographics_na', 'demographics_age',
                  'demographics_education', 'demographics_ethnicity',
                  'demographics_gender', 'demographics_health',
                  'demographics_income', 'demographics_religion',
                  'demographics_unspecified', 'demographics_other',
                  'demographics_other_text', 'demographic_details',
                  'employment_na', 'employment_full_time',
                  'employment_part_time', 'employment_seasonal',
                  'employment_unspecified', 'employment_details', 'stage_na',
                  'stage_pre_harvest', 'stage_harvest', 'stage_post_harvest',
                  'stage_unspecified', 'ssf_defined', 'ssf_definition',
                  'lsf_considered', 'research_method', 'aim_purpose_question',
                  'solutions_offered', 'solution_details',
                  'explicit_implications_recommendations',
                  'implication_details', 'comments']
        labels = {
            'core_record_type': 'Record type', 'demographics_na': 'Not '
                                                                  'applicable', 'demographics_age': 'Age',
            'demographics_education': 'Education', 'demographics_ethnicity': 'Ethnicity',
            'demographics_gender': 'Gender', 'demographics_health': 'Health', 'demographics_income': 'Income',
            'demographics_religion': 'Religion', 'demographics_unspecified': 'Unspecified',
            'demographics_other': 'Other', 'demographics_other_text': 'Other demographic factor',
            'demographic_details': 'Demographic details (if applicable)', 'employment_na': 'Not applicable',
            'employment_full_time': 'Full-time', 'employment_part_time': 'Part-time', 'employment_seasonal': 'Seasonal',
            'employment_unspecified': 'Unspecified', 'employment_details': 'Employment details (if applicable)',
            'stage_na': 'Not applicable', 'stage_pre_harvest': 'Pre-harvest', 'stage_harvest': 'Harvest',
            'stage_post_harvest': 'Post-harvest', 'stage_unspecified': 'Unspecified',
            'ssf_defined': '*Are small-scale fisheries defined?',
            'ssf_definition': 'Provide definition of small-scale fisheries (if applicable)',
            'lsf_considered': '*Are large-scale fisheries also considered?',
            'research_method': 'Research method(s) or approach(es) applied in the study (e.g. '
                               'ethnographic, survey, etc.)',
            'aim_purpose_question': '*What is the overall aim(s)/purpose or research question '
                                    'addressed in the study?',
            'solutions_offered': '*Does the study offer solutions to the above issues (select '
                                 'one)? (Please note: Solutions are regarded as central topics '
                                 'that were elaborated or justified throughout the article in '
                                 'repsonse to certain issues, rather than recommendations tacked '
                                 'on at the end of the article)',
            'solution_details': 'Please provide details about the solutions identified in the '
                                'study (if applicable)',
            'explicit_implications_recommendations': '*Are research implications and/or policy '
                                                     'recommendations made explicit?',
            'implication_details': 'Please provide details about the research implications '
                                   'identified in the study (if applicable)',
            'comments': 'Additional details/comments', }
        widgets = {
            'core_record_type': forms.widgets.HiddenInput, 'ssf_definition':
                forms.Textarea(
                    attrs={'rows': 3}), 'research_method': forms.Textarea(
                attrs={'rows': 3}), 'aim_purpose_question': forms.Textarea(
                attrs={'rows': 3}), 'solution_details': forms.Textarea(
                attrs={'rows': 3}), 'implication_details': forms.Textarea(
                attrs={'rows': 3}), 'comments': forms.Textarea(
                attrs={'rows': 3}), 'fishery_type_details': forms.Textarea(
                attrs={'rows': 3}), 'gear_type_details': forms.Textarea(
                attrs={'rows': 3}), 'ecosystem_type_details': forms.Textarea(
                attrs={'rows': 3}), 'market_details': forms.Textarea(
                attrs={'rows': 3}), 'governance_details': forms.Textarea(
                attrs={'rows': 3}), 'management_details': forms.Textarea(
                attrs={'rows': 3}), 'theme_issue_details': forms.Textarea(
                attrs={'rows': 3}), 'demographic_details': forms.Textarea(
                attrs={'rows': 3}), 'employment_details': forms.Textarea(
                attrs={'rows': 3}), }

    def __init__(self, *args, **kwargs):
        super(KnowledgeOtherDetailsForm, self).__init__(*args, **kwargs)
        # self.fields['research_method'].required = True
        self.fields['ssf_defined'].required = True

    def clean(self):
        cleaned_data = super(KnowledgeOtherDetailsForm, self).clean()

        if 'ssf_defined' in cleaned_data:
            if cleaned_data['ssf_defined'] == 'Yes' and not cleaned_data[
                'ssf_definition']:
                raise forms.ValidationError('Please provide an SSF defintion.')

        # if (not cleaned_data['method_specify_qualitative'] and
        # not cleaned_data['method_specify_quantitative'] and
        # not cleaned_data['method_specify_mixed']):
        # raise forms.ValidationError('Please select at least one method
        # approach (
        # qualitative, quantitative, mixed).')

        if (not cleaned_data['demographics_na'] and not cleaned_data[
            'demographics_age'] and not cleaned_data[
            'demographics_education'] and not cleaned_data[
            'demographics_ethnicity'] and not cleaned_data[
            'demographics_gender'] and not cleaned_data[
            'demographics_health'] and not cleaned_data[
            'demographics_income'] and not cleaned_data[
            'demographics_unspecified'] and not cleaned_data[
            'demographics_other']):
            raise forms.ValidationError(
                'Please select at least one demographic factor.')

        if (not cleaned_data['employment_na'] and not cleaned_data[
            'employment_full_time'] and not cleaned_data[
            'employment_part_time'] and not cleaned_data[
            'employment_seasonal'] and not cleaned_data[
            'employment_unspecified']):
            raise forms.ValidationError(
                'Please select at least one employment status.')

        if (not cleaned_data['stage_na'] and not cleaned_data[
            'stage_pre_harvest'] and not cleaned_data['stage_harvest'] and not
        cleaned_data['stage_post_harvest'] and not cleaned_data[
            'stage_unspecified']):
            raise forms.ValidationError(
                'Please select at least one stage of the fishery chain.')

        if not confirm_other_text('demographics_other_text',
                                  'demographics_other', cleaned_data):
            raise forms.ValidationError(
                'Please specify Other demographic factor, or uncheck Other.')

        # if not confirm_other_text('other_research_method',
        # 'research_method', cleaned_data):
        # raise forms.ValidationError('Please specify Other research method,
        #  or uncheck
        # Other.')

        return cleaned_data


class KnowledgeAuthorsSimpleForm(ModelForm):
    class Meta:
        model = KnowledgeAuthorSimple
        fields = '__all__'
        labels = {
            'author_name': '*Author'
        }


class PersonResearcherForm(ModelForm):
    class Meta:
        model = SSFPerson
        fields = ['core_record_type', 'is_researcher', 'number_publications',
                  'education_level', 'other_education_level',
                  'research_method', 'issues_addressed']
        labels = {
            'core_record_type': 'Record type', 'is_researcher': 'Are you a '
                                                                'SSF '
                                                                'researcher?',
            'number_publications': 'Number of publications in the last 10 years',
            'education_level': 'Highest level of education', 'other_education_level': 'Other level of education',
            'research_method': 'Research method(s) or approach(es) most commonly applied (e.g. '
                               'ethnographic, survey, etc.)',
            'issues_addressed': 'List up three main issues your research aims to address', }
        widgets = {
            'core_record_type': forms.widgets.HiddenInput,
            'research_method': forms.Textarea(
                attrs={'rows': 3}), 'issues_addressed': forms.Textarea(
                attrs={'rows': 3}), }

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(PersonResearcherForm, self).clean()
        # other level of education and text must be provided in combination
        other_text = False
        if len(cleaned_data['other_education_level']) > 0:
            other_text = True
        other_selected = False
        if cleaned_data.has_key('education_level'):
            if cleaned_data['education_level'] == 'Other':
                other_selected = True
        if not other_text and other_selected:
            raise forms.ValidationError(
                'Please specify other education level, or uncheck Other.')
        return cleaned_data


class ExternalLinkForm(ModelForm):
    class Meta:
        model = ExternalLink
        fields = '__all__'
        labels = {
            'link_type': '*Link type', 'link_address': '*Link address'
        }


class GeographicScopeForm(ModelForm):
    class Meta:
        model = ISSF_Core
        fields = ['geographic_scope_type']
        labels = {
            'geographic_scope_type': '*Geographic scope'
        }
        widgets = {
            'geographic_scope_type': RadioSelect
        }


class GeographicScopeLocalAreaForm(ModelForm):
    class Meta:
        model = GeographicScopeLocalArea
        fields = '__all__'
        labels = {
            'local_area_name': '*Name of local area',
            'local_area_alternate_name': 'Alternate name', 'country':
                '*Specify country for local area', 'local_area_setting':
                '*Local area setting', 'local_area_setting_other': 'Other '
                                                                   'local '
                                                                   'area '
                                                                   'setting',
            'local_area_point': 'Local area location (use the draw, edit and delete controls to '
                                'set/modify)'
        }
        # exclude = ('local_area_point',)
        # widgets = {'local_area_point': LeafletWidget()}
        widgets = {'local_area_point': ISSFMapWidget()}

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(GeographicScopeLocalAreaForm, self).clean()
        # other local area setting and text must be provided in combination
        other_text = False
        if len(cleaned_data['local_area_setting_other']) > 0:
            other_text = True
        other_selected = False
        if cleaned_data.has_key('local_area_setting'):
            if cleaned_data['local_area_setting'] == 'Other':
                other_selected = True
        if not other_text and other_selected:
            raise forms.ValidationError(
                'Please specify other local area setting, or unselected '
                'Other.')
        if 'local_area_point' in cleaned_data:
            if cleaned_data['local_area_point'] is None:
                raise forms.ValidationError('Please place a point on the map.')
        return cleaned_data


class GeographicScopeSubnationForm(ModelForm):
    class Meta:
        model = GeographicScopeSubnation
        fields = '__all__'
        labels = {
            'subnation_name': '*Name of sub-national area', 'country':
                '*Specify country for sub-national area', 'subnation_type':
                '*Sub-national area type (select one)',
            'subnation_type_other': 'Other sub-national area type',
            'subnation_point': 'Sub-national area location (use the draw, '
                               'edit and delete '
                               'controls to set/modify)'
        }
        # exclude = ('subnation_point',)
        # widgets = {'subnation_point': LeafletWidget()}
        widgets = {'subnation_point': ISSFMapWidget()}

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(GeographicScopeSubnationForm, self).clean()
        # other local area setting and text must be provided in combination
        other_text = False
        if len(cleaned_data['subnation_type_other']) > 0:
            other_text = True
        other_selected = False
        if cleaned_data['subnation_type'] == 'Other':
            other_selected = True
        if not other_text and other_selected:
            raise forms.ValidationError(
                'Please specify other sub-national area type, or uncheck '
                'Other.')
        if 'subnation_point' in cleaned_data:
            if cleaned_data['subnation_point'] is None:
                raise forms.ValidationError('Please place a point on the map.')
        return cleaned_data


class GeographicScopeNationForm(ModelForm):
    class Meta:
        # model = GeographicScopeNation
        # fields = [
        # 'country',
        # ]
        # labels = {
        # 'country': '*Select country(ries) (at least one)',
        # }
        model = ISSF_Core
        fields = ['countries', ]
        labels = {
            'countries': '*Select country(ries) (at least one)', }
        # widgets = {
        # 'country': SelectMultiple,
        # }


class GeographicScopeRegionForm(ModelForm):
    class Meta:
        model = Geographic_Scope_Region
        fields = '__all__'
        labels = {
            'region': '*Name of region', 'region_name_other': 'Other region '
                                                              'name',
            'countries': 'Select country(ies) (if applicable)', }

    # override clean to check combinations of fields
    def clean(self):
        cleaned_data = super(GeographicScopeRegionForm, self).clean()
        # other local area setting and text must be provided in combination
        other_text = False
        if len(cleaned_data['region_name_other']) > 0:
            other_text = True
        other_selected = False
        if 'region' in cleaned_data:
            if cleaned_data['region'].region_name == 'Other':
                other_selected = True
                # if other_text and not other_selected:
        # raise forms.ValidationError('Other region name requires Other to
        # be checked.') # could
        # auto-set checkbox
        if not other_text and other_selected:
            raise forms.ValidationError(
                'Please specify other region name, or uncheck Other.')
        return cleaned_data


class SpeciesForm(ModelForm):
    class Meta:
        model = Species

        fields = ['species_common', 'species_scientific']

        labels = {
            'species_common': 'Common species name', 'species_scientific':
                'Scientific/Latin name'
        }


class SpeciesLandingsForm(ModelForm):
    class Meta:
        model = Species

        fields = ['species_common', 'species_scientific', 'landings']

        labels = {
            'species_common': 'Common species name', 'species_scientific':
                'Scientific/Latin name', 'landings': 'Landings (t)'
        }

    def clean(self):
        cleaned_data = super(SpeciesLandingsForm, self).clean()

        if cleaned_data['landings'] and not (
                    cleaned_data['species_scientific'] or cleaned_data[
                    'species_common']):
            raise forms.ValidationError(
                'Please provide either a common or scientific name for the '
                'species.')

        return cleaned_data


# formsets for displaying multiple records
AuthorsInlineFormSet = inlineformset_factory(SSFKnowledge,
                                             KnowledgeAuthorSimple,
                                             form=KnowledgeAuthorsSimpleForm,
                                             extra=1)

CommonAttributesViewInlineFormSet = inlineformset_factory(ISSF_Core,
                                                          CommonAttributeView,
                                                          form=CommonAttributeForm,
                                                          extra=0,
                                                          can_delete=True)

CommonThemesIssuesViewInlineFormSet = inlineformset_factory(ISSF_Core,
                                                            CommonThemeIssueView,
                                                            form=CommonThemeIssueForm,
                                                            extra=0,
                                                            can_delete=True)

MainAttributesViewInlineFormSet = inlineformset_factory(ISSF_Core,
                                                        MainAttributeView,
                                                        form=MainAttributeForm,
                                                        extra=0,
                                                        can_delete=True)

SpeciesLandingsInlineFormSet = inlineformset_factory(ISSF_Core, Species,
                                                     # formset=MainAttributesCustomInlineFormSet,
                                                     form=SpeciesLandingsForm,
                                                     extra=1, can_delete=True)

# MainAttributesInlineFormSet = inlineformset_factory(SSFProfile,
# MainAttribute,
# form=MainAttributeForm, extra=0,
# can_delete=False)

ExternalLinksInlineFormSet = inlineformset_factory(ISSF_Core, ExternalLink,
                                                   form=ExternalLinkForm,
                                                   extra=1)

ProfileOrganizationInlineFormset = inlineformset_factory(SSFProfile,
                                                         ProfileOrganization,
                                                         form=ProfileOrganizationForm,
                                                         extra=1)

SpeciesInlineFormSet = inlineformset_factory(ISSF_Core, Species,
                                             form=SpeciesForm, extra=1)

GeographicScopeLocalAreaInlineFormSet = inlineformset_factory(ISSF_Core,
                                                              GeographicScopeLocalArea,
                                                              form=GeographicScopeLocalAreaForm,
                                                              extra=1)

GeographicScopeSubnationInlineFormSet = inlineformset_factory(ISSF_Core,
                                                              GeographicScopeSubnation,
                                                              form=GeographicScopeSubnationForm,
                                                              extra=1)

# GeographicScopeNationInlineFormSet = inlineformset_factory(ISSF_Core, GeographicScopeNation,
# form=GeographicScopeNationForm, extra=1)

GeographicScopeRegionInlineFormSet = inlineformset_factory(ISSF_Core,
                                                           Geographic_Scope_Region,
                                                           form=GeographicScopeRegionForm,
                                                           extra=1)


def confirm_other_text(other_text_field, other_check_field, cleaned_data):
    other_text = False
    if other_text_field in cleaned_data:
        if len(cleaned_data[other_text_field]) > 0:
            other_text = True
    other_check = False
    if cleaned_data[other_check_field]:
        other_check = True
        # if other_text and not other_check:
    # return False
    if not other_text and other_check:
        return False
    return True

#
# class PhotoForm(ModelForm):
#     image = forms.ImageField()
#
#     class Meta:
#         model = Photos
#         fields = ['issf_core_id', 'photo_id']
#
#         widgets = {'issf_core_id': HiddenInput, 'photo_id': HiddenInput}
