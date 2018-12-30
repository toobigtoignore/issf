SELECT date_part('year', contribution_date) AS year, to_char(contribution_date, 'Month') AS month, date_part('month', contribution_date) AS month_no, count(*) AS contribution_count
  FROM issf_core
  GROUP BY year, month, month_no
  ORDER BY year, month_no
