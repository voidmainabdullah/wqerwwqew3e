-- SecureShare File Sharing Platform Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  daily_upload_count INTEGER NOT NULL DEFAULT 0,
  daily_upload_limit INTEGER NOT NULL DEFAULT 5,
  last_upload_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Files table to store file metadata
CREATE TABLE public.files (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  share_code TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  download_limit INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Shared links table for different sharing methods
CREATE TABLE public.shared_links (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('code', 'email', 'direct')),
  share_token TEXT UNIQUE NOT NULL,
  recipient_email TEXT,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  download_limit INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Download logs for tracking
CREATE TABLE public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_link_id UUID REFERENCES public.shared_links(id) ON DELETE SET NULL,
  downloader_ip INET,
  downloader_user_agent TEXT,
  download_method TEXT NOT NULL CHECK (download_method IN ('direct', 'code', 'email', 'link')),
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Files policies
CREATE POLICY "Users can view their own files" 
ON public.files FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own files" 
ON public.files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
ON public.files FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.files FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Public files are viewable by anyone" 
ON public.files FOR SELECT 
USING (is_public = true);

-- Shared links policies
CREATE POLICY "Users can view their shared links" 
ON public.shared_links FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.files 
    WHERE files.id = shared_links.file_id 
    AND files.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create shared links for their files" 
ON public.shared_links FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.files 
    WHERE files.id = shared_links.file_id 
    AND files.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their shared links" 
ON public.shared_links FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.files 
    WHERE files.id = shared_links.file_id 
    AND files.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their shared links" 
ON public.shared_links FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.files 
    WHERE files.id = shared_links.file_id 
    AND files.user_id = auth.uid()
  )
);

-- Download logs policies
CREATE POLICY "Users can view download logs for their files" 
ON public.download_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.files 
    WHERE files.id = download_logs.file_id 
    AND files.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert download logs" 
ON public.download_logs FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

-- Storage policies for files bucket
CREATE POLICY "Users can upload their own files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset daily upload count
CREATE OR REPLACE FUNCTION public.reset_daily_upload_count()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_upload_count = 0, last_upload_reset = CURRENT_DATE
  WHERE last_upload_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique share codes
CREATE OR REPLACE FUNCTION public.generate_share_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_share_code ON public.files(share_code) WHERE share_code IS NOT NULL;
CREATE INDEX idx_files_expires_at ON public.files(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_shared_links_file_id ON public.shared_links(file_id);
CREATE INDEX idx_shared_links_token ON public.shared_links(share_token);
CREATE INDEX idx_download_logs_file_id ON public.download_logs(file_id);
CREATE INDEX idx_download_logs_downloaded_at ON public.download_logs(downloaded_at);