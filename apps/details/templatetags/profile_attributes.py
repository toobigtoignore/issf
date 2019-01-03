from django import template

from issf_base.models import Attribute, Theme_Issue

register = template.Library()


def lookup_attribute_label(value: int) -> str:
    """
    Gets the attribute label for a given attribute.

    :param value: The ID of the attribute to get the label for.
    :return: The label for the attribute.
    """
    attr = Attribute.objects.get(attribute_id=value)
    return attr.question_number + '. ' + attr.attribute_label


def lookup_attribute_noquestion(value: int) -> str:
    """
    Gets the attribute label for a given attribute, without the question included.

    :param value: The ID of the attribute to get the label for.
    :return: The label for the attribute.
    """
    attr = Attribute.objects.get(attribute_id=value)
    return attr.attribute_label


def lookup_attribute_type(value: int) -> str:
    """
    Gets the attribute type for a given attribute.

    :param value: The ID of the attribute to get the type for.
    :return: The type of the attribute.
    """
    return Attribute.objects.get(attribute_id=value).attribute_type


def lookup_attribute_units(value: int) -> str:
    """
    Gets the units for a given attribute.

    :param value: The ID of the attribute to get the units for.
    :return: The units for the attribute.
    """
    return Attribute.objects.get(attribute_id=value).units_label


def lookup_additional_field(value: int) -> str:
    """
    Gets the additional field for a given attribute.

    :param value: The ID of the attribute to get the additional field for.
    :return: The additional field for the attribute.
    """
    return Attribute.objects.get(attribute_id=value).additional_field


def lookup_additional_field_type(value: int) -> str:
    """
    Gets the additional field type for a given attribute.

    :param value: The ID of the attribute to get the additional field type for.
    :return: The additional field type for the attribute.
    """
    return Attribute.objects.get(attribute_id=value).additional_field_type


def lookup_max_min(value: int, args):
    """
    Creates a min/max widget for a given attribute.

    :param value: The ID of the attribute to create the field for.
    :param args: The field to create a widget for.
    :return: A min/max widget for the attribute.
    """
    attr = Attribute.objects.get(attribute_id=value)
    field = args.as_widget(attrs={'min': attr.min_value, 'max': attr.max_value})
    return field


def lookup_theme_issue_label(value: int) -> str:
    """
    Gets the theme issue label for a given theme issue.

    :param value: The ID of the theme issue to get the label for.
    :return: The theme issue category for the given theme issue.
    """
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
