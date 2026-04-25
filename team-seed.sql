-- ============================================================
-- Prolx Team Members – Seed Script (Real Team)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add 'bio' column if it doesn't already exist
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Delete old dummy/placeholder members if any exist
DELETE FROM team_members
WHERE full_name IN ('Zain Ahmad', 'Sara Malik', 'Fatima Shah', 'Hassan Ali');

-- 3. Insert the REAL Prolx team members
INSERT INTO team_members
  (full_name, role, department, bio, experience, skills, is_active, display_order)
VALUES
  (
    'Aryan Waheed',
    'CEO & Co-Founder',
    'Leadership',
    'Visionary entrepreneur leading Prolx''s strategy, growth, and client success with a focus on digital innovation.',
    '4+ years',
    ARRAY['Leadership', 'Strategy', 'Business Development'],
    true,
    1
  ),
  (
    'Muhammad Yassen',
    'COO & Co-Founder',
    'Leadership',
    'Operations expert ensuring every Prolx project is delivered on time, on budget, and to the highest standard.',
    '4+ years',
    ARRAY['Operations', 'Project Management', 'Team Leadership'],
    true,
    2
  ),
  (
    'Abdullah Nisar',
    'Software Developer / Engineer',
    'Engineering',
    'Full-stack engineer passionate about building clean, scalable web applications with modern technologies.',
    '4+ years',
    ARRAY['Next.js', 'React', 'TypeScript'],
    true,
    3
  ),
  (
    'Hammad ur Rehman',
    'Software Developer / Engineer',
    'Engineering',
    'Creative developer focused on building intuitive user experiences and robust backend solutions.',
    '3+ years',
    ARRAY['React', 'Node.js', 'Supabase'],
    true,
    4
  )
ON CONFLICT DO NOTHING;

SELECT 'Real Prolx team members seeded successfully!' AS status;
