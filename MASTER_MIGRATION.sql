-- ============================================================
-- PROLX ENTERPRISE ERP — MASTER SQL MIGRATION
-- Safe to run multiple times (fully idempotent)
-- Matches actual Supabase schema exactly
-- ============================================================

-- ============================================================
-- SECTION 1: PROFILES — EXTEND COLUMNS & CONSTRAINTS
-- ============================================================

-- Extend profiles role constraint to include all roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN (
    'super_admin', 'admin', 'hr_manager', 'project_manager',
    'team_lead', 'finance_manager', 'recruiter', 'content_manager',
    'marketing_manager', 'staff', 'intern', 'client'
  )
);

-- Add extended metadata columns to profiles (safe - uses IF NOT EXISTS)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_joining DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cnic TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'PKR';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full-time';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_location TEXT DEFAULT 'office';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS joining_date DATE;

-- Unique constraint for employee_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_employee_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_employee_id_key UNIQUE (employee_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- SECTION 2: DEPARTMENTS & DESIGNATIONS
-- ============================================================

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

CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 3: EMPLOYEE PROFILES (EXTENDED)
-- ============================================================

CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
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
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  nationality TEXT,
  national_id TEXT,
  national_id_url TEXT,
  phone TEXT,
  alternate_phone TEXT,
  current_address TEXT,
  permanent_address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_email TEXT,
  bio TEXT,
  skills TEXT[],
  languages TEXT[],
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  bank_name TEXT,
  account_number TEXT,
  account_title TEXT,
  base_salary NUMERIC,
  salary_currency TEXT DEFAULT 'PKR',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 4: EMPLOYEE DOCUMENTS
-- ============================================================

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
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_visible_to_employee BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 5: SALARY HISTORY
-- ============================================================

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

-- ============================================================
-- SECTION 6: PROMOTION HISTORY
-- ============================================================

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
  letter_id UUID,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 7: LEAVE MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#0D9488',
  default_days_per_year INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT true,
  requires_attachment BOOLEAN DEFAULT false,
  min_days NUMERIC DEFAULT 0.5,
  max_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  allow_half_day BOOLEAN DEFAULT true,
  carryover_days INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  total_days NUMERIC DEFAULT 0,
  used_days NUMERIC DEFAULT 0,
  pending_days NUMERIC DEFAULT 0,
  carried_over NUMERIC DEFAULT 0,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period TEXT,
  attachment_url TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'hr_review', 'manager_review', 'admin_review', 'approved', 'rejected', 'cancelled')),
  current_stage TEXT DEFAULT 'hr_review'
    CHECK (current_stage IN ('hr_review', 'manager_review', 'admin_review', 'completed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('hr_review', 'manager_review', 'admin_review')),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'info_requested')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 8: INTERNAL APPLICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS internal_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'leave', 'salary_advance', 'equipment_request', 'internet_allowance',
    'laptop_request', 'office_supplies', 'remote_work', 'department_transfer',
    'promotion_request', 'training_request', 'internship_extension',
    'internship_completion', 'experience_letter', 'noc',
    'employment_verification', 'other'
  )),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'on_hold', 'cancelled')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS internal_application_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES internal_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 9: PERFORMANCE REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS review_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  weight NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_period TEXT NOT NULL,
  review_type TEXT DEFAULT 'quarterly'
    CHECK (review_type IN ('quarterly', 'annual', 'probation', 'ad_hoc')),
  overall_score NUMERIC,
  overall_rating TEXT CHECK (overall_rating IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
  strengths TEXT,
  improvements TEXT,
  goals_for_next_period TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES review_criteria(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score BETWEEN 1 AND 10),
  comment TEXT
);

-- ============================================================
-- SECTION 10: PAYROLL
-- ============================================================

CREATE TABLE IF NOT EXISTS payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'finalized', 'paid')),
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  allowances JSONB DEFAULT '[]',
  deductions JSONB DEFAULT '[]',
  total_allowances NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  gross_salary NUMERIC DEFAULT 0,
  net_salary NUMERIC DEFAULT 0,
  working_days INTEGER DEFAULT 0,
  present_days INTEGER DEFAULT 0,
  absent_days INTEGER DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_amount NUMERIC DEFAULT 0,
  advance_deduction NUMERIC DEFAULT 0,
  tax_deduction NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  payslip_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 11: PROJECTS & TASKS (EXTEND EXISTING)
-- ============================================================

