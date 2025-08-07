-- Fix get_user_by_email function to return proper types
DROP FUNCTION IF EXISTS public.get_user_by_email(text);

CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input text)
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id::uuid, au.email::text
  FROM auth.users au
  WHERE au.email = email_input
  AND au.email_confirmed_at IS NOT NULL; -- Only return confirmed users
END;
$$;

-- Create function to get team members with proper joins
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
AS $$
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
$$;

-- Update profiles table to increase storage limits
-- 6GB = 6442450944 bytes for free, unlimited for premium
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS storage_used bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit bigint DEFAULT 6442450944; -- 6GB in bytes

-- Update existing free users to new limit
UPDATE public.profiles 
SET storage_limit = 6442450944 
WHERE subscription_tier = 'free';

-- Update premium users to unlimited (NULL means unlimited)
UPDATE public.profiles 
SET storage_limit = NULL 
WHERE subscription_tier = 'pro';