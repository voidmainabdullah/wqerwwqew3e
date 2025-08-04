-- First, let's check if the function exists and recreate it properly
DROP FUNCTION IF EXISTS public.get_user_teams(uuid);

-- Create the function with proper security settings
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_teams(uuid) TO authenticated;

-- Fix the team_file_shares foreign key issue by adding the missing constraint to profiles
ALTER TABLE public.team_file_shares 
DROP CONSTRAINT IF EXISTS team_file_shares_shared_by_fkey;

-- Add the correct foreign key constraint (referencing profiles instead of auth.users for better compatibility)
ALTER TABLE public.team_file_shares 
ADD CONSTRAINT team_file_shares_shared_by_fkey 
FOREIGN KEY (shared_by) REFERENCES public.profiles(id) ON DELETE CASCADE;