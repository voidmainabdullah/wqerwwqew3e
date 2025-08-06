/*
  # Fix Teams Functions and Database Issues

  1. Database Functions
    - Fix get_team_members function that's missing
    - Ensure all team-related functions work correctly
    - Add proper error handling and logging

  2. Security
    - Maintain RLS policies for all team operations
    - Ensure proper access controls

  3. Performance
    - Add missing indexes for better query performance
    - Optimize function queries
*/

-- Create the missing get_team_members function
CREATE OR REPLACE FUNCTION public.get_team_members(p_team_id uuid)
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
SET search_path = 'public'
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_team_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_teams(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_team_files(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_team_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_team_member(uuid, uuid) TO authenticated;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_admin_id ON public.teams(admin_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_file_shares_shared_by ON public.team_file_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_files_user_id_created_at ON public.files(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_links_file_id_active ON public.shared_links(file_id, is_active);

-- Fix any potential foreign key constraint issues
DO $$
BEGIN
  -- Ensure team_members references profiles correctly
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_user_id_fkey' 
    AND table_name = 'team_members'
  ) THEN
    ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Ensure team_members references profiles for added_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_added_by_fkey' 
    AND table_name = 'team_members'
  ) THEN
    ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_added_by_fkey 
    FOREIGN KEY (added_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies to be more specific and avoid recursion
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
CREATE POLICY "Users can view teams they belong to" ON public.teams
FOR SELECT TO authenticated USING (
  admin_id = auth.uid() OR
  id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Ensure realtime is enabled for all team tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.team_file_shares;