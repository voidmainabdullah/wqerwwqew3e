-- Add message support to shared_links table
ALTER TABLE shared_links ADD COLUMN IF NOT EXISTS message TEXT;

-- Update the create_file_share function to handle messages and proper public/private access
CREATE OR REPLACE FUNCTION public.create_file_share(
  p_file_id uuid,
  p_link_type text,
  p_expires_at timestamp with time zone DEFAULT NULL,
  p_download_limit integer DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_recipient_email text DEFAULT NULL,
  p_message text DEFAULT NULL
)
RETURNS TABLE(share_token text, share_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_share_token text;
  v_share_code text;
  v_file_owner uuid;
BEGIN
  -- Check if user owns the file
  SELECT user_id INTO v_file_owner FROM files WHERE id = p_file_id;
  IF v_file_owner != auth.uid() THEN
    RAISE EXCEPTION 'You can only share your own files';
  END IF;
  
  -- Generate unique share token
  v_share_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  
  -- Generate share code for code sharing
  IF p_link_type = 'code' THEN
    v_share_code := generate_unique_share_code();
    
    -- Update the file with share_code and set is_locked if password is provided
    UPDATE files 
    SET share_code = v_share_code,
        is_locked = CASE WHEN p_password_hash IS NOT NULL THEN true ELSE is_locked END,
        password_hash = CASE WHEN p_password_hash IS NOT NULL THEN p_password_hash ELSE password_hash END
    WHERE id = p_file_id;
  ELSE
    -- For direct links, set is_locked if password is provided
    IF p_password_hash IS NOT NULL THEN
      UPDATE files 
      SET is_locked = true,
          password_hash = p_password_hash
      WHERE id = p_file_id;
    END IF;
  END IF;
  
  -- Insert shared link with message
  INSERT INTO shared_links (
    file_id, 
    share_token, 
    link_type, 
    expires_at, 
    download_limit, 
    password_hash, 
    recipient_email,
    message
  ) VALUES (
    p_file_id,
    v_share_token,
    p_link_type,
    p_expires_at,
    p_download_limit,
    p_password_hash,
    p_recipient_email,
    p_message
  );
  
  RETURN QUERY SELECT v_share_token, v_share_code;
END;
$function$;

-- Add function to toggle file lock status (admin functionality)
CREATE OR REPLACE FUNCTION public.admin_toggle_file_lock(
  p_file_id uuid,
  p_is_locked boolean,
  p_password text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_password_hash text;
BEGIN
  -- Check if user owns the file
  IF NOT EXISTS (SELECT 1 FROM files WHERE id = p_file_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'File not found or access denied';
  END IF;
  
  -- Hash password if locking and password provided
  IF p_is_locked AND p_password IS NOT NULL THEN
    v_password_hash := public.crypt(p_password, public.gen_salt('bf'));
  ELSE
    v_password_hash := NULL;
  END IF;
  
  -- Update file lock status
  UPDATE files 
  SET is_locked = p_is_locked, 
      password_hash = v_password_hash 
  WHERE id = p_file_id AND user_id = auth.uid();
  
  RETURN p_is_locked;
END;
$function$;

-- Add function to check file access permissions
CREATE OR REPLACE FUNCTION public.check_file_access(
  p_file_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE(can_access boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_file_owner uuid;
  v_is_public boolean;
  v_is_locked boolean;
BEGIN
  -- Get file details
  SELECT user_id, is_public, is_locked 
  INTO v_file_owner, v_is_public, v_is_locked
  FROM files 
  WHERE id = p_file_id;
  
  -- File not found
  IF v_file_owner IS NULL THEN
    RETURN QUERY SELECT false, 'File not found';
    RETURN;
  END IF;
  
  -- Owner can always access
  IF p_user_id = v_file_owner THEN
    RETURN QUERY SELECT true, 'Owner access';
    RETURN;
  END IF;
  
  -- Private file - only owner can access
  IF NOT v_is_public THEN
    RETURN QUERY SELECT false, 'Private file - access denied';
    RETURN;
  END IF;
  
  -- Public file - check if locked
  IF v_is_locked THEN
    RETURN QUERY SELECT false, 'File is locked - password required';
    RETURN;
  END IF;
  
  -- Public unlocked file - anyone can access
  RETURN QUERY SELECT true, 'Public file access';
END;
$function$;