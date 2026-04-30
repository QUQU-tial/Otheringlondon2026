# Authentication and User Identity Specification

**Version:** 2026-01-23  
**Source of truth:** Current codebase  
**Intended use:** Reusable authentication and user identity specification

---

## Core Principles

### Display Name Resolution (CRITICAL RULE)

**The resolved display name MUST NOT be written back to the database.**

This rule applies to:
- Workspace list
- Workspace detail
- Admin views
- Public event pages

**Implementation:**
- Display name is resolved in UI only: `author_name || username`
- `Activity.author_name` stores the original value (may be empty)
- `Activity.username` stores the account identity
- Never persist the resolved value: `author_name || username` is computed at render time only

**Example:**
```typescript
// ✅ CORRECT: Resolve in UI
const displayName = activity.author_name || activity.username;

// ❌ WRONG: Persisting resolved value
activity.author_name = activity.author_name || activity.username; // NEVER DO THIS
```

---

## Status Flow

### Draft
- `status = draft`
- Incomplete data allowed
- Visible only to the owner (and admin)

### Submit
- Triggered when all required fields are valid and terms accepted
- Actions:
  - `status → pending_review`
  - If `username` is empty:
    - Set it (from form data: `first_name_last_name` pattern)
    - Lock it permanently (`is_locked: true`)

### Publish
- `pending_review → published`
- Activity becomes publicly visible
- Added to activities list via `submissionToActivity()`

### Remove
- Any state → `removed` (or `is_deleted: true`)
- Activity disappears from workspace and public routes

---

## Route Access Rules

### Public Routes (No Login Required)
- `/partners` - Map / partners page
- `/about-us` - About us page
- `/login` - Login page
- Public event detail pages (if implemented: `/event/[id]` or `/public/[id]`)
- Calendar export (`.ics` file downloads)

### Private Routes (Login Required)
- `/` - Workspace page
- `/submit` - Submission form
- `/admin` - Admin panel (and `/admin/[id]`)

### Route Protection Behavior

If a logged-out user accesses a private route:
1. Store current path as `returnTo` in `sessionStorage`
2. Redirect to `/login?returnTo={encodedPath}`
3. After successful login, redirect back to `returnTo`
4. Clear `returnTo` after redirect

**Implementation:**
- `RouteGuard` component wraps all routes in `app/layout.tsx`
- `checkRouteAccess()` function determines if redirect is needed
- Login page reads `returnTo` from both URL params and `sessionStorage`

---

## User Identity Model

### Username (Account Identity)
- **Purpose:** Stable account identifier
- **Source:** Form field or auto-generated from `first_name_last_name`
- **Locking:** Locked after first successful submit (`is_locked: true`)
- **Persistence:** Stored in `Submission.username` and `Activity.username`
- **Never changes:** Once set and locked, cannot be modified

### Author Name (Display Credit)
- **Purpose:** Public-facing display name
- **Source:** Form field (`author_name`)
- **Locking:** Never locked, always editable
- **Persistence:** Stored in `Submission.author_name` and `Activity.author_name`
- **May be empty:** If empty, UI falls back to `username` for display

### Display Name Resolution
- **Formula:** `displayName = author_name || username`
- **Location:** UI only (never persisted)
- **Usage:** All views that show author/artist name

---

## Implementation Files

### Core Logic
- `app/lib/storage.ts` - Data storage and `submissionToActivity()` conversion
- `app/lib/auth.ts` - Authentication utilities
- `app/lib/route-protection.ts` - Route access control

### Components
- `app/components/RouteGuard.tsx` - Route protection wrapper

### Pages
- `app/page.tsx` - Workspace (private)
- `app/submit/page.tsx` - Submission form (private)
- `app/admin/page.tsx` - Admin list (private)
- `app/admin/[id]/page.tsx` - Admin detail (private)
- `app/partners/page.tsx` - Partners map (public)
- `app/login/page.tsx` - Login (public)
- `app/about-us/page.tsx` - About us (public)

---

## Summary

- **Auth User** controls access (login required for private routes)
- **Profile/Username** controls stable identity (locked after first submit)
- **Activity** controls content and authorship (`author_name` always editable)
- **Display logic** is resolved in the UI, never persisted

This separation is mandatory for system consistency and future scalability.

---

## Version
**Version:** 2026-01-23  
**Source of truth:** Current codebase  
**Intended use:** Reusable authentication and user identity specification

