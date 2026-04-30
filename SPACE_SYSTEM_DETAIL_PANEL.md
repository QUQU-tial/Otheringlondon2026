# Detail Panel Space System

## Purpose
Spacing and layout rules specific to workspace detail panels.
Defines image/text/link vertical rhythm.

**Reference:** 1440px viewport width

---

## Space Token Reference
- `--space-1`: 4px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 30px
- `--space-6`: 36px
- `--space-7`: 60px

---

## Panel / Detail Container
- **Horizontal padding**: `36px` (space-6)
- **Vertical gap between sections**: `12px` (space-2)
- **Bottom padding**: `60px` (space-7) - ensures content is fully visible at end of scroll

---

## Menu 2 (Detail Panel Header)
- **Top padding**: `24px` (space-4) - responsive: `clamp(16px, 1.67vw, 24px)`
- **Bottom padding**: `12px` (space-2) - responsive: `clamp(8px, 0.83vw, 12px)`
- **Horizontal padding**: Inherits from container (`36px`)
- **Position**: Sticky top, z-index 10

---

## Main Content Container
- **Gap between major sections**: `36px` (space-6)
  - Between: Title section, Body text 1, Image 1, Body text 2, Image 2, Media links

---

## Title Section Wrapper
- **Gap**: `24px` (space-4)
  - Between: Title block (title + author + image) and Location/Date block

---

## Title Block (Title + Author + Image)
- **Gap**: `16px` (space-3)
  - Between: Title, Author line, Primary Image

### Author Line
- **Gap between "by" and name**: `4px` (space-1)

### Primary Image
- **Height**: `388px` (fixed)
- **Border**: `1px solid #9CA3AF` (gray-400)
- **Object fit**: `cover`

---

## Location/Date Section
- **Gap between Location and Date rows**: `4px` (space-1)
- **Gap between label and value** (within each row): `16px` (space-3)

**Location Row:**
- Label: Auto width (hugs content)
- Value: Auto width (hugs content), no flex-1

**Date Row:**
- Label: Auto width (hugs content)
- Value: Auto width (hugs content)

---

## Website Button / Media Links Section
- **Padding** (per link): 
  - Horizontal: `24px` (space-4)
  - Vertical: `4px` (space-1)
- **Width**: `shrink-0` (hugs content, NOT full width)
- **Gap between links**: `16px` (space-3) - inline flex with wrap
- **Gap to next section**: `36px` (space-6) - from main container gap
- **Separator**: Dot (·) between Website and additional media links
  - Same typography styling as links
  - Only shown when both website link and additional media links exist

**Link Display:**
- Website link: Label is "Website" (not the URL)
- Additional media links: Label is `media_name` from form data

---

## Category/Organisers Section
- **Gap between Category and Organisers rows**: `4px` (space-1)
- **Gap between label and value** (within each row): `16px` (space-3)

**Category Row:**
- Label and value: Auto width (hug content)

**Organisers Row:**
- Label and value: Auto width (hug content)
- Organiser link: Underlined, Inter 600 weight

---

## Body Text Sections
- **Gap**: Inherits from main container (`36px` space-6)
  - Between Body text 1 and Image 1
  - Between Image 1 and Body text 2
  - Between Body text 2 and Image 2

**Body Text:**
- Renders HTML content from rich text editor
- Uses `dangerouslySetInnerHTML`
- Links are styled with underline

**Images:**
- **Aspect ratio**: `538/319` (for additional_images_1)
- **Additional images 2**: Array of images, each with `538/319` aspect ratio
- **Gap between multiple images**: `12px` (space-2)
- **Border**: `1px solid #9CA3AF` (gray-400)
- **Object fit**: `cover`

---

## Summary Structure

```
Panel / Detail (gap: 12px, px: 36px, pb: 60px)
├── Menu 2 (pt: 24px, pb: 12px, sticky)
└── Main Content (gap: 36px)
    ├── Title Section Wrapper (gap: 24px)
    │   ├── Title Block (gap: 16px)
    │   │   ├── Title
    │   │   ├── Author (gap: 4px)
    │   │   └── Primary Image (h: 388px)
    │   └── Location/Date (gap: 4px between rows, 16px label-value)
    ├── Website Button / Media Links (px: 24px, py: 4px, gap: 16px, shrink-0)
    │   ├── Website (label: "Website")
    │   ├── · (separator dot)
    │   └── Media Link 1, Media Link 2, ...
    ├── Category/Organisers (gap: 4px between rows, 16px label-value)
    ├── Body Text 1 (HTML content)
    ├── Image 1 (aspect: 538/319)
    ├── Body Text 2 (HTML content)
    └── Image 2 (array, aspect: 538/319 each, gap: 12px)
```

---

## Key Principles

1. **Vertical Rhythm**: Consistent `36px` gaps between major content sections
2. **Tight Grouping**: `4px` for related meta information (Location/Date, Category/Organisers)
3. **Content Grouping**: `16px` for label-value pairs and title block elements
4. **Auto Width**: All meta values hug content (no flex-1)
5. **Button/Link Sizing**: All links hug content with padding (not full width)
6. **Image Consistency**: Fixed heights/aspect ratios for visual stability
7. **Bottom Padding**: `60px` ensures content is never clipped at end of scroll

---

## Version
**Version: 2026-01-23  
**Source of truth:** Current codebase (`app/page.tsx`)  
**Intended use:** Reusable system specification