-- Extend projects if columns are missing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health TEXT DEFAULT 'on_track'
  CHECK (health IN ('on_track', 'at_risk', 'behind', 'completed'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_cost NUMERIC DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_currency TEXT DEFAULT 'PKR';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Extend staff_tasks
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100);
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES staff_tasks(id) ON DELETE SET NULL;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE staff_tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES project_comments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES staff_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES staff_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES staff_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 12: CRM
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('lead', 'prospect', 'active', 'inactive', 'churned')),
  source TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  profile_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[],
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'proposal', 'follow_up')),
  subject TEXT NOT NULL,
  notes TEXT,
  outcome TEXT,
  next_action TEXT,
  next_action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 13: AUDIT & ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_label TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'success'
    CHECK (status IN ('success', 'failed', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  device_info TEXT,
  ip_address TEXT,
  last_active TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 14: COMPANY EVENTS (CALENDAR)
-- ============================================================

CREATE TABLE IF NOT EXISTS company_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'holiday', 'birthday', 'anniversary', 'interview',
    'meeting', 'deadline', 'announcement', 'milestone', 'other'
  )),
  color TEXT DEFAULT '#0D9488',
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  target_user_ids UUID[],
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  event_date DATE,
  event_time TIME,
  location TEXT,
  type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 15: ROLE PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, module)
);

-- ============================================================
-- SECTION 16: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 17: RLS POLICIES
-- ============================================================

-- Helper: Check if user is admin/staff
-- Admins: super_admin, admin, hr_manager, finance_manager

-- ---- DEPARTMENTS ----
DROP POLICY IF EXISTS "departments_select" ON departments;
DROP POLICY IF EXISTS "departments_admin_all" ON departments;
CREATE POLICY "departments_select" ON departments FOR SELECT USING (true);
CREATE POLICY "departments_admin_all" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- DESIGNATIONS ----
DROP POLICY IF EXISTS "designations_select" ON designations;
DROP POLICY IF EXISTS "designations_admin_all" ON designations;
CREATE POLICY "designations_select" ON designations FOR SELECT USING (true);
CREATE POLICY "designations_admin_all" ON designations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- EMPLOYEE PROFILES ----
DROP POLICY IF EXISTS "employee_profiles_own_select" ON employee_profiles;
DROP POLICY IF EXISTS "employee_profiles_admin_all" ON employee_profiles;
CREATE POLICY "employee_profiles_own_select" ON employee_profiles FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager','project_manager','team_lead'))
);
CREATE POLICY "employee_profiles_admin_all" ON employee_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- EMPLOYEE DOCUMENTS ----
DROP POLICY IF EXISTS "employee_documents_own_select" ON employee_documents;
DROP POLICY IF EXISTS "employee_documents_admin_all" ON employee_documents;
CREATE POLICY "employee_documents_own_select" ON employee_documents FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "employee_documents_admin_all" ON employee_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- SALARY HISTORY ----
DROP POLICY IF EXISTS "salary_history_own_select" ON salary_history;
DROP POLICY IF EXISTS "salary_history_admin_all" ON salary_history;
CREATE POLICY "salary_history_own_select" ON salary_history FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager','finance_manager'))
);
CREATE POLICY "salary_history_admin_all" ON salary_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager','finance_manager'))
);

