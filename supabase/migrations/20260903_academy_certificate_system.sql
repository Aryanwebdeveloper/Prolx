-- ═══════════════════════════════════════════════════════════════════════
-- PROLX ACADEMY & CERTIFICATE MANAGEMENT SYSTEM
-- Migration: 20260903_academy_certificate_system.sql
-- Safe to run multiple times (Idempotent SQL)
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. ACADEMY STUDENTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_students (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_code        TEXT UNIQUE NOT NULL, -- e.g. PLX-STU-10042
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  whatsapp            TEXT,
  avatar_url          TEXT,
  city                TEXT,
  education           TEXT,
  current_profession  TEXT,
  course_id           UUID REFERENCES academy_courses(id) ON DELETE SET NULL,
  batch_id            UUID REFERENCES academy_batches(id) ON DELETE SET NULL,
  enrollment_id       UUID REFERENCES academy_enrollments(id) ON DELETE SET NULL,
  enrollment_date     DATE DEFAULT CURRENT_DATE,
  course_start_date   DATE,
  completion_date     DATE,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'withdrawn', 'dropped')),
  attendance_pct      NUMERIC(5,2) DEFAULT 0.0,
  result_score        NUMERIC(5,2) DEFAULT 0.0,
  instructor_name     TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 2. CERTIFICATE ELIGIBILITY REQUIREMENTS ON COURSES ─────────────────
ALTER TABLE academy_courses ADD COLUMN IF NOT EXISTS min_attendance_pct NUMERIC(5,2) DEFAULT 75.0;
ALTER TABLE academy_courses ADD COLUMN IF NOT EXISTS min_result_score NUMERIC(5,2) DEFAULT 60.0;
ALTER TABLE academy_courses ADD COLUMN IF NOT EXISTS require_manual_approval BOOLEAN DEFAULT false;
ALTER TABLE academy_courses ADD COLUMN IF NOT EXISTS certificate_title TEXT DEFAULT 'Certificate of Completion';

-- ── 3. ACADEMY CERTIFICATE TEMPLATES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_certificate_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT,
  template_type       TEXT DEFAULT 'completion',
  is_default          BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  bg_image_url        TEXT DEFAULT '/CourseresUIUXCertificate.png',
  logo_url            TEXT DEFAULT '/prolx-logo.png',
  signature_url       TEXT,
  seal_url            TEXT,
  primary_color       TEXT DEFAULT '#0D9488',
  secondary_color     TEXT DEFAULT '#0F172A',
  title_text          TEXT DEFAULT 'CERTIFICATE OF COMPLETION',
  subtitle_text       TEXT DEFAULT 'PROUDLY PRESENTED TO',
  body_template       TEXT DEFAULT 'This certificate is proudly presented in recognition of successfully completing the {course_name} course, demonstrating dedication, creativity, and practical skills. The course was conducted from {start_date} to {completion_date}.',
  config              JSONB DEFAULT '{
    "namePos": {"x": 148.5, "y": 89, "fontSize": 30, "color": "#0F172A"},
    "idPos": {"x": 88, "y": 140, "fontSize": 10, "color": "#009B8E"},
    "datePos": {"x": 216, "y": 140, "fontSize": 10, "color": "#009B8E"},
    "qrPos": {"x": 138.5, "y": 133, "size": 21}
  }'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Prolx Template if missing
INSERT INTO academy_certificate_templates (id, name, description, template_type, is_default, is_active, bg_image_url)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Prolx Official Certificate of Completion',
  'Official Prolx Digital Agency Academy certificate template with teal branding, signature, red seal, and QR code verification.',
  'completion',
  true,
  true,
  '/CourseresUIUXCertificate.png'
) ON CONFLICT (id) DO NOTHING;

-- ── 4. ACADEMY MASTER CERTIFICATES TABLE ───────────────────────────────
CREATE TABLE IF NOT EXISTS academy_certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id      TEXT UNIQUE NOT NULL, -- e.g. PRLX-CERT-26-000001
  student_id          UUID REFERENCES academy_students(id) ON DELETE SET NULL,
  user_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  enrollment_id       UUID REFERENCES academy_enrollments(id) ON DELETE SET NULL,
  course_id           UUID REFERENCES academy_courses(id) ON DELETE SET NULL,
  batch_id            UUID REFERENCES academy_batches(id) ON DELETE SET NULL,
  template_id         UUID REFERENCES academy_certificate_templates(id) ON DELETE SET NULL,
  recipient_name      TEXT NOT NULL,
  recipient_email     TEXT,
  course_title        TEXT NOT NULL,
  course_duration     TEXT,
  start_date          DATE,
  completion_date     DATE,
  issue_date          DATE DEFAULT CURRENT_DATE,
  valid_until         DATE,
  certificate_type    TEXT DEFAULT 'course_completion',
  status              TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'eligible', 'generated', 'issued', 'downloaded', 'verified', 'revoked', 'cancelled')),
  is_published        BOOLEAN DEFAULT true,
  is_uploaded         BOOLEAN DEFAULT false,
  file_url            TEXT,
  qr_code_url         TEXT,
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Ensure public.certificates table columns are extended if legacy query relies on public.certificates
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'internship';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS internship_field TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS revoked_reason TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_uploaded BOOLEAN DEFAULT false;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES academy_courses(id) ON DELETE SET NULL;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES academy_students(id) ON DELETE SET NULL;

