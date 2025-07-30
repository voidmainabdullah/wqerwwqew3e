-- Update existing profiles to have 10 daily upload limit
UPDATE public.profiles 
SET daily_upload_limit = 10 
WHERE subscription_tier = 'free' AND daily_upload_limit = 5;

-- Update the default for new users
ALTER TABLE public.profiles 
ALTER COLUMN daily_upload_limit SET DEFAULT 10;