-- ---- PROMOTION HISTORY ----
DROP POLICY IF EXISTS "promotion_history_own_select" ON promotion_history;
DROP POLICY IF EXISTS "promotion_history_admin_all" ON promotion_history;
CREATE POLICY "promotion_history_own_select" ON promotion_history FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "promotion_history_admin_all" ON promotion_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- LEAVE TYPES ----
DROP POLICY IF EXISTS "leave_types_select" ON leave_types;
DROP POLICY IF EXISTS "leave_types_admin_all" ON leave_types;
CREATE POLICY "leave_types_select" ON leave_types FOR SELECT USING (true);
CREATE POLICY "leave_types_admin_all" ON leave_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- LEAVE BALANCES ----
DROP POLICY IF EXISTS "leave_balances_own_select" ON leave_balances;
DROP POLICY IF EXISTS "leave_balances_admin_all" ON leave_balances;
CREATE POLICY "leave_balances_own_select" ON leave_balances FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "leave_balances_admin_all" ON leave_balances FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- LEAVE REQUESTS ----
DROP POLICY IF EXISTS "leave_requests_own_select" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_own_insert" ON leave_requests;
DROP POLICY IF EXISTS "leave_requests_admin_all" ON leave_requests;
CREATE POLICY "leave_requests_own_select" ON leave_requests FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager','team_lead','project_manager'))
);
CREATE POLICY "leave_requests_own_insert" ON leave_requests FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "leave_requests_admin_all" ON leave_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- LEAVE APPROVALS ----
DROP POLICY IF EXISTS "leave_approvals_select" ON leave_approvals;
DROP POLICY IF EXISTS "leave_approvals_admin_all" ON leave_approvals;
CREATE POLICY "leave_approvals_select" ON leave_approvals FOR SELECT USING (
  approver_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "leave_approvals_admin_all" ON leave_approvals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- INTERNAL APPLICATIONS ----
DROP POLICY IF EXISTS "internal_applications_own_select" ON internal_applications;
DROP POLICY IF EXISTS "internal_applications_own_insert" ON internal_applications;
DROP POLICY IF EXISTS "internal_applications_admin_all" ON internal_applications;
CREATE POLICY "internal_applications_own_select" ON internal_applications FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "internal_applications_own_insert" ON internal_applications FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "internal_applications_admin_all" ON internal_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- INTERNAL APPLICATION COMMENTS ----
DROP POLICY IF EXISTS "internal_app_comments_select" ON internal_application_comments;
DROP POLICY IF EXISTS "internal_app_comments_insert" ON internal_application_comments;
CREATE POLICY "internal_app_comments_select" ON internal_application_comments FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "internal_app_comments_insert" ON internal_application_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ---- REVIEW CRITERIA ----
DROP POLICY IF EXISTS "review_criteria_select" ON review_criteria;
DROP POLICY IF EXISTS "review_criteria_admin_all" ON review_criteria;
CREATE POLICY "review_criteria_select" ON review_criteria FOR SELECT USING (true);
CREATE POLICY "review_criteria_admin_all" ON review_criteria FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- PERFORMANCE REVIEWS ----
DROP POLICY IF EXISTS "performance_reviews_own_select" ON performance_reviews;
DROP POLICY IF EXISTS "performance_reviews_admin_all" ON performance_reviews;
CREATE POLICY "performance_reviews_own_select" ON performance_reviews FOR SELECT USING (
  employee_id = auth.uid() OR reviewer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "performance_reviews_admin_all" ON performance_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- REVIEW RATINGS ----
DROP POLICY IF EXISTS "review_ratings_select" ON review_ratings;
DROP POLICY IF EXISTS "review_ratings_admin_all" ON review_ratings;
CREATE POLICY "review_ratings_select" ON review_ratings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM performance_reviews pr
    WHERE pr.id = review_id AND (pr.employee_id = auth.uid() OR pr.reviewer_id = auth.uid())
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);
CREATE POLICY "review_ratings_admin_all" ON review_ratings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- PAYROLL PERIODS ----
DROP POLICY IF EXISTS "payroll_periods_admin_all" ON payroll_periods;
CREATE POLICY "payroll_periods_admin_all" ON payroll_periods FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','finance_manager','hr_manager'))
);

-- ---- PAYROLL RECORDS ----
DROP POLICY IF EXISTS "payroll_records_own_select" ON payroll_records;
DROP POLICY IF EXISTS "payroll_records_admin_all" ON payroll_records;
CREATE POLICY "payroll_records_own_select" ON payroll_records FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','finance_manager','hr_manager'))
);
CREATE POLICY "payroll_records_admin_all" ON payroll_records FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','finance_manager','hr_manager'))
);

-- ---- PROJECT FILES ----
DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_admin_all" ON project_files;
CREATE POLICY "project_files_select" ON project_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','project_manager'))
);
CREATE POLICY "project_files_insert" ON project_files FOR INSERT WITH CHECK (
  uploaded_by = auth.uid()
);
CREATE POLICY "project_files_admin_all" ON project_files FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','project_manager'))
);

-- ---- PROJECT COMMENTS ----
DROP POLICY IF EXISTS "project_comments_select" ON project_comments;
DROP POLICY IF EXISTS "project_comments_insert" ON project_comments;
CREATE POLICY "project_comments_select" ON project_comments FOR SELECT USING (true);
CREATE POLICY "project_comments_insert" ON project_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ---- TASK COMMENTS ----
DROP POLICY IF EXISTS "task_comments_select" ON task_comments;
DROP POLICY IF EXISTS "task_comments_insert" ON task_comments;
CREATE POLICY "task_comments_select" ON task_comments FOR SELECT USING (true);
CREATE POLICY "task_comments_insert" ON task_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ---- TASK CHECKLISTS ----
DROP POLICY IF EXISTS "task_checklists_select" ON task_checklists;
DROP POLICY IF EXISTS "task_checklists_all" ON task_checklists;
CREATE POLICY "task_checklists_select" ON task_checklists FOR SELECT USING (true);
CREATE POLICY "task_checklists_all" ON task_checklists FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','project_manager','team_lead'))
);

