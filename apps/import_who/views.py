import smtplib
import csv
import time
import re
import ast
import urllib
from time import mktime
from datetime import datetime

from django.db import transaction
from django.http import HttpResponse

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_username, user_email, user_field
from allauth.account.utils import complete_signup
from allauth.account import app_settings

from issf_base.models import *
from issf_admin.models import UserProfile


def index(request):
    translate(request)
    return HttpResponse("done")


def createuser(request):
    filename = 'C:/Users/Randal/repos/issf_prod/apps/import_who/newusers2.csv'
    read = 0
    written = 0
    with open(filename, 'rb') as f:
        reader = csv.DictReader(f, dialect='excel')
        for row in reader:
            read = read + 1
            email = row['email'].lower().strip()
            user_name = email[0:email.index('@')]
            user_name = user_name[0:30]
            # check if email already in user table
            if not UserProfile.objects.filter(email__exact=email):
                # create
                written = written + 1
                # check if user_name already in user table
                while UserProfile.objects.filter(username__exact=user_name):
                    user_name = user_name + '1'
                import_account_adapter = ImportAccountAdapter()
                user = import_account_adapter.new_user(None)
                print email
                import_account_adapter.save_user(user=user, first_name=row['first_name'].strip(),
                                                 last_name=row['last_name'].strip(), email=email, username=user_name)

    print 'Rows read: ' + str(read) + '\n'
    print 'Users created: ' + str(written) + '\n'
    return HttpResponse("done")


def genmail(request):
    smtp_email = 'issf@mun.ca'
    smtp_password = '***REMOVED***'
    smtpserver = smtplib.SMTP("smtp.mun.ca", 587)
    smtpserver.ehlo()
    smtpserver.starttls()
    smtpserver.ehlo
    smtpserver.login(smtp_email, smtp_password)

    sent = 0
    where = []
    where.append(
        "id not in (332, 184, 333, 81, 102, 86, 334, 335, 336, 145, 337, 338, 339, 340, 341, 330, 331, 1, 7, 8, 9, 10, 11)")
    user_profiles = UserProfile.objects.extra(where=where)
    for user_profile in user_profiles:
        to = user_profile.email
        password = user_profile.username
        while len(password) < 6:
            password = password + '1'
        header = 'To:' + to + '\n' + 'From: ' + smtp_email + '\n' + 'Subject:Too Big to Ignore - ISSF user account\n'
        body = 'Dear colleague,\n\n'
        body = body + "You are receiving this email because you completed the Too Big To Ignore (TBTI) Who's Who survey and/or you registered for the 2nd World Small-scale Fisheries Congress in Merida, Mexico.\n\n"
        body = body + "In Merida, TBTI will be launching the Information System on Small-scale Fisheries (ISSF), a web-based application for contributing and disseminating information about small-scales fisheries (SSF). It will include the information entered in the Who's Who survey to help build a community of SSF scientists and stakeholders. In addition to this, as an expert in SSF, we require your help to share your knowledge.\n\n"
        body = body + 'Contributing or modifying information requires an ISSF user account, and we have setup one for you.\n\n'
        body = body + 'Please go to http://issf.toobigtoignore.net to view the application. When you are ready to contribute information, login with the following information:\n'
        body = body + 'Username = ' + user_profile.username + '\n'
        body = body + 'Password = ' + password + '\n\n'
        body = body + 'For security reasons, you will be automatically sent a verification email on your first login attempt. Please follow the instructions in your verification email, and once logged in please change your password.\n\n'
        body = body + 'Kind regards,\n'
        body = body + 'The ISSF team'
        msg = header + '\n' + body
        smtpserver.sendmail(smtp_email, to, msg)
        sent = sent + 1

    smtpserver.close()
    print 'sent: ' + str(sent)
    return HttpResponse("done")


class ImportAccountAdapter(DefaultAccountAdapter):
    def save_user(self, user, first_name, last_name, email, username):
        user_email(user, email)
        user_username(user, username)
        user_field(user, 'first_name', first_name or '')
        user_field(user, 'last_name', last_name or '')
        password = username
        while len(password) < 6:
            password = password + '1'
        user.set_password(username)
        user.save()
        return user


