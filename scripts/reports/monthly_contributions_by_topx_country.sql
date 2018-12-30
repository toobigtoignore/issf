SELECT * FROM
(SELECT row_number() OVER (PARTITION BY year, month_no ORDER BY year, month_no, count(*) DESC) as row_num, year, month, month_no, sq.short_name, count(*) AS contribution_count
   FROM (
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, issf_core_id, geographic_scope_type as short_name, contribution_date
           FROM issf_core
           WHERE geographic_scope_type IN ('Global') --, 'Not specific')
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, issf_core.issf_core_id,country.short_name, issf_core.contribution_date
           FROM issf_core
             JOIN geographic_scope_region ON issf_core.issf_core_id = geographic_scope_region.issf_core_id
             JOIN geographic_scope_region_country ON geographic_scope_region.geographic_scope_region_id = geographic_scope_region_country.geographic_scope_region_id
             JOIN country ON geographic_scope_region_country.country_id = country.country_id
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, issf_core.issf_core_id, country.short_name, issf_core.contribution_date
           FROM issf_core
             JOIN geographic_scope_nation ON issf_core.issf_core_id = geographic_scope_nation.issf_core_id
             JOIN country ON geographic_scope_nation.country_id = country.country_id
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, issf_core.issf_core_id, country.short_name, issf_core.contribution_date
           FROM issf_core
             JOIN geographic_scope_subnation ON issf_core.issf_core_id = geographic_scope_subnation.issf_core_id
             JOIN country ON geographic_scope_subnation.country_id = country.country_id
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, issf_core.issf_core_id, country.short_name, issf_core.contribution_date
           FROM issf_core
             JOIN geographic_scope_local_area ON issf_core.issf_core_id = geographic_scope_local_area.issf_core_id
             JOIN country ON geographic_scope_local_area.country_id = country.country_id
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, ssf_organization.issf_core_id, country.short_name, ssf_organization.contribution_date
           FROM ssf_organization
             JOIN country ON ssf_organization.country_id = country.country_id
        UNION
         SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, p.issf_core_id,
                CASE
                    WHEN cp.short_name IS NOT NULL THEN cp.short_name
                    ELSE cu.short_name
                END AS short_name,
            p.contribution_date
           FROM ssf_person p
             LEFT JOIN country cp ON p.country_id = cp.country_id
             JOIN user_profile u ON p.contributor_id = u.id
             LEFT JOIN country cu ON u.country_id = cu.country_id) sq
  GROUP BY sq.short_name, year, month, month_no
  ORDER BY year, month_no, count(*) DESC --, sq.short_name (without name sort, ties will appear in "random" order)
) iq
WHERE row_num < 4