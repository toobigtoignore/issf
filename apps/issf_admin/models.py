from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser

from issf_base.models import Country, SSFOrganization


# custom user model
class UserProfile(AbstractUser):
    initials = models.CharField(blank=True, max_length=10)
    country = models.ForeignKey(Country, blank=True, null=True)
    # # set true when creating user accounts on their behalf, so that they get prompted to
    # change password after verification
    # prompt_change_password = models.BooleanField(default=False)

    class Meta:
        managed = True
        db_table = 'user_profile'
        ordering = ['username']

    def __str__(self):
        return '%s (%s %s %s)' % (self.username, self.first_name, self.initials, self.last_name)