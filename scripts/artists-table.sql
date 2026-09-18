-- Artist profiles for join/publish + admin review.
-- Run in Supabase SQL editor (safe to re-run).

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_email TEXT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  field TEXT,
  birth TEXT,
  photo TEXT,
  photo_alt TEXT,
  bio TEXT NOT NULL DEFAULT '',
  cv JSONB NOT NULL DEFAULT '[]'::jsonb,
  exhibitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  press JSONB NOT NULL DEFAULT '[]'::jsonb,
  talks JSONB NOT NULL DEFAULT '[]'::jsonb,
  works JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'pending_review', 'published', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE artists ADD COLUMN IF NOT EXISTS owner_email TEXT;

CREATE INDEX IF NOT EXISTS artists_status_idx ON artists (status);
CREATE INDEX IF NOT EXISTS artists_owner_id_idx ON artists (owner_id);
CREATE INDEX IF NOT EXISTS artists_updated_at_idx ON artists (updated_at DESC);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published artists" ON artists;
CREATE POLICY "Public can read published artists"
  ON artists FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins can read all artists" ON artists;
CREATE POLICY "Admins can read all artists"
  ON artists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Owners can insert own artists" ON artists;
CREATE POLICY "Owners can insert own artists"
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own artists" ON artists;
CREATE POLICY "Owners can update own artists"
  ON artists FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can update artists" ON artists;
CREATE POLICY "Admins can update artists"
  ON artists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Optional: lightweight registration log when an artist account first reaches Join.
CREATE TABLE IF NOT EXISTS artist_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_email TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id)
);

ALTER TABLE artist_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can upsert own registration" ON artist_registrations;
CREATE POLICY "Owners can upsert own registration"
  ON artist_registrations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own registration" ON artist_registrations;
CREATE POLICY "Owners can update own registration"
  ON artist_registrations FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can read artist registrations" ON artist_registrations;
CREATE POLICY "Admins can read artist registrations"
  ON artist_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
