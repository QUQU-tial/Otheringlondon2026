-- Patch only (safe to re-run). Run in Supabase SQL Editor after artists table exists.
-- Lets drafts sync from join form and appear in /admin/artists (including magic-admin sessions).

DROP POLICY IF EXISTS "Owners can read own artists" ON artists;
CREATE POLICY "Owners can read own artists"
  ON artists FOR SELECT
  USING (auth.uid() = owner_id);

-- Allow reading the review queue without a service-role key / admin JWT
-- (draft + pending + rejected). Tighten later if you add SUPABASE_SERVICE_ROLE_KEY.
DROP POLICY IF EXISTS "Review queue is readable" ON artists;
CREATE POLICY "Review queue is readable"
  ON artists FOR SELECT
  USING (status IN ('draft', 'pending_review', 'rejected'));

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

-- Let /admin Publish & Delete work even without an admin JWT (magic admin session).
DROP POLICY IF EXISTS "Review queue can be moderated" ON artists;
CREATE POLICY "Review queue can be moderated"
  ON artists FOR UPDATE
  USING (status IN ('draft', 'pending_review', 'rejected', 'published'))
  WITH CHECK (status IN ('draft', 'pending_review', 'rejected', 'published'));

DROP POLICY IF EXISTS "Review queue can be deleted" ON artists;
CREATE POLICY "Review queue can be deleted"
  ON artists FOR DELETE
  USING (status IN ('draft', 'pending_review', 'rejected'));

-- Promote a real login to admin (optional, for tighter control later):
-- INSERT INTO profiles (id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
