-- This transforms the old 'Experiences' table into the 'Blue Justice' table

1. Add example column
ALTER TABLE public.ssf_experience 
	ADD COLUMN email VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN affiliation VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN country VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN role VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN photo_location VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN date_of_photo VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN photographer VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_aquaculture VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_recreational VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_commercial VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_subsistence VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_indigenous VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_type_other VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_name VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_type_marine VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_type_freshwater VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_type_brackish VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_archipelago VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_beach VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_coastal VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_coral_reef VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_deep_sea VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_estuary VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_fjord VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_intertidal VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_lagoon VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_lake VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_mangrove VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_open_ocean VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_river VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_salt_marsh VARCHAR;


ALTER TABLE public.ssf_experience 
	ADD COLUMN ecosystem_detailed_other VARCHAR;



ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_artisanal VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_coastal VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_indigenous VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_inland VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_inshore VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_small_boat VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_small_scale VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_subsistence VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_traditional VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_others VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_fisheries VARCHAR;
	
ALTER TABLE public.ssf_experience 
	ADD COLUMN ssf_terms_fisheries_definiton VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_dredge VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_lift_net VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_cast_net VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_poison VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_gillnet VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_recreational_fishing_gears VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_gleaning VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_seine_net VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_harpoon VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_surrounding_net VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_harvesting_machines VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_traps VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_hook_line VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_trawls VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_gears_others VARCHAR;

Alter TABLE public.ssf_experience
	ADD COLUMN main_vessel_type VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN main_vessel_number VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN main_vessel_engine VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN ss_fishers_numbers VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN ss_fishers_full_time VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN ss_fishers_women VARCHAR NULL;
	
Alter TABLE public.ssf_experience
	ADD COLUMN total_number_households VARCHAR NULL;

Alter TABLE public.ssf_experience
	ADD COLUMN households_participation_percentage VARCHAR NULL;