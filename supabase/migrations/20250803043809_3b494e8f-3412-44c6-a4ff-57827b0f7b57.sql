-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can add members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can remove members" ON public.team_members;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.user_is_team_member(team_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_members.team_id = $1 AND team_members.user_id = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_team_admin(team_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id = $1 AND teams.admin_id = $2
  );
$$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view team members if they are in the team" ON public.team_members
FOR SELECT USING (
  public.user_is_team_member(team_id, auth.uid())
);

CREATE POLICY "Team admins can add members" ON public.team_members
FOR INSERT WITH CHECK (
  public.user_is_team_admin(team_id, auth.uid())
);

CREATE POLICY "Team admins can update members" ON public.team_members
FOR UPDATE USING (
  public.user_is_team_admin(team_id, auth.uid())
);

CREATE POLICY "Team admins can remove members" ON public.team_members
FOR DELETE USING (
  public.user_is_team_admin(team_id, auth.uid())
);