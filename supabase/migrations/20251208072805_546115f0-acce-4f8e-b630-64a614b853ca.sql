-- Create a function to handle received file uploads securely (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_received_file(
  p_receive_request_id uuid,
  p_original_name text,
  p_file_size bigint,
  p_file_type text,
  p_storage_path text,
  p_uploader_name text DEFAULT NULL,
  p_uploader_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_file_id uuid;
  v_request_name text;
BEGIN
  -- Get the user_id from the receive request
  SELECT user_id, name INTO v_user_id, v_request_name
  FROM receive_requests
  WHERE id = p_receive_request_id AND is_active = true;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive receive request';
  END IF;
  
  -- Create the file record for the receiver's account
  INSERT INTO files (
    user_id,
    original_name,
    file_size,
    file_type,
    storage_path,
    is_public,
    is_locked
  ) VALUES (
    v_user_id,
    p_original_name,
    p_file_size,
    p_file_type,
    p_storage_path,
    false,
    false
  ) RETURNING id INTO v_file_id;
  
  -- Update user's storage usage
  UPDATE profiles 
  SET storage_used = COALESCE(storage_used, 0) + p_file_size
  WHERE id = v_user_id;
  
  -- Link file to receive request
  INSERT INTO received_files (
    receive_request_id,
    file_id,
    uploader_name,
    uploader_email
  ) VALUES (
    p_receive_request_id,
    v_file_id,
    p_uploader_name,
    p_uploader_email
  );
  
  -- Create notification for the receiver
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_user_id,
    'file_received',
    'New file received',
    CASE 
      WHEN p_uploader_name IS NOT NULL THEN p_uploader_name || ' sent you a file: ' || p_original_name
      ELSE 'Anonymous user sent you a file: ' || p_original_name
    END,
    jsonb_build_object(
      'file_id', v_file_id,
      'file_name', p_original_name,
      'uploader_name', p_uploader_name,
      'uploader_email', p_uploader_email,
      'request_name', v_request_name
    )
  );
  
  RETURN v_file_id;
END;
$$;

-- Add storage policy to allow anonymous uploads to received folder
CREATE POLICY "Anyone can upload to received folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'files' 
  AND (storage.foldername(name))[1] = 'received'
);