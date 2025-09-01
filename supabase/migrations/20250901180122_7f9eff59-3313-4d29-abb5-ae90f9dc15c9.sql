-- First clear all existing shared_links data to avoid constraint issues
DELETE FROM public.shared_links WHERE link_type = 'public';

-- Drop and recreate the constraint with correct values
ALTER TABLE public.shared_links 
DROP CONSTRAINT IF EXISTS shared_links_link_type_check;

ALTER TABLE public.shared_links 
ADD CONSTRAINT shared_links_link_type_check 
CHECK (link_type = ANY (ARRAY['direct'::text, 'email'::text, 'code'::text]));