# Typography Mapping Table

## Purpose
Maps typography tokens to semantic roles across the system.
Defines font family, weight, size, line-height, transform, and color for each text role.

---

## A. Primary Panel (Workspace)

| Visual Role | UI Area | Font | Weight | Size / Line Height | Transform | Color | Notes |
|-------------|---------|------|--------|-------------------|-----------|-------|-------|
| Logo | Primary Header (Left) | Inter | 700 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Uppercase | White | "OT FESTIVAL" |
| Menu Link | Primary Header (Right) | Inter | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | White | "Menu", "Admin" |
| Dropdown Menu Item | Menu Dropdown | Poppins | 300 | `16px` / `normal` | None | White | "All our partners", "Take part", "About us", "Login", "Logout" |
| Hero Title (Selected) / Display XXL | Primary Panel Main Title | Inter | 700 (bold) | `clamp(96px, calc(-160px + 25vw), 240px)` / `clamp(62.4px, calc(-104px + 16.25vw), 156px)` | Uppercase | White | Selected activity title (very large display type). **Word-breaking rule:** `hyphens: auto` (language-aware), `hyphenate-character: ""` (no visible hyphens), `word-break: normal`, `overflow-wrap: break-word`. Applied via `.hero-title-hyphenate` class. Required for user-generated content that cannot be manually line-broken. |
| Activity List Item | Primary Panel List | Inter | 500 | `clamp(20px, 2.08vw, 36px)` / `clamp(20px, 2.08vw, 36px)` | Uppercase | `#E1E1E1` (unselected) | Each activity (non-selected) |
| CTA Button | Primary Footer | Inter | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Uppercase | White | "Join us →" |

---

## B. Detail Panel (Workspace)

| Visual Role | UI Area | Font | Weight | Size / Line Height | Transform | Color | Notes |
|-------------|---------|------|--------|-------------------|-----------|-------|-------|
| Nav Link | Detail Header | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | Black | "View all programmes", "Become a Partner" |
| Main Title | Detail Content Title | Inter | 500 | `clamp(40px, 4.17vw, 60px)` / `clamp(40px, 4.17vw, 60px)` | Capitalize | Black | Activity title, tracking: `-4.8px` |
| Author Prefix | Detail Author Line | Poppins | 500 | `clamp(12px, 0.97vw, 14px)` / `normal` | Capitalize | Black | "by" |
| Author Name | Detail Author Line | Poppins | 500 | `clamp(12px, 0.97vw, 14px)` / `normal` | Capitalize | Black | Artist / organiser (author_name or username fallback) |
| Meta Label | Detail Meta Section | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | Black | "Location:", "Date:", "Category:", "Organisers / Partners:" |
| Meta Value | Detail Meta Section | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Lowercase | Black | Location / date text |
| Website Button | Detail Footer Links | Inter | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Uppercase | Black | "Website" (text link button) |
| Media Link | Detail Footer Links | Inter | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Uppercase | Black | Additional media links (media_name) |
| Category Label | Detail Category | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | Black | "Category:" |
| Category Value | Detail Category | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | Black | Category text |
| Organisers Label | Detail Organisers | Source Sans 3 | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize | Black | "Organisers / Partners:" |
| Organisers Link | Detail Organisers | Inter | 600 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Capitalize + Underline | Black | Clickable partner link |
| Body Text | Detail Content | Poppins | 500 | `clamp(12px, 0.97vw, 14px)` / `normal` | None | Black | Long-form paragraphs (HTML content from rich text editor) |

---

## C. Form Page (Submission)

| Visual Role | UI Area | Font | Weight | Size / Line Height | Transform | Color | Notes |
|-------------|---------|------|--------|-------------------|-----------|-------|-------|
| Page Title | Form Header | Inter | 500 | `clamp(40px, 4.17vw, 60px)` / `clamp(40px, 4.17vw, 60px)` | Capitalize | Black | "Submission Form" |
| Tab Label | Tab Navigation | Inter | 500 | `16px` / `24px` | None | Black / Black 50% | "Basic Info", "About the Exhibition", "Links / Media" |
| Form Label | Form Field | Inter | 500 | `12px` / `16px` | Uppercase | Black | Field labels with asterisk for required |
| Input Text | Form Field | Inter | 400 | `16px` / `24px` | None | Black | Input values |
| Helper Text | Form Field | Inter | 400 | `12px` / `16px` | None | Black 70% | Helper/hint text below inputs |
| Button Text | Form Actions | Inter | 500 | `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)` | Uppercase | Black / White | "Save Draft", "Next", "Submit", "Back" |
| Terms Text | Terms Section | Inter | 400 | `14px` / `20px` | None | Black 80% | Terms and conditions text |

---

## Font Family Summary

**Inter**
- Logo
- Primary CTA / Buttons
- Detail Main Title
- Form labels, inputs, buttons
- Menu links
- Hero title (Primary Panel)
- Activity list items
- Website/media link buttons

**Poppins**
- Author prefix ("by")
- Author name
- Body text (long paragraphs)

**Source Sans 3**
- Navigation (Detail Panel)
- Meta labels (Location, Date, Category, Organisers)
- Meta values (location/date text)

---

## Responsive Typography Rules

1. **Primary Panel Hero Title**: Uses complex `clamp()` formula for linear scaling between 1280px (160px) and 1440px (200px)
2. **All other text**: Uses standard `clamp(min, preferred, max)` pattern
3. **Line heights**: Scale proportionally with font-size using `clamp()`
4. **Fixed sizes**: Form labels and helper text remain fixed (not responsive)

---

## Word-Breaking Rules

### Hero Title (Primary Panel) - Special Word-Breaking Behavior

**Scope:** ONLY applies to the Hero Title (Display XXL) in the Primary Panel.

**Implementation:**
- CSS class: `.hero-title-hyphenate`
- `hyphens: auto` - Enables language-aware hyphenation
- `hyphenate-character: ""` - Suppresses visible hyphen characters
- `word-break: normal` - Prevents aggressive breaking (no `break-all`)
- `overflow-wrap: break-word` - Allows breaking when necessary

**Rationale:**
- Hero titles are user-generated content and cannot be manually line-broken
- Large-scale display type requires proper syllable-based breaking
- Classic print typography approach adapted for web
- No visible hyphens maintain clean visual appearance

**Important:** 
- This rule applies ONLY to the Hero Title
- Body text, smaller headings, and all other typography use default word-breaking behavior
- No manual line breaks (`<br>`) or JavaScript string manipulation should be used

---

## Version
**Version:** 2026-02-05  
**Source of truth:** Current codebase (`app/page.tsx`, `app/submit/page.tsx`, `app/login/page.tsx`, `app/about-us/page.tsx`, `app/partners/page.tsx`, `app/globals.css`)  
**Intended use:** Reusable typography specification
