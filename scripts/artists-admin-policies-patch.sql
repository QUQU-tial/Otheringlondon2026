-- Patch only (safe to re-run). Run in Supabase SQL Editor after artists table exists.
-- Adds owner read + admin delete so drafts show in /admin/artists and Publish/Delete work.

DROP POLICY IF EXISTS "Owners can read own artists" ON artists;
CREATE POLICY "Owners can read own artists"
  ON artists FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can delete artists" ON artists;
CREATE POLICY "Admins can delete artists"
  ON artists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Promote your real login to admin (replace email):
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
-- If no profile row yet:
-- INSERT INTO profiles (id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
