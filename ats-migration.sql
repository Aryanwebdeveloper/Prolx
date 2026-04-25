-- ============================================================
-- ATS Enhancement Migration — Safe, Additive Only
-- Run in Supabase SQL Editor
-- No existing data is modified or deleted
-- ============================================================

-- 1. Add optional columns to career_applications (if not exist)
ALTER TABLE career_applications 
  ADD COLUMN IF NOT EXISTS interviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS hired_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES career_applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  office_address TEXT,
  interview_mode TEXT DEFAULT 'Online' CHECK (interview_mode IN ('Online', 'Physical')),
  interviewer_name TEXT,
  interview_type TEXT DEFAULT 'Video Call',
  status TEXT DEFAULT 'Scheduled' NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show')),
  interviewer_notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- 3. Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES career_applications(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  template_type TEXT DEFAULT 'custom',
  status TEXT DEFAULT 'sent' NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  resend_id TEXT,
  sent_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_logs_application_id ON email_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- 4. Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('application_received', 'shortlisted', 'interview_scheduled', 'rejected', 'hired', 'custom', 'contact_confirmation', 'booking_confirmation', 'invoice_sent', 'certificate_issued')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely update the constraint if the table already existed
ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_type_check;
ALTER TABLE email_templates ADD CONSTRAINT email_templates_type_check 
  CHECK (type IN ('application_received', 'shortlisted', 'interview_scheduled', 'rejected', 'hired', 'custom', 'contact_confirmation', 'booking_confirmation', 'invoice_sent', 'certificate_issued'));

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable RLS on new tables
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies — all use admin bypass (service role)
-- These are accessed via admin client (service role) so public policies not needed
-- But we create permissive authenticated policies as backup

DROP POLICY IF EXISTS "Allow admin full access to interviews" ON interviews;
CREATE POLICY "Allow admin full access to interviews"
  ON interviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to email_logs" ON email_logs;
CREATE POLICY "Allow admin full access to email_logs"
  ON email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to email_templates" ON email_templates;
CREATE POLICY "Allow admin full access to email_templates"
  ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin full access to notifications" ON notifications;
CREATE POLICY "Allow admin full access to notifications"
  ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Triggers for updated_at
DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Seed default email templates
INSERT INTO email_templates (name, type, subject, body) VALUES
(
  'Application Received',
  'application_received',
  'We received your application for {{role}} at Prolx',
  'Dear {{name}},

Thank you for applying for the {{role}} position at Prolx Digital Agency.

We have successfully received your application and our team will review it carefully. We aim to get back to all applicants within 5–7 business days.

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Shortlisted',
  'shortlisted',
  'Great news! You have been shortlisted for {{role}}',
  'Dear {{name}},

Congratulations! After reviewing your application for the {{role}} position, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our team will be in touch shortly with further details.

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Interview Scheduled',
  'interview_scheduled',
  'Interview Scheduled — {{role}} at Prolx',
  'Dear {{name}},

We are excited to invite you for an interview for the {{role}} position at Prolx Digital Agency.

Interview Details:
Date & Time: {{interview_date}}
Format: {{interview_type}}
Meeting Link: {{meeting_link}}

Please confirm your availability by replying to this email.

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Application Rejected',
  'rejected',
  'Update on your application for {{role}} at Prolx',
  'Dear {{name}},

Thank you for your interest in the {{role}} position at Prolx Digital Agency and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements. We encourage you to apply for future positions that match your skills.

We wish you all the best in your job search.

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Hired — Welcome to Prolx',
  'hired',
  'Welcome to the Prolx team! 🎉',
  'Dear {{name}},

We are thrilled to offer you the {{role}} position at Prolx Digital Agency!

After a thorough review process, we are confident that you will be a great addition to our team. Our HR team will be in touch with the next steps, including your onboarding schedule and contract details.

Welcome aboard!

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Contact Form Received',
  'contact_confirmation',
  'Thanks for reaching out to Prolx, {{name}}!',
  'Dear {{name}},

We have received your message and our team will get back to you within 1–2 business days.

Best regards,
The Prolx Team
https://prolx.cloud'
),
(
  'Consultation Booked',
  'booking_confirmation',
  'Consultation Confirmed: {{date}} at {{time}}',
  'Dear {{name}},

Your consultation has been successfully booked for {{date}} at {{time}}. We look forward to speaking with you.

Best regards,
The Prolx Team
https://prolx.cloud'
)
ON CONFLICT (type) DO NOTHING;

-- SUCCESS
SELECT 'ATS Migration complete! interviews, email_logs, email_templates, notifications tables created.' AS status;
