-- Migration: 20260329_010_portfolio_links.sql
-- Description: Add live_url and github_url to portfolio_projects

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='portfolio_projects' AND column_name='live_url') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN live_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='portfolio_projects' AND column_name='github_url') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN github_url TEXT;
    END IF;
END $$;
