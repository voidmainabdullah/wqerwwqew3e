-- Create validate_file_password function to validate passwords directly against files
CREATE OR REPLACE FUNCTION public.validate_file_password(p_file_id uuid, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM files
  WHERE id = p_file_id AND is_locked = true;
  
  -- If no password hash is stored or file is not locked, no password is required
  IF stored_hash IS NULL THEN
    RETURN true;
  END IF;
  
  -- Use pgcrypto's crypt function with proper schema qualification
  RETURN stored_hash = public.crypt(p_password, stored_hash);
END;
$function$;