-- Fix the validate_share_password function to properly use crypt with schema qualification
CREATE OR REPLACE FUNCTION public.validate_share_password(token text, password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM shared_links
  WHERE share_token = token AND is_active = true;
  
  -- If no password hash is stored, no password is required
  IF stored_hash IS NULL THEN
    RETURN true;
  END IF;
  
  -- Use pgcrypto's crypt function with proper schema qualification
  RETURN stored_hash = public.crypt(password, stored_hash);
END;
$function$;

-- Also fix the hash_password function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.crypt(password, public.gen_salt('bf'));
END;
$function$;

-- Fix the toggle_file_lock_status function
CREATE OR REPLACE FUNCTION public.toggle_file_lock_status(p_file_id uuid, p_is_locked boolean, p_password text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_password_hash text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM files WHERE id = p_file_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'File not found or access denied';
  END IF;
  
  -- Hash password if locking and password provided
  IF p_is_locked AND p_password IS NOT NULL THEN
    v_password_hash := public.crypt(p_password, public.gen_salt('bf'));
  ELSE
    v_password_hash := NULL;
  END IF;
  
  UPDATE files 
  SET is_locked = p_is_locked, password_hash = v_password_hash 
  WHERE id = p_file_id AND user_id = auth.uid();
  
  RETURN p_is_locked;
END;
$function$;