# LAYOUT_INTERACTION_SPEC.md

## Purpose
Defines layout logic, scrolling behavior, and responsiveness.
This file controls **structure only**, never visual styling.

All rules in this file are **authoritative and non-negotiable**.
Do not infer, invent, or substitute alternative structures.

---

## 1. Page Model Types

The system supports **exactly two** page models.
These models are mutually exclusive and must never be mixed.

---

### 1.1 Workspace Pages

**Examples:**
- Public exhibition browsing (master–detail)
- Gallery list + detail interfaces

**Characteristics:**
- Multi-panel layout (exactly two panels)
- Panels are role-based: `Panel / Primary` and `Panel / Detail`
- Independent panel scrolling (each panel scrolls separately)
- Fixed top and bottom bars (menu bars, footers)
- Scrollbars are always hidden (invisible)

**Workspace Pages exist to manage stateful interaction.**

---

### 1.2 Content Pages

**Examples:**
- Submission form (`/submit`)
- Admin review pages (`/admin`)
- Login page (`/login`)
- About us page (`/about-us`)
- Partners page (`/partners`)
- Blog pages, preview pages

**Characteristics:**
- Single vertical page scroll
- No independent panel scrolling
- Max-width content containers allowed (e.g., `max-w-[874px]`)
- No fixed top/bottom bars (unless explicitly specified)

**Content Pages exist to present linear content or input flows.**

---

## 2. Workspace Page Rules (Master–Detail)

These rules apply **only** to Workspace Pages.

---

### 2.1 Panel Structure

A Workspace Page consists of **exactly two panels**:

- `Panel / Primary`
- `Panel / Detail`

No additional panels are permitted.

**Panel roles are semantic** and must not be replaced with:
- Left / Right
- Sidebar / Main
- Aside / Content

---

### 2.2 Panel Dimensions

**At 1440px viewport (reference):**
- `Panel / Primary`: Fixed width `720px`
- `Panel / Detail`: Flexible width, minimum `720px`, expands to fill remaining space

**Below 1440px (down to 860px):**
- Both panels: Equal widths, `clamp(430px, 50vw, 720px)`
- Minimum width: `430px` each

**Below 860px (mobile):**
- Panels stack vertically (flex-direction: column)
- Both panels: Full width (`100%`)
- User scrolls to read detail panel below primary panel

**Above 1440px:**
- `Panel / Primary`: Fixed `720px`
- `Panel / Detail`: Expands to fill remaining viewport width

---

### 2.3 Scrolling Behavior

- `Panel / Primary` scrolls independently (internal scroll container)
- `Panel / Detail` scrolls independently (internal scroll container)
- The page itself must not scroll
- Scrollbars are always hidden (CSS class `scrollbar-hide`)

---

### 2.4 Fixed Elements

- Top menu bars are fixed (sticky positioning)
- Bottom footers are fixed (sticky positioning)
- Fixed elements do not participate in panel scrolling
- Fixed elements use backdrop blur for visual separation

---

### 2.5 Panel Background Colors

- `Panel / Primary`: `#1C1C1C` (dark background)
- `Panel / Detail`: `#FFFFFF` (white background)

---

## 3. Content Page Rules

These rules apply **only** to Content Pages.

---

### 3.1 Scrolling Model

- The page itself is the only scroll container
- No internal or independent scroll regions are permitted
- Standard browser scroll behavior

---

### 3.2 Structural Constraints

Content Pages must not include:
- `Panel / Primary`
- `Panel / Detail`
- Any element named `Panel`

Side panels must never be inferred or added unless a separate spec explicitly overrides this rule.

---

### 3.3 Content Container

- Max-width: `874px` (form pages, about-us page)
- Centered: `margin: 0 auto`
- Horizontal padding: `36px`
- Vertical padding: `36px`

### 3.4 Split-Screen Layout (Login Page)

**Login Page (`/login`):**
- Left-right split layout
- **Left Panel (Billboard):**
  - Background: `#1C1C1C` (dark)
  - Hidden below 860px (mobile: full-width form only)
  - Content: Festival name + short copy
  - Padding: `36px` horizontal
  - Centered content with max-width `400px`
- **Right Panel (Form):**
  - Background: `#FFFFFF` (white)
  - Full width on mobile, 50% on desktop
  - Content: Login form (email, password, submit button)
  - Padding: `36px` horizontal and vertical
  - Max-width: `400px`, centered
- Single page scroll (Content Page model)

---

## 4. Responsive Layout Switch

**Breakpoint: 860px**

When viewport width is **less than 860px**:

- Workspace Pages: Horizontal layouts switch to vertical stacking
- Stacking order: `Panel / Primary` first, then `Panel / Detail`
- Content Pages: No layout change (single scroll remains)

**Rules:**
- This switch is **layout-based only**
- Typography does not change based on this breakpoint
- Panel roles remain unchanged when stacked
- Left / Right orientation must not be inferred

---

## 5. Scroll-Triggered Reveals

**Workspace Pages only:**

- Content elements use `reveal-content` class
- Image elements use `reveal-image` class
- Reveal animation: `opacity: 0 → 1`, `translateY: 16px → 0`
- Timing: `1000ms ease-out`
- Image delay: `200ms` after text
- Uses `IntersectionObserver` API

**Accessibility:**
- Respects `prefers-reduced-motion`
- Animations disabled when motion preference is reduced

---

## 6. Enforcement Rules (Critical)

- Page model type must be determined before layout implementation
- Workspace rules must never leak into Content Pages
- Content rules must never be relaxed by assumption
- If ambiguity exists, **Content Page rules take precedence**

Any deviation from this specification is considered incorrect.

---

## Version
**Version:** 2026-01-23  
**Source of truth:** Current codebase (`app/page.tsx`, `app/globals.css`, `app/login/page.tsx`, `app/partners/page.tsx`)  
**Intended use:** Reusable system specification
