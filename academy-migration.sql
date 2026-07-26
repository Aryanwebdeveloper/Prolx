-- ═══════════════════════════════════════════════════════════════════════
-- PROLX ACADEMY — Complete LMS Database Migration
-- Run this in Supabase SQL Editor or via CLI
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. CATEGORIES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  description TEXT,
  color       TEXT DEFAULT '#0D9488',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 2. COURSES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_courses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID REFERENCES academy_categories(id),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  short_description   TEXT,
  description         TEXT,
  thumbnail_url       TEXT,
  banner_url          TEXT,
  instructor_name     TEXT,
  instructor_bio      TEXT,
  instructor_avatar   TEXT,
  level               TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  language            TEXT DEFAULT 'Urdu / English',
  duration_weeks      INT,
  hours_per_week      INT,
  total_hours         INT,
  prerequisites       TEXT[],
  skills_covered      TEXT[],
  learning_objectives TEXT[],
  career_opportunities TEXT[],
  salary_range        TEXT,
  original_price      NUMERIC(10,2) DEFAULT 0,
  discounted_price    NUMERIC(10,2),
  scholarship_price   NUMERIC(10,2),
  installment_available BOOLEAN DEFAULT false,
  installment_months  INT,
  installment_amount  NUMERIC(10,2),
  early_bird_price    NUMERIC(10,2),
  early_bird_until    DATE,
  student_count       INT DEFAULT 0,
  rating              NUMERIC(3,2) DEFAULT 0,
  review_count        INT DEFAULT 0,
  is_featured         BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  has_internship      BOOLEAN DEFAULT false,
  has_certificate     BOOLEAN DEFAULT true,
  has_placement       BOOLEAN DEFAULT false,
  seo_title           TEXT,
  seo_description     TEXT,
  tags                TEXT[],
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── 3. COURSE CURRICULUM ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_curriculum (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  week_number INT,
  title       TEXT NOT NULL,
  topics      TEXT[],
  sort_order  INT DEFAULT 0
);

-- ── 4. BATCHES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_batches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  batch_code        TEXT NOT NULL UNIQUE,
  start_date        DATE,
  end_date          DATE,
  class_days        TEXT[],
  class_time        TEXT,
  instructor_name   TEXT,
  instructor_id     UUID REFERENCES profiles(id),
  total_seats       INT DEFAULT 30,
  enrolled_seats    INT DEFAULT 0,
  mode              TEXT DEFAULT 'online' CHECK (mode IN ('online','physical','hybrid','self_paced')),
  campus_location   TEXT,
  meeting_link      TEXT,
  status            TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── 5. ENROLLMENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id     TEXT UNIQUE,                     -- e.g. PLX-ENR-2024-0001
  student_id        TEXT,                             -- e.g. PLX-STU-0001
  batch_id          UUID REFERENCES academy_batches(id),
  course_id         UUID REFERENCES academy_courses(id),
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  whatsapp          TEXT,
  city              TEXT,
  education         TEXT,
  current_profession TEXT,
  learning_mode     TEXT DEFAULT 'online',
  payment_method    TEXT DEFAULT 'cash',
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','partial','paid','refunded')),
  amount_paid       NUMERIC(10,2) DEFAULT 0,
  referral_code     TEXT,
  notes             TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','active','completed','withdrawn','cancelled')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Drop legacy constraint if table already exists in Supabase
ALTER TABLE academy_enrollments DROP CONSTRAINT IF EXISTS academy_enrollments_payment_method_check;

