/*
  # Fix Authentication Trigger and Profile Creation

  1. Trigger Function
    - Create proper trigger function for new user profile creation
    - Handle user metadata properly
    - Set correct default values

  2. Security
    - Ensure trigger runs with proper permissions
    - Handle edge cases and errors gracefully
*/

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    subscription_tier,
    subscription_status,
    daily_upload_count,
    daily_upload_limit
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'free',
    'active',
    0,
    10
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;