# Complete Space System Documentation

## Purpose
Global spacing rules across the entire system.
Defines section spacing, dividers, padding logic, and Notion-like rhythm.

**Reference:** 1440px viewport width

---

## Space Token Reference

| Token | Value (px) | Usage |
|-------|------------|-------|
| `--space-1` | `4px` | Minimal spacing, tight groups (author line, label-value pairs, checkbox spacing) |
| `--space-2` | `12px` | Section gaps, menu padding, vertical rhythm between major sections |
| `--space-3` | `16px` | Content grouping, label-value spacing, button gaps, title block elements |
| `--space-4` | `24px` | Menu top padding, footer bottom padding, title wrapper gaps, button horizontal padding |
| `--space-5` | `30px` | Activity list item spacing |
| `--space-6` | `36px` | Major section gaps, horizontal padding (panels, containers) |
| `--space-7` | `60px` | Page-level separation, bottom padding (detail panel end) |

---

## PANEL / PRIMARY

### Container
- **Width**: `720px` (fixed at 1440px+)
- **Min Width**: `430px` (below 1440px)
- **Vertical gap between sections**: `12px` (space-2)
  - Between: Menu, Activity List, Footer

---

### Menu 1 (Primary Panel Header)
- **Top padding**: `24px` (space-4) - responsive: `clamp(16px, 1.67vw, 24px)`
- **Bottom padding**: `12px` (space-2) - responsive: `clamp(8px, 0.83vw, 12px)`
- **Horizontal padding**: `36px` (space-6)
- **Background**: `#1C1C1C` (matches panel background)
- **Position**: Sticky top, z-index 10

---

### Activity List Container
- **Horizontal padding**: `36px` (space-6)
- **Vertical gap between items**: `30px` (space-5)
  - Between: Hero title (selected activity), Activity list items

**Activity List Items:**
- All activities are part of the same list with `30px` gap between each item
- No additional spacing for selected vs non-selected items
- Hero title (selected) uses same spacing as list items

---

### Footer (JOIN US Section)
- **Top padding**: `12px` (space-2) - responsive: `clamp(8px, 0.83vw, 12px)`
- **Bottom padding**: `24px` (space-4) - responsive: `clamp(20px, 1.67vw, 24px)`
- **Horizontal padding**: `36px` (space-6)
- **Position**: Sticky bottom

**JOIN US Button:**
- **Gap between text and arrow**: `12px` (space-2)

---

## PANEL / DETAIL

### Container
- **Width**: Flexible (minimum `720px` at 1440px+)
- **Vertical gap between sections**: `12px` (space-2)
  - Between: Menu and Content
- **Horizontal padding**: `36px` (space-6)
- **Bottom padding**: `60px` (space-7) - ensures content is fully visible

---

### Menu 2 (Detail Panel Header)
- **Top padding**: `24px` (space-4) - responsive: `clamp(16px, 1.67vw, 24px)`
- **Bottom padding**: `12px` (space-2) - responsive: `clamp(8px, 0.83vw, 12px)`
- **Horizontal padding**: Inherits from container (`36px` space-6)
- **Background**: `#FFFFFF` (matches panel background)
- **Position**: Sticky top, z-index 10

---

### Main Content Container
- **Gap between major sections**: `36px` (space-6)
  - Between: Title section, Body text 1, Image 1, Body text 2, Image 2, Media links

---

### Title Section Wrapper
- **Gap**: `24px` (space-4)
  - Between: Title block (title + author + image) and Location/Date block

---

### Title Block (Title + Author + Image)
- **Gap**: `16px` (space-3)
  - Between: Title, Author line, Primary Image

**Author Line:**
- **Gap between "by" and name**: `4px` (space-1)

---

### Location/Date Section
- **Gap between Location and Date rows**: `4px` (space-1)
- **Gap between label and value** (within each row): `16px` (space-3)

**Location Row:**
- Label: Auto width (hugs content)
- Value: Auto width (hugs content), no flex-1

**Date Row:**
- Label: Auto width (hugs content)
- Value: Auto width (hugs content)

---

### Website Button / Media Links
- **Padding**: 
  - Horizontal: `24px` (space-4)
  - Vertical: `4px` (space-1)
- **Width**: `shrink-0` (hugs content, NOT full width)
- **Gap between links**: `16px` (space-3) - inline flex with wrap
- **Gap to next section**: `36px` (space-6) - from main container gap
- **Separator**: Dot (·) between Website and additional media links, same typography as links

---

### Category/Organisers Section
- **Gap between Category and Organisers rows**: `4px` (space-1)
- **Gap between label and value** (within each row): `16px` (space-3)

**Category Row:**
- Label and value: Auto width (hug content)

