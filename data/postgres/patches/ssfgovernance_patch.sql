UPDATE public.ssf_capacity_need SET core_record_type = 'SSF Governance';
UPDATE public.ssf_capacity_need set core_record_summary = concat('<strong> Case Study Country: </strong>', case_study_country, '<br><strong> Contributors Names: </strong>', contributors_names, '<br><strong> Contributors Affiliations: </strong>', contributors_affiliations);


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN case_study_country varchar(256) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN contributors_names text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN contributors_affiliations text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN is_ssf_terms_legally_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_legally_defined text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_legally_defined_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_primary varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_regulation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_national varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_none varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_defined text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_policy_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN is_ssf_terms_informal varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_informal text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_terms_informal_additional text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN human_rights_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN human_rights_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN respect_of_cultures_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN respect_of_cultures_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN non_discrimination_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN non_discrimination_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN gender_equality_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN gender_equality_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN equity_equality_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN equity_equality_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN consultation_participation_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN consultation_participation_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN rule_of_law_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN rule_of_law_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN transparency_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN transparency_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN accountability_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN accountability_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN economic_social_environmental_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN economic_social_environmental_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ecosystem_approach_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ecosystem_approach_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN social_responsibility_policy varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN social_responsibility_legislation varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN other_principles_legislation text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN other_principles_policy text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN legal_system varchar(150) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN legal_system_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN fisheries_legislation_title text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN fisheries_legislation_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN fisheries_legislation_amendments text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN fisheries_legislation_sources text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_policy_title text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_policy_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_policy_period_coverage text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_policy_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_authority_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_authority_sources text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_type varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_type_explanation text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_support_document text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN national_governmental_support_pages text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN specifical_in_ssfcharge text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN specifical_in_ssfcharge_sources text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_among_authority varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_among_authority_example text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_among_authority_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_between_fishers varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_between_fishers_example text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN communication_between_fishers_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN representation_required varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN representation_required_example text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN representation_required_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN participation_management varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN participation_management_example text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN participation_management_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN holistic_form varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN holistic_form_example text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN holistic_form_additional text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_tenure_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_tenure_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_tenure_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_tenure_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_exclusive_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_exclusive_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_exclusive_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_exclusive_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_registration_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_registration_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_registration_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_registration_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_mcs_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_mcs_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_mcs_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_mcs_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_social_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_social_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_social_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_social_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_labour_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_labour_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_labour_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_labour_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_capacity_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_capacity_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_capacity_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_capacity_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_recognition_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_recognition_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_recognition_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_recognition_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_responsible_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_responsible_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_responsible_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_responsible_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_legal_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_legal_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_legal_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_legal_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_special_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_special_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_special_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_special_additional text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_protection_name text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_protection_year varchar(10) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_protection_defined varchar(50) NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN provision_protection_additional text NULL;


ALTER TABLE public.ssf_capacity_need
	ADD COLUMN ssf_country_specific_info text NULL;
ALTER TABLE public.ssf_capacity_need
	ADD COLUMN legal_and_policy_framework text NULL;