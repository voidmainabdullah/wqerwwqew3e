-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{"can_view": true, "can_edit": false, "can_share": false}',
  added_by UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team file shares table
CREATE TABLE public.team_file_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(file_id, team_id)
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_file_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to" ON public.teams
FOR SELECT USING (
  id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create teams" ON public.teams
FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Team admins can update teams" ON public.teams
FOR UPDATE USING (admin_id = auth.uid());

CREATE POLICY "Team admins can delete teams" ON public.teams
FOR DELETE USING (admin_id = auth.uid());

-- RLS Policies for team members
CREATE POLICY "Users can view team members of their teams" ON public.team_members
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can add members" ON public.team_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_id AND admin_id = auth.uid()
  )
);

CREATE POLICY "Team admins can update members" ON public.team_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_id AND admin_id = auth.uid()
  )
);

CREATE POLICY "Team admins can remove members" ON public.team_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_id AND admin_id = auth.uid()
  )
);

-- RLS Policies for team file shares
CREATE POLICY "Team members can view shared files" ON public.team_file_shares
FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team members can share files" ON public.team_file_shares
FOR INSERT WITH CHECK (
  shared_by = auth.uid() AND
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "File owners and team admins can manage shares" ON public.team_file_shares
FOR DELETE USING (
  shared_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_id AND admin_id = auth.uid()
  )
);

-- Add functions for team operations
CREATE OR REPLACE FUNCTION public.get_user_teams(user_id UUID)
RETURNS TABLE(
  team_id UUID,
  team_name TEXT,
  is_admin BOOLEAN,
  role TEXT,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    (t.admin_id = user_id) as is_admin,
    tm.role,
    tm.permissions
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user exists by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input TEXT)
RETURNS TABLE(user_id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = email_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for teams
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_file_shares;