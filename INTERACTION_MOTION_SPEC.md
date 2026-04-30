# INTERACTION_MOTION_SPEC.md

## Purpose
Define consistent interaction feedback and motion rules across the system.
Ensures predictable, calm, and reusable interaction behavior for future projects.

**Principles:**
- Motion must be subtle, functional, and minimal
- No expressive or decorative animations
- Black & white system only
- Respect `prefers-reduced-motion`

---

## 1. Hover Behavior

### When Hover Feedback Exists

**Buttons (Primary - Black Background):**
- Hover: Background opacity changes to `90%` (`rgba(0, 0, 0, 0.9)`)
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Buttons (Secondary - Text Only):**
- Hover: Text opacity changes to `70%`
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Buttons (Outlined - Save Draft):**
- Hover: Text opacity changes to `70%`
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Text Link Buttons (Workspace Detail Panel):**
- Hover: Text opacity changes to `70%`
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Navigation Links (Menu Items):**
- Hover: Text opacity changes to `70%` (Detail Panel) or `80%` (Primary Panel logo)
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Activity List Items (Primary Panel):**
- Hover: Background color changes to `#FF0000` (red), text color changes to white
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out
- Note: Only applies to non-selected items (selected item uses hero title styling)

**Hero Title (Selected Activity):**
- Hover: Text opacity changes to `90%`
- Transition: `opacity` only (no transform)
- Timing: Immediate on hover, immediate on hover out

**CTA Button with Arrow (Join Us):**
- Hover: Text opacity changes to `70%`
- Arrow: Translates right by `1px` (`translate-x-1`)
- Transition: `200ms ease-out`
- Timing: Immediate on hover, immediate on hover out

**Images (Workspace Detail Panel):**
- Hover: Opacity changes to `85%`, grayscale filter `10%`, brightness `98%`
- Transition: `400ms ease-out`
- Timing: Immediate on hover, immediate on hover out
- Purpose: Observational feedback, not clickable indication

**Form Action Buttons (Remove, Add Media Link):**
- Hover: Background color changes to `rgba(0, 0, 0, 0.05)` (black 5% opacity)
- Transition: Immediate (no explicit transition)
- Timing: Immediate on hover, immediate on hover out

**Organiser Links (Underlined):**
- Hover: Underline removed (`hover:no-underline`)
- Transition: Immediate
- Timing: Immediate on hover, immediate on hover out

---

### When Hover Must Be Disabled

**Form Input Fields:**
- No hover feedback
- No visual change on hover
- Hover state is ignored

**Disabled Form Fields:**
- No hover feedback
- Cursor: `not-allowed`
- Visual: `opacity: 50%`

**Disabled Buttons:**
- No hover feedback
- Cursor: `not-allowed`
- Visual: `opacity: 50%`

**Locked Fields (first_name, last_name, username after submit):**
- No hover feedback
- Cursor: `not-allowed`
- Visual: `opacity: 50%`

---

## 2. Focus States

### Keyboard Focus

**Form Input Fields:**
- Focus: **No visible outline** (`focus:outline-none`)
- No focus ring or border change
- Focus is functional but not visually indicated

**Buttons:**
- Focus: Standard browser default focus ring
- No custom focus styling
- Focus ring appears on keyboard navigation (Tab key)

**Links:**
- Focus: Standard browser default focus ring
- No custom focus styling
- Focus ring appears on keyboard navigation (Tab key)

**Tabs:**
- Focus: Standard browser default focus ring
- No custom focus styling
- Focus ring appears on keyboard navigation (Tab key)

### Mouse Focus

**Form Input Fields:**
- Click focus: No visual change (same as keyboard focus - no outline)
- Cursor changes to text input cursor

**Buttons:**
- Click focus: No visual change (focus ring only on keyboard)
- Cursor changes to pointer

---

## 3. Click / Active Feedback

### Buttons

**Primary Buttons (Black Background):**
- Active state: Uses hover state (background opacity `90%`)
- No separate active state
- Click feedback: Immediate state change (no animation)

**Secondary Buttons (Text Only):**
- Active state: Uses hover state (text opacity `70%`)
- No separate active state
- Click feedback: Immediate state change (no animation)

**Outlined Buttons (Save Draft):**
- Active state: Uses hover state (text opacity `70%`)
- No separate active state
- Click feedback: Immediate state change (no animation)

