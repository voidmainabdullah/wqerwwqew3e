-- ============================================
-- ENTERPRISE TEAMS FEATURE - COMPLETE SCHEMA
-- ============================================

-- 1. Create app_role enum for RBAC (with error handling)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member', 'guest', 'readonly');
  END IF;
END $$;

-- 2. Create user_roles table (security definer pattern)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- 3. Create spaces table (project/folder organization)
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  parent_space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- 4. Create team_invites table
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

-- 5. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create team_policies table
CREATE TABLE IF NOT EXISTS public.team_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  allow_external_sharing BOOLEAN NOT NULL DEFAULT true,
  require_password_for_shares BOOLEAN NOT NULL DEFAULT false,
  default_share_expiry_days INTEGER,
  max_file_size_mb INTEGER,
  allowed_file_types TEXT[],
  require_2fa BOOLEAN NOT NULL DEFAULT false,
  auto_join_domain TEXT,
  retention_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Update team_file_shares to support spaces
ALTER TABLE public.team_file_shares 
ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL;

-- 8. Create space_members table for space-level permissions
CREATE TABLE IF NOT EXISTS public.space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '{"can_view": true, "can_edit": false, "can_share": false, "can_delete": false}'::jsonb,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(space_id, user_id)
);

-- ============================================
-- SECURITY DEFINER FUNCTIONS FOR RBAC
-- ============================================

-- Function to check if user has role in team
CREATE OR REPLACE FUNCTION public.user_has_team_role(_user_id UUID, _team_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND team_id = _team_id
      AND role = _role
  ) OR EXISTS (
    SELECT 1
    FROM public.teams
    WHERE id = _team_id
      AND admin_id = _user_id
  );
$$;

-- Function to check if user is team owner
CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams
    WHERE id = _team_id
      AND admin_id = _user_id
  );
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _team_id UUID,
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    team_id,
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    _team_id,
    _user_id,
    _action,
    _entity_type,
    _entity_id,
    _metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to get team spaces
CREATE OR REPLACE FUNCTION public.get_team_spaces(_team_id UUID, _parent_space_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  parent_space_id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  creator_email TEXT,
  file_count BIGINT,
  is_archived BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.team_id,
    s.parent_space_id,
    s.name,
    s.description,
    s.created_by,
    s.created_at,
    p.email as creator_email,
    COUNT(DISTINCT tfs.file_id) as file_count,
    s.is_archived
  FROM public.spaces s
  LEFT JOIN public.profiles p ON p.id = s.created_by
  LEFT JOIN public.team_file_shares tfs ON tfs.space_id = s.id
  WHERE s.team_id = _team_id
    AND (_parent_space_id IS NULL AND s.parent_space_id IS NULL OR s.parent_space_id = _parent_space_id)
    AND s.is_archived = false
  GROUP BY s.id, p.email
  ORDER BY s.created_at DESC;
END;
$$;

-- Function to accept team invite
CREATE OR REPLACE FUNCTION public.accept_team_invite(_invite_token TEXT, _user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM public.team_invites
  WHERE invite_token = _invite_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  INSERT INTO public.team_members (
    team_id,
    user_id,
    role,
    permissions,
    added_by
  ) VALUES (
    invite_record.team_id,
    _user_id,
    invite_record.role,
    CASE invite_record.role
      WHEN 'admin' THEN '{"can_view": true, "can_edit": true, "can_share": true}'::jsonb
      WHEN 'member' THEN '{"can_view": true, "can_edit": true, "can_share": true}'::jsonb
      WHEN 'guest' THEN '{"can_view": true, "can_edit": false, "can_share": false}'::jsonb
      WHEN 'readonly' THEN '{"can_view": true, "can_edit": false, "can_share": false}'::jsonb
      ELSE '{"can_view": true, "can_edit": false, "can_share": false}'::jsonb
    END,
    invite_record.invited_by
  )
  ON CONFLICT (team_id, user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role, team_id)
  VALUES (_user_id, invite_record.role, invite_record.team_id)
  ON CONFLICT (user_id, team_id) DO UPDATE SET role = EXCLUDED.role;
  
  UPDATE public.team_invites
  SET status = 'accepted', accepted_at = now()
  WHERE id = invite_record.id;
  
  PERFORM public.log_audit_event(
    invite_record.team_id,
    _user_id,
    'invite_accepted',
    'team_invite',
    invite_record.id,
    jsonb_build_object('role', invite_record.role)
  );
  
  RETURN jsonb_build_object('success', true, 'team_id', invite_record.team_id);
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Team owners can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_team_owner(auth.uid(), team_id))
WITH CHECK (public.is_team_owner(auth.uid(), team_id));

CREATE POLICY "Team members can view spaces"
ON public.spaces FOR SELECT
TO authenticated
USING (public.user_is_team_member(team_id, auth.uid()));

CREATE POLICY "Team admins can manage spaces"
ON public.spaces FOR ALL
TO authenticated
USING (public.user_is_team_admin(team_id, auth.uid()))
WITH CHECK (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can view invites"
ON public.team_invites FOR SELECT
TO authenticated
USING (public.user_is_team_admin(team_id, auth.uid()) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Team admins can create invites"
ON public.team_invites FOR INSERT
TO authenticated
WITH CHECK (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can update invites"
ON public.team_invites FOR UPDATE
TO authenticated
USING (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.user_is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team members can view policies"
ON public.team_policies FOR SELECT
TO authenticated
USING (public.user_is_team_member(team_id, auth.uid()));

CREATE POLICY "Team owners can manage policies"
ON public.team_policies FOR ALL
TO authenticated
USING (public.is_team_owner(auth.uid(), team_id))
WITH CHECK (public.is_team_owner(auth.uid(), team_id));

CREATE POLICY "Space members can view membership"
ON public.space_members FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.spaces s
  WHERE s.id = space_id AND public.user_is_team_member(s.team_id, auth.uid())
));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_spaces_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER spaces_updated_at
BEFORE UPDATE ON public.spaces
FOR EACH ROW
EXECUTE FUNCTION update_spaces_updated_at();

CREATE OR REPLACE FUNCTION create_default_team_policy()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.team_policies (team_id)
  VALUES (NEW.id)
  ON CONFLICT (team_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_team_policy
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION create_default_team_policy();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_team ON public.user_roles(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_spaces_team ON public.spaces(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_created ON public.audit_logs(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_space_members_space_user ON public.space_members(space_id, user_id);