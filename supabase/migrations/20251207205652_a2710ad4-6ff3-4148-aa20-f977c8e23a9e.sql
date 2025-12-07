-- Create a view for deduplicated download analytics
-- This deduplicates downloads from the same IP/user agent within a 5-minute window

CREATE OR REPLACE VIEW public.deduplicated_download_logs AS
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

-- Create a function to get download stats for a user's files
CREATE OR REPLACE FUNCTION public.get_user_download_stats(p_user_id uuid)
RETURNS TABLE (
  total_downloads bigint,
  today_downloads bigint,
  week_downloads bigint,
  unique_files_downloaded bigint,
  peak_hour int,
  peak_hour_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_file_ids uuid[];
BEGIN
  -- Get user's file IDs
  SELECT array_agg(id) INTO v_file_ids
  FROM files
  WHERE user_id = p_user_id;
  
  IF v_file_ids IS NULL OR array_length(v_file_ids, 1) = 0 THEN
    RETURN QUERY SELECT 0::bigint, 0::bigint, 0::bigint, 0::bigint, 0::int, 0::bigint;
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH download_data AS (
    SELECT 
      dl.file_id,
      dl.downloaded_at,
      EXTRACT(hour FROM dl.downloaded_at)::int as download_hour
    FROM download_logs dl
    WHERE dl.file_id = ANY(v_file_ids)
  ),
  hour_counts AS (
    SELECT 
      download_hour,
      COUNT(*) as hour_count
    FROM download_data
    GROUP BY download_hour
    ORDER BY hour_count DESC
    LIMIT 1
  )
  SELECT
    (SELECT COUNT(*) FROM download_data)::bigint as total_downloads,
    (SELECT COUNT(*) FROM download_data WHERE downloaded_at >= CURRENT_DATE)::bigint as today_downloads,
    (SELECT COUNT(*) FROM download_data WHERE downloaded_at >= CURRENT_DATE - interval '7 days')::bigint as week_downloads,
    (SELECT COUNT(DISTINCT file_id) FROM download_data)::bigint as unique_files_downloaded,
    COALESCE((SELECT download_hour FROM hour_counts), 0)::int as peak_hour,
    COALESCE((SELECT hour_count FROM hour_counts), 0)::bigint as peak_hour_count;
END;
$$;

-- Create a function to get heatmap data (7 days x 24 hours)
CREATE OR REPLACE FUNCTION public.get_user_download_heatmap(p_user_id uuid)
RETURNS TABLE (
  day_of_week int,
  hour_of_day int,
  download_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_file_ids uuid[];
BEGIN
  -- Get user's file IDs
  SELECT array_agg(id) INTO v_file_ids
  FROM files
  WHERE user_id = p_user_id;
  
  IF v_file_ids IS NULL OR array_length(v_file_ids, 1) = 0 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    EXTRACT(dow FROM downloaded_at)::int as day_of_week,
    EXTRACT(hour FROM downloaded_at)::int as hour_of_day,
    COUNT(*)::bigint as download_count
  FROM download_logs
  WHERE file_id = ANY(v_file_ids)
    AND downloaded_at >= CURRENT_DATE - interval '7 days'
  GROUP BY day_of_week, hour_of_day
  ORDER BY day_of_week, hour_of_day;
END;
$$;

-- Create a function to get per-link download stats
CREATE OR REPLACE FUNCTION public.get_link_download_stats(p_user_id uuid)
RETURNS TABLE (
  shared_link_id uuid,
  file_id uuid,
  file_name text,
  link_type text,
  download_count bigint,
  last_download_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id as shared_link_id,
    sl.file_id,
    f.original_name as file_name,
    sl.link_type,
    COUNT(dl.id)::bigint as download_count,
    MAX(dl.downloaded_at) as last_download_at
  FROM shared_links sl
  JOIN files f ON f.id = sl.file_id
  LEFT JOIN download_logs dl ON dl.shared_link_id = sl.id
  WHERE f.user_id = p_user_id
  GROUP BY sl.id, sl.file_id, f.original_name, sl.link_type
  ORDER BY download_count DESC;
END;
$$;

-- Create a function to get daily download counts for the last 30 days
CREATE OR REPLACE FUNCTION public.get_daily_download_counts(p_user_id uuid)
RETURNS TABLE (
  download_date date,
  download_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_file_ids uuid[];
BEGIN
  -- Get user's file IDs
  SELECT array_agg(id) INTO v_file_ids
  FROM files
  WHERE user_id = p_user_id;
  
  IF v_file_ids IS NULL OR array_length(v_file_ids, 1) = 0 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    DATE(downloaded_at) as download_date,
    COUNT(*)::bigint as download_count
  FROM download_logs
  WHERE file_id = ANY(v_file_ids)
    AND downloaded_at >= CURRENT_DATE - interval '30 days'
  GROUP BY download_date
  ORDER BY download_date;
END;
$$;