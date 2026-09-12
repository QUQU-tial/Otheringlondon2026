-- Optional: run in Supabase SQL editor so artist join publishes site-wide.
-- Until this exists, join still works via browser localStorage for the submitter.

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS artists_status_idx ON artists (status);
CREATE INDEX IF NOT EXISTS artists_owner_id_idx ON artists (owner_id);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published artists" ON artists;
CREATE POLICY "Public can read published artists"
  ON artists FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Owners can insert own artists" ON artists;
CREATE POLICY "Owners can insert own artists"
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own artists" ON artists;
CREATE POLICY "Owners can update own artists"
  ON artists FOR UPDATE
  USING (auth.uid() = owner_id);
