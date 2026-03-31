-- 1. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_desc TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES FOR CONSULTATIONS
CREATE POLICY "consultations_insert_public" ON public.consultations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "consultations_all_admin" ON public.consultations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. FIX CONTACTS RLS (Ensure it's actually working)
-- Drop existing insert policy if it exists to recreate it just in case
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts;
CREATE POLICY "contacts_insert_public" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- 5. REFRESH ADMIN POLICIES
DROP POLICY IF EXISTS "contacts_all_admin" ON public.contacts;
CREATE POLICY "contacts_all_admin" ON public.contacts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. TRIGGER FOR consultations
CREATE TRIGGER on_consultations_updated
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
