-- Update upload limits: 6GB for free users, unlimited for premium
UPDATE public.profiles 
SET daily_upload_limit = 999999999 -- Effectively unlimited daily uploads
WHERE subscription_tier = 'free';

-- Set unlimited for premium users
UPDATE public.profiles 
SET daily_upload_limit = 999999999,
    storage_limit = NULL
WHERE subscription_tier = 'pro';

-- Update default values for new users
ALTER TABLE public.profiles 
ALTER COLUMN daily_upload_limit SET DEFAULT 999999999;