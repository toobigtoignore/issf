from django.contrib import admin

from issf_base.models import Country, PublicationType, Language, Region

# Registers the Country, PublicationType, Language, and Region models with the admin dashboard
# Since this dashboard is no longer used, this code isn't really needed
admin.site.register(Country)
admin.site.register(PublicationType)
admin.site.register(Language)
admin.site.register(Region)