def translate(request):
    filename = 'C:/Users/Randal/repos/issf_prod/apps/import_who/WhosWho5.csv'
    with open(filename, 'rb') as f:
        reader = csv.DictReader(f, dialect='excel')
        print 'Start of processing.\n'
        rowNumber = 0
        userCreate = 0
        userUpdate = 0
        orgCreate = 0
        orgUpdate = 0
        orgGeocode = 0
        resCreate = 0
        resUpdate = 0
        specCreate = 0
        transaction.set_autocommit(True)
        for row in reader:
            rowNumber += 1
            print 'rowNumber = ' + str(rowNumber)

            email = row['Email'].lower()
            user_name = email[0:email.index('@')]
            user_name = user_name[0:30]
            # check if email already in user table
            if not UserProfile.objects.filter(email__exact=email):
                # create
                userCreate += 1
                # check if user_name already in user table
                if UserProfile.objects.filter(username__exact=user_name):
                    user_name = user_name + '1'
                import_account_adapter = ImportAccountAdapter()
                user = import_account_adapter.new_user(None)
                import_account_adapter.save_user(user=user, first_name='', last_name='', email=email,
                                                 username=user_name)
                # this steps sends a verification email
            else:
                # update
                userUpdate += 1
            up = UserProfile.objects.get(email=email)
            # check for uniqueness of user_name if different than current
            if user_name != up.username:
                if UserProfile.objects.filter(username__exact=user_name):
                    user_name = user_name + '1'
            up.username = user_name
            up.first_name = row['Firstname']  # .title()
            up.last_name = row['Lastname']  # .title()
            country_res = row['Countryresidence']
            country = Country.objects.get(short_name__iexact=country_res)
            up.country_id = country.country_id
            contribution_date = datetime.fromtimestamp(mktime(time.strptime(row['Timestamp'], '%m/%d/%Y %H:%M')))
            up.date_joined = contribution_date
            up.save()

            # researcher - only one per contributor
            if not SSFResearcher.objects.filter(contributor_id=up.id):
                # create
                res = SSFResearcher()
                resCreate += 1
            else:
                # update
                res = SSFResearcher.objects.get(contributor_id=up.id)
                resUpdate += 1
            res.number_publications = row['Publications']
            education_read = row['Education']
            education_other = ''
            if education_read == "Bachelor":
                education_save = 'Bachelor'
            elif education_read == "Master's":
                education_save = 'Master'
            elif education_read == "PhD":
                education_save = 'PhD'
            else:
                education_save = 'Other'
                education_other = education_read
            res.education_level = education_save
            res.other_education_level = education_other
            res.memberships = row['Memberships']
            if row['Member2'].lower() == 'yes':
                res.is_tbti_member = True
            res.gender = row['Gender']
            res.age_category = row['Age']
            res.issues_addressed = row['Issues']
            res.url = row['URL']
            res.discipline = row['Discipline']
            res.contributor_id = up.id
            res.contribution_date = contribution_date
            res.save()

            for species in re.split('\n', row['Species']):
                spec = Species()
                spec.issf_core_id = res.issf_core_id
                spec.species_typed = species
                spec.save()
                specCreate += 1

            # add org even if dup
            if res.organization:
                org = res.organization
                orgUpdate += 1
            else:
                org = SSFOrganization()
                orgCreate += 1
            org.organization_name = row['Affiliation']
            org.address1 = row['Address']
            if len(row['Address']) > 0:
                # geocode address using Bing
                geocoding_url = 'http://dev.virtualearth.net/REST/v1/Locations?query=' + row[
                    'Address'] + ', ' + country_res
                geocoding_url = geocoding_url + '&maxResults=1&key=Al1mXkJObbAqh8s8TkCwTnIYZOemobAiJZSVaPklNXPS_ErYDtPButHlPDJrznFf'
                geocoding_dict = ast.literal_eval(urllib.urlopen(geocoding_url).read())
                if geocoding_dict['statusDescription'] == 'OK':
                    if geocoding_dict['resourceSets'][0]['estimatedTotal'] > 0:
                        org_point = 'POINT(' + str(
                            geocoding_dict['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][
                                1]) + ' ' + str(
                            geocoding_dict['resourceSets'][0]['resources'][0]['geocodePoints'][0]['coordinates'][
                                0]) + ')'
                        org.organization_point = org_point
                        orgGeocode += 1
            org.contributor_id = up.id
            org.contribution_date = contribution_date
            org.save()
            res.organization = org
            res.save()

        print 'Rows read: ' + str(rowNumber) + '/n'
        print 'Users created: ' + str(userCreate) + '/n'
        print 'Users updated: ' + str(userUpdate) + '/n'
        print 'Res created: ' + str(resCreate) + '/n'
        print 'Res updated: ' + str(resUpdate) + '/n'
        print 'Specs created: ' + str(specCreate) + '/n'
        print 'Orgs created: ' + str(orgCreate) + '/n'
        print 'Orgs updated: ' + str(orgCreate) + '/n'
        print 'Orgs geocoded: ' + str(orgGeocode) + '/n'


def unicode_csv_reader(unicode_csv_data, dialect=csv.excel, **kwargs):
    # csv.py doesn't do Unicode; encode temporarily as UTF-8:
    csv_reader = csv.DictReader(utf_8_encoder(unicode_csv_data),
                                dialect=dialect, **kwargs)
    for row in csv_reader:
        # decode UTF-8 back to Unicode, cell by cell:
        yield [unicode(cell, 'utf-8') for cell in row]


def UnicodeDictReader(utf8_data, **kwargs):
    csv_reader = csv.DictReader(utf8_data, **kwargs)
    for row in csv_reader:
        yield dict([(key, unicode(value, 'utf-8')) for key, value in row.iteritems()])