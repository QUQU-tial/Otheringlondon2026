-- Run this whole file in Supabase SQL Editor (safe to re-run).
-- Creates profiles (needed for admin role) + artists + artist_registrations.

-- 1) Profiles (admin role lives here)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles (username)
  WHERE username IS NOT NULL;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 2) Artists (join/publish + admin review)
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

DROP POLICY IF EXISTS "Owners can read own artists" ON artists;
CREATE POLICY "Owners can read own artists"
  ON artists FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Review queue is readable" ON artists;
CREATE POLICY "Review queue is readable"
  ON artists FOR SELECT
  USING (status IN ('draft', 'pending_review', 'rejected'));

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

-- 3) Artist registration log (when someone opens Join while signed in)
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
