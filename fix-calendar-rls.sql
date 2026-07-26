-- ============================================================
-- FIX: Company Calendar RLS Policies
-- Run this in Supabase SQL Editor to fix Add Event permission
-- ============================================================

-- Drop old restrictive insert policy
DROP POLICY IF EXISTS "events_insert" ON company_events;
DROP POLICY IF EXISTS "events_update" ON company_events;
DROP POLICY IF EXISTS "events_delete" ON company_events;

-- Allow admin, hr_manager, AND project_manager to insert events
CREATE POLICY "events_insert" ON company_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'hr_manager', 'project_manager')
  ));

-- Allow creators and admins to update events
CREATE POLICY "events_update" ON company_events FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Allow creators and admins to delete events
CREATE POLICY "events_delete" ON company_events FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

SELECT 'Calendar RLS fix applied!' AS status;
