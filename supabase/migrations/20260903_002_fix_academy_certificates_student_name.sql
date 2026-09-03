-- Fix for student_name NOT NULL constraint on academy_certificates table
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='academy_certificates' AND column_name='student_name'
  ) THEN 
    ALTER TABLE academy_certificates ALTER COLUMN student_name DROP NOT NULL;
    UPDATE academy_certificates SET recipient_name = student_name WHERE recipient_name IS NULL;
    UPDATE academy_certificates SET student_name = recipient_name WHERE student_name IS NULL;
  END IF; 
END $$;
