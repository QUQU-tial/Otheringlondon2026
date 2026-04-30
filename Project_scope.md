# Project Scope

## Purpose
Defines the overall purpose, target users, core flows, non-goals, and success criteria for the Art Festival 2026 platform.

---

## Goal

Build an MVP art / exhibition platform for approximately 30 partner organisations or artists.

**Core Functionality:**
- Partners can register accounts, submit exhibition or activity content, and edit drafts
- All submissions must be reviewed by an admin before being publicly published
- Public-facing pages display **approved and published content only**

---

## Target Users

### Partners (Artists/Organizations)
- Individual artists or organizations
- Can register accounts and submit content
- Can save drafts and edit submissions
- Can resubmit after rejection

### Administrators
- Review and manage submissions
- Approve or reject submissions
- Publish approved content
- Remove published content

### Public Visitors
- Browse published exhibitions/activities
- View detailed activity information
- Access external links (websites, media)

---

## In Scope (MVP)

### Public Pages

**Workspace Page Model:**
- Public exhibition browsing uses a **Workspace Page model**
- Layout follows a **master–detail structure**:
  - **Primary Panel**: List of all published activities / exhibitions
  - **Detail Panel**: Detailed view of the currently selected activity / exhibition
- Interaction rules:
  - Selecting an item in the Primary Panel updates the Detail Panel
  - On small screens (< 860px), panels stack vertically
  - Selecting an item scrolls to the Detail Panel on mobile
- Scroll-triggered reveal animations for editorial feel
- No Gallery Grid layout in MVP (list-based navigation only)

**Navigation Menu:**
- Menu dropdown in Primary Panel header
- Menu items:
  - "All our partners" → navigates to `/partners` (map-based visitor browsing page)
  - "Take part" → navigates to `/submit`
  - "About us" → navigates to `/about-us`
  - "Login" / "Logout" (dynamic based on auth state)
- Dropdown styling: Dark background (`#2d2d2d`), white text, Poppins Light font
- Dropdown closes on outside click or item selection
- Post-login label change: "Become a Partner" (Detail Panel) becomes "My program" when logged in

**Partners Page (`/partners`):**
- Content Page model (single scroll)
- Placeholder for map-based partner browsing
- Consistent styling with other content pages

---

### Partner Registration & Access

- Partner account registration (Basic Info form)
- Each partner represents an individual artist or organisation
- Identity fields (`first_name`, `last_name`, `username`) locked after first submission
- Display name (`author_name`) always editable
- Authentication via Supabase Auth (email/password)
- Passwords managed by Supabase Auth only (never stored in database)
- User profiles stored in `profiles` table (username, role)
- Login page with split-screen layout (billboard left, form right)
- Login form: Email + password inputs, primary "Login" button
- Secondary action: "Take part" button (text-only style) below login button, links to `/submit`
- Logout functionality redirects to public landing page
- Return path storage: When user clicks "Login" from any page, current path is stored as `returnTo`; after successful login, redirects to `returnTo` if present, otherwise `/`

---

### Partner Submission Form

**Content Page Model:**
- Submission form uses **Content Page model** (single scroll)
- Form split into **three tabs**:
  - **Basic Info**: Partner account and registration information
  - **About the Exhibition / Activity**: Content with strict order, image uploads, rich text
  - **Links / Media**: Website link and optional additional media links
- Partners can:
  - Create new submissions
  - Save drafts (status: `draft`, no validation required)
  - Submit for review (status: `pending_review`, validation required)
  - Edit drafts or previously approved content

**Form Features:**
- Rich text editor for long descriptions
- Image upload (Supabase Storage or data URL fallback)
- Tab navigation (Next/Back buttons)
- Save Draft always available
- Submit only on final tab (disabled until valid + terms accepted)

---

### Admin Review

**Minimal Admin System:**
- Admin users can review submitted content
- Admin list shows only submitted items (filters out `draft` status)
- Admin actions:
  - **Approve & Publish**: Sets status to `published`, adds to activities list
  - **Reject**: Sets status to `rejected`
  - **Remove**: Sets `is_deleted: true`, removes from activities list
- Read-only detail view (no editing UI)
- No pagination, filters, search, or bulk actions

---

### Publishing & Status Workflow

**Status Flow:**
```
draft → pending_review → approved → published
                              ↓
                          rejected (can resubmit)
```

**Status Rules:**
- Only content with status `published` is visible on public pages
- Editing any `approved` or `published` content resets status to `pending_review`
- Drafts are not visible to admins
- Rejected submissions can be edited and resubmitted

---

### Data & Content Rules

**Schema Compliance:**
- All fields, validation rules, image requirements, alt text, and content order must strictly follow `FORM_SCHEMA.md`

**Visual Styling:**
- Black & white visual system only
- Must follow `DESIGN_TOKENS.md` for colors, fonts, spacing
- Must follow `Typography Mapping Table.md` for text styling
- Must follow `SPACE_SYSTEM_COMPLETE.md` for spacing

**Layout & Interaction:**
- Must follow `LAYOUT_INTERACTION_SPEC.md` for page models and scrolling
- Workspace Pages: Master–detail layout with independent scrolling
- Content Pages: Single scroll, max-width containers

---

## Out of Scope (MVP)

- Payment processing or ticket sales
- Advanced analytics or reporting dashboards
- Multi-language support
- Notifications, comments, likes, or social features
- Gallery Grid layout (possible future expansion)
- Password reset functionality
- Email notifications
- Search functionality
- Pagination or infinite scroll
- Advanced admin features (bulk actions, filters, search)
- User registration (partners register via submission form)

---

## Key Principles

1. **Avoid over-engineering**: Finish usable flows before adding complexity
2. **Visual structure first**: Layout and interaction rules defined before implementation
3. **Specification-driven**: All implementation must follow provided specification files
4. **Black & white only**: No color variations beyond grayscale
5. **Reusable patterns**: Workspace components and button styles reused across pages
6. **Editorial feel**: Scroll-triggered reveals, calm interactions, respects `prefers-reduced-motion`

---

## Success Criteria

**Functional:**
- Partners can register and submit content
- Admins can review and publish content
- Public visitors can browse published exhibitions
- All status transitions work correctly
- Identity fields lock after first submission
- Display name logic works (author_name fallback to username)

**Technical:**
- All pages follow specified layout models (Workspace vs Content)
- All styling follows design tokens and typography mapping
- All spacing follows space system specifications
- Form validation works correctly
- Image upload and storage works (Supabase or data URL fallback)

**User Experience:**
- Clear visual hierarchy
- Consistent spacing and typography
- Smooth interactions (with motion preference respect)
- Accessible (alt text, semantic HTML)

---

## Version
**Version: 2026-01-23  
**Source of truth:** Current codebase (`app/page.tsx`, `app/submit/page.tsx`, `app/admin/page.tsx`, `app/login/page.tsx`, `app/about-us/page.tsx`, `app/partners/page.tsx`, `app/lib/auth.ts`)  
**Intended use:** Reusable system specification
