-- Fix storage policies to allow public downloads for shared files
-- First, create a policy for files bucket to allow downloads for shared files

-- Policy to allow downloads for files that are public or have active share links
CREATE POLICY "Allow downloads for shared files" ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'files' AND 
  (
    -- Allow if file is public
    EXISTS (
      SELECT 1 FROM public.files 
      WHERE files.storage_path = objects.name 
      AND files.is_public = true
    ) 
    OR 
    -- Allow if file has active share links or share codes
    EXISTS (
      SELECT 1 FROM public.files f
      LEFT JOIN public.shared_links sl ON f.id = sl.file_id
      WHERE f.storage_path = objects.name 
      AND (
        sl.is_active = true 
        OR f.share_code IS NOT NULL
      )
    )
  )
);