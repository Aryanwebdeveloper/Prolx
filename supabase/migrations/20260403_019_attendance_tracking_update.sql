-- 20260403_019_attendance_tracking_update.sql

-- Add new columns for tracking heartbeat and movement
ALTER TABLE attendance 
  ADD COLUMN IF NOT EXISTS tracking_status TEXT DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS last_active_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS outside_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkout_reason TEXT,
  ADD COLUMN IF NOT EXISTS movement_history JSONB DEFAULT '[]'::jsonb;

-- Prevent staff from updating their own 'is_locked' column, allowing admins to enforce allowed boundaries
ALTER TABLE staff_locations
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
