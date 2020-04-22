-- Create Blue Justice Table

CREATE TABLE public.ssf_bluejustice
(
    -- Inherited from table public.issf_core: issf_core_id integer NOT NULL DEFAULT nextval('issf_core_issf_core_id_seq'::regclass),
    -- Inherited from table public.issf_core: contribution_date date NOT NULL DEFAULT ('now'::text)::date,
    -- Inherited from table public.issf_core: contributor_id integer,
    -- Inherited from table public.issf_core: core_record_type text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
    -- Inherited from table public.issf_core: core_record_summary text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
    -- Inherited from table public.issf_core: core_record_tsvector tsvector,
    -- Inherited from table public.issf_core: core_record_status integer NOT NULL DEFAULT 0,
    -- Inherited from table public.issf_core: geographic_scope_type text COLLATE pg_catalog."default" NOT NULL DEFAULT 'Local'::text,
    -- Inherited from table public.issf_core: edited_date date NOT NULL DEFAULT ('now'::text)::date,
    -- Inherited from table public.issf_core: editor_id integer,
    title text COLLATE pg_catalog."default" DEFAULT ''::text,
    name text COLLATE pg_catalog."default" NOT NULL,
    video_url text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
    img_url text COLLATE pg_catalog."default",
    vimeo_video_url text COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    affiliation character varying COLLATE pg_catalog."default",
    country character varying COLLATE pg_catalog."default",
    role character varying COLLATE pg_catalog."default",
    photo_location character varying COLLATE pg_catalog."default",
    date_of_photo character varying COLLATE pg_catalog."default",
    photographer character varying COLLATE pg_catalog."default",
    ssf_location character varying COLLATE pg_catalog."default",
    ssf_country character varying COLLATE pg_catalog."default",
    ssf_main_species character varying COLLATE pg_catalog."default",
    ssf_type_aquaculture character varying COLLATE pg_catalog."default",
    ssf_type_recreational character varying COLLATE pg_catalog."default",
    ssf_type_commercial character varying COLLATE pg_catalog."default",
    ssf_type_subsistence character varying COLLATE pg_catalog."default",
    ssf_type_indigenous character varying COLLATE pg_catalog."default",
    ssf_type_other character varying COLLATE pg_catalog."default",
    ssf_name character varying COLLATE pg_catalog."default",
    ecosystem_type_marine character varying COLLATE pg_catalog."default",
    ecosystem_type_freshwater character varying COLLATE pg_catalog."default",
    ecosystem_type_brackish character varying COLLATE pg_catalog."default",
    ecosystem_detailed_archipelago character varying COLLATE pg_catalog."default",
    ecosystem_detailed_beach character varying COLLATE pg_catalog."default",
    ecosystem_detailed_coastal character varying COLLATE pg_catalog."default",
    ecosystem_detailed_coral_reef character varying COLLATE pg_catalog."default",
    ecosystem_detailed_deep_sea character varying COLLATE pg_catalog."default",
    ecosystem_detailed_estuary character varying COLLATE pg_catalog."default",
    ecosystem_detailed_fjord character varying COLLATE pg_catalog."default",
    ecosystem_detailed_intertidal character varying COLLATE pg_catalog."default",
    ecosystem_detailed_lagoon character varying COLLATE pg_catalog."default",
    ecosystem_detailed_lake character varying COLLATE pg_catalog."default",
    ecosystem_detailed_mangrove character varying COLLATE pg_catalog."default",
    ecosystem_detailed_open_ocean character varying COLLATE pg_catalog."default",
    ecosystem_detailed_river character varying COLLATE pg_catalog."default",
    ecosystem_detailed_salt_marsh character varying COLLATE pg_catalog."default",
    ecosystem_detailed_other character varying COLLATE pg_catalog."default",
    ssf_terms_artisanal character varying COLLATE pg_catalog."default",
    ssf_terms_coastal character varying COLLATE pg_catalog."default",
    ssf_terms_indigenous character varying COLLATE pg_catalog."default",
    ssf_terms_inland character varying COLLATE pg_catalog."default",
    ssf_terms_inshore character varying COLLATE pg_catalog."default",
    ssf_terms_small_boat character varying COLLATE pg_catalog."default",
    ssf_terms_small_scale character varying COLLATE pg_catalog."default",
    ssf_terms_subsistence character varying COLLATE pg_catalog."default",
    ssf_terms_traditional character varying COLLATE pg_catalog."default",
    ssf_terms_others character varying COLLATE pg_catalog."default",
    ssf_terms_fisheries character varying COLLATE pg_catalog."default",
    ssf_terms_fisheries_definiton character varying COLLATE pg_catalog."default",
    main_gears_dredge character varying COLLATE pg_catalog."default",
    main_gears_lift_net character varying COLLATE pg_catalog."default",
    main_gears_cast_net character varying COLLATE pg_catalog."default",
    main_gears_poison character varying COLLATE pg_catalog."default",
    main_gears_gillnet character varying COLLATE pg_catalog."default",
    main_gears_recreational_fishing_gears character varying COLLATE pg_catalog."default",
    main_gears_gleaning character varying COLLATE pg_catalog."default",
    main_gears_seine_net character varying COLLATE pg_catalog."default",
    main_gears_harpoon character varying COLLATE pg_catalog."default",
    main_gears_surrounding_net character varying COLLATE pg_catalog."default",
    main_gears_harvesting_machines character varying COLLATE pg_catalog."default",
    main_gears_traps character varying COLLATE pg_catalog."default",
    main_gears_hook_line character varying COLLATE pg_catalog."default",
    main_gears_trawls character varying COLLATE pg_catalog."default",
    main_gears_others character varying COLLATE pg_catalog."default",
    main_vessel_type character varying COLLATE pg_catalog."default",
    main_vessel_number character varying COLLATE pg_catalog."default",
    main_vessel_engine character varying COLLATE pg_catalog."default",
    ss_fishers_numbers character varying COLLATE pg_catalog."default",
    ss_fishers_full_time character varying COLLATE pg_catalog."default",
    ss_fishers_women character varying COLLATE pg_catalog."default",
    total_number_households character varying COLLATE pg_catalog."default",
    households_participation_percentage character varying COLLATE pg_catalog."default",
    background_about_ssf character varying COLLATE pg_catalog."default",
    justice_in_context character varying COLLATE pg_catalog."default",
    types_of_justice_distributive character varying COLLATE pg_catalog."default",
    types_of_justice_social character varying COLLATE pg_catalog."default",
    types_of_justice_economic character varying COLLATE pg_catalog."default",
    types_of_justice_market character varying COLLATE pg_catalog."default",
    types_of_justice_infrastructure character varying COLLATE pg_catalog."default",
    types_of_justice_regulatory character varying COLLATE pg_catalog."default",
    types_of_justice_procedural character varying COLLATE pg_catalog."default",
    types_of_justice_environmental character varying COLLATE pg_catalog."default",
    types_of_justice_others character varying COLLATE pg_catalog."default",
    dealing_with_justice character varying COLLATE pg_catalog."default",
    covid_19_related character varying COLLATE pg_catalog."default",
    CONSTRAINT ssf_bluejustice_pkey PRIMARY KEY (issf_core_id)
)
    INHERITS (public.issf_core)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.ssf_bluejustice
    OWNER to postgres;

-- Create function to generate a core_record_summary for Blue Justice

CREATE OR REPLACE FUNCTION public.bluejustice_summary_update(
	core_id integer)
    RETURNS void
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE 
AS $BODY$

  DECLARE

    bluejustice   ssf_bluejustice%ROWTYPE;

    summary_text TEXT := '';

  BEGIN


    SELECT *


    INTO bluejustice


    FROM ssf_bluejustice


    WHERE issf_core_id = core_id;


    summary_text := summary_text || '<strong> Name: </strong>' || bluejustice.name;


    bluejustice.core_record_summary := summary_text;


    UPDATE ssf_bluejustice


    SET core_record_summary = summary_text


    WHERE issf_core_id = core_id;


  END;


  $BODY$;

ALTER FUNCTION public.bluejustice_summary_update(integer)
    OWNER TO postgres;