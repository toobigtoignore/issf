from django import template
from django.utils.safestring import mark_safe
from issf_base.models import Attribute, Theme_Issue

register = template.Library()


def lookup_attribute_label(value):
    attr = Attribute.objects.get(attribute_id=value)
    return attr.question_number + '. ' + attr.attribute_label


def lookup_attribute_noquestion(value):
    attr = Attribute.objects.get(attribute_id=value)
    return attr.attribute_label


def lookup_attribute_type(value):
    return Attribute.objects.get(attribute_id=value).attribute_type


def lookup_attribute_units(value):
    return Attribute.objects.get(attribute_id=value).units_label


def lookup_additional_field(value):
    return Attribute.objects.get(attribute_id=value).additional_field


def lookup_additional_field_type(value):
    return Attribute.objects.get(attribute_id=value).additional_field_type


def lookup_max_min(value, args):
    attr = Attribute.objects.get(attribute_id=value)
    field = args.as_widget(attrs={'min': attr.min_value, 'max': attr.max_value})
    return field


def lookup_theme_issue_label(value):
    ti = Theme_Issue.objects.get(theme_issue_id=value)
    return ti.theme_issue_category


register.filter('lookup_attribute_label', lookup_attribute_label)
register.filter('lookup_attribute_noquestion', lookup_attribute_noquestion)
register.filter('lookup_attribute_type', lookup_attribute_type)
register.filter('lookup_attribute_units', lookup_attribute_units)
register.filter('lookup_additional_field', lookup_additional_field)
register.filter('lookup_additional_field_type', lookup_additional_field_type)
register.filter('lookup_max_min', lookup_max_min)
register.filter('lookup_theme_issue_label', lookup_theme_issue_label)
