from django import forms
from django.db.models import Q
from django.forms import ModelForm, Select
from django.forms.models import formset_factory
from issf_admin.models import UserProfile
from issf_base.models import Country, ISSFCore, SelectedAttribute, SelectedThemeIssue, DidYouKnow, FAQ, WhoFeature, SSFPerson, SSFKnowledge


class SearchForm(forms.Form):
    keywords = forms.CharField(label='Full text', required=False)
    # contributor_id=1 is the ISSF Staff account
    existing_contributors = ISSFCore.objects.all().values('contributor')
    contributor_choices = [
        (u.id, '%s (%s %s %s)' % (u.username, u.first_name, u.initials, u.last_name)) for u in UserProfile.objects.filter(
            Q(id__in=existing_contributors)
        ).order_by('username')
    ]
    contributor_choices.insert(0, ('', '------------------'))
    contributor = forms.ChoiceField(
        choices=contributor_choices,
        label='Contributor/editor',
        required=False
    )
    contribution_begin_date = forms.DateField(required=False)
    contribution_end_date = forms.DateField(required=False)
    countries = forms.MultipleChoiceField(
        choices=[(c.country_id, c.short_name) for c in Country.objects.order_by('short_name')],
        help_text='Hold down "Control", or "Command" on a Mac, to select more than one.',
        required=False
    )


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

    class Meta:
        model = FAQ
        fields = '__all__'


class WhosWhoForm(ModelForm):
    name = forms.CharField()
    about = forms.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super(WhosWhoForm, self).__init__(*args, **kwargs)
        self.fields['ssf_person'].queryset = SSFPerson.objects.all().order_by(
            'contributor__last_name',
            'contributor__first_name'
        )
        self.fields['ssf_knowledge'].queryset = SSFKnowledge.objects.all().order_by('level2_title', 'level1_title')

    class Meta:
        model = WhoFeature
        fields = '__all__'
        labels = {
            'ssf_person': 'Who\'s Who Page',
            'ssf_knowledge': 'Select Publication'
        }
        widgets = {
            'ssf_knowledge': Select(attrs={'id': 'sota-select'}),
            'ssf_person': Select(attrs={'id': 'who-select'})
        }


class GeoJSONUploadForm(forms.Form):
    file = forms.FileField(required=False)


SelectedAttributesFormSet = formset_factory(SelectedAttributeForm, extra=1)
SelectedThemesIssuesFormSet = formset_factory(SelectedThemeIssueForm, extra=1)
