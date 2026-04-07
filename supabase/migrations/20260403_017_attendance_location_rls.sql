-- Enable RLS for tables
ALTER TABLE public.staff_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_announcement_reads ENABLE ROW LEVEL SECURITY;

-- STAFF LOCATIONS POLICIES
-- Clean up any existing policies just in case
DROP POLICY IF EXISTS "Users can view their own staff locations" ON public.staff_locations;
DROP POLICY IF EXISTS "Users can insert their own staff locations" ON public.staff_locations;
DROP POLICY IF EXISTS "Users can update their own staff locations" ON public.staff_locations;
DROP POLICY IF EXISTS "Users can delete their own staff locations" ON public.staff_locations;

-- Users can view their own locations
CREATE POLICY "Users can view their own staff locations"
  ON public.staff_locations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own locations
CREATE POLICY "Users can insert their own staff locations"
  ON public.staff_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own locations
CREATE POLICY "Users can update their own staff locations"
  ON public.staff_locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own locations
CREATE POLICY "Users can delete their own staff locations"
  ON public.staff_locations FOR DELETE
  USING (auth.uid() = user_id);


-- STAFF ANNOUNCEMENTS POLICIES
DROP POLICY IF EXISTS "Users can view staff announcements" ON public.staff_announcements;

-- Anyone can view active announcements, or announcements targeted at them
CREATE POLICY "Users can view staff announcements"
  ON public.staff_announcements FOR SELECT
  USING (
    is_active = true AND 
    (target_user_ids IS NULL OR auth.uid() = ANY(target_user_ids))
  );

-- STAFF ANNOUNCEMENT READS POLICIES
DROP POLICY IF EXISTS "Users can view their own announcement reads" ON public.staff_announcement_reads;
DROP POLICY IF EXISTS "Users can insert their own announcement reads" ON public.staff_announcement_reads;

-- Users can view their own reads
CREATE POLICY "Users can view their own announcement reads"
  ON public.staff_announcement_reads FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reads
CREATE POLICY "Users can insert their own announcement reads"
  ON public.staff_announcement_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ADMIN POLICIES (Full CRUD)
-- Applies admin CRUD to these tables using public.is_admin()
DO $$ 
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN SELECT UNNEST(ARRAY[
        'staff_locations', 'staff_announcements', 'staff_announcement_reads'
    ]) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%I_all_admin" ON public.%I', table_name, table_name);
        EXECUTE format('CREATE POLICY "%I_all_admin" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());', table_name, table_name);
    END LOOP;
END $$;
