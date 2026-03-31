-- ========================================================
-- Attendance Management Enhancements
-- Migration: 20260331_013_attendance_enhancements.sql
-- ========================================================

-- Add new columns to the attendance table
ALTER TABLE public.attendance
ADD COLUMN check_in_photo_url TEXT,
ADD COLUMN check_out_photo_url TEXT,
ADD COLUMN task_description TEXT,
ADD COLUMN completed_tasks TEXT;

-- Insert the attendance_proofs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attendance_proofs', 'attendance_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Define RLS for attendance_proofs bucket
CREATE POLICY "attendance_storage_admin" ON storage.objects
  FOR ALL USING (bucket_id = 'attendance_proofs' AND public.is_admin())
  WITH CHECK (bucket_id = 'attendance_proofs' AND public.is_admin());

CREATE POLICY "attendance_storage_read_auth" ON storage.objects
  FOR SELECT USING (bucket_id = 'attendance_proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "attendance_storage_insert_staff" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attendance_proofs' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff') AND status = 'active')
  );
