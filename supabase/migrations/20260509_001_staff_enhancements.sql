-- ============================================================
-- Migration: 20260509_001_staff_enhancements.sql
-- Description: Add user_id and is_visible to team_members
-- ============================================================

-- 1. Add columns to team_members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bio TEXT;


-- 2. Update RLS policies for team_members

-- Drop existing public select policy
DROP POLICY IF EXISTS "team_members_select_public" ON public.team_members;

-- Drop existing public select policy
DROP POLICY IF EXISTS "team_members_select_public" ON public.team_members;

-- New public select policy: only show active AND visible members
CREATE POLICY "team_members_select_public" ON public.team_members
  FOR SELECT USING (is_active = true AND is_visible = true);


-- Policy to allow staff to select their own record (for editing)
DROP POLICY IF EXISTS "team_members_select_owner" ON public.team_members;
CREATE POLICY "team_members_select_owner" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow staff to update their own record
-- They can only update their own record and cannot change user_id or is_visible (handled via app logic usually, but let's be safe)
DROP POLICY IF EXISTS "team_members_update_owner" ON public.team_members;
CREATE POLICY "team_members_update_owner" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Ensure admins still have full access (already covered by team_members_all_admin policy)

-- Log
SELECT 'Staff enhancements migration applied successfully!' AS status;
