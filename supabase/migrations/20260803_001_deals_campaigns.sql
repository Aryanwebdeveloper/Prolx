-- ========================================================
-- Migration: 20260803_001_deals_campaigns.sql
-- Description: Deals & Campaigns module for 14 August Independence Day and future campaigns
-- ========================================================

-- 1. DEALS CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.deals_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  announcement_text TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  countdown_end_date TIMESTAMPTZ,
  total_slots INTEGER DEFAULT 20,
  available_slots INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT TRUE,
  theme_config JSONB DEFAULT '{"primaryColor": "#006633", "accentColor": "#10B981", "badgeText": "14 AUGUST SPECIAL"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEALS PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.deals_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.deals_campaigns(id) ON DELETE CASCADE,
  category_id TEXT DEFAULT 'business',
  category_name TEXT DEFAULT 'Business Website',
  name TEXT NOT NULL,
  slug TEXT,
  regular_price_pkr NUMERIC NOT NULL,
  deal_price_pkr NUMERIC NOT NULL,
  savings_pkr NUMERIC GENERATED ALWAYS AS (regular_price_pkr - deal_price_pkr) STORED,
  description TEXT,
  features TEXT NOT NULL, -- newline-separated features
  delivery_estimate TEXT DEFAULT '3 to 5 Business Days',
  is_popular BOOLEAN DEFAULT FALSE,
  badge_text TEXT DEFAULT '14 August Deal',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEAL LEADS TABLE
CREATE TABLE IF NOT EXISTS public.deal_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.deals_campaigns(id) ON DELETE SET NULL,
  campaign_name TEXT DEFAULT '14 August Azadi Special Deals',
  package_id UUID REFERENCES public.deals_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  deal_price TEXT,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  business_type TEXT,
  website_type TEXT,
  message TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  source_type TEXT DEFAULT 'demo_booking' CHECK (source_type IN ('contact_form', 'whatsapp', 'demo_booking')),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Closed', 'Lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGN ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.deals_campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'cta_click', 'whatsapp_click', 'demo_booking', 'lead_submission')),
  visitor_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  selected_package TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.deals_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Public Read for campaigns & packages
CREATE POLICY "deals_campaigns_public_read" ON public.deals_campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "deals_packages_public_read" ON public.deals_packages FOR SELECT USING (is_active = true);

-- Public Insert for leads and analytics
CREATE POLICY "deal_leads_public_insert" ON public.deal_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "campaign_analytics_public_insert" ON public.campaign_analytics FOR INSERT WITH CHECK (true);

-- Admin Full Access Policies
CREATE POLICY "deals_campaigns_admin_all" ON public.deals_campaigns FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "deals_packages_admin_all" ON public.deals_packages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "deal_leads_admin_all" ON public.deal_leads FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "campaign_analytics_admin_all" ON public.campaign_analytics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Disable RLS for bypass if service_role used
GRANT ALL ON public.deals_campaigns TO anon, authenticated, service_role;
GRANT ALL ON public.deals_packages TO anon, authenticated, service_role;
GRANT ALL ON public.deal_leads TO anon, authenticated, service_role;
GRANT ALL ON public.campaign_analytics TO anon, authenticated, service_role;
