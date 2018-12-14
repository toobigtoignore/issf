# ISSF - Information System on Small Scale Fisheries
# Author: Joshua Murphy
# Date: December 13th 2018
# https://github.com/toobigtoignore/issf


import os, sys
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "issf_prod.settings")

application = get_wsgi_application()
