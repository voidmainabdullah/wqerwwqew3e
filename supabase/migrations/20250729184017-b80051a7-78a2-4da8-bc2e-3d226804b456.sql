-- Fix security warnings by setting proper search_path for functions

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email)
  );
  RETURN new;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update reset_daily_upload_count function
CREATE OR REPLACE FUNCTION public.reset_daily_upload_count()
RETURNS VOID 
SET search_path = public
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_upload_count = 0, last_upload_reset = CURRENT_DATE
  WHERE last_upload_reset < CURRENT_DATE;
END;
$$;

-- Update generate_share_code function
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT 
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;