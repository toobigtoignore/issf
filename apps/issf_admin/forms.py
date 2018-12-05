from django import forms
from django.forms import ModelForm

# replace * with specific references
from .models import *


class ProfileForm(ModelForm):
    def clean(self):
        cleaned_data = super(ProfileForm, self).clean()
        # check for required fields, it cannot be done in the model because it inherits from
        # Django's AbstractUser (auth app)
        if len(cleaned_data['first_name']) == 0 or len(cleaned_data['last_name']) == 0:
            raise forms.ValidationError('Please specify a first name and last name.')

        if len(cleaned_data['email']) == 0:
            raise forms.ValidationError('Please enter an email address.')
        return cleaned_data

    class Meta:
        model = UserProfile
        fields = ['username', 'first_name', 'initials', 'last_name', 'email', 'country']
        labels = {
            'first_name': '*First name',
            'last_name': '*Last name',
            'country': 'Country of residence',
            'initials': 'Middle initial(s)',
            'email': '*Email'
        }
        help_texts = {
            'username': ''
        }
        widgets = {
            'username': forms.HiddenInput(),
        }
