# What changed — 17 August 2026

Handoff note for the next designer. Specs in this pack were updated to match the live site. If code and spec disagree, **the codebase is the source of truth**.

## New public routes

| Route | Model | Purpose |
|-------|--------|---------|
| `/artists` | White Directory (LAYOUT §1.3) | A–Z list, Genre/Medium filters, overlapping four-artist billboard, four-column grid |
| `/artists/[slug]` | White Split Content | Portrait/bio left; CV, Exhibitions, Press, Talks, Works right. Empty sections keep their headings |
| `/artists/join` | Content Page (form) | Three-tab artist profile. Saved in `localStorage` until an `artists` table exists |

White header (`WhiteSiteHeader`) on `/partners` and Artists: Become a Partner → Artists → Back to workspace (muted, last).

## Billboard

- Four overlapping full-height artist pages. Default: name overlay, image to the top edge (no white header strip).
- Select: that page expands; the other three compress (~6% width), **name vertical, no image**.
- Motion: `700ms` `cubic-bezier(0.22, 1, 0.36, 1)` on `left` / `width`.
- `Read more →` is the existing CTA-with-arrow text button.
- `∨` at the billboard bottom scrolls to the grid. Billboard bottom sits on the screen bottom under header + filters.

## Filters

- Genre and Medium only, **collapsed by default**.
- Exhibition / When dropdown was removed.

## Images

- About **half of the 15 editorial artists** have a portrait (7 with, 8 without).
- Empty = **white**. No grey square, no broken-image icon.
- Portraits or artworks only. No cityscapes or stock filler.
- Grid thumbs: `96px`.

## Tokens still in force

Black/white system. Fonts: Inter, Poppins, Source Sans 3. Spacing scale unchanged. Red (`#FF0000`) only for workspace activity-list hover and the selected A–Z artist name. Meta grey `#9A9A9A` for muted nav, field, years, letters.

## Persistence

Artist join is **not** in Supabase yet. Draft: `othering_artist_join_draft_v1`. Submitted: `othering_artist_submissions_v1`. DATABASE_SCHEMA.md describes a later `artists` table — do not invent it in UI.
