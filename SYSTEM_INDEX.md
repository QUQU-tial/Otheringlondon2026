# SYSTEM_INDEX.md

## Purpose
This document serves as a table of contents and onboarding guide for the Art Festival 2026 platform specification system.

**How to use this file:**
1. Read this file first to understand the system structure
2. Refer to specific specification files as needed
3. Use this file to understand how files work together

---

## Specification Files Overview

The system is organized into **9 specification files**, each with a clear, non-overlapping responsibility:

1. **DESIGN_TOKENS.md** - Visual primitives (colors, fonts, spacing, borders)
2. **Typography Mapping Table.md** - Text styling by semantic role
3. **LAYOUT_INTERACTION_SPEC.md** - Page models and scrolling behavior
4. **SPACE_SYSTEM_COMPLETE.md** - Global spacing rules
5. **SPACE_SYSTEM_DETAIL_PANEL.md** - Detail panel spacing specifics
6. **FORM_SCHEMA.md** - Data structure and validation
7. **FORM_PAGE_SPEC.md** - Form behavior and logic
8. **INTERACTION_MOTION_SPEC.md** - Interaction feedback and motion rules
9. **Project_scope.md** - Overall purpose and goals

**Note:** The system includes authentication (Supabase), navigation menu dropdown, login page, and dynamic label changes based on auth state.

---

## File-by-File Guide

### 1. DESIGN_TOKENS.md

**What it controls:**
- Color tokens (black, white, grays, backgrounds)
- Font families (Inter, Poppins, Source Sans 3)
- Spacing scale (4px, 12px, 16px, 24px, 30px, 36px, 60px)
- Border tokens (width, color, radius)
- Button tokens (primary, secondary, outlined)
- Responsive typography patterns
- Scrollbar and animation tokens

**What it MUST include:**
- All visual primitive values
- Token names and exact values
- Usage guidelines for each token

**What it MUST NOT include:**
- Component definitions
- Layout structures
- Page-specific rules
- Form field definitions
- Business logic

**When to use:**
- Implementing any visual styling
- Choosing colors, fonts, or spacing values
- Creating buttons or UI elements
- Setting up responsive typography

---

### 2. Typography Mapping Table.md

**What it controls:**
- Font family assignment by semantic role
- Font weight, size, line-height for each text role
- Text transform (uppercase, lowercase, capitalize, none)
- Text color for each role
- Responsive typography scaling

**What it MUST include:**
- Complete mapping of text roles to typography tokens
- Exact font sizes and line heights (with responsive formulas)
- Color assignments
- Transform rules

**What it MUST NOT include:**
- Layout or spacing rules
- Component structures
- Form field definitions
- Business logic

**When to use:**
- Styling any text element
- Choosing font family for a text role
- Setting font size and line height
- Applying text transforms

---

### 3. LAYOUT_INTERACTION_SPEC.md

**What it controls:**
- Page model types (Workspace vs Content)
- Panel structure and dimensions
- Scrolling behavior (independent vs single scroll)
- Responsive breakpoints (860px, 1440px)
- Fixed elements (sticky headers/footers)
- Scroll-triggered reveal animations

**What it MUST include:**
- Clear distinction between Workspace and Content pages
- Panel width rules and responsive behavior
- Scrolling rules for each page type
- Breakpoint definitions

**What it MUST NOT include:**
- Visual styling (colors, fonts, spacing)
- Form field definitions
- Component implementations
- Business logic

**When to use:**
- Determining page structure
- Implementing panel layouts
- Setting up scrolling behavior
- Adding responsive breakpoints

---

### 4. SPACE_SYSTEM_COMPLETE.md

**What it controls:**
- Global spacing rules across entire system
- Section spacing, dividers, padding logic
- Notion-like vertical rhythm
- Spacing for both Workspace and Content pages
- Form page spacing

**What it MUST include:**
- Complete spacing token reference
- Spacing for all major sections
- Panel spacing rules
- Form spacing rules
- Visual hierarchy summary

**What it MUST NOT include:**
- Typography rules
- Color definitions
- Component structures
- Business logic

**When to use:**
- Setting padding and margins
- Determining gaps between sections
- Creating vertical rhythm
- Spacing form fields

---

### 5. SPACE_SYSTEM_DETAIL_PANEL.md

**What it controls:**
- Spacing and layout rules specific to Workspace detail panels
- Image/text/link vertical rhythm
- Detail panel-specific spacing values
- Media links layout and spacing

