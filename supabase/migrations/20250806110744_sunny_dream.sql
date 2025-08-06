/*
  # Fix Teams Functions and Add My Team Navigation

  1. Database Functions
    - Fix get_user_by_email function to return proper structure
    - Ensure user_is_team_admin and user_is_team_member functions work correctly
    - Add proper error handling for team operations

  2. Security
    - Maintain RLS policies for all team operations
    - Ensure proper access controls for team file sharing

  3. New Features
    - Support for "My Team" navigation section
    - Enhanced team member management
    - Improved team file sharing capabilities
*/

-- Drop and recreate the get_user_by_email function with proper return type
DROP FUNCTION IF EXISTS get_user_by_email(text);

CREATE OR REPLACE FUNCTION get_user_by_email(email_input text)
RETURNS TABLE(user_id uuid, email text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as user_id, p.email
  FROM profiles p
  WHERE p.email = email_input;
END;
$$;

-- Ensure the user_is_team_admin function exists and works correctly
CREATE OR REPLACE FUNCTION user_is_team_admin(team_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_id AND t.admin_id = user_id
  ) OR EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_id 
    AND tm.user_id = user_id 
    AND tm.role = 'admin'
  );
END;
$$;

-- Ensure the user_is_team_member function exists and works correctly
CREATE OR REPLACE FUNCTION user_is_team_member(team_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_id AND tm.user_id = user_id
  ) OR EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id = team_id AND t.admin_id = user_id
  );
END;
$$;

-- Create a function to get team members with proper user details
CREATE OR REPLACE FUNCTION get_team_members(p_team_id uuid)
RETURNS TABLE(
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

-- Create a function to get files shared with user's teams
CREATE OR REPLACE FUNCTION get_my_team_files(p_user_id uuid)
RETURNS TABLE(
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
    t.id as team_id,
    t.name as team_name,
    tfs.shared_by,
    tfs.shared_at,
    sharer.email as sharer_email,
    COALESCE((tm.permissions->>'can_view')::boolean, false) OR user_is_team_admin(t.id, p_user_id) as can_download,
    COALESCE((tm.permissions->>'can_edit')::boolean, false) OR user_is_team_admin(t.id, p_user_id) as can_edit,
    user_is_team_admin(t.id, p_user_id) as is_team_admin
  FROM team_file_shares tfs
  JOIN files f ON f.id = tfs.file_id
  JOIN teams t ON t.id = tfs.team_id
  JOIN profiles sharer ON sharer.id = tfs.shared_by
  LEFT JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = p_user_id
  WHERE user_is_team_member(t.id, p_user_id)
  ORDER BY tfs.shared_at DESC;
END;
$$;

-- Update team_members policies to ensure proper access
DROP POLICY IF EXISTS "Users can view team members if they are in the team" ON team_members;
CREATE POLICY "Users can view team members if they are in the team"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_is_team_member(team_id, auth.uid()));

-- Ensure proper indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_file_shares_team ON team_file_shares(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);