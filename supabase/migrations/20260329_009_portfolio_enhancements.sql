-- Migration: 20260329_009_portfolio_enhancements.sql
-- Description: Enhancing portfolio_projects and case_studies with new fields

-- 1. Add slug to portfolio_projects if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='portfolio_projects' AND column_name='slug') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN slug TEXT UNIQUE;
    END IF;
END $$;

-- 2. Add screenshots to case_studies if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='case_studies' AND column_name='screenshots') THEN
        ALTER TABLE public.case_studies ADD COLUMN screenshots JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. Add extra fields to portfolio_projects for the listing design
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='portfolio_projects' AND column_name='short_description') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN short_description TEXT;
    END IF;
END $$;

-- 4. Update existing projects with slugs based on their names
UPDATE public.portfolio_projects 
SET slug = LOWER(REPLACE(name, ' ', '-')) 
WHERE slug IS NULL;

-- 5. Ensure case_studies has a slug (already exists but marking for clarity)
-- 6. Add results_label, results_value, results_desc if not using the metrics pipe-separated format
-- Actually, the pipe-separated format (Label|Value|Desc) is fine, but we'll use JSONB for more flexibility later if needed.
-- For now, we'll stick to what we have but add a visual_screenshots field as requested.
