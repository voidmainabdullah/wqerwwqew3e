-- Drop the problematic constraint first
ALTER TABLE public.shared_links 
DROP CONSTRAINT IF EXISTS shared_links_link_type_check;

-- Update all existing 'public' values to 'direct'
UPDATE public.shared_links 
SET link_type = 'direct' 
WHERE link_type = 'public';

-- Add the corrected constraint
ALTER TABLE public.shared_links 
ADD CONSTRAINT shared_links_link_type_check 
CHECK (link_type = ANY (ARRAY['direct'::text, 'email'::text, 'code'::text]));

-- Add password_hash column to files table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'files' AND column_name = 'password_hash') THEN
    ALTER TABLE public.files ADD COLUMN password_hash text;
  END IF;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create improved backend functions for file sharing
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
  
  -- Generate unique share token
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
$function$;

-- Function to toggle file public/private status
CREATE OR REPLACE FUNCTION public.toggle_file_public_status(p_file_id uuid, p_is_public boolean)
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

-- Function to toggle file lock status
CREATE OR REPLACE FUNCTION public.toggle_file_lock_status(
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
  IF NOT EXISTS (SELECT 1 FROM files WHERE id = p_file_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'File not found or access denied';
  END IF;
  
  -- Hash password if locking and password provided
  IF p_is_locked AND p_password IS NOT NULL THEN
    v_password_hash := crypt(p_password, gen_salt('bf'));
  ELSE
    v_password_hash := NULL;
  END IF;
  
  UPDATE files 
  SET is_locked = p_is_locked, password_hash = v_password_hash 
  WHERE id = p_file_id AND user_id = auth.uid();
  
  RETURN p_is_locked;
END;
$function$;