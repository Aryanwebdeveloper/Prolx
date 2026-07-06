-- ============================================================
-- Prolx Chat Read Receipts Migration
-- Run this in Supabase SQL Editor (Idempotent / Safe to rerun)
-- ============================================================

CREATE TABLE IF NOT EXISTS team_message_reads (
  message_id uuid REFERENCES team_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (message_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE team_message_reads ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if they already exist
DROP POLICY IF EXISTS "team_message_reads_select" ON team_message_reads;
DROP POLICY IF EXISTS "team_message_reads_insert" ON team_message_reads;

-- Read policy: Any staff or admin can see who read messages
CREATE POLICY "team_message_reads_select" ON team_message_reads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
        AND profiles.status = 'active'
    )
  );

-- Insert policy: Any staff/admin can mark their own read status
CREATE POLICY "team_message_reads_insert" ON team_message_reads
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
        AND profiles.status = 'active'
    )
  );

-- Enable realtime for this table so read updates stream live
-- (Using exception block to prevent error if already added to publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'team_message_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE team_message_reads;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Fallback in case of replication restrictions
END $$;
