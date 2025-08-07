-- Update storage logic: 6GB total storage for free users, unlimited for pro
-- Remove daily upload limits and implement proper storage tracking

-- Reset daily upload logic to proper storage tracking
UPDATE public.profiles 
SET daily_upload_limit = NULL,
    daily_upload_count = 0,
    storage_limit = 6442450944 -- 6GB in bytes
WHERE subscription_tier = 'free';

-- Set unlimited storage for pro users
UPDATE public.profiles 
SET daily_upload_limit = NULL,
    daily_upload_count = 0,
    storage_limit = NULL -- NULL means unlimited
WHERE subscription_tier = 'pro';

-- Update default values for new users
ALTER TABLE public.profiles 
ALTER COLUMN daily_upload_limit DROP DEFAULT,
ALTER COLUMN storage_limit SET DEFAULT 6442450944; -- 6GB default

-- Create function to check storage quota before upload
CREATE OR REPLACE FUNCTION public.check_storage_quota(
  p_user_id uuid,
  p_file_size bigint
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_storage bigint;
  storage_limit bigint;
BEGIN
  -- Get user's current storage usage and limit
  SELECT 
    COALESCE(storage_used, 0),
    storage_limit
  INTO current_storage, storage_limit
  FROM profiles 
  WHERE id = p_user_id;
  
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
$$;

-- Create function to update storage usage
CREATE OR REPLACE FUNCTION public.update_storage_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update storage usage when files are added
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET storage_used = COALESCE(storage_used, 0) + NEW.file_size
    WHERE id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  -- Update storage usage when files are deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET storage_used = GREATEST(COALESCE(storage_used, 0) - OLD.file_size, 0)
    WHERE id = OLD.user_id;
    
    RETURN OLD;
  END IF;
  
  -- Update storage usage when file size changes
  IF TG_OP = 'UPDATE' THEN
    UPDATE profiles 
    SET storage_used = COALESCE(storage_used, 0) - OLD.file_size + NEW.file_size
    WHERE id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update storage usage
DROP TRIGGER IF EXISTS trigger_update_storage_usage ON files;
CREATE TRIGGER trigger_update_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_usage();

-- Update existing storage usage for all users
WITH user_storage AS (
  SELECT 
    user_id,
    COALESCE(SUM(file_size), 0) as total_storage
  FROM files
  GROUP BY user_id
)
UPDATE profiles 
SET storage_used = user_storage.total_storage
FROM user_storage 
WHERE profiles.id = user_storage.user_id;