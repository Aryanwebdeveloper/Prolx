-- ============================================================
-- LEAVE MANAGEMENT MIGRATION
-- Creates: leave_types, leave_balances, leave_requests,
--          leave_approvals
-- ============================================================

-- 1. Leave Types (configurable by HR/Admin)
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,                    -- e.g. "Annual Leave"
  code TEXT NOT NULL UNIQUE,                    -- e.g. "AL"
  color TEXT DEFAULT '#0D9488',
  default_days_per_year INTEGER DEFAULT 0,      -- 0 = unlimited / carry-forward
  is_paid BOOLEAN DEFAULT true,
  requires_attachment BOOLEAN DEFAULT false,
  min_days NUMERIC DEFAULT 0.5,                 -- allow half-day
  max_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  allow_half_day BOOLEAN DEFAULT true,
  carryover_days INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Leave Balances (per employee, per year)
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  total_days NUMERIC DEFAULT 0,
  used_days NUMERIC DEFAULT 0,
  pending_days NUMERIC DEFAULT 0,
  carried_over NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, leave_type_id, year)
);

-- 3. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period TEXT,                          -- 'morning' | 'afternoon'
  attachment_url TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'hr_review', 'manager_review', 'admin_review', 'approved', 'rejected', 'cancelled')),
  current_stage TEXT DEFAULT 'hr_review'
    CHECK (current_stage IN ('hr_review', 'manager_review', 'admin_review', 'completed')),
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Leave Approvals (multi-stage history)
CREATE TABLE IF NOT EXISTS leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('hr_review', 'manager_review', 'admin_review')),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'info_requested')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_request ON leave_approvals(leave_request_id);

-- 6. Seed default leave types
INSERT INTO leave_types (name, code, color, default_days_per_year, is_paid, allow_half_day, description) VALUES
('Annual Leave', 'AL', '#0D9488', 14, true, true, 'Paid annual vacation leave'),
('Sick Leave', 'SL', '#EF4444', 10, true, true, 'Medical or health-related leave'),
('Casual Leave', 'CL', '#F97316', 7, true, true, 'For personal errands or short breaks'),
('Emergency Leave', 'EL', '#8B5CF6', 3, true, false, 'For unforeseen emergencies'),
('Maternity Leave', 'ML', '#EC4899', 90, true, false, 'For new mothers'),
('Paternity Leave', 'PL', '#3B82F6', 7, true, false, 'For new fathers'),
('Work From Home', 'WFH', '#10B981', 0, true, true, 'Remote work request'),
('Compensatory Leave', 'CompL', '#6366F1', 0, true, true, 'In lieu of overtime worked'),
('Half Day', 'HD', '#F59E0B', 0, true, false, 'Half-day absence')
ON CONFLICT (code) DO NOTHING;

-- 7. Enable RLS
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_approvals ENABLE ROW LEVEL SECURITY;

-- Leave Types Policies
CREATE POLICY "Anyone authenticated can view leave types"
  ON leave_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins/HR can manage leave types"
  ON leave_types FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager'))
  );

-- Leave Balances Policies
CREATE POLICY "Users can view own balances"
  ON leave_balances FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead')
  ));

CREATE POLICY "Admins/HR can manage balances"
  ON leave_balances FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager'))
  );

-- Leave Requests Policies
CREATE POLICY "Users can view own requests"
  ON leave_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead')
  ));

CREATE POLICY "Users can create own requests"
  ON leave_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own requests"
  ON leave_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Approvers can update requests"
  ON leave_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead'))
  );

-- Leave Approvals Policies
CREATE POLICY "Approvers can view approvals"
  ON leave_approvals FOR SELECT TO authenticated
  USING (
    approver_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager')
    ) OR EXISTS (
      SELECT 1 FROM leave_requests lr WHERE lr.id = leave_request_id AND lr.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can insert approvals"
  ON leave_approvals FOR INSERT TO authenticated
  WITH CHECK (
    approver_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager', 'team_lead')
    )
  );
