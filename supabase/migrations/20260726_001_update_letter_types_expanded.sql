-- ========================================================
-- Migration: 20260726_001_update_letter_types_expanded.sql
-- Description: Drop old letter_type check constraint and add updated one with all 18 letter types.
-- ========================================================

ALTER TABLE public.company_letters DROP CONSTRAINT IF EXISTS company_letters_letter_type_check;

ALTER TABLE public.company_letters ADD CONSTRAINT company_letters_letter_type_check 
CHECK (letter_type IN (
  'offer_letter', 
  'internship_letter', 
  'paid_internship_letter', 
  'appointment_letter', 
  'experience_letter', 
  'termination_letter', 
  'promotion_letter', 
  'warning_letter', 
  'nda_agreement', 
  'relieving_letter', 
  'salary_certificate', 
  'completion_letter',
  'job_confirmation_letter',
  'transfer_letter',
  'no_objection_certificate',
  'leave_approval_letter',
  'reference_letter',
  'custom'
));
