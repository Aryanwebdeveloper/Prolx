-- Update pricing plans data
-- Migration: 20260331_015_update_pricing_plans_data.sql

-- Deactivate existing plans first to ensure only these 4 are shown
UPDATE public.pricing_plans SET is_active = false;

-- Upsert the 4 specific plans
INSERT INTO public.pricing_plans (
  id, name, price_usd, price_pkr, description, features, is_recommended, cta_text, is_active, display_order
) VALUES 
(
  '2454ee6c-722e-4774-8a3f-82f4fa763d4a', 
  'Starter Website', 
  '99', 
  '28,000', 
  'Perfect for small businesses and startups to get online quickly.', 
  '1-3 Pages Website\nResponsive Design (Mobile Friendly)\nBasic UI/UX Design\nContact Form Integration\nBasic SEO Setup\nFast Loading Speed\n1 Revision\nDelivery in 3-5 Days', 
  false, 
  'Get Started', 
  true, 
  1
),
(
  'b374575c-0cee-418b-be95-ef227e71bc44', 
  'Business Website', 
  '249', 
  '70,000', 
  'Best for growing businesses that need a professional online presence.', 
  '5-7 Pages Website\nModern UI/UX Design\nFully Responsive Design\nContact Form + Google Map\nOn-Page SEO Optimization\nSpeed Optimization\nSocial Media Integration\nAdmin Panel (WordPress or Custom)\n3 Revisions\nDelivery in 5-7 Days', 
  true, 
  'Get Started', 
  true, 
  2
),
(
  'fcc2758e-b315-4936-860b-79eaa3e35499', 
  'Premium Website', 
  '499', 
  '140,000', 
  'Advanced solution for businesses that want powerful and scalable websites.', 
  '10+ Pages Website\nCustom Design (No Template)\nAdvanced UI/UX\nE-commerce Functionality (Optional)\nPayment Gateway Integration\nSpeed & Performance Optimization\nAdvanced SEO Setup\nSecurity Optimization\nAnalytics Integration\n5 Revisions\nDelivery in 7-10 Days', 
  false, 
  'Get Started', 
  true, 
  3
),
(
  'a7ce44b0-2428-4e27-8d91-4ab136cc0b4b', 
  'Enterprise Solution', 
  '999+', 
  '280,000+', 
  'Complete custom solution for large businesses, startups, and enterprises.', 
  'Unlimited Pages\nCustom Web Application (MERN / Next.js)\nDashboard & Admin Panel\nAPI Integrations\nAutomation Systems\nHigh-Level Security\nScalable Architecture\nPriority Support\nUnlimited Revisions\nDedicated Developer Team', 
  false, 
  'Contact Us', 
  true, 
  4
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  price_pkr = EXCLUDED.price_pkr,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_recommended = EXCLUDED.is_recommended,
  cta_text = EXCLUDED.cta_text,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
