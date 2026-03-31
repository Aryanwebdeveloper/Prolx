-- 1. Ensure RLS is enabled
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_owner" ON public.contacts;
DROP POLICY IF EXISTS "contacts_all_admin" ON public.contacts;
DROP POLICY IF EXISTS "consultations_insert_public" ON public.consultations;
DROP POLICY IF EXISTS "consultations_all_admin" ON public.consultations;

-- 3. Public Insert Policies (Explicitly allow anyone to insert)
CREATE POLICY "contacts_insert_public" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "consultations_insert_public" ON public.consultations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Admin Policies (Full access for admins)
CREATE POLICY "contacts_admin_all" ON public.contacts
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "consultations_admin_all" ON public.consultations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Owner Policy (For clients to see their own status)
CREATE POLICY "contacts_select_owner" ON public.contacts
  FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

-- 6. Grant sequence access if needed (Supabase usually handles this, but just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT INSERT ON public.consultations TO anon, authenticated;
