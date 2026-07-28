-- ============================================================
-- PROLX BUSINESS DOCUMENTS ENTERPRISE MODULE
-- Migration: business-docs-migration.sql
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── ENUM TYPES ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE business_doc_type AS ENUM (
    'proposal', 'quotation', 'srs', 'brd', 'contract',
    'nda', 'agreement', 'scope_doc', 'meeting_minutes',
    'purchase_order', 'service_agreement', 'project_plan', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE business_doc_status AS ENUM (
    'draft', 'review', 'approved', 'sent', 'viewed',
    'accepted', 'rejected', 'expired', 'archived', 'locked'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE doc_currency AS ENUM ('PKR', 'USD', 'EUR', 'AED', 'GBP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE signature_role AS ENUM ('client', 'admin', 'hr', 'manager', 'director', 'witness');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── MAIN DOCUMENTS TABLE ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.business_documents (
  id                TEXT PRIMARY KEY,               -- e.g. PROP-2026-0001
  type              business_doc_type NOT NULL DEFAULT 'proposal',
  title             TEXT NOT NULL,
  description       TEXT,
  status            business_doc_status NOT NULL DEFAULT 'draft',

  -- Relationships
  client_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Dates
  valid_until       DATE,
  expiry_date       DATE,

  -- Financial
  currency          doc_currency DEFAULT 'PKR',
  subtotal          NUMERIC(14, 2) DEFAULT 0,
  tax_rate          NUMERIC(5, 2) DEFAULT 0,
  discount          NUMERIC(14, 2) DEFAULT 0,
  total             NUMERIC(14, 2) DEFAULT 0,
  pricing_model     TEXT DEFAULT 'fixed',         -- fixed, hourly, retainer, milestone

  -- Rich Content (JSONB sections)
  sections          JSONB DEFAULT '[]'::jsonb,     -- array of {id, title, content, order}
  metadata          JSONB DEFAULT '{}'::jsonb,     -- doc-specific fields (tech stack, team, etc.)
  branding          JSONB DEFAULT '{}'::jsonb,     -- {primaryColor, accentColor, coverStyle}

  -- Workflow
  internal_notes    TEXT,
  rejection_reason  TEXT,
  
  -- Files
  pdf_url           TEXT,
  docx_url          TEXT,
  
  -- Public share
  secure_token      UUID UNIQUE DEFAULT gen_random_uuid(),
  share_enabled     BOOLEAN DEFAULT false,
  client_viewed_at  TIMESTAMPTZ,
  client_ip         TEXT,

  -- Versioning
  version_number    INTEGER DEFAULT 1,
  parent_doc_id     TEXT REFERENCES public.business_documents(id) ON DELETE SET NULL,

  -- Template
  is_template       BOOLEAN DEFAULT false,
  template_name     TEXT,
  template_category TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENT LINE ITEMS ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_line_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   TEXT NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  category      TEXT DEFAULT 'development',  -- development, uiux, hosting, domain, maintenance, support, addon, custom
  description   TEXT NOT NULL,
  quantity      NUMERIC(10, 2) DEFAULT 1,
  unit          TEXT DEFAULT 'unit',          -- unit, hour, month, item
  unit_price    NUMERIC(14, 2) DEFAULT 0,
  total         NUMERIC(14, 2) DEFAULT 0,
  is_optional   BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENT VERSIONS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   TEXT NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot      JSONB NOT NULL,              -- full document state snapshot
  change_notes  TEXT,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DIGITAL SIGNATURES ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_signatures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     TEXT NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  signer_role     signature_role NOT NULL DEFAULT 'client',
  signer_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  signer_name     TEXT NOT NULL,
  signer_email    TEXT,
  signature_data  TEXT,                      -- base64 PNG of drawn signature
  signature_type  TEXT DEFAULT 'drawn',      -- drawn, typed, uploaded
  signed_at       TIMESTAMPTZ DEFAULT NOW(),
  ip_address      TEXT,
  verified        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENT COMMENTS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,                          -- for external/client comments
  author_email TEXT,
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,         -- internal staff notes vs client comments
  parent_id   UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENT AUDIT LOG ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES public.business_documents(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,                 -- created, edited, sent, viewed, approved, signed, etc.
  actor_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name  TEXT,
  actor_email TEXT,
  details     JSONB DEFAULT '{}'::jsonb,     -- action-specific metadata
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENT TEMPLATES (saved templates) ──────────────────────

CREATE TABLE IF NOT EXISTS public.document_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  type          business_doc_type NOT NULL DEFAULT 'proposal',
  category      TEXT,                         -- software, mobile-app, website, etc.
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  is_default    BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_business_docs_client ON public.business_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_business_docs_created_by ON public.business_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_business_docs_status ON public.business_documents(status);
CREATE INDEX IF NOT EXISTS idx_business_docs_type ON public.business_documents(type);
CREATE INDEX IF NOT EXISTS idx_business_docs_token ON public.business_documents(secure_token);
CREATE INDEX IF NOT EXISTS idx_doc_line_items_doc ON public.document_line_items(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_doc ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_doc ON public.document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_comments_doc ON public.document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_doc ON public.document_audit_log(document_id);

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_business_docs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_business_docs_updated_at ON public.business_documents;
CREATE TRIGGER set_business_docs_updated_at
  BEFORE UPDATE ON public.business_documents
  FOR EACH ROW EXECUTE FUNCTION update_business_docs_updated_at();

DROP TRIGGER IF EXISTS set_doc_templates_updated_at ON public.document_templates;
CREATE TRIGGER set_doc_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION update_business_docs_updated_at();

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Business Documents RLS
CREATE POLICY "Staff can read business documents" ON public.business_documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager', 'staff', 'team_lead')
    )
  );

CREATE POLICY "Staff can create business documents" ON public.business_documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

CREATE POLICY "Staff can update business documents" ON public.business_documents
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

CREATE POLICY "Admin can delete business documents" ON public.business_documents
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')
    )
  );

-- Public token-based read (for share links, no auth needed)
CREATE POLICY "Public read via secure token" ON public.business_documents
  FOR SELECT USING (
    share_enabled = true AND secure_token IS NOT NULL
  );

-- Line Items
CREATE POLICY "Staff can manage line items" ON public.document_line_items
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

-- Versions
CREATE POLICY "Staff can read versions" ON public.document_versions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager', 'staff')
    )
  );

