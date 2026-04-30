# FORM_SCHEMA.md

## Purpose
Complete data schema for partner submissions.
All frontend forms, backend tables, and AI-generated code must strictly follow this schema.

**This file defines data structure only. No UI or layout instructions.**

---

## TAB 1 — Basic Info (Partner Account Registration)

| Field | Type | Required | Editable After Submit | Notes |
|-------|------|----------|----------------------|-------|
| `first_name` | string | Yes | No (locked) | Cannot be edited after first submission |
| `last_name` | string | Yes | No (locked) | Cannot be edited after first submission |
| `username` | string | Yes | No (locked) | Account identity, locked after first submit. Auto-generated if empty: `first_name_last_name` (lowercase, underscores) |
| `organization_name` | string | Yes | Yes | Organization or artist name |
| `email` | string | Yes | Yes | Must be valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) |
| `role` | string | Yes | Yes | Default: `'partner'` |
| `is_student` | boolean | No | Yes | Optional checkbox. Helper text: "If you are a student, please email proof to info@spira9.art with the subject: name_spira9_student_application" |

**Identity Locking Rules:**
- `first_name`, `last_name`, `username` become read-only (disabled, greyed) after first successful submit
- `username` is locked in `profiles` table after first submit (cannot be changed)
- `author_name` (in TAB 2) is **always editable** and is NOT locked
- Locking is controlled by `is_locked` flag on submission and `profiles.username` field

---

## TAB 2 — About the Exhibition / Activity

**All fields are required except `partner`.**

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `activity_title` | string | Yes | Yes | Exhibition/activity title |
| `author_name` | string | Yes | Yes | **Display credit, always editable** (never locked). Used for public display. Falls back to `username` if empty. |
| `activity_type` | string | Yes | Yes | Type of activity/exhibition |
| `activity_description` | string (HTML) | Yes | Yes | Rich text (HTML content from rich text editor) |
| `activity_location` | string | Yes | Yes | Location of activity |
| `activity_date` | string | Yes | Yes | Date of activity |
| `primary_image` | string (URL) | Yes | Yes | Image URL (Supabase Storage URL). Must start with `http`. Images are uploaded to Supabase Storage, not stored as data URLs in database. |
| `primary_image_alt` | string | Yes | Yes | Alt text for primary image |
| `website_link` | string (URL) | Yes | Yes | Must be valid URL format. Can be used for video, ticket, press, or other media |
| `body_text_1` | string (HTML) | Yes | Yes | Rich text (HTML content from rich text editor) |
| `additional_images_1` | string (URL) | Yes | Yes | Image URL (Supabase Storage URL). Must start with `http`. Images are uploaded to Supabase Storage. |
| `additional_images_1_alt` | string | Yes | Yes | Alt text for additional image 1 |
| `body_text_2` | string (HTML) | Yes | Yes | Rich text (HTML content from rich text editor) |
| `additional_images_2` | string[] (URLs) | Yes | Yes | Array of 1-3 image URLs. Each must start with `http`. Images are uploaded to Supabase Storage. |
| `additional_images_2_alt` | string[] | Yes | Yes | Array of alt texts (one per image) |
| `organizer` | string | Yes | Yes | Organizer name |
| `partner` | string | No | Yes | Optional, can be a link to partner organization |

**Content Sequence (strict order):**
1. `body_text_1` (paragraph)
2. `additional_images_1` (single image)
3. `body_text_2` (paragraph)
4. `additional_images_2` (1-3 images, carousel)

**Image Requirements:**
- Minimum resolution: 1920x1080 per image
- 72dpi
- Max 5MB per image
- JPG or PNG
- Stored in Supabase Storage bucket `images/activities/`
- Database stores only URLs (strings), not File objects or data URLs
- Images are publicly accessible via Supabase Storage URLs

---

## TAB 3 — Links / Media

| Field | Type | Required | Editable | Notes |
|-------|------|----------|----------|-------|
| `website_link` | string (URL) | Yes | Yes | Main website link (also in TAB 2, same field) |
| `additional_media_links` | MediaLink[] | No | Yes | Optional, up to 5 items. Each item: `{ media_name: string, media_link: string }` |
| `accept_terms` | boolean | Yes | Yes | Required for submission. Must be checked to enable Submit button |

**Terms & Conditions Text:**
"I confirm that:
1) I have the rights to submit and display the uploaded materials (images/text), and I grant SPIRA9 ART permission to use them for exhibition presentation and related promotion (website, social media, press) with credit.
2) The information I provide is accurate, and I understand SPIRA9 ART may request clarification.
3) I understand submissions may be reviewed and may be edited for formatting (not altering meaning) for publication/presentation.
4) I understand my submission may be accepted or declined, and participation/publication is not guaranteed.
5) I agree to be contacted by SPIRA9 ART regarding my submission."

