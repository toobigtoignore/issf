import codecs
import json
import random

from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import render, HttpResponse
from django.db import connection
from allauth.account.models import EmailAddress
from allauth.account.views import PasswordChangeView
from .models import UserProfile
from issf_base.models import FAQ, FAQCategory
from issf_base.models import DidYouKnow
from .forms import ProfileForm
from issf_base.models import ISSFCore, SSFPerson, ISSF_Core


# class UserProfileUpdateView(UpdateView):
# model = UserProfile
# form_class = UserProfileForm
# success_url = '/'
#
# def get_success_url(self):
# return '/'
#
#

@login_required
def update_profile(request, template_name='issf_admin/user_profile.html'):
    if request.method == "POST":
        # # save
        # profile_form = ProfileForm(data=request.POST, instance=request.user)
        # if profile_form.is_valid():
        # profile_form.save()
        # # up = profile_form.save()
        # # up.user = request.user
        # # up.save()
        # # check if email address has changed
        # if "email" in profile_form.changed_data:
        # # also update emailaddress table
        # email_address = EmailAddress.objects.get(user=request.user)
        #         email_address.email = profile_form.data['email']
        #         email_address.save()
        #         # # reverify?
        #         # # this code does not work if atomic requests is true
        #         # email_address.change(request=request,
        # new_email=up.email, confirm=True)
        #         # # should go to verification_sent page and force logout
        #
        #     # update summary and search vector for Who's Who (if exists)
        #     person_list = SSFPerson.objects.filter(
        # contributor_id=profile_form.instance.id)
        #
        #     if len(person_list) > 0:
        #         person = SSFPerson.objects.get(
        # contributor_id=profile_form.instance.id)
        #
        #         cursor = connection.cursor()
        #         cursor.execute(
        #             'SELECT * FROM person_tsvector_update(' + str(
        # person.issf_core_id) + ')')
        #         cursor.execute(
        #             'SELECT * FROM person_summary_update(' + str(
        # person.issf_core_id) + ')')
        saved, response = save_profile(request)
        if saved:

            response = json.dumps({
                'success': 'true', 'redirectname': 'profile-saved',
                'record': None
            })
            return HttpResponse(response)
        # return HttpResponseRedirect(reverse('profile-saved'))
        else:
            # # invalidly-formatted email address will land here
            # # send errors back for display...
            # errors = form.errors
            # response = json.dumps({'success': 'false', 'errors': errors})
            return HttpResponse(response)
    else:
        # load
        user_profile = UserProfile.objects.get(id=request.user.pk)
        profile_form = ProfileForm(instance=user_profile)
        return render(request, template_name, {
            'userName': request.user.username, 'userForm': profile_form, })


def save_profile(request):
    # save
    profile_form = ProfileForm(data=request.POST, instance=request.user)
    if profile_form.is_valid():
        profile_form.save()
        # up = profile_form.save()
        # up.user = request.user
        # up.save()
        # check if email address has changed
        if "email" in profile_form.changed_data:
            # also update emailaddress table
            email_address = EmailAddress.objects.get(user=request.user)
            email_address.email = profile_form.data['email']
            email_address.save()
            # # reverify?
            # # this code does not work if atomic requests is true
            # email_address.change(request=request, new_email=up.email,
            # confirm=True)
            # # should go to verification_sent page and force logout

        # update summary and search vector for Who's Who (if exists)
        person_list = SSFPerson.objects.filter(
            contributor_id=profile_form.instance.id)

        if len(person_list) > 0:
            person = SSFPerson.objects.get(
                contributor_id=profile_form.instance.id)

            cursor = connection.cursor()
            cursor.execute('SELECT * FROM person_tsvector_update(' + str(
                person.issf_core_id) + ')')
            cursor.execute('SELECT * FROM person_summary_update(' + str(
                person.issf_core_id) + ')')
        return True, None
    else:
        # invalidly-formatted email address will land here
        # send errors back for display...
        errors = profile_form.errors
        response = json.dumps({'success': 'false', 'errors': errors})
        return False, response


def temp(request):
    user_profile = UserProfile.objects.get(id=325)
    user_profile.set_password('temp')
    user_profile.save()
    return render(request, 'issf_admin/verification_successful.html')


def account_verified(request):
    # if request.user.prompt_change_password:
    # HttpResponseRedirect(reverse(CustomPasswordChangeView))
    # else:
    return render(request, 'issf_admin/verification_successful.html')


def profile_saved(request):
    return render(request, 'issf_admin/user_profile_saved.html')


class CustomPasswordChangeView(PasswordChangeView):
    success_url = '/accounts/profile/'


custom_password_change = login_required(CustomPasswordChangeView.as_view())


