/*
  # Fix Database Functions and Missing RPC Functions

  1. Database Functions
    - Create missing RPC functions that are referenced in the code
    - Fix function signatures and return types
    - Add proper error handling

  2. Security
    - Ensure all functions have proper security context
    - Add necessary permissions for authenticated users

  3. Missing Functions
    - get_my_team_files: Get files shared with user's teams
    - get_team_members: Get members of a specific team
    - uid(): Get current authenticated user ID
*/

-- Create uid() function if it doesn't exist (for RLS policies)
CREATE OR REPLACE FUNCTION uid() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Create get_my_team_files function
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
  can_download boolean,
  can_edit boolean,
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
    COALESCE(tm.permissions->>'can_view', 'false')::boolean as can_download,
    COALESCE(tm.permissions->>'can_edit', 'false')::boolean as can_edit,
    (tm.role = 'admin' OR t.admin_id = p_user_id) as is_team_admin
  FROM team_file_shares tfs
  JOIN files f ON f.id = tfs.file_id
  JOIN teams t ON t.id = tfs.team_id
  JOIN profiles p ON p.id = tfs.shared_by
  JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = p_user_id
  WHERE tm.user_id = p_user_id
  ORDER BY tfs.shared_at DESC;
END;
$$;

-- Create get_team_members function
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION uid() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_team_files(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_teams(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_share_code() TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_share_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_team_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_team_member(uuid, uuid) TO authenticated;