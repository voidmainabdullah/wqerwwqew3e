-- Create receive_requests table
CREATE TABLE IF NOT EXISTS public.receive_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Create received_files table to track files uploaded via receive links
CREATE TABLE IF NOT EXISTS public.received_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receive_request_id uuid NOT NULL REFERENCES public.receive_requests(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  uploader_name text,
  uploader_email text
);

-- Enable RLS
ALTER TABLE public.receive_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.received_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for receive_requests
CREATE POLICY "Users can create their own receive requests"
  ON public.receive_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own receive requests"
  ON public.receive_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own receive requests"
  ON public.receive_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receive requests"
  ON public.receive_requests
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active receive requests by token"
  ON public.receive_requests
  FOR SELECT
  USING (is_active = true);

-- RLS policies for received_files
CREATE POLICY "Anyone can insert received files"
  ON public.received_files
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Request owners can view received files"
  ON public.received_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.receive_requests
      WHERE receive_requests.id = received_files.receive_request_id
      AND receive_requests.user_id = auth.uid()
    )
  );

-- Create index for faster token lookups
CREATE INDEX idx_receive_requests_token ON public.receive_requests(token);
CREATE INDEX idx_received_files_request_id ON public.received_files(receive_request_id);