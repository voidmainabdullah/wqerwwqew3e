/*
  # Add Missing Database Functions

  1. Missing Functions
    - user_is_team_admin: Check if user is admin of a team
    - user_is_team_member: Check if user is member of a team
    - get_user_by_email: Find user by email address

  2. Security
    - All functions use SECURITY DEFINER for proper access
    - Grant execute permissions to authenticated users
*/

-- Function to check if user is team admin
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
    WHERE tm.team_id = team_id AND tm.user_id = user_id AND tm.role = 'admin'
  );
END;
$$;

-- Function to check if user is team member
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

-- Function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(email_input text)
RETURNS TABLE (
  user_id uuid,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email
  FROM profiles p
  WHERE p.email = email_input;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION user_is_team_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_team_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_email(text) TO authenticated;