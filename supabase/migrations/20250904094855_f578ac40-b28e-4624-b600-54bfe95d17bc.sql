-- Fix the create_file_share function to properly set is_locked when password is provided
CREATE OR REPLACE FUNCTION public.create_file_share(
  p_file_id uuid,
  p_link_type text,
  p_expires_at timestamp with time zone DEFAULT NULL,
  p_download_limit integer DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_recipient_email text DEFAULT NULL
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
  
  -- Generate unique share token using gen_random_uuid (no extension needed)
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
    -- For direct links, still set is_locked if password is provided
    IF p_password_hash IS NOT NULL THEN
      UPDATE files 
      SET is_locked = true,
          password_hash = p_password_hash
      WHERE id = p_file_id;
    END IF;
  END IF;
  
  -- Insert shared link
  INSERT INTO shared_links (
    file_id, 
    share_token, 
    link_type, 
    expires_at, 
    download_limit, 
    password_hash, 
    recipient_email
  ) VALUES (
    p_file_id,
    v_share_token,
    p_link_type,
    p_expires_at,
    p_download_limit,
    p_password_hash,
    p_recipient_email
  );
  
  RETURN QUERY SELECT v_share_token, v_share_code;
END;
$function$;