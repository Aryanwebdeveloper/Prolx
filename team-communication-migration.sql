-- ============================================================
-- Prolx Team Communication & Task Management Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TEAM MESSAGES TABLE (Global Staff Chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS team_messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for fast ordered fetch
CREATE INDEX IF NOT EXISTS idx_team_messages_created ON team_messages(created_at DESC);

-- Row Level Security
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Staff & admin can read all messages
CREATE POLICY "team_messages_select" ON team_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
        AND profiles.status = 'active'
    )
  );

-- Staff & admin can insert messages
CREATE POLICY "team_messages_insert" ON team_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
        AND profiles.status = 'active'
    )
  );

-- Only the sender or admin can delete
CREATE POLICY "team_messages_delete" ON team_messages
  FOR DELETE
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 2. STAFF TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS staff_tasks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  priority    text DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status      text DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  due_date    date,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status   ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_created  ON staff_tasks(created_at DESC);

-- Row Level Security
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- Admins see and manage ALL tasks
CREATE POLICY "tasks_admin_all" ON staff_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Staff can read their own tasks
CREATE POLICY "tasks_staff_select" ON staff_tasks
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'staff'
    )
  );

-- Staff can update their own tasks (status only effectively — no RLS column filter needed,
-- the server action will limit what staff can change)
CREATE POLICY "tasks_staff_update" ON staff_tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'staff'
    )
  );

-- ============================================================
-- 3. AUTO-UPDATE updated_at on staff_tasks
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_tasks_updated_at ON staff_tasks;
CREATE TRIGGER staff_tasks_updated_at
  BEFORE UPDATE ON staff_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ENABLE REALTIME
-- (Run these if realtime publication exists, otherwise add
--  tables via Supabase Dashboard → Database → Replication)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_tasks;

-- ============================================================
-- Done! Run: npm run dev and navigate to /dashboard → Team Chat
-- ============================================================
