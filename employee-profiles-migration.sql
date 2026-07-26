-- ============================================================
-- EMPLOYEE PROFILES EXTENDED MIGRATION
-- Adds: employee_profiles, departments, designations,
--       employee_documents, salary_history, promotion_history
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Departments master table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  description TEXT,
  head_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Designations master table
CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,   -- 1=entry, 5=senior, 10=executive
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Extended Employee Profile
CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  -- Employment info
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
  employment_type TEXT DEFAULT 'full-time'
    CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  joining_date DATE,
  probation_end_date DATE,
  confirmation_date DATE,
  work_location TEXT DEFAULT 'office'
    CHECK (work_location IN ('office', 'remote', 'hybrid')),
  reporting_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Personal info
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  nationality TEXT,
  national_id TEXT,
  national_id_url TEXT,
  phone TEXT,
  alternate_phone TEXT,
  current_address TEXT,
  permanent_address TEXT,
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  -- Professional info
  bio TEXT,
  skills TEXT[],               -- array of skill tags
  languages TEXT[],            -- array of languages
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  -- Education (JSONB array)
  education JSONB DEFAULT '[]'::JSONB,
  -- Work experience (JSONB array)
  experience JSONB DEFAULT '[]'::JSONB,
  -- Certifications (external, not company certs)
  certifications JSONB DEFAULT '[]'::JSONB,
  -- Bank details
  bank_name TEXT,
  account_number TEXT,
  account_title TEXT,
  -- Current salary
  base_salary NUMERIC,
  salary_currency TEXT DEFAULT 'PKR',
  -- Notes
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Employee Documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'contract', 'offer_letter', 'nda', 'policy', 'certificate',
    'identity', 'educational', 'experience', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,              -- pdf, docx, image, etc.
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_visible_to_employee BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Salary History
CREATE TABLE IF NOT EXISTS salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  base_salary NUMERIC NOT NULL,
  previous_salary NUMERIC,
  increment_percentage NUMERIC,
  increment_reason TEXT,
  currency TEXT DEFAULT 'PKR',
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Promotion History
CREATE TABLE IF NOT EXISTS promotion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  from_designation TEXT,
  to_designation TEXT,
  from_department TEXT,
  to_department TEXT,
  from_role TEXT,
  to_role TEXT,
  reason TEXT,
  letter_id UUID,              -- link to company_letters if generated
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Seed default departments
INSERT INTO departments (name, code, description) VALUES
('Engineering', 'ENG', 'Software development and technical team'),
('Design', 'DES', 'UI/UX and graphic design'),
('Marketing', 'MKT', 'Digital marketing and growth'),
('Human Resources', 'HR', 'HR, recruitment and people operations'),
('Finance', 'FIN', 'Finance, accounting and billing'),
('Project Management', 'PM', 'Project coordination and delivery'),
('Sales', 'SALES', 'Business development and sales'),
('Content', 'CONT', 'Content creation and management'),
('Operations', 'OPS', 'General operations and admin')
ON CONFLICT (name) DO NOTHING;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_dept ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_manager ON employee_profiles(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_employee_docs_user ON employee_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_history_user ON salary_history(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_user ON promotion_history(user_id);

-- 9. Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_history ENABLE ROW LEVEL SECURITY;

-- Departments - viewable by all staff
CREATE POLICY "All staff can view departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON departments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- Designations
CREATE POLICY "All staff can view designations" ON designations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage designations" ON designations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- Employee profiles
CREATE POLICY "Employees can view own profile" ON employee_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead')
  ));

CREATE POLICY "Employees can update own profile" ON employee_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins/HR can insert profiles" ON employee_profiles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

CREATE POLICY "Admins/HR can update profiles" ON employee_profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- Documents
CREATE POLICY "Employees see own visible docs" ON employee_documents FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND is_visible_to_employee = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

CREATE POLICY "Admins/HR manage documents" ON employee_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- Salary History - sensitive
CREATE POLICY "Employees view own salary history" ON salary_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'finance_manager')
  ));

CREATE POLICY "Finance/HR can manage salary" ON salary_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'finance_manager')));

-- Promotion History
CREATE POLICY "Employees view own promotions" ON promotion_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')
  ));

CREATE POLICY "Admins manage promotions" ON promotion_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- 10. Triggers
DROP TRIGGER IF EXISTS employee_profiles_updated_at ON employee_profiles;
CREATE TRIGGER employee_profiles_updated_at BEFORE UPDATE ON employee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Employee profiles migration complete! Departments seeded.' AS status;
