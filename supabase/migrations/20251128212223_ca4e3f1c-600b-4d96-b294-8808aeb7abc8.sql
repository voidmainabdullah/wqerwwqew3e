-- Update profiles table to support premium subscription tiers
ALTER TABLE profiles 
  ALTER COLUMN subscription_tier SET DEFAULT 'free',
  DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Add proper subscription tier check constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'basic', 'pro'));

-- Update any existing 'basic' users who should be 'free'
UPDATE profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier NOT IN ('free', 'basic', 'pro');

-- Add paddle_customer_id and paddle_subscription_id for tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;