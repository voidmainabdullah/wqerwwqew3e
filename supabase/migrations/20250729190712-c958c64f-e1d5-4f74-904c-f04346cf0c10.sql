-- Add password protection to shared_links table
ALTER TABLE shared_links ADD COLUMN IF NOT EXISTS password_hash text;

-- Add a function to validate passwords
CREATE OR REPLACE FUNCTION public.validate_share_password(
  token text,
  password text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Add a function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;