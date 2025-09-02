-- Fix the create_file_share function and missing dependencies

-- First, create the missing generate_unique_share_code function
CREATE OR REPLACE FUNCTION public.generate_unique_share_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN := TRUE;
BEGIN
  -- Generate unique codes until we find one that doesn't exist
  WHILE code_exists LOOP
    result := '';
    -- Generate 8-character code
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM files WHERE share_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Recreate the create_file_share function with proper pgcrypto support
CREATE OR REPLACE FUNCTION public.create_file_share(
  p_file_id uuid, 
  p_link_type text, 
  p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone, 
  p_download_limit integer DEFAULT NULL::integer, 
  p_password_hash text DEFAULT NULL::text, 
  p_recipient_email text DEFAULT NULL::text
)
RETURNS TABLE(share_token text, share_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  -- Generate unique share token using pgcrypto
  v_share_token := encode(gen_random_bytes(16), 'hex');
  
  -- Generate share code for code sharing
  IF p_link_type = 'code' THEN
    v_share_code := generate_unique_share_code();
    UPDATE files SET share_code = v_share_code WHERE id = p_file_id;
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
$$;