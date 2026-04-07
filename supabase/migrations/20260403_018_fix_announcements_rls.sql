-- Fix STAFF ANNOUNCEMENTS POLICIES to handle empty array '{}' correctly
DROP POLICY IF EXISTS "Users can view staff announcements" ON public.staff_announcements;

-- Anyone can view active announcements, or announcements targeted at them
CREATE POLICY "Users can view staff announcements"
  ON public.staff_announcements FOR SELECT
  USING (
    is_active = true AND 
    (
      target_user_ids IS NULL OR 
      coalesce(array_length(target_user_ids, 1), 0) = 0 OR 
      auth.uid() = ANY(target_user_ids)
    )
  );
