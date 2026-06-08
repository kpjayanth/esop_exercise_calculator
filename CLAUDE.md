# ESOP Tax Calculator — Project Guide

Standalone React SPA for Indian ESOP employees (FY 2025-26). Embedded inside the Hissa App. No backend — all calculations are pure client-side.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite 6 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Animations | Framer Motion |
| Excel parsing | SheetJS (xlsx) |

---

## Color System

### Brand / Interactive UI
- **Primary accent**: `#E85936` — buttons, active tabs, icons, slider thumb, focus rings
- Use `#E85936` **only** on interactive elements (buttons, icons, highlights). Never on numeric data values.

### Data Value Colors (subtle, non-vivid)
| Role | Hex | Usage |
|------|-----|-------|
| Positive / gain | `#3F7D5A` | Net gain text, perquisite income, FIFO perquisite column |
| Progress bar fill | `#5A8A72` | Net-keep bar in TaxSummaryCard |
| Negative / tax | `#A05C45` | Tax deductions, total tax, exercise cost |

**Rule:** Never use vivid Tailwind color classes (`text-green-600`, `text-red-500`, `text-blue-500`, etc.) for financial data. Always use the muted hex values above.

### Slab Bracket Pills (InputSummaryCard)
Desaturated tonal backgrounds — do not use saturated Tailwind color classes:

| Rate | bg | text | pill |
|------|----|------|------|
| 0% | `#F1F5F2` | `#3F6B52` | `#5A8A6E` |
| 5% | `#F1F4F8` | `#4A6580` | `#6A8FAD` |
| 10% | `#F3F2F8` | `#58537A` | `#7A749E` |
| 15% | `#F5F3F8` | `#5E5278` | `#8A7AA0` |
| 20% | `#F8F5F0` | `#7A6040` | `#A08060` |
| 25% | `#F8F3F0` | `#805040` | `#A87060` |
| 30% | `#F8F1F0` | `#854840` | `#A86058` |

### Neutral Palette
- Text primary: `#111827`
- Text secondary: `#374151`
- Text muted: `#6B7280`
- Text placeholder: `#9CA3AF`
- Border default: `#E5E7EB`
- Border subtle: `#F3F4F6`
- Background page: `#F9FAFB`
- Background card: `#FFFFFF`

---

## Architecture

### Grant Upload Flow
1. User lands on `GrantUpload` (full-page) — drag-drop or click to upload `.xlsx/.xls/.csv`
2. SheetJS parses the file; flexible case-insensitive header matching
3. On "Calculate Tax", `AppShell` receives `Grant[]` and enters the main calculator view

### Grant Data Shape (`src/types/grant.types.ts`)
```ts
interface Grant {
  grantId: string
  dateOfGrant: Date
  totalOptions: number
  exercisePrice: number
  vestedOptions: number   // Net vested = available to exercise
}
```

### FIFO Allocation (`src/lib/grantUtils.ts`)
- Sort grants by `dateOfGrant` ascending (oldest first)
- Fill oldest grant completely before moving to next
- `weightedStrikePrice(allocations)` → used internally by tax engine only, never displayed
- Per-grant perquisite display = `(FMV − grant.exercisePrice) × optionsAllocated`

### Tax Engine (`src/lib/taxEngine.ts`)
Pure functions only — no side effects.
- FY 2025-26 New Regime slabs (Budget 2025)
- Old Regime slabs
- Surcharge with marginal relief at each bracket boundary
- 4% cess
- 87A rebate: zero tax if net income ≤ ₹12L (new) / ₹5L (old)

### Residential Status
Derived from the active tab — **not** a form field:
- "Exercise Tax" tab → `RESIDENT`
- "NRI" tab → `NRI`

### Tabs
Only 2 tabs are active:
- **Exercise Tax** (`PerquisiteScenario`)
- **NRI** (`NRIScenario`)

Capital Gains and Startup Deferral tabs are hidden (pending future work).

---

## Dev Server

```bash
# Node 23 required (Vite 8 incompatible with Node 16)
/opt/homebrew/opt/node/bin/node node_modules/.bin/vite --port 5175
```

Or use the `.claude/launch.json` configuration which points to the correct Node binary.

---

## Expected Excel Format

| Grant Id | Date Of Grant | Options | Exercise Price | Vested |
|----------|--------------|---------|---------------|--------|
| G1 | 01/05/2020 | 50 | 10 | 30 |
| G2 | 01/06/2023 | 100 | 100 | 25 |

"Vested" = Net vested options available to exercise.

