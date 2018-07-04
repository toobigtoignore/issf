SELECT geographic_scope_type, count(*) AS contribution_count
  FROM issf_core
  GROUP BY geographic_scope_type
  ORDER BY geographic_scope_type
