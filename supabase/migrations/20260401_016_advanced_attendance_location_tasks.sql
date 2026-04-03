-- Add location columns to attendance table
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS check_in_location TEXT,
  ADD COLUMN IF NOT EXISTS check_out_location TEXT,
  ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_out_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS check_out_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS task_completed BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS task_proof_urls TEXT[] DEFAULT '{}';

-- Staff predefined working locations table
CREATE TABLE IF NOT EXISTS staff_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Staff announcements / task assignments table
CREATE TABLE IF NOT EXISTS staff_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  priority TEXT NOT NULL DEFAULT 'normal',
  target_user_ids UUID[],
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  scheduled_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff announcement read receipts
CREATE TABLE IF NOT EXISTS staff_announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES staff_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- Enable realtime for announcements
ALTER PUBLICATION supabase_realtime ADD TABLE staff_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_announcement_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
