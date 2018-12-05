-- Filename: clean_db.sql
-- Author: Joshua Murphy, Randal Greene
-- Date: May 23rd, 2018
-- https://github.com/toobigtoignore/issf

-- A script for scrubbing the ISSF database of sensitive artifacts.
-- Don't be a goof, don't run on prod.

-- The unique key constraints for social accounts make it a pain to obscure.

ALTER TABLE "socialaccount_socialtoken" DROP CONSTRAINT "socialaccount_socialtoken_app_id_fkey";
ALTER TABLE "socialaccount_socialapp_sites" DROP CONSTRAINT "socialapp_id_refs_id_e7a43014";
ALTER TABLE "socialaccount_socialapp_sites" DROP CONSTRAINT "socialaccount_socialapp_sites_site_id_fkey";
ALTER TABLE "socialaccount_socialapp_sites" DROP CONSTRAINT "socialaccount_socialapp_sites_socialapp_id_site_id_key";
ALTER TABLE "socialaccount_socialapp" DROP CONSTRAINT "socialaccount_socialapp_pkey";
ALTER TABLE "django_session" DROP CONSTRAINT "django_session_pkey";
ALTER TABLE "ssf_organization" DROP CONSTRAINT "ssf_organization_country_id_fkey";

UPDATE socialaccount_socialapp SET
  client_id = '1',
  secret = '1';

UPDATE socialaccount_socialapp_sites SET
  socialapp_id = floor(random())*10,
  site_id = floor(random())*10;

UPDATE user_profile SET
  password = 'password' || to_char(id,'FM000000'),
  username = 'harold' || to_char(id,'FM000000'),
  first_name = 'Harold',
  last_name = 'H' || to_char(id,'FM000000'),
  email = to_char(id,'FM0000000') || '@harold.com',
  initials = 'H',
  country_id = null;

UPDATE ssf_person SET
  geographic_scope_type = 'Unspecified',
  number_publications = 0,
  memberships = 'Lots!',
  affiliation = 'ISSF',
  url = '',
  img_url='http://i0.kym-cdn.com/entries/icons/original/000/016/546/hidethepainharold.jpg',

  is_researcher = false,
  issues_addressed = 'All of them',
  research_method = 'Trial and error',
  education_level = 'PhD',
  other_education_level = 'N/A',

  address1 = '1 Townsville St',
  address2 = '',
  city_town = 'Townsville',
  prov_state = 'Statesville',
  postal_code = 'H0H 0H0';

UPDATE profile_organization SET
  organization_name = 'Harold & Sons';

UPDATE ssf_organization SET
  organization_name = 'Harold & Sons',
  mission = 'Fishing Fish',
  address1 = 'Big Secret',
  address2 = 'Bigger Secret',
  prov_state = 'Statesville',
  country_id = 1,
  postal_code = 'HOH HOH',
  city_town =  'Melbourne',
  year_established = '1463',
  motivation_other_text = 'To get good',
  activities_other_text= 'Stargazing',
  network_types_other_text = 'Linkedin',
  achievements = 'Held breath for 12 seconds',
  success_factors= 'Strong lungs',
  obstacles = 'Needing oxygen';

UPDATE ssf_guidelines SET
  organizer = 'Harold',
  start_year = '0000',
  start_month = '1',
  start_day = '1',
  end_month = '1',
  end_year = '0000',
  end_day = '1';

UPDATE knowledge_author_simple SET
  author_name = 'Harold';

UPDATE django_session SET
  session_key = floor(random()),
  session_data = floor(random()),
  expire_date = '1463-01-01 00:00:01.639+00';

UPDATE account_emailaddress SET
email = 'harold'  || '@harold.com';

UPDATE account_emailconfirmation SET
key = to_char(id,'FM000_')  || 'dummy_key';

SELECT * FROM run_person_updates();
