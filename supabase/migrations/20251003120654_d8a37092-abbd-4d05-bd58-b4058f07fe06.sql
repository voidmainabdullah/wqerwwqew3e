-- Fix security warnings from previous migration
-- Add search_path to trigger functions

CREATE OR REPLACE FUNCTION update_spaces_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_default_team_policy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_policies (team_id)
  VALUES (NEW.id)
  ON CONFLICT (team_id) DO NOTHING;
  RETURN NEW;
END;
$$;