**Organisers Row:**
- Label and value: Auto width (hug content)

---

### Body Text Sections
- **Gap**: Inherits from main container (`36px` space-6)
  - Between Body text 1 and Image 1
  - Between Image 1 and Body text 2
  - Between Body text 2 and Image 2

---

## FORM PAGE SPACING

### Container
- **Max-width**: `874px`
- **Horizontal padding**: `36px` (space-6)
- **Vertical padding**: `36px` (space-6)

### Page Title
- **Bottom margin**: `36px` (space-6)

### Tabs
- **Gap between tabs**: `16px` (space-3)
- **Bottom margin**: `36px` (space-6)
- **Bottom border**: `1px solid black`

### Banner
- **Bottom margin**: `36px` (space-6)

### Form Fields (Table Rows)
- **Vertical padding**: `16px` (space-3) per row
- **Horizontal padding**: `16px` (space-3) per row
- **Border between rows**: `1px solid rgba(0, 0, 0, 0.1)`
- **Gap between label and input**: `16px` (space-3)
- **Gap between input and helper text**: `8px` (if helper text exists)

### Action Buttons
- **Gap between buttons**: `16px` (space-3)
- **Top padding**: `24px` (space-4)
- **Top margin**: `24px` (space-4)

---

## VISUAL HIERARCHY SUMMARY

### Spacing Scale (Smallest to Largest)
1. **4px** (space-1): Tight text groups (author line, category/date rows, checkbox spacing)
2. **12px** (space-2): Section gaps, menu padding, vertical rhythm
3. **16px** (space-3): Content grouping (label-value pairs, title block, button gaps, form rows)
4. **24px** (space-4): Menu top, footer bottom, title wrapper, button horizontal padding
5. **30px** (space-5): Activity list spacing
6. **36px** (space-6): Major sections, horizontal padding
7. **60px** (space-7): Page-level separation, bottom padding

---

## STRUCTURE DIAGRAM

```
WORKSPACE CONTAINER
├── PANEL / PRIMARY (gap: 12px, bg: #1C1C1C)
│   ├── Menu 1 (pt: 24px, pb: 12px, px: 36px, sticky)
│   ├── Activity List (px: 36px, gap: 30px)
│   │   ├── Hero Title (selected activity)
│   │   ├── Activity Item 1
│   │   ├── Activity Item 2
│   │   └── ...
│   └── Footer (pt: 12px, pb: 24px, px: 36px, sticky)
│       └── JOIN US (gap: 12px)
│
└── PANEL / DETAIL (gap: 12px, px: 36px, bg: #FFFFFF, pb: 60px)
    ├── Menu 2 (pt: 24px, pb: 12px, sticky)
    └── Main Content (gap: 36px)
        ├── Title Section Wrapper (gap: 24px)
        │   ├── Title Block (gap: 16px)
        │   │   ├── Title
        │   │   ├── Author (gap: 4px)
        │   │   └── Primary Image
        │   └── Location/Date (gap: 4px between rows, 16px label-value)
        ├── Website Button / Media Links (px: 24px, py: 4px, gap: 16px, shrink-0)
        ├── Category/Organisers (gap: 4px between rows, 16px label-value)
        ├── Body Text 1
        ├── Image 1
        ├── Body Text 2
        └── Image 2
```

---

## KEY DESIGN PRINCIPLES

1. **Horizontal Padding**: Consistent `36px` (space-6) for both panels and form containers
2. **Vertical Section Gaps**: `12px` (space-2) for panel-level structure
3. **Major Content Gaps**: `36px` (space-6) for main content sections
4. **Content Grouping**: `16px` (space-3) for related content pairs
5. **Tight Text Groups**: `4px` (space-1) for minimal spacing needs
6. **Auto Width**: Location/Date values hug content (no flex-1 or fixed widths)
7. **Button Sizing**: All buttons hug content with padding (not full width)
8. **Notion-like Rhythm**: Consistent vertical spacing creates editorial flow

---

## RESPONSIVE CONSIDERATIONS

All spacing values are fixed pixel values at 1440px reference.

**Menu/Footer Padding:**
- Uses responsive `clamp()` for top/bottom padding only
- Horizontal padding remains fixed `36px`

**Panel Widths:**
- Responsive via CSS media queries (see LAYOUT_INTERACTION_SPEC.md)
- Spacing within panels remains fixed

---

## Version
**Version:** 2026-01-23  
**Source of truth:** Current codebase (`app/page.tsx`, `app/submit/page.tsx`, `app/login/page.tsx`, `app/about-us/page.tsx`, `app/partners/page.tsx`)  
**Intended use:** Reusable system specification
