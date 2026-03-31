-- ========================================================
-- ERP Systems Migration: Invoice, Letters, Attendance
-- Migration: 20260327_008_erp_systems.sql
-- ========================================================

-- ============================================================
-- 1. INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,                        -- e.g. INV-2026-0001
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,           -- percentage e.g. 10.00
  discount NUMERIC(12,2) DEFAULT 0,          -- fixed discount amount
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  pdf_url TEXT,                              -- stored in Supabase storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. INVOICE ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

-- ============================================================
-- 3. COMPANY LETTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_letters (
  id TEXT PRIMARY KEY,                        -- e.g. LTR-2026-0001
  letter_type TEXT NOT NULL CHECK (letter_type IN ('offer_letter', 'appointment_letter', 'experience_letter', 'salary_certificate', 'custom')),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',       -- dynamic fields per template type
  pdf_url TEXT,                              -- stored in Supabase storage
  docx_url TEXT,                             -- stored in Supabase storage
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)                      -- one record per user per day
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('invoices', 'invoices', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('letters', 'letters', true)
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- INVOICES RLS
-- Admin: full access
CREATE POLICY "invoices_all_admin" ON public.invoices
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Staff: can view invoices they created or are the client of
CREATE POLICY "invoices_select_staff" ON public.invoices
  FOR SELECT USING (
    auth.uid() = created_by OR auth.uid() = client_id
  );

-- Client: can view their own invoices
CREATE POLICY "invoices_select_client" ON public.invoices
  FOR SELECT USING (auth.uid() = client_id);

-- Staff: can create invoices
CREATE POLICY "invoices_insert_staff" ON public.invoices
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff') AND status = 'active')
  );

-- Staff: can update invoices they created
CREATE POLICY "invoices_update_staff" ON public.invoices
  FOR UPDATE USING (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff') AND status = 'active')
  );

-- INVOICE ITEMS RLS
CREATE POLICY "invoice_items_all_admin" ON public.invoice_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "invoice_items_select_via_invoice" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND (invoices.client_id = auth.uid() OR invoices.created_by = auth.uid())
    )
  );

CREATE POLICY "invoice_items_insert_staff" ON public.invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.created_by = auth.uid()
    )
  );

CREATE POLICY "invoice_items_update_staff" ON public.invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.created_by = auth.uid()
    )
  );

CREATE POLICY "invoice_items_delete_staff" ON public.invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.created_by = auth.uid()
    )
  );

-- COMPANY LETTERS RLS
CREATE POLICY "letters_all_admin" ON public.company_letters
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "letters_select_recipient" ON public.company_letters
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "letters_select_creator" ON public.company_letters
  FOR SELECT USING (auth.uid() = created_by);

-- ATTENDANCE RLS
CREATE POLICY "attendance_all_admin" ON public.attendance
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Staff can view their own attendance
CREATE POLICY "attendance_select_own" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

-- Staff can insert their own attendance (check-in)
CREATE POLICY "attendance_insert_own" ON public.attendance
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff' AND status = 'active')
  );

-- Staff can update their own attendance (check-out)
CREATE POLICY "attendance_update_own" ON public.attendance
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'staff' AND status = 'active')
  );

-- Storage Policies for invoices bucket
CREATE POLICY "invoices_storage_admin" ON storage.objects
  FOR ALL USING (bucket_id = 'invoices' AND public.is_admin())
  WITH CHECK (bucket_id = 'invoices' AND public.is_admin());

CREATE POLICY "invoices_storage_read_auth" ON storage.objects
  FOR SELECT USING (bucket_id = 'invoices' AND auth.uid() IS NOT NULL);

CREATE POLICY "invoices_storage_insert_staff" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','staff') AND status = 'active')
  );

-- Storage Policies for letters bucket
CREATE POLICY "letters_storage_admin" ON storage.objects
  FOR ALL USING (bucket_id = 'letters' AND public.is_admin())
  WITH CHECK (bucket_id = 'letters' AND public.is_admin());

CREATE POLICY "letters_storage_read_auth" ON storage.objects
  FOR SELECT USING (bucket_id = 'letters' AND auth.uid() IS NOT NULL);

CREATE POLICY "letters_storage_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'letters' AND public.is_admin()
  );

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_invoices_updated ON public.invoices;
CREATE TRIGGER on_invoices_updated
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_company_letters_updated ON public.company_letters;
CREATE TRIGGER on_company_letters_updated
  BEFORE UPDATE ON public.company_letters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_attendance_updated ON public.attendance;
CREATE TRIGGER on_attendance_updated
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
