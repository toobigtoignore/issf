"""
WSGI config for issf_prod project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import os, sys

activate_this = os.path.expanduser("/issf/bin/activate_this.py")
# execfile(activate_this, dict(__file__=activate_this))

with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, dict(__file__=activate_this))

sys.path.append('/issf/issf_prod/')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "issf_prod.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
