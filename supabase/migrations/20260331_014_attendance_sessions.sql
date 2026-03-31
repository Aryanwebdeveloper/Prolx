-- ========================================================
-- Attendance Management: Sessions (Breaks)
-- Migration: 20260331_014_attendance_sessions.sql
-- ========================================================

-- Add sessions column to track multiple check-ins/check-outs per day
ALTER TABLE public.attendance
ADD COLUMN sessions JSONB DEFAULT '[]'::jsonb;
