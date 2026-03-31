-- TOTAL RLS BYPASS (Run this if you still get RLS errors)
-- This disables RLS for these tables, allowing anyone to read/write.
-- Use this if you are having trouble setting up specific policies.

ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations DISABLE ROW LEVEL SECURITY;

-- Ensure public can access the tables
GRANT ALL ON public.contacts TO anon, authenticated, service_role;
GRANT ALL ON public.consultations TO anon, authenticated, service_role;