---

## Key UX Rules
- FMV and Number of Options are the **primary** inputs (large, top of panel)
- Annual Salary is a **secondary** input (below divider, under "Tax Details")
- User can exercise any number from 1 up to total net vested — not locked to max
- All calculations update in real-time (no submit button)
- Indian number formatting throughout: ₹1,00,000 (lakhs/crores)

---

# Hissa Design System — UI Rules

This file defines the design system rules for the Hissa by Rulezero ESOP admin portal.
Every time you build a UI component, page, form, or flow, follow these rules exactly.
Do not improvise spacing, colors, typography, or component choices — always refer to this file first.

---

## DS-1. Typography

**Font family:** Inter (all weights)

**Naming convention:** `[Type]-[font-size]-[line-height]-[font-weight]`
- `B` = Body, `H` = Heading
- Example: `B-14-20-500` = Body, 14px font, 20px line height, weight 500

**Common type styles:**
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| H-34-34-600 | 34px | 34px | 600 | Page headings, stat card numbers |
| H-18-18-600 | 18px | 18px | 600 | Section headings |
| B-16-16-600 | 16px | 16px | 600 | Sub-headings, card titles, body emphasis |
| B-14-20-600 | 14px | 20px | 600 | Primary cell text, body text |
| B-14-20-500 | 14px | 20px | 500 | Button labels (large), body text |
| B-12-20-600 | 12px | 20px | 600 | Button labels (medium), secondary cell text |
| B-12-18-500 | 12px | 18px | 500 | Sub-labels, helper text, record counts |
| B-11-16-500 | 11px | 16px | 500 | Table column headers (ALL CAPS), card section sub-labels |

**Text colors (DS — override project neutrals below where they conflict):**
- Main headings: `#071437`
- Sub-headings and body: `#252F4A`
- Text in input fields: `#4B5675`
- Default/grey/helper text: `#99A1B7`

---

## DS-2. Color System

**Brand (interactive only):** `#E85936`

**Gray scale:**
| Token | Hex | Usage |
|-------|-----|-------|
| Ghost button bg | `#F5F8FA` | |
| Page background | `#F6F9FB` | App background |
| Container border | `#F1F1F4` | Card/container borders |
| Field border | `#DBDFE9` | Default input border |
| Helper text | `#99A1B7` | Placeholder, muted text |
| Input text | `#4B5675` | Text inside inputs |
| Body / sub-headings | `#252F4A` | General body text |
| Main headings | `#071437` | Page titles, headings |

**Semantic colors:**
- Error: `#F04438` (inline), `#D92D20` (border), `#B42318` (destructive)
- Warning: `#FEC84B` / `#FDB022` / `#F79009`
- Success: `#12B76A` / `#039855` / `#027A48`

**Rules:** Never use arbitrary hex values outside this list. `#E85936` on interactive elements only — never decorative fills.

---

## DS-3. Iconography

- Library: Material Design Icons, always 24×24px
- Help/info icon: `?` circle (muted gray, 16px) — never ⓘ
- Icon gap (horizontal): 15px; (vertical): 30px

---

## DS-4. Shadow

Single global shadow — no variants:
```css
box-shadow: 0 3px 4px rgba(0, 0, 0, 0.03);
```

---

## DS-5. Buttons

Border radius: 6px on all buttons.

| Variant | Size | Height | H-padding | Font | Weight |
|---------|------|--------|-----------|------|--------|
| Primary (filled `#E85936`) | Large | 44px | 20px | 14px | 500 |
| Primary | Medium | 32px | 14px | 12px | 600 |
| Secondary (outlined `#E85936`) | Large | 44px | 20px | 14px | 500 |
| Secondary | Medium | 32px | 14px | 12px | 600 |
| Cancel/Back (gray) | Large | 44px | 20px | 14px | 500 |
| Cancel/Back | Medium | 32px | 14px | 12px | 600 |

Footer rule: Cancel always LEFT, primary action always RIGHT.

---

## DS-6. Form Inputs

- Default border: `#DBDFE9`; Focus border: `#E85936`
- Placeholder: `#99A1B7`; Input text: `#4B5675`
- Mandatory: `*` AFTER label. Optional: `(Optional)` in muted text. Never `*` before label.
- < 8 options → plain Select; ≥ 8 options → Select with Search
- Dates: always `DD MMM YYYY` (e.g. `12 MAY 2023`)
- Big numbers: Indian format `23,00,000.00` + words below field
- Error: red border `#D92D20` + message `#F04438` directly below field
- Warning: orange border + message `#F79009` directly below field

