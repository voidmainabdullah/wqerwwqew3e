-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_user_teams(uuid);

-- Recreate the function with a properly named parameter to avoid ambiguity
CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id uuid)
RETURNS TABLE(team_id uuid, team_name text, is_admin boolean, role text, permissions jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    (t.admin_id = p_user_id) as is_admin,
    tm.role,
    tm.permissions
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = p_user_id;
END;
$function$;

-- Add missing foreign key constraints for proper relationships (ignore if they already exist)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.team_file_shares 
    ADD CONSTRAINT team_file_shares_file_id_fkey 
    FOREIGN KEY (file_id) REFERENCES public.files(id) ON DELETE CASCADE;
  EXCEPTION 
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.team_file_shares 
    ADD CONSTRAINT team_file_shares_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;
  EXCEPTION 
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.team_file_shares 
    ADD CONSTRAINT team_file_shares_shared_by_fkey 
    FOREIGN KEY (shared_by) REFERENCES auth.users(id) ON DELETE CASCADE;
  EXCEPTION 
    WHEN duplicate_object THEN NULL;
  END;
END $$;