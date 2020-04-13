-- This will revert the changes to the database what that are made in 'patch_blue_justice.sql'

-- 1. Remove example column
ALTER TABLE public.ssf_experience
    DROP COLUMN example_column;