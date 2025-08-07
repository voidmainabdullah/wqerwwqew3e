-- Create function to get team members
CREATE OR REPLACE FUNCTION public.get_team_members(p_team_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  role text,
  permissions jsonb,
  joined_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.user_id,
    p.email,
    p.display_name,
    tm.role,
    tm.permissions,
    tm.joined_at
  FROM public.team_members tm
  JOIN public.profiles p ON p.id = tm.user_id
  WHERE tm.team_id = p_team_id
  ORDER BY tm.joined_at ASC;
END;
$function$;