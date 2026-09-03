-- Fix for certificate_type CHECK constraint on academy_certificates table
ALTER TABLE academy_certificates DROP CONSTRAINT IF EXISTS academy_certificates_certificate_type_check;
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_certificate_type_check;
