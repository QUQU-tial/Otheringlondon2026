# QA Checklist

## Purpose
Step-by-step testing guide for production-ready multi-user website verification.

---

## Pre-Testing Setup

1. **Environment Variables**
   - [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
   - [ ] Supabase database has `profiles` and `activities` tables
   - [ ] Supabase Storage has `images` bucket configured

2. **Database Setup**
   - [ ] Run SQL migration from `DATABASE_SCHEMA.md`
   - [ ] Create at least one admin user: Update `profiles` table, set `role='admin'` for test user
   - [ ] Verify RLS policies are enabled

---

## Test 1: Multi-Browser Consistency (Published Activity Visibility)

**Goal:** Verify published activities are visible across different browsers/devices.

### Steps:
1. [ ] Open browser A (e.g., Chrome)
2. [ ] Log in as admin user
3. [ ] Create a test activity via `/submit`
4. [ ] Submit the activity (status: `pending_review`)
5. [ ] In admin panel (`/admin`), approve and publish the activity
6. [ ] Open browser B (e.g., Firefox) or incognito window
7. [ ] Navigate to homepage (`/`)
8. [ ] **Verify:** Activity appears in the left panel activity list
9. [ ] **Verify:** Clicking the activity shows full details in right panel
10. [ ] **Verify:** All images display correctly (not broken)
11. [ ] **Verify:** Activity appears on `/partners` page

**Expected Result:** Published activity is visible to all users (logged in or not) across all browsers.

---

## Test 2: Image Visibility Across Browsers

**Goal:** Verify images uploaded to Supabase Storage are accessible across browsers.

### Steps:
1. [ ] In browser A, log in as regular user
2. [ ] Go to `/submit`
3. [ ] Fill out form and upload images:
   - Primary image
   - Additional image 1
   - Additional images 2 (multiple)
4. [ ] Submit the activity
5. [ ] Note the image URLs (should be Supabase Storage URLs, not data URLs)
6. [ ] Open browser B (incognito) or different device
7. [ ] Navigate to homepage
8. [ ] Find the published activity
9. [ ] **Verify:** All images display correctly
10. [ ] **Verify:** Images load from Supabase Storage URLs (check Network tab)
11. [ ] **Verify:** No broken image placeholders

**Expected Result:** All images are stored in Supabase Storage and accessible via public URLs.

---

## Test 3: Password Security (No Password Storage)

**Goal:** Verify passwords are never stored in database or localStorage.

### Steps:
1. [ ] Open browser DevTools (F12)
2. [ ] Go to Application/Storage tab
3. [ ] Check `localStorage`:
   - [ ] **Verify:** No password fields exist
   - [ ] **Verify:** No sensitive auth data stored
4. [ ] Check `sessionStorage`:
   - [ ] **Verify:** No password fields exist
5. [ ] In Supabase Dashboard, check `activities` table:
   - [ ] **Verify:** No `password` column exists
   - [ ] **Verify:** No password data in any JSON fields
6. [ ] Check `profiles` table:
   - [ ] **Verify:** No password fields exist
7. [ ] Check Network tab during login:
   - [ ] **Verify:** Password only sent in auth request body
   - [ ] **Verify:** Password not stored in response

**Expected Result:** Password is only used in Supabase Auth signIn request, never persisted.

---

## Test 4: Admin Gating

**Goal:** Verify admin routes are properly protected.

### Steps:
1. [ ] Log in as **non-admin** user (regular user)
2. [ ] Try to access `/admin` directly
3. [ ] **Verify:** Redirected to `/login` or `/` (not admin page)
4. [ ] **Verify:** No admin menu link visible in homepage header
5. [ ] Log out
6. [ ] Try to access `/admin` while logged out
7. [ ] **Verify:** Redirected to `/login` with `returnTo` parameter
8. [ ] Log in as **admin** user
9. [ ] **Verify:** Can access `/admin` page
10. [ ] **Verify:** Admin menu link visible in homepage header
11. [ ] **Verify:** Can see all submissions (pending_review, published, etc.)
12. [ ] **Verify:** Can approve/publish/reject/remove activities

**Expected Result:** Only users with `profiles.role='admin'` can access admin routes.

---

## Test 5: Submit Flow + Email Exists Popup

**Goal:** Verify submission flow works correctly, including email existence check.

### Steps:
1. [ ] Log in as regular user
2. [ ] Go to `/submit`
3. [ ] Fill out Tab 1 (Basic Info):
   - First name, last name, username
   - Organization, email, role
4. [ ] Click "Next" to go to Tab 2
5. [ ] **Verify:** If email already exists, "Account exists" modal appears
6. [ ] **Verify:** Modal has "Login" and "Cancel" buttons
7. [ ] Click "Login" in modal
8. [ ] **Verify:** Redirected to `/login` with email pre-filled
9. [ ] Go back to `/submit` with new email
10. [ ] Fill out Tab 2 (About the Exhibition)
11. [ ] Upload images (primary, additional)
12. [ ] Fill out Tab 3 (Links / Media)
13. [ ] Check "Accept terms" checkbox
14. [ ] Click "Submit"
15. [ ] **Verify:** Success modal appears
16. [ ] **Verify:** Form fields are locked (username, first_name, last_name)
17. [ ] **Verify:** Activity status is `pending_review`
18. [ ] Go to admin panel (as admin)
19. [ ] **Verify:** Activity appears in admin list with status `pending_review`

**Expected Result:** Submit flow works end-to-end, email check prevents duplicate accounts, username locks after first submit.

---

## Test 6: Username Locking

**Goal:** Verify username is locked after first successful submit.

### Steps:
1. [ ] Log in as new user (never submitted before)
2. [ ] Go to `/submit`
3. [ ] Fill out form with username: `test_user_123`
4. [ ] Submit the activity
5. [ ] **Verify:** Success modal appears
6. [ ] **Verify:** Username field is disabled (opacity 50%, cursor not-allowed)
7. [ ] **Verify:** First name and last name fields are disabled
8. [ ] **Verify:** Author name field is still editable
9. [ ] Try to edit username field (should be disabled)
10. [ ] Check `profiles` table in Supabase:
    - [ ] **Verify:** `username` is set to `test_user_123`
11. [ ] Try to update username via API (should fail)
12. [ ] Create new draft activity
13. [ ] **Verify:** Username is pre-filled and locked

**Expected Result:** Username is locked in profile after first submit, cannot be changed.

---

## Test 7: Session Persistence

**Goal:** Verify user session persists after page refresh.

### Steps:
1. [ ] Log in as any user
2. [ ] Navigate to homepage
3. [ ] **Verify:** User menu shows logged-in state
4. [ ] Refresh page (F5)
5. [ ] **Verify:** Still logged in (no redirect to login)
6. [ ] **Verify:** User menu still shows logged-in state
7. [ ] Close browser tab
8. [ ] Reopen browser and navigate to site
9. [ ] **Verify:** Still logged in (session persisted)
10. [ ] Log out
11. [ ] Refresh page
12. [ ] **Verify:** Logged out state persists

**Expected Result:** Session persists across page refreshes and browser restarts.

---

## Test 8: Public Routes Accessibility

**Goal:** Verify public routes are accessible without login.

### Steps:
1. [ ] Log out (or use incognito window)
2. [ ] Navigate to `/` (homepage)
3. [ ] **Verify:** Can view published activities
4. [ ] **Verify:** Can click activities to see details
5. [ ] Navigate to `/partners`
6. [ ] **Verify:** Can view partners map
7. [ ] Navigate to `/about-us`
8. [ ] **Verify:** Can view about page
9. [ ] Navigate to `/submit`
10. [ ] **Verify:** Can access submit form (but will need login to submit)
11. [ ] Try to access `/admin`
12. [ ] **Verify:** Redirected to `/login`

**Expected Result:** Public routes are accessible without authentication.

---

## Test 9: Private Routes Protection

**Goal:** Verify private routes redirect to login when not authenticated.

### Steps:
1. [ ] Log out (or use incognito window)
2. [ ] Try to access `/admin`
3. [ ] **Verify:** Redirected to `/login?returnTo=/admin`
4. [ ] **Verify:** `returnTo` parameter is preserved
5. [ ] Log in
6. [ ] **Verify:** Redirected back to `/admin` after login
7. [ ] Log out
8. [ ] Try to access `/admin/123` (admin detail page)
9. [ ] **Verify:** Redirected to login with correct `returnTo`

**Expected Result:** Private routes require authentication and preserve return URL.

---

## Test 10: Image Upload to Supabase Storage

**Goal:** Verify images are uploaded to Supabase Storage, not stored as data URLs in DB.

### Steps:
1. [ ] Log in as user
2. [ ] Go to `/submit`
3. [ ] Upload an image (primary image)
4. [ ] Submit the activity
5. [ ] Check Supabase Storage dashboard:
    - [ ] **Verify:** Image exists in `images/activities/` bucket
    - [ ] **Verify:** Image has public URL
6. [ ] Check `activities` table in database:
    - [ ] **Verify:** `primary_image` field contains URL (starts with `https://`)
    - [ ] **Verify:** `primary_image` is NOT a data URL (`data:image/...`)
7. [ ] View the activity on homepage
8. [ ] **Verify:** Image loads from Supabase Storage URL
9. [ ] Check Network tab:
    - [ ] **Verify:** Image request goes to Supabase Storage domain

**Expected Result:** All images are stored in Supabase Storage, URLs stored in database.

---

## Test 11: Multi-User Isolation

**Goal:** Verify users can only see/edit their own activities.

### Steps:
1. [ ] Log in as User A
2. [ ] Create and submit an activity
3. [ ] Log out
4. [ ] Log in as User B
5. [ ] Go to `/submit`
6. [ ] **Verify:** User B's form is empty (not User A's data)
7. [ ] Create and submit User B's activity
8. [ ] Go to admin panel (as admin)
9. [ ] **Verify:** Can see both User A and User B's activities
10. [ ] Log in as User A
11. [ ] **Verify:** Cannot see User B's activities in personal view
12. [ ] **Verify:** Can only edit own activities

**Expected Result:** Users are isolated, can only access their own data (except admins).

---

## Test 12: Activity Status Workflow

**Goal:** Verify activity status transitions work correctly.

### Steps:
1. [ ] User submits activity
2. [ ] **Verify:** Status is `pending_review`
3. [ ] Admin views activity in `/admin`
4. [ ] Admin clicks "Approve & Publish"
5. [ ] **Verify:** Status changes to `published`
6. [ ] **Verify:** Activity appears on homepage
7. [ ] Admin clicks "Reject"
8. [ ] **Verify:** Status changes to `rejected`
9. [ ] **Verify:** Activity does NOT appear on homepage
10. [ ] Admin clicks "Remove"
11. [ ] **Verify:** Status changes to `removed`, `is_deleted=true`
12. [ ] **Verify:** Activity does NOT appear anywhere

**Expected Result:** Status workflow functions correctly, only `published` activities are public.

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance Checks

- [ ] [ ] Homepage loads in < 3 seconds
- [ ] [ ] Images load progressively (no blocking)
- [ ] [ ] No console errors
- [ ] [ ] No network errors (404s, 500s)

---

## Version
**Version:** 2026-02-05  
**Last Updated:** Production deployment verification  
**Intended use:** Pre-deployment QA testing guide
