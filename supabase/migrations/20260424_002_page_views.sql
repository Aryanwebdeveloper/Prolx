-- Migration for permanent historical page views and referrers
-- Creates a table to store every page view for analytics

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert tracking data
CREATE POLICY "Allow public insert to page_views"
    ON public.page_views FOR INSERT
    WITH CHECK (true);

-- Allow admins to read all page views
CREATE POLICY "Allow authenticated read to page_views"
    ON public.page_views FOR SELECT
    TO authenticated
    USING (true);

-- Add indexes for fast aggregation by date and path
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
