-- Update shared_links table to support complete sharing functionality
ALTER TABLE shared_links ADD COLUMN IF NOT EXISTS message text;

-- Update the create_file_share function to handle all features properly
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

-- Function to update shared link settings
CREATE OR REPLACE FUNCTION public.update_shared_link_settings(
  p_link_id uuid,
  p_is_active boolean DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_download_limit integer DEFAULT NULL,
  p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user owns the file associated with this shared link
  IF NOT EXISTS (
    SELECT 1 FROM shared_links sl
    JOIN files f ON f.id = sl.file_id
    WHERE sl.id = p_link_id AND f.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Shared link not found or access denied';
  END IF;
  
  -- Update shared link settings
  UPDATE shared_links 
  SET 
    is_active = COALESCE(p_is_active, is_active),
    password_hash = CASE WHEN p_password_hash IS NOT NULL THEN p_password_hash ELSE password_hash END,
    download_limit = CASE WHEN p_download_limit IS NOT NULL THEN p_download_limit ELSE download_limit END,
    expires_at = CASE WHEN p_expires_at IS NOT NULL THEN p_expires_at ELSE expires_at END
  WHERE id = p_link_id;
  
  -- Update corresponding file lock status if password is being set/removed
  IF p_password_hash IS NOT NULL THEN
    UPDATE files 
    SET is_locked = CASE WHEN p_password_hash = '' THEN false ELSE true END,
        password_hash = CASE WHEN p_password_hash = '' THEN NULL ELSE p_password_hash END
    WHERE id = (SELECT file_id FROM shared_links WHERE id = p_link_id);
  END IF;
  
  RETURN true;
END;
$function$;

-- Function to toggle file public/private status
CREATE OR REPLACE FUNCTION public.toggle_file_public_status(
  p_file_id uuid,
  p_is_public boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM files WHERE id = p_file_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'File not found or access denied';
  END IF;
  
  UPDATE files SET is_public = p_is_public WHERE id = p_file_id AND user_id = auth.uid();
  RETURN p_is_public;
END;
$function$;