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
