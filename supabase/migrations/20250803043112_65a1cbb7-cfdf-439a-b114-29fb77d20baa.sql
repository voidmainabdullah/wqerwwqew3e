-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_user_teams(user_id UUID)
RETURNS TABLE(
  team_id UUID,
  team_name TEXT,
  is_admin BOOLEAN,
  role TEXT,
  permissions JSONB
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    (t.admin_id = user_id) as is_admin,
    tm.role,
    tm.permissions
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input TEXT)
RETURNS TABLE(user_id UUID, email TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = email_input;
END;
$$;