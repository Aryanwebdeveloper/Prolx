-- Patch: Ensure columns exist on tables if they already exist.
-- If the tables do not exist yet, we do nothing and let the main script create them.

-- 1. Ensure employee_id column exists on profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 2. Ensure unique constraint exists on profiles(employee_id)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_employee_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_employee_id_key UNIQUE (employee_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Ensure columns exist on other tables IF the tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leave_balances') THEN
    ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leave_requests') THEN
    ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'internal_applications') THEN
    ALTER TABLE internal_applications ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_scorecards') THEN
    ALTER TABLE review_scorecards ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
