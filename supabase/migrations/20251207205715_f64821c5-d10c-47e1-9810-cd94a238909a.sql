-- Fix the security definer view warning by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.deduplicated_download_logs;

CREATE VIEW public.deduplicated_download_logs 
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (file_id, downloader_ip, downloader_user_agent, date_trunc('minute', downloaded_at) - (EXTRACT(minute FROM downloaded_at)::int % 5) * interval '1 minute')
  id,
  file_id,
  shared_link_id,
  downloader_ip,
  downloader_user_agent,
  download_method,
  downloaded_at
FROM public.download_logs
ORDER BY file_id, downloader_ip, downloader_user_agent, date_trunc('minute', downloaded_at) - (EXTRACT(minute FROM downloaded_at)::int % 5) * interval '1 minute', downloaded_at DESC;