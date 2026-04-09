-- Fix RLS Policy for career_applications
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily (optional, for testing)
-- ALTER TABLE career_applications DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert" ON career_applications;
DROP POLICY IF EXISTS "Allow public to submit applications" ON career_applications;
DROP POLICY IF EXISTS "Allow anon insert" ON career_applications;

-- Create policy to allow ANYONE (including non-logged in users) to submit applications
CREATE POLICY "Allow public insert"
    ON career_applications
    FOR INSERT
    TO anon, authenticated, public
    WITH CHECK (true);

-- Alternative: Allow all operations for service role
-- This is used by server actions
CREATE POLICY "Allow service role all"
    ON career_applications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'career_applications';
