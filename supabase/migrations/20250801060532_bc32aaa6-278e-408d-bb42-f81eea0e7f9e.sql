-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the hash_password function to ensure it works properly
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$function$;

-- Update the validate_share_password function to ensure it works properly  
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
  
  -- Use Postgres crypt function to verify password
  RETURN stored_hash = crypt(password, stored_hash);
END;
$function$;