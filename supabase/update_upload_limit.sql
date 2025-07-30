-- SQL script to manually run in Supabase SQL Editor
-- This updates the default upload limit for free users from 5 to 10

-- Update existing profiles
UPDATE public.profiles 
SET daily_upload_limit = 10 
WHERE subscription_tier = 'free' AND daily_upload_limit = 5;

-- Update the default constraint (if migration file can't be changed)
-- Note: Run this in Supabase SQL Editor if the migration file is read-only
ALTER TABLE public.profiles 
ALTER COLUMN daily_upload_limit SET DEFAULT 10;