-- ---- TASK ACTIVITY ----
DROP POLICY IF EXISTS "task_activity_select" ON task_activity;
DROP POLICY IF EXISTS "task_activity_insert" ON task_activity;
CREATE POLICY "task_activity_select" ON task_activity FOR SELECT USING (true);
CREATE POLICY "task_activity_insert" ON task_activity FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ---- CLIENTS ----
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_admin_all" ON clients;
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (
    'super_admin','admin','project_manager','finance_manager','team_lead','recruiter'
  ))
);
CREATE POLICY "clients_admin_all" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','project_manager','finance_manager'))
);

-- ---- CLIENT INTERACTIONS ----
DROP POLICY IF EXISTS "client_interactions_select" ON client_interactions;
DROP POLICY IF EXISTS "client_interactions_insert" ON client_interactions;
CREATE POLICY "client_interactions_select" ON client_interactions FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','project_manager','finance_manager'))
);
CREATE POLICY "client_interactions_insert" ON client_interactions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- ---- AUDIT LOGS ----
DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_admin_select" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- ---- LOGIN HISTORY ----
DROP POLICY IF EXISTS "login_history_own_select" ON login_history;
DROP POLICY IF EXISTS "login_history_admin_all" ON login_history;
CREATE POLICY "login_history_own_select" ON login_history FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);
CREATE POLICY "login_history_admin_all" ON login_history FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);

-- ---- ACTIVE SESSIONS ----
DROP POLICY IF EXISTS "active_sessions_own_select" ON active_sessions;
DROP POLICY IF EXISTS "active_sessions_admin_all" ON active_sessions;
CREATE POLICY "active_sessions_own_select" ON active_sessions FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);
CREATE POLICY "active_sessions_admin_all" ON active_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);

-- ---- COMPANY EVENTS ----
DROP POLICY IF EXISTS "company_events_select" ON company_events;
DROP POLICY IF EXISTS "company_events_admin_all" ON company_events;
CREATE POLICY "company_events_select" ON company_events FOR SELECT USING (
  is_public = true OR created_by = auth.uid() OR
  (target_user_ids IS NOT NULL AND auth.uid()::text = ANY(target_user_ids::text[]))
);
CREATE POLICY "company_events_admin_all" ON company_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','hr_manager'))
);

-- ---- ROLE PERMISSIONS ----
DROP POLICY IF EXISTS "role_permissions_admin_all" ON role_permissions;
DROP POLICY IF EXISTS "role_permissions_select" ON role_permissions;
CREATE POLICY "role_permissions_select" ON role_permissions FOR SELECT USING (true);
CREATE POLICY "role_permissions_admin_all" ON role_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);

-- ============================================================
-- SECTION 18: FIX NOTIFICATIONS RLS (already exists guard)
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
DROP POLICY IF EXISTS "Users insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON notifications;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY "notifications_admin_all" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','admin'))
);

-- ============================================================
-- SECTION 19: DEFAULT LEAVE TYPES DATA
-- ============================================================

INSERT INTO leave_types (name, code, color, default_days_per_year, is_paid, is_active, description)
VALUES
  ('Annual Leave', 'AL', '#0D9488', 15, true, true, 'Yearly paid vacation leave'),
  ('Sick Leave', 'SL', '#EF4444', 10, true, true, 'Medical and health-related leave'),
  ('Casual Leave', 'CL', '#F59E0B', 7, true, true, 'Short-term personal leave'),
  ('Unpaid Leave', 'UL', '#6B7280', 30, false, true, 'Leave without pay'),
  ('Maternity Leave', 'ML', '#EC4899', 90, true, true, 'Maternity leave for new mothers'),
  ('Paternity Leave', 'PL', '#8B5CF6', 7, true, true, 'Paternity leave for new fathers'),
  ('Study Leave', 'STL', '#3B82F6', 5, true, true, 'Education and exam leave')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SECTION 20: DEFAULT REVIEW CRITERIA DATA
-- ============================================================

INSERT INTO review_criteria (name, description, weight, order_index)
VALUES
  ('Work Quality', 'Quality and accuracy of work delivered', 2.0, 1),
  ('Productivity', 'Volume and efficiency of work output', 2.0, 2),
  ('Communication', 'Verbal and written communication skills', 1.5, 3),
  ('Teamwork', 'Collaboration and team contribution', 1.5, 4),
  ('Initiative', 'Proactiveness and self-motivation', 1.0, 5),
  ('Punctuality', 'Attendance and time management', 1.0, 6),
  ('Problem Solving', 'Analytical thinking and issue resolution', 1.5, 7),
  ('Leadership', 'Mentoring and leadership qualities', 1.0, 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- DONE! All tables created, RLS enabled, policies applied.
-- ============================================================
