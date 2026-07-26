-- ============================================================
-- ROLE EXPANSION MIGRATION
-- Adds new roles: super_admin, hr_manager, project_manager,
-- team_lead, intern, finance_manager, recruiter,
-- content_manager, marketing_manager
-- ============================================================

-- 1. Update the role check constraint to include new roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'super_admin',
    'admin',
    'hr_manager',
    'project_manager',
    'team_lead',
    'finance_manager',
    'recruiter',
    'content_manager',
    'marketing_manager',
    'staff',
    'intern',
    'client'
  ));

-- 2. Create role_permissions table for granular access control
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,        -- e.g. 'leave', 'projects', 'payroll'
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, module)
);

-- 3. Seed default permissions per role
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete, can_approve) VALUES
-- super_admin gets everything
('super_admin', 'all', true, true, true, true, true),
-- admin
('admin', 'employees', true, true, true, true, true),
('admin', 'leave', true, true, true, true, true),
('admin', 'attendance', true, true, true, true, true),
('admin', 'projects', true, true, true, true, true),
('admin', 'tasks', true, true, true, true, true),
('admin', 'payroll', true, true, true, true, true),
('admin', 'certificates', true, true, true, true, true),
('admin', 'letters', true, true, true, true, true),
('admin', 'recruitment', true, true, true, true, true),
('admin', 'crm', true, true, true, true, true),
('admin', 'invoices', true, true, true, true, true),
('admin', 'reports', true, false, false, false, false),
('admin', 'audit_logs', true, false, false, false, false),
('admin', 'settings', true, true, true, true, false),
-- hr_manager
('hr_manager', 'employees', true, true, true, false, true),
('hr_manager', 'leave', true, true, true, false, true),
('hr_manager', 'attendance', true, true, true, false, false),
('hr_manager', 'recruitment', true, true, true, true, true),
('hr_manager', 'certificates', true, true, false, false, false),
('hr_manager', 'letters', true, true, false, false, false),
('hr_manager', 'payroll', true, false, false, false, false),
('hr_manager', 'reports', true, false, false, false, false),
-- project_manager
('project_manager', 'projects', true, true, true, false, true),
('project_manager', 'tasks', true, true, true, true, true),
('project_manager', 'employees', true, false, false, false, false),
('project_manager', 'attendance', true, false, false, false, false),
('project_manager', 'reports', true, false, false, false, false),
-- team_lead
('team_lead', 'projects', true, false, true, false, false),
('team_lead', 'tasks', true, true, true, false, true),
('team_lead', 'leave', true, false, false, false, true),
('team_lead', 'attendance', true, false, false, false, false),
-- finance_manager
('finance_manager', 'invoices', true, true, true, false, true),
('finance_manager', 'payroll', true, true, true, false, true),
('finance_manager', 'crm', true, false, false, false, false),
('finance_manager', 'reports', true, false, false, false, false),
-- recruiter
('recruiter', 'recruitment', true, true, true, false, false),
-- staff / intern basics
('staff', 'leave', true, true, false, false, false),
('staff', 'attendance', true, false, false, false, false),
('staff', 'tasks', true, false, false, false, false),
('staff', 'projects', true, false, false, false, false),
('intern', 'leave', true, true, false, false, false),
('intern', 'attendance', true, false, false, false, false),
('intern', 'tasks', true, false, false, false, false)
ON CONFLICT (role, module) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Authenticated users can read permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- 5. Add department and designation columns to profiles if not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full-time';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE;
