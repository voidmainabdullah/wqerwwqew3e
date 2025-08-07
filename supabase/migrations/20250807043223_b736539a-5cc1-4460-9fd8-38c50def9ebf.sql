-- Create function to get team files for a user
CREATE OR REPLACE FUNCTION public.get_my_team_files(p_user_id uuid)
RETURNS TABLE(
  file_id uuid,
  file_name text,
  file_size bigint,
  file_type text,
  created_at timestamp with time zone,
  is_locked boolean,
  download_count integer,
  team_id uuid,
  team_name text,
  shared_by uuid,
  shared_at timestamp with time zone,
  sharer_email text,
  can_download boolean,
  can_edit boolean,
  is_team_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as file_id,
    f.original_name as file_name,
    f.file_size,
    f.file_type,
    f.created_at,
    f.is_locked,
    f.download_count,
    tfs.team_id,
    t.name as team_name,
    tfs.shared_by,
    tfs.shared_at,
    p.email as sharer_email,
    CASE 
      WHEN tm.permissions->>'can_view' = 'true' THEN true
      ELSE false
    END as can_download,
    CASE 
      WHEN tm.permissions->>'can_edit' = 'true' OR t.admin_id = p_user_id THEN true
      ELSE false
    END as can_edit,
    CASE 
      WHEN t.admin_id = p_user_id THEN true
      ELSE false
    END as is_team_admin
  FROM public.team_file_shares tfs
  JOIN public.files f ON f.id = tfs.file_id
  JOIN public.teams t ON t.id = tfs.team_id
  JOIN public.team_members tm ON tm.team_id = t.id AND tm.user_id = p_user_id
  JOIN public.profiles p ON p.id = tfs.shared_by
  ORDER BY tfs.shared_at DESC;
END;
$function$;