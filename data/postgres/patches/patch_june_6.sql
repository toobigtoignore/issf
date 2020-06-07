CREATE OR REPLACE FUNCTION public.bluejustice_summary_update(core_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$

  DECLARE

    bluejustice   ssf_bluejustice%ROWTYPE;

    summary_text TEXT := '';

  BEGIN


    SELECT *


    INTO bluejustice


    FROM ssf_bluejustice


    WHERE issf_core_id = core_id;


    summary_text := summary_text || '<strong> Name: </strong>' || bluejustice.ssf_name || '<br><strong> Country: </strong>' || bluejustice.ssf_country;


    bluejustice.core_record_summary := summary_text;


    UPDATE ssf_bluejustice


    SET core_record_summary = summary_text


    WHERE issf_core_id = core_id;


  END;


  $function$
;
