-- Patch only (safe to re-run). Fixes "new row violates row-level security policy for table artists".

-- 1) Owners can insert their own rows (required for Save Draft / Submit)
DROP POLICY IF EXISTS "Owners can insert own artists" ON artists;
CREATE POLICY "Owners can insert own artists"
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 2) Owners can read/update their own rows
DROP POLICY IF EXISTS "Owners can read own artists" ON artists;
CREATE POLICY "Owners can read own artists"
  ON artists FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own artists" ON artists;
CREATE POLICY "Owners can update own artists"
  ON artists FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 3) Review queue readable (so /admin can list drafts without service role)
DROP POLICY IF EXISTS "Review queue is readable" ON artists;
CREATE POLICY "Review queue is readable"
  ON artists FOR SELECT
  USING (status IN ('draft', 'pending_review', 'rejected'));

-- 4) Allow moderation updates/deletes from /admin (incl. magic-admin session)
DROP POLICY IF EXISTS "Review queue can be moderated" ON artists;
CREATE POLICY "Review queue can be moderated"
  ON artists FOR UPDATE
  USING (status IN ('draft', 'pending_review', 'rejected', 'published'))
  WITH CHECK (status IN ('draft', 'pending_review', 'rejected', 'published'));

DROP POLICY IF EXISTS "Review queue can be deleted" ON artists;
CREATE POLICY "Review queue can be deleted"
  ON artists FOR DELETE
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
