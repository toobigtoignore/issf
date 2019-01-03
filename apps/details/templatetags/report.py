from typing import Iterable

from django import template


def joinby(value: Iterable[str], arg: str) -> str:
    """
    Joins all items in a given iterable into a string, seperating each item by another provided string.

    :param value: The iterable to join.
    :param arg: The seperator to use.
    :return: The joined string.
    """
    return arg.join(value)


register = template.Library()

register.filter('joinby', joinby)
