-- ========================================================
-- Full Database Migration for Prolx CMS
-- Migration: 20260325_002_full_schema.sql
-- ========================================================

-- 1. CONTACTS TABLE (For contact form submissions)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Read', 'Replied')),
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional client link
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Scheduled')),
  featured BOOLEAN DEFAULT FALSE,
  read_time TEXT,
  tags TEXT, -- comma-separated
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRICING PLANS TABLE
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_usd TEXT,
  price_pkr TEXT,
  description TEXT,
  features TEXT, -- newline-separated
  is_recommended BOOLEAN DEFAULT FALSE,
  cta_text TEXT DEFAULT 'Get Started',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  quote TEXT NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT,
  category TEXT,
  industry TEXT,
  tech_stack TEXT, -- comma-separated
  featured_image_url TEXT,
  summary TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CASE STUDIES TABLE (Optional, links to portfolio)
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT,
  industry TEXT,
  hero_image_url TEXT,
  project_background TEXT,
  client_challenges TEXT, -- newline-separated
  research_strategy TEXT,
  design_process TEXT,
  development_approach TEXT,
  technologies TEXT, -- comma-separated
  metrics TEXT, -- newline-separated (Label|Value|Desc)
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  experience TEXT,
  skills TEXT, -- comma-separated
  photo_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  icon_name TEXT,
  tech_stack TEXT, -- comma-separated
  description TEXT,
  benefits TEXT, -- newline-separated
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CAREER JOBS TABLE
CREATE TABLE IF NOT EXISTS public.career_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT,
  requirements TEXT, -- newline-separated
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SITE SETTINGS TABLE (Key-Value pair)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper to check if user is admin
-- Using auth.jwt() -> 'user_metadata' ->> 'role' is risky if not synced, 
-- but we'll use our profiles table approach for consistency:

-- --------------------------------------------------------
-- PUBLIC READ POLICIES (Visible to everyone)
-- --------------------------------------------------------

-- Anyone can submit a contact form
CREATE POLICY "contacts_insert_public" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- Public can read published blog posts
CREATE POLICY "blog_posts_select_public" ON public.blog_posts
  FOR SELECT USING (status = 'Published');

-- Public can read active pricing plans
CREATE POLICY "pricing_plans_select_public" ON public.pricing_plans
  FOR SELECT USING (is_active = true);

-- Public can read visible testimonials
CREATE POLICY "testimonials_select_public" ON public.testimonials
  FOR SELECT USING (is_visible = true);

-- Public can read portfolio projects
CREATE POLICY "portfolio_projects_select_public" ON public.portfolio_projects
  FOR SELECT USING (true);

-- Public can read published case studies
CREATE POLICY "case_studies_select_public" ON public.case_studies
  FOR SELECT USING (status = 'Published');

-- Public can read active team members
CREATE POLICY "team_members_select_public" ON public.team_members
  FOR SELECT USING (is_active = true);

-- Public can read active services
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT USING (is_active = true);

-- Public can read open career jobs
CREATE POLICY "career_jobs_select_public" ON public.career_jobs
  FOR SELECT USING (status = 'Open');

-- Public can read site settings
CREATE POLICY "site_settings_select_public" ON public.site_settings
  FOR SELECT USING (true);

-- Client can view their own contact requests
CREATE POLICY "contacts_select_owner" ON public.contacts
  FOR SELECT USING (auth.uid() = client_id);

-- --------------------------------------------------------
-- ADMIN POLICIES (Full CRUD)
-- --------------------------------------------------------

-- Use a reusable function for role check to avoid repetitive subqueries 
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Applies admin CRUD to all tables
DO $$ 
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN SELECT UNNEST(ARRAY[
        'contacts', 'blog_posts', 'pricing_plans', 'testimonials', 
        'portfolio_projects', 'case_studies', 'team_members', 
        'services', 'career_jobs', 'site_settings'
    ]) 
    LOOP
        EXECUTE format('CREATE POLICY "%I_all_admin" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());', table_name, table_name);
    END LOOP;
END $$;


-- ========================================================
-- TRIGGERS FOR updated_at
-- ========================================================

DO $$ 
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN SELECT UNNEST(ARRAY[
        'contacts', 'blog_posts', 'pricing_plans', 'testimonials', 
        'portfolio_projects', 'case_studies', 'team_members', 
        'services', 'career_jobs', 'site_settings'
    ]) 
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS on_%I_updated ON public.%I;
            CREATE TRIGGER on_%I_updated
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;
