-- ============================================================
-- NOTIFICATIONS, AUDIT LOGS, CALENDAR, INTERNAL APPS,
-- PERFORMANCE, PAYROLL, CRM, SECURITY MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'task_assigned', 'task_updated', 'task_completed',
    'leave_submitted', 'leave_approved', 'leave_rejected',
    'certificate_issued', 'letter_issued',
    'interview_scheduled', 'announcement_posted',
    'chat_mention', 'attendance_reminder',
    'application_status', 'project_assigned',
    'payslip_ready', 'warning_issued', 'performance_review',
    'general'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,                       -- e.g. '/dashboard?tab=leave'
  entity_type TEXT,                -- 'leave_request', 'task', etc.
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "Users can mark read" ON notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 2. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,            -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'
  entity_type TEXT NOT NULL,       -- 'leave_request', 'employee', 'project', etc.
  entity_id TEXT,
  entity_label TEXT,               -- human-readable description
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins and admins can view audit logs" ON audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 3. COMPANY CALENDAR EVENTS
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
  linked_entity_type TEXT,         -- 'leave_request', 'project', 'interview', etc.
  linked_entity_id UUID,
  target_user_ids UUID[],          -- null = all staff
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_events_dates ON company_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_company_events_type ON company_events(event_type);

ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All staff can view public events" ON company_events FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Admins can manage events" ON company_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

-- ============================================================
-- 4. INTERNAL APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS internal_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'leave', 'salary_advance', 'equipment_request', 'internet_allowance',
    'laptop_request', 'office_supplies', 'remote_work', 'department_transfer',
    'promotion_request', 'training_request', 'internship_extension',
    'internship_completion', 'experience_letter', 'noc', 'employment_verification',
    'other'
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS internal_application_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES internal_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,    -- internal = only HR/admin sees it
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_apps_user ON internal_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_internal_apps_status ON internal_applications(status);

ALTER TABLE internal_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_application_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own apps" ON internal_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')
  ));
CREATE POLICY "Users create own apps" ON internal_applications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users cancel own apps" ON internal_applications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "HR/Admin manage apps" ON internal_applications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));

CREATE POLICY "App participants can view comments" ON internal_application_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM internal_applications ia WHERE ia.id = application_id AND ia.user_id = auth.uid()
  ) OR is_internal = false
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')));
CREATE POLICY "Authenticated users can comment" ON internal_application_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 5. PERFORMANCE REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS review_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  weight NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

INSERT INTO review_criteria (name, description, weight, order_index) VALUES
('Communication', 'Clarity of communication with team and clients', 1.0, 1),
('Attendance & Punctuality', 'Regular attendance and on-time reporting', 1.0, 2),
('Technical Skills', 'Proficiency in role-specific technical areas', 1.5, 3),
('Teamwork & Collaboration', 'Working effectively with the team', 1.0, 4),
('Leadership', 'Taking initiative and leading when required', 1.0, 5),
('Productivity', 'Output quality and quantity relative to goals', 1.5, 6),
('Behavior & Professionalism', 'Attitude, ethics, and workplace behavior', 1.0, 7),
('Problem Solving', 'Ability to identify and resolve issues effectively', 1.0, 8)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  review_period TEXT NOT NULL,     -- e.g. 'Q1 2026', 'Annual 2025'
  review_type TEXT DEFAULT 'quarterly' CHECK (review_type IN ('quarterly', 'annual', 'probation', 'ad_hoc')),
  overall_score NUMERIC,
  overall_rating TEXT CHECK (overall_rating IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
  strengths TEXT,
  improvements TEXT,
  goals_for_next_period TEXT,
  recommendations TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
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
  comment TEXT,
  UNIQUE(review_id, criteria_id)
);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_review_ratings_review ON review_ratings(review_id);

ALTER TABLE review_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All can view criteria" ON review_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Employees view own reviews" ON performance_reviews FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR reviewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')
  ));
CREATE POLICY "Managers can create reviews" ON performance_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead')
  ));
CREATE POLICY "Reviewers can update" ON performance_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));
CREATE POLICY "All can view ratings" ON review_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviewers manage ratings" ON review_ratings FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM performance_reviews pr WHERE pr.id = review_id AND pr.reviewer_id = auth.uid()
  ) OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));

-- ============================================================
-- 6. PAYROLL
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label TEXT NOT NULL,      -- e.g. 'July 2026'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'finalized', 'paid')),
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year)
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  allowances JSONB DEFAULT '[]'::JSONB,    -- [{name, amount}]
  deductions JSONB DEFAULT '[]'::JSONB,   -- [{name, amount}]
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
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  payslip_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_records_period ON payroll_records(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_user ON payroll_records(user_id);

ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance/Admin can manage payroll periods" ON payroll_periods FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager', 'hr_manager')));
CREATE POLICY "Employees view own payslips" ON payroll_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager', 'hr_manager')
  ));
CREATE POLICY "Finance can manage payroll" ON payroll_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')));

-- ============================================================
-- 7. CRM — CLIENTS
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
  status TEXT DEFAULT 'active' CHECK (status IN ('lead', 'prospect', 'active', 'inactive', 'churned')),
  source TEXT,                     -- 'referral', 'website', 'linkedin', etc.
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  profile_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- linked dashboard user
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

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_client_interactions_client ON client_interactions(client_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view clients" ON clients FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager', 'project_manager', 'team_lead')));
CREATE POLICY "Admin/Finance can manage clients" ON clients FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')));
CREATE POLICY "Staff can view interactions" ON client_interactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager', 'project_manager')));
CREATE POLICY "Staff can log interactions" ON client_interactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager', 'project_manager')
  ));

-- ============================================================
-- 8. SECURITY / LOGIN HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
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

CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own login history" ON login_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins see all login history" ON login_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));
CREATE POLICY "System inserts login history" ON login_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users see own sessions" ON active_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins see all sessions" ON active_sessions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS internal_apps_updated_at ON internal_applications;
CREATE TRIGGER internal_apps_updated_at BEFORE UPDATE ON internal_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS performance_reviews_updated_at ON performance_reviews;
CREATE TRIGGER performance_reviews_updated_at BEFORE UPDATE ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS payroll_records_updated_at ON payroll_records;
CREATE TRIGGER payroll_records_updated_at BEFORE UPDATE ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS company_events_updated_at ON company_events;
CREATE TRIGGER company_events_updated_at BEFORE UPDATE ON company_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'All remaining ERP tables created successfully!' AS status;
