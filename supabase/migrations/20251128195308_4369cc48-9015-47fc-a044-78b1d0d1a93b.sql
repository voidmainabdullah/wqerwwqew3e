-- Helper function to update storage after file deletion (used by edge function)
CREATE OR REPLACE FUNCTION public.update_storage_after_deletion(p_user_id uuid, p_file_size bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET storage_used = GREATEST(COALESCE(storage_used, 0) - p_file_size, 0)
  WHERE id = p_user_id;
END;
$$;