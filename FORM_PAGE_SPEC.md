# FORM_PAGE_SPEC.md

## Purpose
Scoped specification for building Form pages.
Defines tab structure, Save Draft vs Submit logic, validation rules, and button behavior.

**This file defines form behavior only. No layout or styling details.**

---

## 1. Page Definition

- **Page type**: Content Page
- **Scroll model**: Single page scroll
- **No side panels**
- **Max-width container**: `874px`
- **Centered**: `margin: 0 auto`
- **Padding**: `36px` horizontal and vertical

---

## 2. Tab Structure

**Three tabs:**
1. **Basic Info** (TAB 1)
2. **About the Exhibition** (TAB 2)
3. **Links / Media** (TAB 3)

**Tab Navigation:**
- Tabs are clickable buttons
- Active tab: Black text, black bottom border (2px)
- Inactive tabs: Black 50% opacity
- Tab gap: `16px`
- Bottom border: `1px solid black` (below all tabs)

---

## 3. Tab Navigation Buttons

**Tab 1 and Tab 2:**
- Show "Next" button (primary style: black background, white text)
- Show "Back" button (text-only style) if on Tab 2 or 3
- "Next" advances to next tab
- "Back" returns to previous tab

**Tab 3 (Final Tab):**
- Show "Submit" button (primary style: black background, white text)
- Submit button is disabled until:
  - All required fields are valid and filled
  - `accept_terms` is checked
  - User is on Tab 3

**All Tabs:**
- "Save Draft" button always available (outlined style: black border, transparent background)
- "Save Draft" works with partially filled form (no validation required)

---

## 4. Save Draft vs Submit Logic

### Save Draft
- **Always available**: Can be clicked at any time, on any tab
- **No validation required**: Can save with missing required fields
- **Status**: Sets `status = 'draft'`
- **Behavior**: Saves current form state to localStorage
- **Success**: Shows success modal ("Upload successful")
- **Admin visibility**: Drafts are NOT shown in admin list (filtered out)

### Submit
- **Only on Tab 3**: Submit button only appears on final tab
- **Disabled until valid**: Submit button disabled until:
  - All required fields are filled and valid
  - `accept_terms` checkbox is checked
- **Validation**: Runs `isFormValid()` function (checks all required fields + format validation)
- **Status**: Sets `status = 'pending_review'`
- **Locking**: Sets `is_locked = true` (locks username, first_name, last_name)
- **Success**: Shows success modal ("Upload successful")
- **Admin visibility**: Submitted items (pending_review/published/etc) are shown in admin list

---

## 5. Validation Rules

**Required Fields Check:**
- TAB 1: `first_name`, `last_name`, `username`, `organization_name`, `email`, `password`
- TAB 2: `activity_title`, `author_name`, `activity_type`, `activity_description`, `activity_location`, `activity_date`, `primary_image`, `website_link`, `body_text_1`, `additional_images_1`, `body_text_2`, `additional_images_2`, `organizer`

**Format Validation:**
- `email`: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `website_link`: Must be valid URL (use `new URL()` constructor)
- `primary_image`: Must be string starting with `http` or `data:image`
- `additional_images_1`: Must be string starting with `http` or `data:image`
- `additional_images_2`: Must be array with at least 1 item, all items must be strings starting with `http` or `data:image`

**Terms Validation:**
- `accept_terms`: Must be `true` (checkbox checked)

**Validation Function:**
```typescript
isFormValid(): boolean {
  // Check all required fields
  // Check format validation
  // Return true only if all pass
}
```

---

## 6. Editable vs Locked Fields

### Locked After First Submit
- `first_name`: Read-only, disabled, greyed (opacity 50%)
- `last_name`: Read-only, disabled, greyed (opacity 50%)
- `username`: Read-only, disabled, greyed (opacity 50%)

**Locking Logic:**
- Check if user has submitted before: Look for submission with `status === 'pending_review' || 'published' || 'approved'` and `is_locked === true`
- If locked, load `first_name`, `last_name`, `username` from existing submission
- Set `isLocked` state to `true`
- Apply `disabled` and `opacity-50` classes to locked fields

### Always Editable
- `author_name`: **Always editable** (never locked)
- All other fields: Always editable

**Display Name Logic:**
- `author_name` is used for public display
- Falls back to `username` if `author_name` is empty
- Do not auto-sync `author_name` with `username`

---

## 7. Button Behavior