CREATE POLICY "Staff can create versions" ON public.document_versions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

-- Signatures - allow public inserts for client signing
CREATE POLICY "Anyone can add signatures" ON public.document_signatures
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can read signatures" ON public.document_signatures
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

-- Comments
CREATE POLICY "Staff can manage comments" ON public.document_comments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager', 'staff')
    )
  );

CREATE POLICY "Anyone can add comments" ON public.document_comments
  FOR INSERT WITH CHECK (true);

-- Audit Log
CREATE POLICY "Staff can read audit log" ON public.document_audit_log
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager')
    )
  );

CREATE POLICY "System can insert audit log" ON public.document_audit_log
  FOR INSERT WITH CHECK (true);

-- Templates
CREATE POLICY "Staff can read templates" ON public.document_templates
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE role IN ('admin', 'super_admin', 'project_manager', 'finance_manager', 'hr_manager', 'staff')
    )
  );

CREATE POLICY "Admin can manage templates" ON public.document_templates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')
    )
  );

-- ─── SEED DEFAULT TEMPLATES ────────────────────────────────────

INSERT INTO public.document_templates (name, description, type, category, template_data, is_default)
VALUES
  (
    'Software Development Proposal',
    'Professional proposal template for custom software development projects',
    'proposal',
    'software',
    '{
      "sections": [
        {"id": "cover", "title": "Cover Page", "order": 0, "content": ""},
        {"id": "executive-summary", "title": "Executive Summary", "order": 1, "content": "We are delighted to present this proposal for your software development project. Prolx Digital Agency specializes in delivering world-class digital solutions tailored to your unique business requirements."},
        {"id": "about-prolx", "title": "About Prolx Digital Agency", "order": 2, "content": "Prolx Digital Agency is a leading software house with expertise in web development, mobile applications, UI/UX design, and digital transformation. Our team of 30+ professionals has delivered 200+ successful projects across 15+ countries."},
        {"id": "client-requirements", "title": "Client Requirements", "order": 3, "content": "Based on our consultation and your project brief, we have identified the following key requirements:"},
        {"id": "proposed-solution", "title": "Proposed Solution", "order": 4, "content": "We propose a comprehensive digital solution built with modern, scalable technologies designed to meet your business objectives and grow with your organization."},
        {"id": "scope-of-work", "title": "Scope of Work", "order": 5, "content": "This project includes the following scope:"},
        {"id": "deliverables", "title": "Deliverables", "order": 6, "content": "Upon project completion, you will receive:"},
        {"id": "timeline", "title": "Project Timeline", "order": 7, "content": "The estimated project timeline is as follows:"},
        {"id": "technologies", "title": "Technologies Used", "order": 8, "content": "Our recommended technology stack:"},
        {"id": "team", "title": "Our Team", "order": 9, "content": "Your dedicated project team:"},
        {"id": "pricing", "title": "Investment & Pricing", "order": 10, "content": ""},
        {"id": "payment-terms", "title": "Payment Terms", "order": 11, "content": "• 30% advance payment upon project initiation\n• 40% upon design approval and development milestone\n• 30% upon project completion and delivery"},
        {"id": "terms", "title": "Terms & Conditions", "order": 12, "content": "This proposal is valid for 30 days from the date of issue. All work is subject to Prolx Digital Agency standard terms and conditions."},
        {"id": "signature", "title": "Acceptance & Signature", "order": 13, "content": "By signing below, you agree to proceed with this proposal and accept the terms and conditions."}
      ]
    }'::jsonb,
    true
  ),
  (
    'Mobile App Proposal',
    'Proposal template for iOS and Android mobile app development',
    'proposal',
    'mobile',
    '{
      "sections": [
        {"id": "cover", "title": "Cover Page", "order": 0, "content": ""},
        {"id": "executive-summary", "title": "Executive Summary", "order": 1, "content": "This proposal outlines our comprehensive approach to designing and developing a world-class mobile application for your business."},
        {"id": "app-concept", "title": "App Concept & Vision", "order": 2, "content": ""},
        {"id": "features", "title": "Core Features & Functionality", "order": 3, "content": ""},
        {"id": "platforms", "title": "Platform & Technology", "order": 4, "content": "We will develop native/cross-platform applications for iOS and Android using React Native / Flutter."},
        {"id": "ui-design", "title": "UI/UX Design Approach", "order": 5, "content": "Our design team will create intuitive, beautiful interfaces following iOS Human Interface Guidelines and Android Material Design principles."},
        {"id": "timeline", "title": "Development Timeline", "order": 6, "content": ""},
        {"id": "pricing", "title": "Investment & Pricing", "order": 7, "content": ""},
        {"id": "support", "title": "Post-Launch Support", "order": 8, "content": "We provide 3 months of free bug fixes and technical support after app launch."},
        {"id": "signature", "title": "Acceptance", "order": 9, "content": ""}
      ]
    }'::jsonb,
    true
  ),
  (
    'Website Development Proposal',
    'Proposal template for website design and development projects',
    'proposal',
    'website',
    '{
      "sections": [
        {"id": "cover", "title": "Cover Page", "order": 0, "content": ""},
        {"id": "executive-summary", "title": "Executive Summary", "order": 1, "content": ""},
        {"id": "design-approach", "title": "Design Approach", "order": 2, "content": "Our design philosophy centers on creating websites that are not only visually stunning but also conversion-optimized and user-friendly."},
        {"id": "features", "title": "Website Features", "order": 3, "content": ""},
        {"id": "seo", "title": "SEO & Performance", "order": 4, "content": "All websites are built with SEO best practices, fast loading times, and Core Web Vitals optimization."},
        {"id": "timeline", "title": "Timeline", "order": 5, "content": ""},
        {"id": "pricing", "title": "Pricing", "order": 6, "content": ""},
        {"id": "signature", "title": "Acceptance", "order": 7, "content": ""}
      ]
    }'::jsonb,
    true
  ),
  (
    'Standard Quotation',
    'Professional quotation template with itemized pricing',
    'quotation',
    'general',
    '{
      "sections": [
        {"id": "intro", "title": "Introduction", "order": 0, "content": "Thank you for your interest in Prolx Digital Agency. Please find below our detailed quotation for the requested services."},
        {"id": "scope", "title": "Scope of Services", "order": 1, "content": ""},
        {"id": "pricing", "title": "Pricing Breakdown", "order": 2, "content": ""},
        {"id": "payment", "title": "Payment Terms", "order": 3, "content": "• 50% advance payment\n• 50% upon completion"},
        {"id": "validity", "title": "Quotation Validity", "order": 4, "content": "This quotation is valid for 15 days from the date of issue."},
        {"id": "terms", "title": "Terms & Conditions", "order": 5, "content": ""}
      ]
    }'::jsonb,
    true
  ),
  (
    'Software Requirements Specification (SRS)',
    'IEEE-standard SRS document template',
    'srs',
    'technical',
    '{
      "sections": [
        {"id": "introduction", "title": "1. Introduction", "order": 0, "content": ""},
        {"id": "purpose", "title": "1.1 Purpose", "order": 1, "content": ""},
        {"id": "scope", "title": "1.2 Scope", "order": 2, "content": ""},
        {"id": "definitions", "title": "1.3 Definitions & Abbreviations", "order": 3, "content": ""},
        {"id": "overall", "title": "2. Overall Description", "order": 4, "content": ""},
        {"id": "functional", "title": "3. Functional Requirements", "order": 5, "content": ""},
        {"id": "nonfunctional", "title": "4. Non-Functional Requirements", "order": 6, "content": ""},
        {"id": "user-roles", "title": "5. User Roles & Permissions", "order": 7, "content": ""},
        {"id": "tech-stack", "title": "6. Technology Stack", "order": 8, "content": ""},
        {"id": "security", "title": "7. Security Requirements", "order": 9, "content": ""},
        {"id": "appendix", "title": "8. Appendix", "order": 10, "content": ""}
      ]
    }'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Business Documents Module migration complete!' AS status;
