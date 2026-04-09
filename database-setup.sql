-- Database Setup for Dynamic Job Application Form
-- Run these queries in your Supabase SQL Editor

-- 1. Create career_applications table (if not exists)
CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES career_jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    experience TEXT,
    location TEXT,
    expected_salary TEXT,
    notice_period TEXT,
    message TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_career_applications_job_id ON career_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at DESC);

-- 3. Create site_settings table (if not exists)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Insert default form field configuration
INSERT INTO site_settings (key, value)
VALUES ('application_form_fields', '{
    "name": {"enabled": true, "required": true, "label": "Full Name"},
    "email": {"enabled": true, "required": true, "label": "Email Address"},
    "phone": {"enabled": true, "required": true, "label": "Phone Number"},
    "portfolio_url": {"enabled": true, "required": false, "label": "Portfolio / LinkedIn URL"},
    "resume": {"enabled": true, "required": true, "label": "Resume / CV"},
    "experience": {"enabled": true, "required": true, "label": "Years of Experience"},
    "location": {"enabled": true, "required": false, "label": "Current Location"},
    "expected_salary": {"enabled": true, "required": false, "label": "Expected Salary"},
    "notice_period": {"enabled": true, "required": false, "label": "Notice Period"},
    "message": {"enabled": true, "required": false, "label": "Cover Letter / Message"}
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. Enable Row Level Security (RLS) on tables
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for career_applications
-- Allow anyone to insert (for job applications)
CREATE POLICY "Allow public to submit applications"
    ON career_applications
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow admins to read all applications
CREATE POLICY "Allow admins to view applications"
    ON career_applications
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update applications
CREATE POLICY "Allow admins to update applications"
    ON career_applications
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 7. Create policies for site_settings
-- Allow public to read settings (for form configuration)
CREATE POLICY "Allow public to read settings"
    ON site_settings
    FOR SELECT
    TO public
    USING (true);

-- Allow admins to modify settings
CREATE POLICY "Allow admins to modify settings"
    ON site_settings
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 8. Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to career_applications
DROP TRIGGER IF EXISTS update_career_applications_updated_at ON career_applications;
CREATE TRIGGER update_career_applications_updated_at
    BEFORE UPDATE ON career_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SUCCESS MESSAGE
SELECT 'Database setup complete! career_applications and site_settings tables created.' as status;