### Text Link Buttons

**Workspace Detail Panel Links:**
- Active state: Uses hover state (text opacity `70%`)
- No separate active state
- Click feedback: Immediate navigation (no animation)

**Navigation Links:**
- Active state: Uses hover state (text opacity `70-80%`)
- No separate active state
- Click feedback: Immediate navigation (no animation)

### Activity List Items

**Selection Feedback:**
- Click: Immediate selection (no animation)
- Selected item: Renders as hero title (large typography, white)
- Non-selected items: Small typography, `#E1E1E1` color
- No transition between selected states

---

## 4. Tab Switching

**Behavior:**
- Tab switching is **instant** (no animation)
- State change: Immediate
- Visual change: Active tab shows black text and black bottom border (2px)
- Inactive tabs: Black text at 50% opacity
- Transition: `transition-colors` class present but no visible animation (instant color change)

**Timing:**
- Click → Tab change: Immediate
- No fade, slide, or other motion

---

## 4a. Menu Dropdown

**Behavior:**
- Dropdown appears **instant** (no animation)
- Position: Absolute, below menu button, right-aligned
- Background: `#2d2d2d` (dark gray)
- Items: White text, Poppins Light (300), 16px, hover opacity 70%
- Item borders: `#e9e9f2` (light gray) between items
- Padding: `24px` horizontal, `16px` vertical per item
- Close triggers:
  - Click outside dropdown
  - Click any menu item
  - Navigation occurs
- No fade, slide, or other motion

**Timing:**
- Click menu button → Dropdown appears: Immediate
- Click outside/item → Dropdown closes: Immediate

---

## 5. Modal Behavior

### Success Modal

**Entrance:**
- Appearance: **Instant** (no animation)
- Modal appears immediately when `showSuccessModal` state becomes `true`
- No fade-in, slide-in, or scale animation

**Exit:**
- Dismissal: **Instant** (no animation)
- Modal disappears immediately when `showSuccessModal` state becomes `false`
- No fade-out, slide-out, or scale animation

**Backdrop:**
- Color: Black at 50% opacity (`rgba(0, 0, 0, 0.5)`)
- Click behavior: Clicking backdrop closes modal
- No animation on backdrop appearance/disappearance

**Modal Content:**
- Background: White
- Border: `1px solid black`
- Padding: `24px`
- Max width: `400px`
- Centered: Flexbox centering

**Dismiss Methods:**
1. Click "OK" button → Closes modal
2. Click backdrop → Closes modal
3. No keyboard escape (not implemented)

**Timing:**
- Modal appears: Immediately after action (Save Draft, Submit, Image Upload)
- Modal stays: Until user dismisses (no auto-dismiss)
- No timeout or auto-close

---

## 6. Toast / Success Dialog Behavior

**Current Implementation:**
- Uses modal pattern (not toast)
- See "Modal Behavior" section above

**Future Toast Pattern (if needed):**
- Not currently implemented
- Would follow same instant appearance/disappearance pattern

---

## 7. Image Upload Feedback

### Loading State

**Current Implementation:**
- No visible loading indicator
- Upload happens synchronously (or with brief delay simulation)
- No spinner, progress bar, or skeleton state

### Success State

**Feedback:**
- Success modal appears immediately after upload
- Modal content: "Upload successful"
- Image preview appears immediately in form
- No separate success animation for image itself

**Timing:**
- Upload → Success modal: Immediate (or 500ms delay simulation)
- Preview appears: Immediately after URL is available

### Error State

**Current Implementation:**
- No visible error state
- Errors logged to console only
- No error message displayed to user
- Fallback: Image converts to data URL if Supabase upload fails

---

## 8. Disabled States

### Visual Rules

**Disabled Buttons:**
- Opacity: `50%`
- Cursor: `not-allowed`
- Hover: Disabled (no hover feedback)
- Background: Same as enabled state (just dimmed)

**Disabled Form Fields:**
- Opacity: `50%`
- Cursor: `not-allowed`
- Background: Same as enabled state (just dimmed)
- Border: Same as enabled state (just dimmed)

**Locked Fields (first_name, last_name, username):**
- Opacity: `50%`
- Cursor: `not-allowed`
- Background: Same as enabled state (just dimmed)
- Border: Same as enabled state (just dimmed)
- Visual indication: Greyed out appearance