---

## Status Flow

| Status | Editable | Visible to Admin | Visible to Public | Notes |
|--------|----------|-----------------|-------------------|-------|
| `draft` | Yes | No | No | Saved but not submitted |
| `pending_review` | Yes | Yes | No | Submitted, awaiting admin review |
| `approved` | Yes | Yes | No | Approved by admin, not yet published |
| `published` | Yes | Yes | Yes | Visible on public pages |
| `rejected` | Yes | Yes | No | Rejected by admin, can be edited and resubmitted |
| `removed` | No | Yes | No | Soft deleted (is_deleted: true) |

**Status Transition Rules:**
- `draft` → `pending_review`: On Submit (if all required fields valid + terms accepted)
- `pending_review` → `approved`: Admin action
- `approved` → `published`: Admin action (manual publish)
- Any edit to `approved` or `published` content resets status to `pending_review`
- `rejected` → `pending_review`: On resubmit after editing

---

## Identity & Display Name Logic

**Username vs Author Name:**
- `username`: Account identity, locked after first submit
- `author_name`: Display credit, always editable

**Display Fallback:**
- If `author_name` is empty, use `username` for display
- If `author_name` is filled, use `author_name` for display
- Do not auto-sync `author_name` with `username`

**Implementation:**
```typescript
displayName = submission.author_name || submission.username
```

---

## Data Types

### Submission Type
```typescript
type Submission = {
  id: string;
  owner_id: string; // UUID, matches auth.users.id
  // TAB 1
  first_name: string;
  last_name: string;
  username: string; // Locked after first submit (stored in profiles table)
  organization_name: string;
  email: string;
  role: string;
  is_student?: boolean;
  // TAB 2
  activity_title: string;
  author_name: string;
  activity_type: string;
  activity_description: string; // HTML
  activity_location: string;
  activity_date: string;
  primary_image: string | null; // URL
  primary_image_alt: string;
  website_link: string; // URL
  body_text_1: string; // HTML
  additional_images_1: string | null; // URL
  additional_images_1_alt: string;
  body_text_2: string; // HTML
  additional_images_2: string[] | null; // URLs
  additional_images_2_alt: string[];
  organizer: string;
  partner: string;
  // TAB 3
  additional_media_links?: MediaLink[];
  accept_terms?: boolean;
  // System fields
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'removed';
  createdAt: string; // ISO string
  is_deleted?: boolean;
  is_locked?: boolean;
}

type MediaLink = {
  media_name: string;
  media_link: string;
}
```

---

## Validation Rules

**Required Field Validation:**
- All TAB 1 fields except `is_student` are required
- All TAB 2 fields except `partner` are required
- `accept_terms` is required for submission

**Format Validation:**
- `email`: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `website_link`: Must be valid URL (can use `new URL()` constructor)
- `primary_image`, `additional_images_1`, `additional_images_2`: Must be valid URLs (start with `http` or `data:image`)

**Image Validation:**
- Images must be uploaded to Supabase Storage before submission
- File objects are converted to Supabase Storage URLs
- Only URLs (strings) are stored in database, never File objects or data URLs
- Images are stored in `images/activities/` bucket

---

## Notes for Implementation

- Partners can save drafts multiple times (status: `draft`)
- Submission form is split into 3 tabs
- Tab 2 content sequence **must be preserved**
- Video is always a link (no upload)
- Admin handles approval and manual publish
- All fields except `partner` and `is_student` are required
- Alt text should be filled for SEO and accessibility
- Frontend should show placeholder/help text (character limit, small text indicator, image size hints)
- Rich text fields (`activity_description`, `body_text_1`, `body_text_2`) store HTML content
- Image fields store URLs only (not File objects)

---

## Production Notes

**Authentication:**
- Passwords are managed by Supabase Auth only
- Passwords are NEVER stored in database or localStorage
- Users authenticate via `/login` page using email/password

**User Profiles:**
- Each user has a `profiles` table entry (created on first login)
- `profiles.username` is locked after first successful submit
- `profiles.role` determines admin access (`'admin'` or `'user'`)

**Data Storage:**
- All data stored in Supabase database (`activities` table)
- Images stored in Supabase Storage (`images` bucket)
- No localStorage or sessionStorage for activity data
- Single source of truth: Supabase

---

## Version
**Version:** 2026-02-05  
**Source of truth:** Current codebase (`app/lib/storage.ts`, `app/submit/page.tsx`, `app/lib/profiles.ts`, `DATABASE_SCHEMA.md`)  
**Intended use:** Reusable system specification
