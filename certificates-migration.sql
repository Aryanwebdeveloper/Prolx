-- ============================================================
-- Prolx Certificate Management System – DB Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add new columns to existing certificates table
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS certificate_type TEXT DEFAULT 'internship',
  ADD COLUMN IF NOT EXISTS internship_field TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_reason TEXT;

-- 2. Update status column to support 'revoked'
-- Drop old constraint if any (may not exist depending on your setup)
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_status_check;

-- Re-add with revoked included
ALTER TABLE certificates
  ADD CONSTRAINT certificates_status_check
  CHECK (status IN ('active', 'inactive', 'expired', 'revoked'));

-- 3. Create a global certificate sequence for professional IDs
CREATE SEQUENCE IF NOT EXISTS certificate_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  NO CYCLE;

-- 4. Helper function to generate the next certificate ID
-- Format: PRX-CERT-YYYY-NNNNNN
CREATE OR REPLACE FUNCTION generate_cert_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_val BIGINT;
  year_str TEXT;
BEGIN
  next_val := nextval('certificate_id_seq');
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  RETURN 'PRX-CERT-' || year_str || '-' || LPAD(next_val::TEXT, 6, '0');
END;
$$;

-- 5. Grant execute on function to authenticated users
GRANT EXECUTE ON FUNCTION generate_cert_id() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_cert_id() TO service_role;

-- 6. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_type ON certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_by ON certificates(created_by);

-- 7. Back-fill existing certificates with a default type if null
UPDATE certificates SET certificate_type = 'internship' WHERE certificate_type IS NULL;

-- ============================================================
-- Verification query – run after migration to confirm
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'certificates' ORDER BY ordinal_position;
