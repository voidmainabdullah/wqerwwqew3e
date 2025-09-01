-- Fix the link_type check constraint to match frontend values
ALTER TABLE public.shared_links 
DROP CONSTRAINT shared_links_link_type_check;

ALTER TABLE public.shared_links 
ADD CONSTRAINT shared_links_link_type_check 
CHECK (link_type = ANY (ARRAY['direct'::text, 'email'::text, 'code'::text]));

-- Also ensure the files table has proper structure for public/private and lock functionality
-- Add missing columns if they don't exist (will be ignored if they already exist)
DO $$ 
BEGIN
  -- Check if password_hash column exists in files table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'files' AND column_name = 'password_hash') THEN
    ALTER TABLE public.files ADD COLUMN password_hash text;
  END IF;
  
  -- Ensure share_code column exists and has proper constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'files' AND column_name = 'share_code') THEN
    ALTER TABLE public.files ADD COLUMN share_code text UNIQUE;
  END IF;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create function to generate unique share codes
CREATE OR REPLACE FUNCTION public.generate_unique_share_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  code_exists boolean := true;
BEGIN
  WHILE code_exists LOOP
    new_code := generate_share_code();
    SELECT EXISTS(SELECT 1 FROM files WHERE share_code = new_code) INTO code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- Update RLS policies for shared links to work with all link types
DROP POLICY IF EXISTS "Public shared links are accessible" ON shared_links;
CREATE POLICY "Public shared links are accessible" 
ON shared_links 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create function to handle file sharing with proper backend logic
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
  
  -- Generate share code if link_type is code
  IF p_link_type = 'code' THEN
    v_share_code := generate_unique_share_code();
    -- Update file with share code
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