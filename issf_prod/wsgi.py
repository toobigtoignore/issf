import os
import sys
from django.core.wsgi import get_wsgi_application

"""
WSGI config for issf_prod project.

It exposes the WSGI callable as a module-level variable named ``application``.

"""

activate_this = os.path.expanduser("/issf/bin/activate_this.py")

with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, dict(__file__=activate_this))

sys.path.append('/issf/issf_prod/')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "issf_prod.settings")


application = get_wsgi_application()