**What it MUST include:**
- Detail panel container spacing
- Title block spacing
- Meta information spacing
- Body text and image spacing
- Media links spacing

**What it MUST NOT include:**
- Primary panel spacing (see SPACE_SYSTEM_COMPLETE.md)
- Typography rules
- Color definitions
- Form spacing

**When to use:**
- Implementing detail panel layout
- Spacing detail panel content
- Arranging media links
- Setting image spacing

---

### 6. FORM_SCHEMA.md

**What it controls:**
- All form field definitions (names, types, required/optional)
- Data structure (Submission type, Activity type)
- Status flow and transitions
- Identity locking rules (username vs author_name)
- Validation rules
- Image storage requirements

**What it MUST include:**
- Complete field list with types
- Required vs optional flags
- Editable vs locked rules
- Status definitions and transitions
- Validation requirements

**What it MUST NOT include:**
- UI or layout instructions
- Form behavior (see FORM_PAGE_SPEC.md)
- Visual styling
- Component structures

**When to use:**
- Defining form fields
- Implementing validation
- Understanding data structure
- Setting up status transitions

---

### 7. FORM_PAGE_SPEC.md

**What it controls:**
- Tab structure and navigation
- Save Draft vs Submit logic
- Button behavior (Next, Back, Submit, Save Draft)
- Validation rules and timing
- Modal behavior
- Image upload handling
- Rich text editor usage

**What it MUST include:**
- Tab navigation rules
- Save Draft vs Submit differences
- Button states and behaviors
- Validation timing
- Modal triggers

**What it MUST NOT include:**
- Data structure (see FORM_SCHEMA.md)
- Visual styling
- Layout rules (see LAYOUT_INTERACTION_SPEC.md)
- Spacing rules (see SPACE_SYSTEM_COMPLETE.md)

**When to use:**
- Implementing form behavior
- Setting up tab navigation
- Adding validation logic
- Creating button interactions

---

### 8. INTERACTION_MOTION_SPEC.md

**What it controls:**
- Hover behavior (when enabled, when disabled)
- Focus states (keyboard and mouse)
- Click/active feedback
- Tab switching behavior
- Modal entrance/exit
- Image upload feedback
- Disabled states (visual and interaction)
- Scroll-triggered reveals
- Workspace vs Form interaction intensity

**What it MUST include:**
- Complete interaction patterns
- Motion timing and transitions
- Accessibility rules (prefers-reduced-motion)
- When hover/focus/active states apply
- When interactions are disabled

**What it MUST NOT include:**
- Visual styling (colors, fonts - see DESIGN_TOKENS.md)
- Layout rules (see LAYOUT_INTERACTION_SPEC.md)
- Component structures
- Business logic

**When to use:**
- Implementing hover states
- Adding focus indicators
- Creating button interactions
- Implementing modals
- Adding scroll animations
- Ensuring accessibility

---

### 9. Project_scope.md

**What it controls:**
- Overall purpose and goals
- Target users (Partners, Admins, Public)
- Core flows and features
- Non-goals (out of scope)
- Success criteria

**What it MUST include:**
- Clear purpose statement
- User personas
- In-scope features
- Out-of-scope features
- Success metrics

**What it MUST NOT include:**
- Technical implementation details
- Design specifications
- Data structure details
- Layout rules

**When to use:**
- Understanding project goals
- Determining if a feature is in scope
- Onboarding new team members
- Making scope decisions

---

## How Files Work Together

### Visual Styling Flow

1. **DESIGN_TOKENS.md** → Provides color, font, spacing tokens
2. **Typography Mapping Table.md** → Maps tokens to text roles
3. **SPACE_SYSTEM_COMPLETE.md** → Defines spacing application
4. **SPACE_SYSTEM_DETAIL_PANEL.md** → Refines detail panel spacing

**Example:** Styling a detail panel title
- Use DESIGN_TOKENS.md for font family (Inter) and color (black)
- Use Typography Mapping Table.md for size (`clamp(40px, 4.17vw, 60px)`) and transform (capitalize)
- Use SPACE_SYSTEM_DETAIL_PANEL.md for spacing around title (16px gap)

---

### Layout Flow

1. **LAYOUT_INTERACTION_SPEC.md** → Determines page model (Workspace vs Content)
2. **SPACE_SYSTEM_COMPLETE.md** → Provides spacing for panels
3. **SPACE_SYSTEM_DETAIL_PANEL.md** → Refines detail panel layout

