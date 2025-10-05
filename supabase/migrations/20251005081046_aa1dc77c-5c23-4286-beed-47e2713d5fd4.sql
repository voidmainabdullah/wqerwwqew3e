-- Add folder_id to shared_links to support folder sharing
ALTER TABLE shared_links ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE CASCADE;

-- Make file_id nullable since we can now share folders
ALTER TABLE shared_links ALTER COLUMN file_id DROP NOT NULL;

-- Add constraint to ensure either file_id or folder_id is set
ALTER TABLE shared_links ADD CONSTRAINT shared_links_file_or_folder_check 
  CHECK ((file_id IS NOT NULL AND folder_id IS NULL) OR (file_id IS NULL AND folder_id IS NOT NULL));

-- Update create_folder_share function to return proper data
CREATE OR REPLACE FUNCTION public.create_folder_share(
  p_folder_id uuid,
  p_link_type text,
  p_expires_at timestamp with time zone DEFAULT NULL,
  p_download_limit integer DEFAULT NULL,
  p_password_hash text DEFAULT NULL,
  p_message text DEFAULT NULL
) RETURNS TABLE(share_token text, share_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share_token TEXT;
  v_share_code TEXT;
  v_folder_owner UUID;
BEGIN
  -- Check if user owns the folder
  SELECT user_id INTO v_folder_owner FROM folders WHERE id = p_folder_id;
  IF v_folder_owner != auth.uid() THEN
    RAISE EXCEPTION 'You can only share your own folders';
  END IF;
  
  -- Generate unique share token
  v_share_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  
  -- Generate share code for code sharing
  IF p_link_type = 'code' THEN
    v_share_code := generate_unique_share_code();
    
    -- Update folder with share_code and set is_public
    UPDATE folders 
    SET share_code = v_share_code,
        is_public = true
    WHERE id = p_folder_id;
  ELSE
    -- For direct links, set folder as public
    UPDATE folders 
    SET is_public = true
    WHERE id = p_folder_id;
  END IF;
  
  -- Insert shared link for folder
  INSERT INTO shared_links (
    folder_id,
    share_token,
    link_type,
    expires_at,
    download_limit,
    password_hash,
    message
  ) VALUES (
    p_folder_id,
    v_share_token,
    p_link_type,
    p_expires_at,
    p_download_limit,
    p_password_hash,
    p_message
  );
  
  RETURN QUERY SELECT v_share_token, v_share_code;
END;
$$;

-- Create function to get folder contents for shared folders
CREATE OR REPLACE FUNCTION public.get_shared_folder_contents(p_share_token text)
RETURNS TABLE(
  item_type text,
  id uuid,
  name text,
  file_size bigint,
  file_type text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_folder_id UUID;
BEGIN
  -- Get folder_id from share token
  SELECT folder_id INTO v_folder_id
  FROM shared_links
  WHERE share_token = p_share_token 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  IF v_folder_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired share link';
  END IF;
  
  -- Return folder contents
  RETURN QUERY
  SELECT 
    'file'::TEXT as item_type,
    f.id,
    f.original_name as name,
    f.file_size,
    f.file_type,
    f.created_at
  FROM files f
  WHERE f.folder_id = v_folder_id
  ORDER BY f.created_at DESC;
END;
$$;

-- Update RLS policies for shared_links to include folder sharing
DROP POLICY IF EXISTS "Users can view their shared links" ON shared_links;
CREATE POLICY "Users can view their shared links"
ON shared_links FOR SELECT
USING (
  (file_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM files WHERE files.id = shared_links.file_id AND files.user_id = auth.uid()
  ))
  OR
  (folder_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM folders WHERE folders.id = shared_links.folder_id AND folders.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can create shared links for their files" ON shared_links;
CREATE POLICY "Users can create shared links"
ON shared_links FOR INSERT
WITH CHECK (
  (file_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM files WHERE files.id = shared_links.file_id AND files.user_id = auth.uid()
  ))
  OR
  (folder_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM folders WHERE folders.id = shared_links.folder_id AND folders.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can update their shared links" ON shared_links;
CREATE POLICY "Users can update their shared links"
ON shared_links FOR UPDATE
USING (
  (file_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM files WHERE files.id = shared_links.file_id AND files.user_id = auth.uid()
  ))
  OR
  (folder_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM folders WHERE folders.id = shared_links.folder_id AND folders.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can delete their shared links" ON shared_links;
CREATE POLICY "Users can delete their shared links"
ON shared_links FOR DELETE
USING (
  (file_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM files WHERE files.id = shared_links.file_id AND files.user_id = auth.uid()
  ))
  OR
  (folder_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM folders WHERE folders.id = shared_links.folder_id AND folders.user_id = auth.uid()
  ))
);