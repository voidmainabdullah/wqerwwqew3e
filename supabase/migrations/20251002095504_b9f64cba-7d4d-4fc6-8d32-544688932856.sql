-- Create folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_code TEXT UNIQUE
);

-- Enable RLS on folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY "Users can view their own folders"
ON public.folders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
ON public.folders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
ON public.folders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
ON public.folders FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Public folders are viewable by anyone"
ON public.folders FOR SELECT
USING (is_public = true);

-- Add folder_id column to files table
ALTER TABLE public.files
ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_files_folder_id ON public.files(folder_id);
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_folder_id);

-- Trigger for folder updated_at
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get folder contents
CREATE OR REPLACE FUNCTION public.get_folder_contents(p_folder_id UUID DEFAULT NULL, p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  item_type TEXT,
  id UUID,
  name TEXT,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN,
  is_locked BOOLEAN,
  download_count INTEGER,
  folder_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get folders
  RETURN QUERY
  SELECT 
    'folder'::TEXT as item_type,
    f.id,
    f.name,
    NULL::BIGINT as file_size,
    NULL::TEXT as file_type,
    f.created_at,
    f.is_public,
    false as is_locked,
    0 as download_count,
    f.parent_folder_id as folder_id
  FROM folders f
  WHERE (p_folder_id IS NULL AND f.parent_folder_id IS NULL OR f.parent_folder_id = p_folder_id)
    AND f.user_id = COALESCE(p_user_id, auth.uid())
  
  UNION ALL
  
  -- Get files
  SELECT 
    'file'::TEXT as item_type,
    fi.id,
    fi.original_name as name,
    fi.file_size,
    fi.file_type,
    fi.created_at,
    fi.is_public,
    fi.is_locked,
    fi.download_count,
    fi.folder_id
  FROM files fi
  WHERE (p_folder_id IS NULL AND fi.folder_id IS NULL OR fi.folder_id = p_folder_id)
    AND fi.user_id = COALESCE(p_user_id, auth.uid())
  
  ORDER BY item_type DESC, created_at DESC;
END;
$$;

-- Function to create folder share
CREATE OR REPLACE FUNCTION public.create_folder_share(
  p_folder_id UUID,
  p_link_type TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_password_hash TEXT DEFAULT NULL
)
RETURNS TABLE(share_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_share_code TEXT;
  v_folder_owner UUID;
BEGIN
  -- Check if user owns the folder
  SELECT user_id INTO v_folder_owner FROM folders WHERE id = p_folder_id;
  IF v_folder_owner != auth.uid() THEN
    RAISE EXCEPTION 'You can only share your own folders';
  END IF;
  
  -- Generate unique share code
  v_share_code := generate_unique_share_code();
  
  -- Update folder with share code and public status
  UPDATE folders 
  SET share_code = v_share_code,
      is_public = true
  WHERE id = p_folder_id;
  
  RETURN QUERY SELECT v_share_code;
END;
$$;