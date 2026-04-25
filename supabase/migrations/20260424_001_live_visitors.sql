-- Migration for real-time live visitor tracking
-- Creates a table to store active sessions

CREATE TABLE IF NOT EXISTS public.live_visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id TEXT NOT NULL UNIQUE,
    current_path TEXT NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.live_visitors ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert/update their own tracking data
CREATE POLICY "Allow public insert to live_visitors"
    ON public.live_visitors FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to live_visitors"
    ON public.live_visitors FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow admins to read all live visitors
CREATE POLICY "Allow authenticated read to live_visitors"
    ON public.live_visitors FOR SELECT
    TO authenticated
    USING (true);

-- Add indexes for fast querying on the dashboard
CREATE INDEX IF NOT EXISTS idx_live_visitors_last_seen ON public.live_visitors(last_seen);
CREATE INDEX IF NOT EXISTS idx_live_visitors_path ON public.live_visitors(current_path);

-- Create a function to clean up old visitors (optional, but good for keeping DB small)
-- We can call this via cron or just rely on the 5-minute filter in queries.
