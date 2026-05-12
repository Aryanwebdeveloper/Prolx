-- ============================================================
-- Migration: 20260512_001_team_linking.sql
-- Description: Refine User-to-Team linking with linked_user_id
-- ============================================================

-- 1. Rename column if it exists as user_id (from previous staff enhancements)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'user_id') THEN
    ALTER TABLE public.team_members RENAME COLUMN user_id TO linked_user_id;
  END IF;
END $$;

-- 2. Add linked_user_id if it somehow doesn't exist
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Enforce one-to-one linking (one user = one team profile)
ALTER TABLE public.team_members 
DROP CONSTRAINT IF EXISTS team_members_linked_user_id_key;

ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_linked_user_id_key UNIQUE (linked_user_id);

-- 4. Ensure bio is available in team_members as well (for local overrides if needed)
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 5. Add visibility and activity flags (ensure they exist)
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- 6. Log
SELECT 'Team linking migration applied successfully!' AS status;