-- ── 5. ACADEMY SETTINGS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_certificate_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_prefix           TEXT DEFAULT 'PRLX-CERT',
  year_format         TEXT DEFAULT '26', -- '26' or '2026'
  sequence_counter    INT DEFAULT 1001,
  default_template_id UUID REFERENCES academy_certificate_templates(id),
  verification_base_url TEXT DEFAULT 'https://prolx.cloud/verify-certificate',
  issuing_authority   TEXT DEFAULT 'Prolx Digital Agency',
  signatory_name      TEXT DEFAULT 'Aryan M Yaseen',
  signatory_title     TEXT DEFAULT 'Founder & CEO, Prolx Digital Agency',
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Seed default settings row if empty
INSERT INTO academy_certificate_settings (id, id_prefix, year_format, sequence_counter, default_template_id)
VALUES (
  'b1fec999-9c0b-4ef8-bb6d-6bb9bd380b22',
  'PRLX-CERT',
  '26',
  1001,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
) ON CONFLICT (id) DO NOTHING;

-- ── 6. ACADEMY CERTIFICATE AUDIT LOGS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_certificate_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id      TEXT NOT NULL,
  action              TEXT NOT NULL, -- 'CREATED', 'GENERATED', 'ISSUED', 'DOWNLOADED', 'VERIFIED', 'REVOKED', 'EDITED'
  performed_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  performed_by_name   TEXT,
  ip_address          TEXT,
  details             JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 7. INDEXES ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_acad_students_email ON academy_students(email);
CREATE INDEX IF NOT EXISTS idx_acad_students_code ON academy_students(student_code);
CREATE INDEX IF NOT EXISTS idx_acad_students_course ON academy_students(course_id);
CREATE INDEX IF NOT EXISTS idx_acad_students_batch ON academy_students(batch_id);

CREATE INDEX IF NOT EXISTS idx_acad_certs_cert_id ON academy_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_acad_certs_student ON academy_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_acad_certs_user ON academy_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_acad_certs_status ON academy_certificates(status);

CREATE INDEX IF NOT EXISTS idx_acad_cert_logs_id ON academy_certificate_logs(certificate_id);

-- ── 8. ROW LEVEL SECURITY ──────────────────────────────────────────────
ALTER TABLE academy_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificate_logs ENABLE ROW LEVEL SECURITY;

-- Public can verify published/active certificates
DROP POLICY IF EXISTS "Public can view published academy certs" ON academy_certificates;
CREATE POLICY "Public can view published academy certs" ON academy_certificates
  FOR SELECT USING (is_published = true AND status IN ('issued', 'downloaded', 'verified', 'revoked'));

-- Students can read their own certificates
DROP POLICY IF EXISTS "Students can view own academy certs" ON academy_certificates;
CREATE POLICY "Students can view own academy certs" ON academy_certificates
  FOR SELECT USING (user_id = auth.uid() OR student_id IN (SELECT id FROM academy_students WHERE user_id = auth.uid()));

-- Students can view their own profile
DROP POLICY IF EXISTS "Students can view own student record" ON academy_students;
CREATE POLICY "Students can view own student record" ON academy_students
  FOR SELECT USING (user_id = auth.uid() OR email IN (SELECT email FROM profiles WHERE id = auth.uid()));

-- Admins full access
DROP POLICY IF EXISTS "Admin full access academy_students" ON academy_students;
CREATE POLICY "Admin full access academy_students" ON academy_students FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

DROP POLICY IF EXISTS "Admin full access academy_templates" ON academy_certificate_templates;
CREATE POLICY "Admin full access academy_templates" ON academy_certificate_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

DROP POLICY IF EXISTS "Admin full access academy_certificates" ON academy_certificates;
CREATE POLICY "Admin full access academy_certificates" ON academy_certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

DROP POLICY IF EXISTS "Admin full access academy_settings" ON academy_certificate_settings;
CREATE POLICY "Admin full access academy_settings" ON academy_certificate_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

DROP POLICY IF EXISTS "Admin full access academy_logs" ON academy_certificate_logs;
CREATE POLICY "Admin full access academy_logs" ON academy_certificate_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ── 9. ATOMIC SEQUENCE COUNTER FUNCTION ───────────────────────────────
CREATE OR REPLACE FUNCTION generate_next_certificate_id()
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_counter INT;
  v_cert_id TEXT;
BEGIN
  -- Get settings
  SELECT id_prefix, year_format, sequence_counter
  INTO v_prefix, v_year, v_counter
  FROM academy_certificate_settings
  LIMIT 1;

  IF v_prefix IS NULL THEN
    v_prefix := 'PRLX-CERT';
    v_year := '26';
    v_counter := 1001;
  END IF;

  -- Build Certificate ID string
  v_cert_id := v_prefix || '-' || v_year || '-' || LPAD(v_counter::text, 6, '0');

  -- Increment sequence counter atomically
  UPDATE academy_certificate_settings
  SET sequence_counter = sequence_counter + 1, updated_at = now();

  RETURN v_cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
