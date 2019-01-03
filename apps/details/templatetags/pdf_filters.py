import urllib
import base64
from io import StringIO

from django import template

register = template.Library()


@register.filter
def get64(url: str) -> str:
    """
    Method returning base64 image data instead of URL.

    :param url: The URL to retrieve the image from.
    :return: A base64-encoded image.
    """
    if url.startswith("http"):
        image = StringIO.StringIO(urllib.urlopen(url).read())
        return 'data:image/jpg;base64,' + base64.b64encode(image.read())

    return url
