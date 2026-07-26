-- ========================================================
-- Run this query in your Supabase SQL Editor to update the letter_type constraint
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
