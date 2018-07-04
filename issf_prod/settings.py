import os, sys
from decouple import config 
from unipath import Path


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
APPS_DIR = os.path.join(BASE_DIR, 'apps')
sys.path.insert(0, APPS_DIR)
sys.path.append('apps')

ALLOWED_HOSTS=['*']

SECRET_KEY= config('SECRET_KEY')
 
#DEBUG = config('DEBUG', default=False, cast=bool) 
DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': config('DB_NAME'), 
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'), 
        'PORT': config('DB_PORT'),
        'ATOMIC_REQUESTS': True
    }
}

INSTALLED_APPS = (
    # Django 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.gis',
    'django.contrib.messages',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'django.contrib.humanize',

    # Third-Party 
    'crispy_forms',
    'crispy_forms_foundation',
    'django_tables2',
    'djangojs',
    'djgeojson',
    'eztables',
    'foundationform',
    'leaflet',

    # Authentication
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',

    # ISSF 
    'issf_base',
    'issf_admin',
    'details',
    'frontend',
    'details.templatetags'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

STATIC_ROOT = '/issf/static'
STATIC_URL  = '/static/'
STATICFILES_DIRS = ( os.path.join(BASE_DIR, 'node_modules/'), APPS_DIR,
        '/issf/static_root' )

print("*****************************")
print("STATIC ROOT: " + STATIC_ROOT)
print("*****************************")
print("STATIC_URL : " + STATIC_URL)
print("*****************************")
print("BASE_DIR: " + BASE_DIR)
print("APPS: " + APPS_DIR)
print("*****************************")

CRISPY_TEMPLATE_PACK = 'foundation-5'
TEMPLATES = [
    {'BACKEND': 'django.template.backends.django.DjangoTemplates',
     'DIRS': [
         #APPS_DIR.child('issf_admin').child('templates').child('issf_admin'),
         os.path.join(APPS_DIR, 'frontend/templates/frontend'),
         os.path.join(APPS_DIR, 'details/templates/details'),
         os.path.join(APPS_DIR, 'issf_admin/templates/issf_admin'),

     ],
     'APP_DIRS': True,
     'OPTIONS': {
         'context_processors': [
             'django.contrib.auth.context_processors.auth',
             'django.contrib.messages.context_processors.messages',
             'django.template.context_processors.debug',
             'django.template.context_processors.i18n',
             'django.template.context_processors.media',
             'django.template.context_processors.static',
             'django.template.context_processors.tz',
         ], 'debug': True
     },
     }, ]

AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",

    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)


# Leaflet
LEAFLET_CONFIG = {
    'TILES': 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'PLUGINS': {
        'forms': {'auto-include': True, },
        'cluster': {
            'css': ['issf_base/leaflet-markercluster/css/MarkerCluster.css',
                    'issf_base/leaflet-markercluster/css/MarkerCluster.Default.css'],
            'js': 'issf_base/leaflet-markercluster/js/leaflet.markercluster.js',
            'auto-include': True,
        },
        'navbar': {
            'css': ['issf_base/Leaflet.NavBar-master/src/Leaflet.NavBar.css'],
            'js': 'issf_base/Leaflet.NavBar-master/src/Leaflet.NavBar.js',
            'auto-include': True,
        },

        'binggeocoder': {
            'css': ['issf_base/leaflet-control-bing-geocoder/Control.BingGeocoder.css'],
            'js':
                'issf_base/leaflet-control-bing-geocoder/Control.BingGeocoder.js',
            'auto-include': True,
        },
    },
    'DEFAULT_CENTER': (22.0, 0.0),
    'DEFAULT_ZOOM': 2,
    'MIN_ZOOM': 1,
    'MAX_ZOOM': 13,
    'RESET_VIEW': False,
    'SCALE': None,
}
EMAIL_USE_TLS = config('EMAIL_TLS')
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT')
EMAIL_HOST_USER =  config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL')
DEFAULT_TO_EMAIL = 'to'

AUTH_USER_MODEL = 'issf_admin.UserProfile'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = '/accounts/verified/'
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'

TWITTER_CONSUMER_KEY = config('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = config('TWITTER_CONSUMER_SECRET')
TWITTER_ACCESS_TOKEN = config('TWITTER_ACCESS_TOKEN')
TWITTER_ACCESS_TOKEN_SECRET = config('TWITTER_ACCESS_TOKEN_SECRET')

SITE_ID = 1
LOGIN_REDIRECT_URL = '/'
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'SCOPE': ['email', 'publish_stream'],
        'METHOD': 'js_sdk'  # instead of 'oauth2'
    }
}

JS_CONTEXT_ENABLED = False
LANGUAGE_CODE = 'en-ca'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
X_FRAME_OPTIONS = 'ALLOW-FROM http://dev.toobigtoignore.net/?page_id=758'
ROOT_URLCONF = 'issf_prod.urls'
WSGI_APPLICATION = 'issf_prod.wsgi_dev.application'
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
POSTGIS_VERSION = (2, 1)