# @login_required
# def generate_sitemap(request):
# with codecs.open('sitemap.xml', 'w', 'utf-8-sig') as handle:
# # handle = open('sitemap.xml', 'w')
# handle.write(request.build_absolute_uri(reverse('index')) + '\r\n')
# for record in ISSFCore.objects.all():
# if record.core_record_type == "Who's Who in SSF":
# handle.write(request.build_absolute_uri(reverse('who-details',
# args=[record.issf_core_id])) + "\r\n")
# elif record.core_record_type == "State-of-the-Art in SSF Research":
# handle.write(request.build_absolute_uri(reverse('sota-details',
# args=[record.issf_core_id])) + "\r\n")
# elif record.core_record_type == "Capacity Development":
# handle.write(request.build_absolute_uri(reverse('capacity-details',
# args=[record.issf_core_id])) + "\r\n")
#             elif record.core_record_type == "SSF Organization":
#                 handle.write(request.build_absolute_uri(reverse(
# 'organization-details',
# args=[record.issf_core_id])) + "\r\n")
#         # handle.close()
#     return HttpResponse('done')
#
# def return_sitemap(request):
#     handle = open('sitemap.xml', 'r')
#     retstr = handle.readlines()
#     handle.close()
#     return HttpResponse(retstr)
#
def return_google_site_verification(request):
    return HttpResponse(
        unicode('google-site-verification: googlee9690f8983b8a350.html',
                "utf-8"), content_type="text/plain")


def return_sitemap(request):
    retstr = ''
    retstr = retstr + request.build_absolute_uri(reverse('index')) + '\r\n'
    for record in ISSFCore.objects.all():
        if record.core_record_type == "Who's Who in SSF":
            retstr = retstr + request.build_absolute_uri(
                reverse('who-details', args=[record.issf_core_id])) + "\r\n"
        elif record.core_record_type == "State-of-the-Art in SSF Research":
            retstr = retstr + request.build_absolute_uri(
                reverse('sota-details', args=[record.issf_core_id])) + "\r\n"
        elif record.core_record_type == "Capacity Development":
            retstr = retstr + request.build_absolute_uri(
                reverse('capacity-details',
                        args=[record.issf_core_id])) + "\r\n"
        elif record.core_record_type == "SSF Organization":
            retstr = retstr + request.build_absolute_uri(
                reverse('organization-details',
                        args=[record.issf_core_id])) + "\r\n"
        elif record.core_record_type == "SSF Profile":
            retstr = retstr + request.build_absolute_uri(
                reverse('profile-details',
                        args=[record.issf_core_id])) + "\r\n"
        elif record.core_record_type == "SSF Guidelines":
            retstr = retstr + request.build_absolute_uri(
                reverse('guidelines-details',
                        args=[record.issf_core_id])) + "\r\n"
    return HttpResponse(unicode(retstr, "utf-8"), content_type="text/plain")


def return_robots(request):
    retstr = 'User-agent: *\r\n'
    retstr = retstr + 'Disallow: /admin/\r\n'
    retstr = retstr + 'Disallow: /accounts/\r\n'
    retstr = retstr + 'Disallow: /djangojs/\r\n'
    retstr = retstr + 'Disallow: /frontend/\r\n'
    retstr = retstr + 'Disallow: /import-who/\r\n'
    return HttpResponse(unicode(retstr, "utf-8"), content_type="text/plain")


def contributed_records(request):
    user = request.user
    records = ISSF_Core.objects.filter(contributor_id=user.id)
    record_items = {}

    for record in records:
        titles = record.core_record_summary.split('<strong>')
        record_title = titles[1].replace('</strong>', '')
        record_url = reverse(get_redirectname(record.core_record_type),
                             kwargs={'issf_core_id': record.issf_core_id})
        record_items[record_url] = [record_title, record.core_record_type]

    return render(request, 'issf_admin/account/contributed_records.html',
                  {'record_items': record_items})


def get_redirectname(core_record_type):
    if core_record_type == "State-of-the-Art in SSF Research":
        return 'sota-details'
    elif core_record_type == "Who's Who in SSF":
        return 'who-details'
    elif core_record_type == "SSF Organization":
        return 'organization-details'
    elif core_record_type == "Capacity Development":
        return 'capacity-details'
    elif core_record_type == "SSF Profile":
        return 'profile-details'
    elif core_record_type == "SSF Guidelines":
        return 'guidelines-details'


def help_page(request):
    faqs = FAQ.objects.all()
    categories = FAQCategory.objects.all()

    num_facts = DidYouKnow.objects.count()
    random_index = random.randint(1, num_facts)
    random_fact = DidYouKnow.objects.get(id=random_index)

    return render(request, 'issf_admin/help.html',
                  {'faqs': faqs, 'categories': categories, 'fact':
                      random_fact})


def fact_archive(request):
    return render(request, 'issf_admin/fact_archive.html',
                  {'facts': DidYouKnow.objects.all()})
