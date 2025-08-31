
-- Fix the ambiguous column reference in check_storage_quota function
CREATE OR REPLACE FUNCTION public.check_storage_quota(p_user_id uuid, p_file_size bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_storage bigint;
  storage_limit bigint;
BEGIN
  -- Get user's current storage usage and limit with properly qualified column names
  SELECT 
    COALESCE(profiles.storage_used, 0),
    profiles.storage_limit
  INTO current_storage, storage_limit
  FROM profiles 
  WHERE profiles.id = p_user_id;
  
  -- If no storage limit (pro user), allow upload
  IF storage_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if adding this file would exceed the limit
  IF (current_storage + p_file_size) > storage_limit THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$
