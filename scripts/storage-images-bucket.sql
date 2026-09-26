-- Run in Supabase SQL Editor (safe to re-run).
-- Creates the public "images" storage bucket + policies so artists can upload photos.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public can read uploaded images
DROP POLICY IF EXISTS "Public can read images" ON storage.objects;
CREATE POLICY "Public can read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Anyone (incl. signed-in artists) can upload into the images bucket
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images');

-- Owners / anyone can update/replace their uploads in this bucket (festival ops)
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
CREATE POLICY "Anyone can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
CREATE POLICY "Anyone can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images');

-- Also ensure artists table insert works for signed-in owners
DROP POLICY IF EXISTS "Owners can insert own artists" ON artists;
CREATE POLICY "Owners can insert own artists"
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own artists" ON artists;
CREATE POLICY "Owners can update own artists"
  ON artists FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can read own artists" ON artists;
CREATE POLICY "Owners can read own artists"
  ON artists FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Review queue is readable" ON artists;
CREATE POLICY "Review queue is readable"
  ON artists FOR SELECT
  USING (status IN ('draft', 'pending_review', 'rejected'));
