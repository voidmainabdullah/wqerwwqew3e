/*
  # Fix team-related database functions

  1. Functions
    - `get_my_team_files` - Get files shared with user's teams
    - `get_team_members` - Get members of a specific team

  2. Security
    - Ensure proper RLS policies are in place
    - Add missing function definitions
*/

-- Function to get files shared with user's teams
CREATE OR REPLACE FUNCTION get_my_team_files(p_user_id uuid)
RETURNS TABLE (
  file_id uuid,
  file_name text,
  file_size bigint,
  file_type text,
  created_at timestamptz,
  is_locked boolean,
  download_count integer,
  team_id uuid,
  team_name text,
  shared_by uuid,
  shared_at timestamptz,
  sharer_email text,
  can_edit boolean,
  can_download boolean,
  is_team_admin boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    COALESCE(tm.permissions->>'can_edit', 'false')::boolean as can_edit,
    COALESCE(tm.permissions->>'can_view', 'true')::boolean as can_download,
    user_is_team_admin(tfs.team_id, p_user_id) as is_team_admin
  FROM team_file_shares tfs
  JOIN files f ON f.id = tfs.file_id
  JOIN teams t ON t.id = tfs.team_id
  JOIN profiles p ON p.id = tfs.shared_by
  JOIN team_members tm ON tm.team_id = tfs.team_id AND tm.user_id = p_user_id
  WHERE user_is_team_member(tfs.team_id, p_user_id)
  ORDER BY tfs.shared_at DESC;
END;
$$;

-- Function to get team members
CREATE OR REPLACE FUNCTION get_team_members(p_team_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  role text,
  permissions jsonb,
  joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.user_id,
    p.email,
    p.display_name,
    tm.role,
    tm.permissions,
    tm.joined_at
  FROM team_members tm
  JOIN profiles p ON p.id = tm.user_id
  WHERE tm.team_id = p_team_id
  ORDER BY tm.joined_at ASC;
END;
$$;