### Interaction Rules

**Disabled Elements:**
- Cannot be clicked
- Cannot receive focus (or focus is ignored)
- Cannot be edited (for form fields)
- No hover feedback
- No active state

**Submit Button Disabled Logic:**
- Disabled when: `!isFormValid() || !accept_terms`
- Visual: `opacity: 50%`, `cursor: not-allowed`
- No hover feedback when disabled

---

## 9. Scroll-Triggered Reveals (Workspace Only)

### Content Reveals

**Behavior:**
- Elements with `reveal-content` class fade in and slide up on scroll
- Initial state: `opacity: 0`, `translateY: 16px`
- Revealed state: `opacity: 1`, `translateY: 0`
- Transition: `1000ms ease-out`
- Trigger: `IntersectionObserver` API (threshold: 0.1, rootMargin: `0px 0px -50px 0px`)

**Timing:**
- Reveal starts: When element enters viewport (with 50px bottom margin)
- Reveal duration: 1000ms
- Once revealed: Stays revealed (no fade out on scroll away)

### Image Reveals

**Behavior:**
- Elements with `reveal-image` class fade in and slide up on scroll
- Initial state: `opacity: 0`, `translateY: 16px`
- Revealed state: `opacity: 1`, `translateY: 0`
- Transition: `1000ms ease-out` with `200ms` delay
- Trigger: Same as content reveals

**Timing:**
- Reveal starts: 200ms after content reveals
- Reveal duration: 1000ms
- Once revealed: Stays revealed

### Accessibility

**Reduced Motion:**
- When `prefers-reduced-motion: reduce`:
  - All reveal animations disabled
  - Elements appear immediately (`opacity: 1`, `transform: none`)
  - Transition durations set to `0.01ms`

---

## 10. Workspace vs Form Interaction Intensity

### Workspace Pages

**Interaction Intensity: Medium**
- More structural feedback
- Hover states on all interactive elements
- Activity list items have color change on hover (red background, white text)
- Scroll-triggered reveals for editorial feel
- Image hover effects (observational)
- Arrow translation on CTA button hover

**Motion Level:**
- Scroll reveals: 1000ms (slow, calm)
- Hover transitions: 200ms (quick, responsive)
- Image hover: 400ms (smooth, observational)

### Form Pages

**Interaction Intensity: Low**
- Reduced motion, calm interactions
- No hover feedback on form inputs
- Minimal hover feedback on buttons only
- No scroll-triggered reveals
- Instant tab switching (no animation)
- Instant modal appearance (no animation)

**Motion Level:**
- Button hover: 200ms (quick, minimal)
- No other motion
- Focus on clarity and calmness

---

## 11. General Motion Rules

### Transition Timing

**Standard Transitions:**
- Duration: `200ms`
- Timing function: `ease-out`
- Properties: `opacity`, `background-color`, `transform`

**Slow Transitions (Workspace Reveals):**
- Duration: `1000ms`
- Timing function: `ease-out`
- Properties: `opacity`, `transform`

**Image Hover:**
- Duration: `400ms`
- Timing function: `ease-out`
- Properties: `opacity`, `filter`

### Motion Reduction

**Respect `prefers-reduced-motion`:**
- All transitions disabled when motion preference is reduced
- Transition durations set to `0.01ms`
- Animations set to `1` iteration
- Scroll reveals appear immediately
- Hover transitions disabled

**Implementation:**
- Use `motion-reduce:transition-none` class where applicable
- CSS media query: `@media (prefers-reduced-motion: reduce)`

---

## 12. Interaction Patterns Summary

### Instant Interactions (No Animation)
- Tab switching
- Modal appearance/disappearance
- Activity selection
- Form field focus
- Button clicks (state change only)

### Animated Interactions (Subtle Motion)
- Button hover (200ms opacity/background)
- Link hover (200ms opacity)
- Activity list item hover (200ms color change)
- Image hover (400ms opacity/filter)
- Scroll-triggered reveals (1000ms fade/slide)

### No Interaction Feedback
- Form input hover
- Disabled elements hover
- Locked fields hover

---

## Version
**Version:** 2026-01-23  
**Source of truth:** Current codebase (`app/page.tsx`, `app/submit/page.tsx`, `app/login/page.tsx`, `app/globals.css`)  
**Intended use:** Reusable system specification

