-- ========================================================
-- Migration: 20260331_012_update_letter_types.sql
-- Description: Drop the old letter_type constraint and add the new one with all 12 types.
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
  'custom'
));