### Save Draft Button
- **Style**: Outlined (black border, transparent background, black text)
- **Padding**: `24px` horizontal, `4px` vertical
- **Always enabled**: Can click at any time
- **Action**: `handleSaveDraft()` - saves with `status: 'draft'`

### Next Button (Tabs 1-2)
- **Style**: Primary (black background, white text)
- **Padding**: `24px` horizontal, `4px` vertical
- **Action**: `handleNext()` - advances to next tab
- **Only on**: Tab 1 and Tab 2

### Back Button (Tabs 2-3)
- **Style**: Text-only (transparent background, black text)
- **Padding**: `24px` horizontal, `4px` vertical
- **Action**: `handleBack()` - returns to previous tab
- **Only on**: Tab 2 and Tab 3 (hidden on Tab 1)

### Submit Button (Tab 3)
- **Style**: Primary (black background, white text)
- **Padding**: `24px` horizontal, `4px` vertical
- **Disabled state**: `opacity: 50%`, `cursor: not-allowed`
- **Enabled when**: `isFormValid() && accept_terms === true`
- **Action**: `handleSubmit()` - saves with `status: 'pending_review'`, sets `is_locked: true`

**Button Layout:**
- All buttons in same row: `flex gap-[16px]`
- "Save Draft" always first
- Then "Back" (if applicable)
- Then "Next" or "Submit"

---

## 8. Modal Behavior

### Success Modal
- **Trigger**: After successful Save Draft, Submit, or image upload
- **Content**:
  - Title: "Success"
  - Body: "Upload successful"
  - Button: "OK" (closes modal)
- **Style**: White background, black border, centered overlay
- **Backdrop**: Black 50% opacity
- **Close**: Click backdrop or "OK" button

---

## 9. Image Upload Handling

**Upload Process:**
1. User selects file(s)
2. File(s) uploaded to Supabase Storage (if configured)
3. Get public URL from Supabase
4. If Supabase not configured, convert to data URL (base64) as fallback
5. Store URL in form data (not File object)
6. Show preview immediately
7. Show success modal

**Image Preview:**
- Display thumbnail/preview after upload
- Show placeholder if image not available
- Preview updates form data immediately

**Image Validation:**
- Must be valid URL (starts with `http` or `data:image`)
- File objects are converted to URLs before storage

---

## 10. Rich Text Editor

**Fields using Rich Text Editor:**
- `activity_description`
- `body_text_1`
- `body_text_2`

**Features:**
- Bold, italic, underline formatting
- Link insertion
- Character count display
- HTML content storage
- Placeholder text support

**Height:**
- Minimum height: `180px` (50% taller than standard inputs)

---

## 11. Form Field Layout

**Notion-like Table Style:**
- Each field is a table row
- Two columns: Label (200px) | Input (flex-1)
- Border between rows: `1px solid rgba(0, 0, 0, 0.1)`
- Row padding: `16px` vertical, `16px` horizontal
- No hover effects on rows
- No outline on form container

**Label:**
- Uppercase, Inter 500, 12px/16px
- Required indicator: Asterisk (*)
- Helper text below input (if provided)

**Input:**
- Full width within column
- Border: `1px solid rgba(0, 0, 0, 0.2)`
- Border radius: `2px`
- Padding: `12px` horizontal, `8px` vertical
- Focus: No outline (removed)

---

## 12. Student Checkbox

**Location**: TAB 1 (Basic Info)

**Field:**
- `is_student`: boolean checkbox
- Optional (not required)

**Helper Text:**
"If you are a student, please email proof to info@spira9.art with the subject: name_spira9_student_application"

---

## 13. Terms Checkbox

**Location**: TAB 3 (Links / Media)

**Field:**
- `accept_terms`: boolean checkbox
- **Required for submission**

**Terms Text:**
"I confirm that:
1) I have the rights to submit and display the uploaded materials (images/text), and I grant SPIRA9 ART permission to use them for exhibition presentation and related promotion (website, social media, press) with credit.
2) The information I provide is accurate, and I understand SPIRA9 ART may request clarification.
3) I understand submissions may be reviewed and may be edited for formatting (not altering meaning) for publication/presentation.
4) I understand my submission may be accepted or declined, and participation/publication is not guaranteed.
5) I agree to be contacted by SPIRA9 ART regarding my submission."

**Styling:**
- Checkbox: `16px × 16px`, black border
- Terms text: Inter 400, 14px/20px, black 80% opacity
- Numbered list: Decimal, inside positioning

---

## Version
**Version: 2026-01-23  
**Source of truth:** Current codebase (`app/submit/page.tsx`)  
**Intended use:** Reusable system specification