---

## DS-7. Tables

- Row padding: 16px top/bottom
- Row hover bg: `#F0F2FF`
- Selected row: `#E8EDFF` + left border `2px solid #E85936`
- Column headers: 11px, weight 500, ALL CAPS, letter-spacing 0.08em, color `#99A1B7`
- Primary cell text: 14px / lh 34px / weight 600 / `#071437`
- Secondary cell sub-label: 12px / lh 18px / weight 500 / `#99A1B7`
- Pagination: "X to Y of Z records" left; page controls right; active page = `#E85936` bg

---

## DS-8. Status Pills

**Standard (dot + text):** border-radius 20px, padding 3px 10px, 12px/500
- Active: bg `#ECFDF3`, text `#027A48`, dot `#039855`
- Expired: bg `#FEF3F2`, text `#B42318`, dot `#F04438`

**Simple (text only):** border-radius 20px, padding 3px 10px, 12px/500
- Created: `#EEF4FB` / `#0C224A`
- Approved: `#E1F5EE` / `#085041`
- Offered: `#F5F0FF` / `#6B21A8`
- Pending: `#FEF9EE` / `#854F0B`
- Draft: `#F6F9FB` / `#4B5675`
- Completed: `#E1F5EE` / `#085041`
- Closed: `#F6F9FB` / `#99A1B7`

---

## DS-9. Navigation

- Top bar: Hissa logo left; company switcher → settings → grid → bell → avatar right; white bg, bottom border
- Sidebar collapsed: `#071437` bg, 24px white icons, active = `#E85936` row highlight
- Sidebar expanded: same bg, icon + 13px/500 white label, active = full-width `#E85936` row

---

## DS-10. Cards and Containers

- Background: `#FFFFFF`
- Border: `1px solid #F1F1F4`
- Border radius: 8px
- Shadow: `0 3px 4px rgba(0, 0, 0, 0.03)`
- Stat card large number: H-34-34-600, `#071437`
- Stat card sub-label: B-12-18-500, `#99A1B7`
- Section sub-labels inside cards: ALL CAPS, 11px/500, `#99A1B7`, letter-spacing 0.06em
- Selected card indicator: 3px bottom border in `#E85936`

---

## DS-11. Tooltips

- Light: white bg, gray border, dark title + muted body
- Dark: `#071437` bg, white text
- Help icon: always `?` circle (muted gray, 16px), never ⓘ

---

## DS-12. Toast Messages

- Position: bottom-right
- Background: `#252F4A`
- White bold title + muted white body
- X dismiss on right
- Error variant: dark bg + red left border + red icon

---

## DS-13. Modals

- Blanket: `#000000` at 68% opacity
- Confirmation: white card, amber `!` icon, Cancel (gray left) + confirm (orange right)
- Form modal: ≤8 fields; inputs use `#F6F9FB` bg inside modal

---

## DS-14. Breadcrumbs

- Separator: `>`
- First segment: `#E85936`
- Middle: `#4B5675`, clickable
- Current page: `#99A1B7`, not clickable

---

## DS-15. Data Visualisation

- Donut chart: proportional distribution, legend below, empty center
- Arc/gauge: single % metric, `#E85936` fill on `#FDF1EE` track, H-34-34-600 value centered
- Stacked avatars: 24px circles, 8px overlap, max 3 + "+N" pill

---

## DS-16. Empty States

- Empty card: 80px circle bg `#FDF1EE` + 32px icon `#E85936` + 14px/600 title + 12px helper + primary medium CTA
- Empty table: keep column headers, min 4-row height, illustration + title + CTA
- Empty page: keep page header + CTA; larger illustration (100px circle, 40px icon)
- Search empty: gray circle + muted icon, no CTA
- Filter empty: "Clear filters" secondary button only, never primary

---

## DS-17. Flow Archetypes

- **Archetype 1 — Creation wizard (3+ steps):** Left 240px stepper panel + right form area. Active step = orange filled box. Last step always a review page.
- **Archetype 2 — Edit/amend:** ≤5 fields → drawer; >5 fields → full page. Footer: Cancel left, "Save changes" right.
- **Archetype 3 — Approval flow:** Full page. Left = summary, Right = approver chain. Show full chain always.

---

## DS-18. Page Header Pattern

- Title: H-34-34-600, `#071437`, top left
- Subtitle: B-12-18-500, `#99A1B7`, one line below title
- Record count: B-12-18-500, `#99A1B7`
- CTAs: top right, primary rightmost