**Example:** Building a Workspace page
- Use LAYOUT_INTERACTION_SPEC.md to determine two-panel structure
- Use SPACE_SYSTEM_COMPLETE.md for panel padding (36px) and gaps (12px)
- Use SPACE_SYSTEM_DETAIL_PANEL.md for detail panel content spacing

---

### Form Implementation Flow

1. **FORM_SCHEMA.md** → Defines fields and data structure
2. **FORM_PAGE_SPEC.md** → Defines behavior and logic
3. **LAYOUT_INTERACTION_SPEC.md** → Determines Content Page model
4. **SPACE_SYSTEM_COMPLETE.md** → Provides form spacing
5. **DESIGN_TOKENS.md** → Provides button and input styling
6. **Typography Mapping Table.md** → Provides form text styling

**Example:** Building the submission form
- Use FORM_SCHEMA.md to list all fields (first_name, last_name, etc.)
- Use FORM_PAGE_SPEC.md to implement tab navigation and validation
- Use LAYOUT_INTERACTION_SPEC.md to ensure single scroll (Content Page)
- Use SPACE_SYSTEM_COMPLETE.md for form container and field spacing
- Use DESIGN_TOKENS.md for button styles (primary, outlined)
- Use Typography Mapping Table.md for form label and input text styling

---

## Decision Tree

**"Where do I find...?"**

- **Colors, fonts, spacing values** → DESIGN_TOKENS.md
- **How to style text** → Typography Mapping Table.md
- **Page structure (panels, scrolling)** → LAYOUT_INTERACTION_SPEC.md
- **Spacing between elements** → SPACE_SYSTEM_COMPLETE.md or SPACE_SYSTEM_DETAIL_PANEL.md
- **Form field definitions** → FORM_SCHEMA.md
- **Form behavior (tabs, validation)** → FORM_PAGE_SPEC.md
- **Hover, focus, click interactions** → INTERACTION_MOTION_SPEC.md
- **Project goals and scope** → Project_scope.md

---

## System Features

### Navigation & Authentication

**Workspace Menu Dropdown:**
- Located in Primary Panel header (right side)
- Menu items:
  - "All our partners" → `/partners` (map-based partner browsing page)
  - "Take part" → `/submit` (submission form)
  - "About us" → `/about-us` (placeholder page)
  - "Login" / "Logout" (dynamic based on auth state)
- Dropdown styling: Dark background (`#2d2d2d`), white text, Poppins Light (300), 16px
- Item borders: Light gray (`#e9e9f2`) between items
- Padding: `24px` horizontal, `16px` vertical per item
- Dropdown closes on outside click or item selection
- Instant appearance/disappearance (no animation)

**Login Page (`/login`):**
- Split-screen layout (left: billboard, right: form)
- Left panel hidden below 860px
- Form: email + password inputs, primary "Login" button
- Secondary action: "Take part" button (text-only style) below login button, links to `/submit`
- Error display: Inline text below form (no toast)
- Return path: Stores `returnTo` in sessionStorage, redirects after login

**Post-Login UI Changes:**
- Detail Panel: "Become a Partner" label changes to "My program" when logged in
- Same button style and placement, only label changes
- Uses existing auth state from `getCurrentUser()`

**Return Path Logic:**
- When user clicks "Login" from any page, current path stored as `returnTo` in sessionStorage
- After successful login, redirects to `returnTo` if present, otherwise `/`
- `returnTo` cleared after redirect

---

## Version
**Version: 2026-01-23  
**Source of truth:** Current codebase  
**Intended use:** System specification index and onboarding guide

---

## Version Control

All specification files include a version footer:

```
## Version
**Version: 2026-01-23
**Source of truth:** Current codebase
**Intended use:** Reusable system specification
```

**When updating:**
- Update version date
- Ensure source of truth matches current implementation
- Maintain strict responsibility boundaries

---

## Best Practices

1. **Read SYSTEM_INDEX.md first** to understand the system
2. **Use the decision tree** to find the right file
3. **Respect boundaries** - don't mix concerns between files
4. **Follow the flow** - use files in the order they work together
5. **Check version dates** - ensure you're using current specifications
6. **Current codebase is source of truth** - if spec conflicts with code, update spec

---

## Version
**Version: 2026-01-23  
**Source of truth:** Current codebase  
**Intended use:** System specification index and onboarding guide

