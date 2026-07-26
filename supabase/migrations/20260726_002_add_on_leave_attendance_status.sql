-- ========================================================
-- Migration: 20260726_002_add_on_leave_attendance_status.sql
-- Description: Drop old attendance status check constraint and add updated one with 'on_leave'.
-- ========================================================

ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_status_check;

ALTER TABLE public.attendance ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave'));
