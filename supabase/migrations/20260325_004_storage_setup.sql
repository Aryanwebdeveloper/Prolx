-- ========================================================
-- Storage Buckets and RLS Policies for Image Uploads
-- Migration: 20260325_004_storage_setup.sql
-- ========================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('blog-images', 'blog-images', true),
  ('portfolio-images', 'portfolio-images', true),
  ('testimonials', 'testimonials', true),
  ('team-members', 'team-members', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Set up RLS Policies for Storage

-- Helper to check if user is admin (restated for storage context or reuse if schema permits)
-- Note: storage.objects doesn't easily join with public.profiles without full path or helper functions.
-- We'll use the public.is_admin() function if it exists, otherwise we'll define a storage-specific check.

-- A) PUBLIC READ ACCESS
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('avatars', 'blog-images', 'portfolio-images', 'testimonials', 'team-members') );

-- B) AUTHENTICATED UPLOAD ACCESS (For any authenticated user to avatars - usually users manage their own)
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- C) ADMIN FULL ACCESS (For all content buckets)
-- We'll use a subquery to check the role in public.profiles
CREATE POLICY "Admin Full Storage Access"
ON storage.objects FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- D) USERS CAN UPDATE/DELETE THEIR OWN AVATARS
-- This assumes the path starts with their user ID (e.g., 'avatars/uuid/filename.jpg')
-- or we just allow them to manage objects in 'avatars' that they created (metadata.owner)
CREATE POLICY "Users Manage Own Avatars"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars' AND (owner = auth.uid() OR auth.uid()::text = (storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'avatars' AND (owner = auth.uid() OR auth.uid()::text = (storage.foldername(name))[1])
);
