-- Migration: 20260329_011_case_study_unique_fix.sql
-- Description: Add UNIQUE constraint to portfolio_id for case_studies upsert consistency

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'case_studies_portfolio_id_key'
    ) THEN
        ALTER TABLE public.case_studies 
        ADD CONSTRAINT case_studies_portfolio_id_key UNIQUE (portfolio_id);
    END IF;
END $$;
