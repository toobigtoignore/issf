from typing import Dict, Any

from django import forms
from django.forms import ModelForm

import bleach

# replace * with specific references
from .models import *


class ProfileForm(ModelForm):
    """
    Form for creating and updating a user profile.
    """
    def clean(self) -> Dict[str, Any]:
        """
        Cleans and validates the data entered by the user.

        :return: The cleaned data.
        :raises forms.ValidationError: When the form data provided is invalid.
        """
        cleaned_data = super(ProfileForm, self).clean()
        # check for required fields, it cannot be done in the model because it inherits from
        # Django's AbstractUser (auth app)

        for key in cleaned_data:
            if isinstance(cleaned_data[key], str):
                cleaned_data[key] = bleach.clean(cleaned_data[key])

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
