-- Add missing columns to profiles table for Settings functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{"email": true, "push": false, "marketing": false}'::jsonb,
ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS corner_style TEXT DEFAULT 'rounded',
ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_backup TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.language IS 'User preferred language (en, ur, ar)';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone for date/time display';
COMMENT ON COLUMN public.profiles.notifications IS 'User notification preferences';
COMMENT ON COLUMN public.profiles.font_style IS 'UI font style preference';
COMMENT ON COLUMN public.profiles.corner_style IS 'UI corner style preference';
COMMENT ON COLUMN public.profiles.two_fa_enabled IS 'Two-factor authentication status';
COMMENT ON COLUMN public.profiles.last_backup IS 'Last backup timestamp';
COMMENT ON COLUMN public.profiles.tagline IS 'User profile tagline/bio';