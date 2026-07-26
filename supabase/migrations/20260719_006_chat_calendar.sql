-- ============================================================
-- PHASE 3 UPGRADE: Chat Channels, Direct Messages, Calendar
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Chat Channels
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default general channel
INSERT INTO chat_channels (name, is_private)
VALUES ('general', false)
ON CONFLICT (name) DO NOTHING;

-- 2. Channel Members
CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- 3. Upgrade team_messages to support channels + pin
ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 4. Direct Messages
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id);

-- 5. Company Calendar Events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'company_events'
  ) THEN
    CREATE TABLE company_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      event_date DATE,
      event_time TIME,
      location TEXT,
      type TEXT DEFAULT 'other' CHECK (type IN ('leave', 'holiday', 'meeting', 'interview', 'other')),
      created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'event_date'
  ) THEN
    ALTER TABLE company_events ADD COLUMN event_date DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'event_time'
  ) THEN
    ALTER TABLE company_events ADD COLUMN event_time TIME;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'location'
  ) THEN
    ALTER TABLE company_events ADD COLUMN location TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'type'
  ) THEN
    ALTER TABLE company_events ADD COLUMN type TEXT DEFAULT 'other';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE company_events ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE company_events ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_events' AND column_name = 'event_date'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_events_date ON company_events(event_date);
  END IF;
END $$;

-- 6. RLS Policies

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;

-- Channels: all authenticated users can view public channels
CREATE POLICY "auth_view_channels" ON chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_create_channels" ON chat_channels FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Channel members
CREATE POLICY "auth_view_members" ON channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_join_channel" ON channel_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Direct messages: only sender and recipient can read
CREATE POLICY "dm_select" ON direct_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "dm_insert" ON direct_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Company events: all staff can view, admins create
CREATE POLICY "events_select" ON company_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert" ON company_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'hr_manager')
  ));

-- 7. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE company_events;
