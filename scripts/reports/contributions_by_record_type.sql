SELECT core_record_type, count(*) AS contribution_count
  FROM issf_core
  GROUP BY core_record_type
  ORDER BY core_record_type