-- ── 6. DEMO BOOKINGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_demo_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  course_interest TEXT,
  preferred_date  DATE,
  preferred_time  TEXT,
  mode            TEXT DEFAULT 'online' CHECK (mode IN ('online','physical')),
  questions       TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','rescheduled')),
  admin_notes     TEXT,
  meeting_link    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 7. CERTIFICATES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id  TEXT UNIQUE,             -- e.g. PLX-CERT-2024-0001
  enrollment_id   UUID REFERENCES academy_enrollments(id),
  student_name    TEXT NOT NULL,
  course_title    TEXT NOT NULL,
  batch_name      TEXT,
  instructor_name TEXT,
  certificate_type TEXT DEFAULT 'completion' CHECK (certificate_type IN ('completion','internship','participation','achievement','training','workshop')),
  issued_at       DATE,
  valid_until     DATE,
  qr_code_url     TEXT,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 8. REVIEWS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
  enrollment_id   UUID REFERENCES academy_enrollments(id),
  student_name    TEXT NOT NULL,
  rating          INT CHECK (rating BETWEEN 1 AND 5),
  review          TEXT,
  employment_status TEXT,
  company_joined  TEXT,
  salary_package  TEXT,
  before_after    TEXT,
  is_approved     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 9. EVENTS & WORKSHOPS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE,
  type            TEXT DEFAULT 'workshop' CHECK (type IN ('workshop','bootcamp','seminar','hackathon','webinar','meetup','competition')),
  description     TEXT,
  thumbnail_url   TEXT,
  event_date      DATE,
  event_time      TEXT,
  duration        TEXT,
  mode            TEXT DEFAULT 'online',
  venue           TEXT,
  meeting_link    TEXT,
  total_seats     INT DEFAULT 50,
  registered_seats INT DEFAULT 0,
  is_free         BOOLEAN DEFAULT true,
  fee             NUMERIC(10,2) DEFAULT 0,
  instructor_name TEXT,
  status          TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  registration_closes_at TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 10. INTERNSHIPS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_internships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  department      TEXT,
  duration_months INT DEFAULT 3,
  positions_available INT DEFAULT 5,
  description     TEXT,
  requirements    TEXT[],
  projects        TEXT[],
  skills_required TEXT[],
  mentor_name     TEXT,
  stipend         TEXT,
  is_paid         BOOLEAN DEFAULT false,
  provides_certificate BOOLEAN DEFAULT true,
  provides_completion_letter BOOLEAN DEFAULT true,
  hiring_opportunity BOOLEAN DEFAULT false,
  application_deadline DATE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 11. COUPONS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  max_uses        INT DEFAULT 100,
  used_count      INT DEFAULT 0,
  valid_from      DATE,
  valid_until     DATE,
  applicable_courses UUID[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── INDEXES ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_academy_courses_category ON academy_courses(category_id);
CREATE INDEX IF NOT EXISTS idx_academy_courses_slug ON academy_courses(slug);
CREATE INDEX IF NOT EXISTS idx_academy_courses_active ON academy_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_academy_batches_course ON academy_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_batches_status ON academy_batches(status);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_email ON academy_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_batch ON academy_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_academy_reviews_course ON academy_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_certificates_id ON academy_certificates(certificate_id);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────
ALTER TABLE academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_coupons ENABLE ROW LEVEL SECURITY;

-- Public read for active content
CREATE POLICY "Public can read active categories" ON academy_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active courses" ON academy_courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read curriculum" ON academy_curriculum FOR SELECT USING (true);
CREATE POLICY "Public can read active batches" ON academy_batches FOR SELECT USING (true);
CREATE POLICY "Public can read approved reviews" ON academy_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can read published certs" ON academy_certificates FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active events" ON academy_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active internships" ON academy_internships FOR SELECT USING (is_active = true);

-- Public insert for enrollment and demo bookings
CREATE POLICY "Public can enroll" ON academy_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can book demo" ON academy_demo_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit review" ON academy_reviews FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access categories" ON academy_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access courses" ON academy_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access batches" ON academy_batches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access enrollments" ON academy_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access demos" ON academy_demo_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access reviews" ON academy_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access certs" ON academy_certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin','hr_manager'))
);
CREATE POLICY "Admin full access events" ON academy_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);
CREATE POLICY "Admin full access internships" ON academy_internships FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);
CREATE POLICY "Admin full access coupons" ON academy_coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
);

-- ── SEED: 8 Sample Categories ──────────────────────────────────────────
INSERT INTO academy_categories (name, slug, icon, color, sort_order) VALUES
  ('Full Stack Development', 'full-stack-development', '💻', '#0D9488', 1),
  ('UI/UX Design', 'ui-ux-design', '🎨', '#7C3AED', 2),
  ('Digital Marketing', 'digital-marketing', '📈', '#F97316', 3),
  ('Mobile App Development', 'mobile-app-development', '📱', '#0891B2', 4),
  ('Data Science & AI', 'data-science-ai', '🤖', '#6366F1', 5),
  ('Graphic Design', 'graphic-design', '🖌️', '#EC4899', 6),
  ('Cyber Security', 'cyber-security', '🔐', '#EF4444', 7),
  ('Freelancing & Business', 'freelancing-business', '💼', '#EAB308', 8)
ON CONFLICT (slug) DO NOTHING;
