-- Update default storage limit for Basic plan users to 5 GB
UPDATE public.profiles 
SET storage_limit = 5368709120  -- 5 GB in bytes
WHERE subscription_tier = 'basic' AND storage_limit IS NULL;

-- Function to delete expired Basic plan files (24 hours old)
CREATE OR REPLACE FUNCTION public.delete_expired_basic_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_file RECORD;
BEGIN
  -- Find all files from Basic users that are older than 24 hours
  FOR expired_file IN 
    SELECT f.id, f.storage_path, f.user_id, f.file_size
    FROM files f
    JOIN profiles p ON p.id = f.user_id
    WHERE p.subscription_tier = 'basic'
      AND f.created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Delete from storage (this will be done via edge function)
    -- Delete from database
    DELETE FROM files WHERE id = expired_file.id;
    
    -- Update storage usage
    UPDATE profiles 
    SET storage_used = GREATEST(COALESCE(storage_used, 0) - expired_file.file_size, 0)
    WHERE id = expired_file.user_id;
  END LOOP;
END;
$$;

-- Function to check if user is on Basic plan
CREATE OR REPLACE FUNCTION public.is_basic_plan_user(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id 
    AND subscription_tier = 'basic'
  );
$$;

-- Update check_storage_quota to enforce Basic plan limits
CREATE OR REPLACE FUNCTION public.check_storage_quota(p_user_id uuid, p_file_size bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_storage bigint;
  storage_limit bigint;
  subscription_tier text;
  max_file_size bigint := 2147483648; -- 2 GB in bytes for Basic plan
BEGIN
  -- Get user's current storage usage, limit, and subscription tier
  SELECT 
    COALESCE(profiles.storage_used, 0),
    profiles.storage_limit,
    profiles.subscription_tier
  INTO current_storage, storage_limit, subscription_tier
  FROM profiles 
  WHERE profiles.id = p_user_id;
  
  -- For Basic plan users, enforce 2 GB per file limit
  IF subscription_tier = 'basic' AND p_file_size > max_file_size THEN
    RETURN false;
  END IF;
  
  -- If no storage limit (pro/premium user), allow upload
  IF storage_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if adding this file would exceed the limit
  IF (current_storage + p_file_size) > storage_limit THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;