# DESIGN_TOKENS.md

## Purpose
Single source of truth for visual primitives.
These tokens are **immutable constants**.
Do not invent new values.

---

## 1. Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-black` | `#000000` | Primary text, borders, buttons |
| `--color-white` | `#FFFFFF` | Backgrounds, text on dark |
| `--color-primary-bg` | `#1C1C1C` | Primary panel background |
| `--color-detail-bg` | `#FFFFFF` | Detail panel background |
| `--color-text-muted` | `#E1E1E1` | Unselected activity list items |
| `--color-text-placeholder` | `#999999` | Placeholder text |
| `--color-text-meta` | `#9A9A9A` | White-site muted nav, A–Z letters, artist field labels |
| `--color-selection` | `#FF0000` | Workspace activity-list hover; selected artist name in the A–Z list |
| `--color-border` | `#000000` | Borders (20% opacity: `rgba(0, 0, 0, 0.2)`) |
| `--color-gray-300` | `#D1D5DB` | Workspace / event **image placeholders only**. Do **not** use on `/artists` empty slots |
| `--color-gray-400` | `#9CA3AF` | Image borders |
| `--color-gray-600` | `#4B5563` | Secondary text |
| `--color-dropdown-bg` | `#2d2d2d` | Dropdown menu background |
| `--color-dropdown-border` | `#e9e9f2` | Dropdown menu item borders |

**Rules:**
- Black & white visual system only
- No color variations beyond grayscale
- Opacity used for borders and overlays only

---

## 2. Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-inter` | `Inter` | Primary UI font (body, buttons, labels) |
| `--font-poppins` | `Poppins` | Display font (author names, body text) |
| `--font-source-sans-3` | `Source Sans 3` | Navigation, meta labels, meta values |

**Font Loading:**
- Inter: Variable font, subsets: latin, display: swap
- Poppins: Weights 400, 500, 600, 700, subsets: latin, display: swap
- Source Sans 3: Loaded via CSS variable (if available)

---

## 3. Spacing Tokens (px)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Minimal spacing, tight groups (author line, label-value pairs) |
| `--space-2` | `12px` | Section gaps, menu padding, vertical rhythm |
| `--space-3` | `16px` | Content grouping, label-value spacing, button gaps |
| `--space-4` | `24px` | Menu top padding, footer bottom padding, title wrapper gaps |
| `--space-5` | `30px` | Activity list item spacing |
| `--space-6` | `36px` | Major section gaps, horizontal padding |
| `--space-7` | `60px` | Page-level separation, bottom padding |

**Rules:**
- Do not use spacing values outside this scale
- All spacing is fixed pixel values at 1440px reference
- Responsive scaling uses `clamp()` for typography only, not spacing

---

## 4. Border Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width` | `1px` | Standard border width |
| `--border-color` | `rgba(0, 0, 0, 0.2)` | Standard border color (20% opacity) |
| `--border-radius` | `2px` | Standard border radius (form inputs, images) |
| `--border-radius-lg` | `4px` | Large border radius (modals, containers) |

---

## 5. Button Tokens

### Primary Button (Black Background)
- Background: `#000000`
- Text: `#FFFFFF`
- Padding: `24px` horizontal, `4px` vertical
- Border: None
- Font: Inter, medium weight, uppercase
- Font size: `clamp(16px, 1.39vw, 20px)`
- Line height: `clamp(24px, 2.08vw, 30px)`
- Hover: `opacity: 0.9` or `background: rgba(0, 0, 0, 0.9)`

### Secondary Button (Text Only)
- Background: Transparent
- Text: `#000000`
- Padding: `24px` horizontal, `4px` vertical
- Border: None
- Font: Inter, medium weight, uppercase
- Font size: `clamp(16px, 1.39vw, 20px)`
- Line height: `clamp(24px, 2.08vw, 30px)`
- Hover: `opacity: 0.7`

### Save Draft Button (Outlined)
- Background: Transparent
- Text: `#000000`
- Padding: `24px` horizontal, `4px` vertical
- Border: `1px solid #000000`
- Font: Inter, medium weight, uppercase
- Font size: `clamp(16px, 1.39vw, 20px)`
- Line height: `clamp(24px, 2.08vw, 30px)`
- Hover: `opacity: 0.7`

**Rules:**
- Buttons use responsive typography via `clamp()`
- Padding remains fixed (not responsive)
- All buttons are `shrink-0` (hug content)

---

## 6. Responsive Typography

Typography scales using CSS `clamp()` with viewport width.

**Reference Breakpoints:**
- 1280px: Minimum viewport
- 1440px: Reference viewport (design target)
- Maximum: No upper limit (typography continues scaling)

**Common Patterns:**
- Menu/Navigation: `clamp(16px, 1.39vw, 20px)` / `clamp(24px, 2.08vw, 30px)`
- Page Titles: `clamp(40px, 4.17vw, 60px)` / `clamp(40px, 4.17vw, 60px)`
- Hero Title (Primary Panel): `clamp(96px, calc(-160px + 25vw), 240px)` / `clamp(62.4px, calc(-104px + 16.25vw), 156px)` - Uses language-aware hyphenation (`hyphens: auto`) with suppressed visible hyphens (`hyphenate-character: ""`) for user-generated content
- Activity List Items: `clamp(20px, 2.08vw, 36px)` / `clamp(20px, 2.08vw, 36px)`

**Rules:**
- Only typography scales responsively
- Spacing, padding, and layout remain fixed
- Use `clamp(min, preferred, max)` format

---

## 7. Scrollbar Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `scrollbar-hide` | CSS class | Hides scrollbars completely (always invisible) |

**Implementation:**
- `-ms-overflow-style: none` (IE/Edge)
- `scrollbar-width: none` (Firefox)
- `::-webkit-scrollbar { display: none }` (Chrome/Safari)

---

## 8. Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-base` | `200ms` | Standard hover transitions |
| `--transition-slow` | `1000ms` | Scroll-triggered reveals |
| `--transition-delay` | `200ms` | Image reveal delay |
| `--transition-image` | `400ms` | Observational image hover (`opacity`, `filter`) |
| `--easing-out` | `ease-out` | Default hover / reveal easing |
| `--easing-editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | Already used by `.othering-enter`; reuse for artist billboard squeeze |
| `--transition-editorial` | `700ms` | Artist billboard `left` / `width` squeeze only |

**Rules:**
- Respect `prefers-reduced-motion`
- Animations disabled when motion preference is reduced
- Default timing function is `ease-out`
- Billboard squeeze uses `--easing-editorial` at `700ms`; compressed-card image fade uses the same easing at `500ms`

**Artists image assets (sizes, not spacing):**
- Directory grid thumbnail: `96px × 96px`
- Billboard expanded work/portrait: up to `480px` (also capped at `70%` height / `55%` width of the expanded peek)
- Filter checkbox: `12px × 12px`, radius `2px`, black border; checked fill `#000000`

---

## Version
**Version:** 2026-08-17  
**Source of truth:** Current codebase (`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/artists/page.tsx`, `app/submit/page.tsx`, `app/login/page.tsx`)  
**Intended use:** Reusable system specification
