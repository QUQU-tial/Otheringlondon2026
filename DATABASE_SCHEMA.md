# Database Schema

## Purpose
Defines the Supabase database schema for the production-ready multi-user platform.

---

## Tables

### 1. `profiles`

User profile information linked to Supabase Auth users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, REFERENCES `auth.users(id)` | User ID (matches auth.users.id) |
| `username` | `text` | NULLABLE, UNIQUE | Username (locked after first submit) |
| `role` | `text` | NOT NULL, DEFAULT 'user' | User role: 'user' or 'admin' |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Profile creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `username` (where not null)

**Row Level Security (RLS):**
- Users can read their own profile
- Users can update their own profile (but username is locked after first submit)
- Admins can read all profiles

**Triggers:**
- Auto-create profile on user signup (via Supabase trigger or application logic)

---

### 2. `activities`

Activity/submission data (single table for both drafts and published activities).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT gen_random_uuid() | Activity ID |
| `owner_id` | `uuid` | NOT NULL, REFERENCES `auth.users(id)` | Owner user ID |
| `status` | `text` | NOT NULL, DEFAULT 'draft' | Status: 'draft', 'pending_review', 'published', 'rejected', 'removed' |
| `created_at` | `timestamp` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamp` | NOT NULL, DEFAULT now() | Last update timestamp |
| `is_deleted` | `boolean` | NOT NULL, DEFAULT false | Soft delete flag |
| `is_locked` | `boolean` | NOT NULL, DEFAULT false | Username locked flag |
| `first_name` | `text` | NOT NULL | First name |
| `last_name` | `text` | NOT NULL | Last name |
| `username` | `text` | NOT NULL | Account username |
| `organization_name` | `text` | NOT NULL | Organization name |
| `email` | `text` | NOT NULL | Email address |
| `role` | `text` | NOT NULL | User role (e.g., 'partner') |
| `is_student` | `boolean` | NOT NULL, DEFAULT false | Student flag |
| `activity_title` | `text` | NOT NULL | Activity title |
| `author_name` | `text` | NOT NULL | Display author name |
| `activity_type` | `text` | NOT NULL | Activity type |
| `activity_description` | `text` | NOT NULL | HTML description |
| `activity_location` | `text` | NOT NULL | Location |
| `activity_date` | `text` | NOT NULL | Date string |
| `primary_image` | `text` | NULLABLE | Primary image URL (Supabase Storage) |
| `primary_image_alt` | `text` | NULLABLE | Primary image alt text |
| `website_link` | `text` | NOT NULL | Website URL |
| `body_text_1` | `text` | NOT NULL | First body text (HTML) |
| `additional_images_1` | `text` | NULLABLE | Additional image 1 URL |
| `additional_images_1_alt` | `text` | NULLABLE | Additional image 1 alt text |
| `body_text_2` | `text` | NOT NULL | Second body text (HTML) |
| `additional_images_2` | `jsonb` | NULLABLE | Array of image URLs (JSON) |
| `additional_images_2_alt` | `jsonb` | NULLABLE | Array of alt texts (JSON) |
| `organizer` | `text` | NOT NULL | Organizer name |
| `partner` | `text` | NOT NULL | Partner name |
| `additional_media_links` | `jsonb` | NULLABLE | Array of media links (JSON) |
| `accept_terms` | `boolean` | NOT NULL, DEFAULT false | Terms acceptance flag |

**Indexes:**
- Primary key on `id`
- Index on `owner_id` for user queries
- Index on `status` for filtering
- Index on `is_deleted` for soft delete filtering
- Composite index on `(status, is_deleted)` for published activities query

**Row Level Security (RLS):**
- Users can read their own activities (all statuses)
- Users can create/update their own activities (draft/pending_review only)
- Public can read activities with `status='published'` and `is_deleted=false`
- Admins can read/update all activities

**JSONB Fields:**
- `additional_images_2`: Array of strings `["url1", "url2", ...]`
- `additional_images_2_alt`: Array of strings `["alt1", "alt2", ...]`
- `additional_media_links`: Array of objects `[{"media_name": "...", "media_link": "..."}, ...]`

---

## Storage Buckets

### `images`

Supabase Storage bucket for activity images.

**Structure:**
- `activities/{timestamp}_{random}.{ext}` - Activity images (primary, additional)

**Policies:**
- Public read access for published activities
- Authenticated users can upload to their own folder
- Admins can manage all images

---

## SQL Migration Script

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  is_student BOOLEAN NOT NULL DEFAULT false,
  activity_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  activity_location TEXT NOT NULL,
  activity_date TEXT NOT NULL,
  primary_image TEXT,
  primary_image_alt TEXT,
  website_link TEXT NOT NULL,
  body_text_1 TEXT NOT NULL,
  additional_images_1 TEXT,
  additional_images_1_alt TEXT,
  body_text_2 TEXT NOT NULL,
  additional_images_2 JSONB,
  additional_images_2_alt JSONB,
  organizer TEXT NOT NULL,
  partner TEXT NOT NULL,
  additional_media_links JSONB,
  accept_terms BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_owner_id ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_is_deleted ON activities(is_deleted);
CREATE INDEX IF NOT EXISTS idx_activities_status_deleted ON activities(status, is_deleted) WHERE is_deleted = false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for activities
CREATE POLICY "Users can read own activities" ON activities
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Public can read published activities" ON activities
  FOR SELECT USING (status = 'published' AND is_deleted = false);

CREATE POLICY "Users can create own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own activities" ON activities
  FOR UPDATE USING (auth.uid() = owner_id);

-- Create storage bucket (run in Supabase dashboard or via API)
-- Storage bucket: 'images'
-- Public: true (for published activities)
```

---

## Version
**Version:** 2026-02-05  
**Source of truth:** Production Supabase database  
**Intended use:** Database schema reference and migration guide
