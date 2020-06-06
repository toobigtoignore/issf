#This patch is specific to FIX IWA-51. Should not be aplied as a regular patch as june 6 patch fixes this.
UPDATE public.ssf_bluejustice set core_record_summary = concat('<strong> Name: </strong>', ssf_name);
