CREATE OR REPLACE VIEW public.issf_core_map_point_unique
AS SELECT row_number() OVER (ORDER BY issf_core_map_point.issf_core_id) AS row_number,
    issf_core_map_point.issf_core_id,
    issf_core_map_point.contribution_date,
    issf_core_map_point.contributor_id,
    issf_core_map_point.edited_date,
    issf_core_map_point.editor_id,
    issf_core_map_point.core_record_type,
    issf_core_map_point.core_record_summary,
    issf_core_map_point.core_record_tsvector,
    issf_core_map_point.core_record_status,
    issf_core_map_point.geographic_scope_type,
    issf_core_map_point.map_point,
    issf_core_map_point.country_id,
    st_x(issf_core_map_point.map_point) AS lon,
    st_y(issf_core_map_point.map_point) AS lat
   FROM issf_core_map_point;

CREATE OR REPLACE VIEW public.issf_core_geog_scope_subnation
AS SELECT i.issf_core_id,
    i.contribution_date,
    i.contributor_id,
    i.edited_date,
    i.editor_id,
    i.core_record_type,
    i.core_record_summary,
    i.core_record_tsvector,
    i.core_record_status,
    i.geographic_scope_type,
        CASE
            WHEN g.subnation_point IS NOT NULL THEN g.subnation_point
            ELSE c.country_point
        END AS map_point,
    c.country_id
   FROM issf_core i
     left JOIN geographic_scope_subnation g ON i.issf_core_id = g.issf_core_id
     left JOIN country c ON g.country_id = c.country_id
  WHERE i.geographic_scope_type = 'Sub-national'::text;

CREATE OR REPLACE VIEW public.issf_core_geog_scope_region
AS SELECT t1.issf_core_id,
    t1.contribution_date,
    t1.contributor_id,
    t1.edited_date,
    t1.editor_id,
    t1.core_record_type,
    t1.core_record_summary,
    t1.core_record_tsvector,
    t1.core_record_status,
    t1.geographic_scope_type,
        CASE
            WHEN t2.country_point IS NOT NULL THEN t2.country_point
            ELSE t1.region_point
        END AS map_point,
    t2.country_id
   FROM ( SELECT i.issf_core_id,
            i.contribution_date,
            i.contributor_id,
            i.edited_date,
            i.editor_id,
            i.core_record_type,
            i.core_record_summary,
            i.core_record_tsvector,
            i.core_record_status,
            i.geographic_scope_type,
            g.geographic_scope_region_id,
            r.region_point
           FROM issf_core i
             left JOIN geographic_scope_region g ON i.issf_core_id = g.issf_core_id
             left JOIN region r ON g.region_id = r.region_id
          WHERE i.geographic_scope_type = 'Regional'::text) t1
     LEFT JOIN ( SELECT c.country_point,
            rc.geographic_scope_region_id,
            c.country_id
           FROM geographic_scope_region_country rc
             left JOIN country c ON rc.country_id = c.country_id) t2 ON t1.geographic_scope_region_id = t2.geographic_scope_region_id;

CREATE OR REPLACE VIEW public.issf_core_geog_scope_nation
AS SELECT i.issf_core_id,
    i.contribution_date,
    i.contributor_id,
    i.edited_date,
    i.editor_id,
    i.core_record_type,
    i.core_record_summary,
    i.core_record_tsvector,
    i.core_record_status,
    i.geographic_scope_type,
    c.country_point AS map_point,
    c.country_id
   FROM issf_core i
     LEFT JOIN geographic_scope_nation g ON i.issf_core_id = g.issf_core_id
     LEFT JOIN country c ON g.country_id = c.country_id
  WHERE i.geographic_scope_type = 'National'::text;

CREATE OR REPLACE VIEW public.issf_core_geog_scope_local_area
AS SELECT i.issf_core_id,
    i.contribution_date,
    i.contributor_id,
    i.edited_date,
    i.editor_id,
    i.core_record_type,
    i.core_record_summary,
    i.core_record_tsvector,
    i.core_record_status,
    i.geographic_scope_type,
        CASE
            WHEN g.local_area_point IS NOT NULL THEN g.local_area_point
            ELSE c.country_point
        END AS map_point,
    c.country_id
   FROM issf_core i
     LEFT JOIN geographic_scope_local_area g ON i.issf_core_id = g.issf_core_id
     LEFT JOIN country c ON g.country_id = c.country_id
  WHERE i.geographic_scope_type = 'Local'::text;

CREATE OR REPLACE VIEW public.organization_location
AS SELECT o.issf_core_id,
    o.contribution_date,
    o.contributor_id,
    o.edited_date,
    o.editor_id,
    o.core_record_type,
    o.core_record_summary,
    o.core_record_tsvector,
    o.core_record_status,
    o.geographic_scope_type,
        CASE
            WHEN o.organization_point IS NOT NULL THEN o.organization_point
            ELSE c.country_point
        END AS map_point,
    c.country_id
   FROM ssf_organization o
     LEFT JOIN country c ON o.country_id = c.country_id
  WHERE o.country_id IS NOT NULL OR o.organization_point IS NOT NULL;

CREATE OR REPLACE VIEW public.person_location
AS SELECT p.issf_core_id,
    p.contribution_date,
    p.contributor_id,
    p.edited_date,
    p.editor_id,
    p.core_record_type,
    p.core_record_summary,
    p.core_record_tsvector,
    p.core_record_status,
    p.geographic_scope_type,
        CASE
            WHEN p.person_point IS NOT NULL THEN p.person_point
            WHEN p.country_id IS NOT NULL THEN cp.country_point
            ELSE cu.country_point
        END AS map_point,
        CASE
            WHEN p.country_id IS NOT NULL THEN p.country_id
            ELSE cu.country_id
        END AS country_id
   FROM ssf_person p
     LEFT JOIN country cp ON p.country_id = cp.country_id
     LEFT JOIN user_profile u ON p.contributor_id = u.id
     LEFT JOIN country cu ON u.country_id = cu.country_id
  WHERE cu.country_id IS NOT NULL OR cp.country_id IS NOT NULL OR p.person_point IS NOT NULL;
