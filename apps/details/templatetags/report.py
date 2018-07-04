from django import template


def joinby(value, arg):
    return arg.join(value)


register = template.Library()

register.filter('joinby', joinby)
