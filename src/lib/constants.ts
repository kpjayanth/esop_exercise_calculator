// FY 2025-26 (Assessment Year 2026-27) — Budget 2025

export const FY = '2025-26'

// ── New Regime Slabs ──────────────────────────────────────────────────────────
// Budget 2025 revised slabs
export const NEW_REGIME_SLABS = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.10 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.20 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 },
]

export const NEW_REGIME_STANDARD_DEDUCTION = 75_000
// Rebate u/s 87A: nil tax if net taxable income ≤ ₹12L
export const NEW_REGIME_87A_LIMIT = 1_200_000

// ── Old Regime Slabs ──────────────────────────────────────────────────────────
export const OLD_REGIME_SLABS = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
]

export const OLD_REGIME_STANDARD_DEDUCTION = 50_000
// Rebate u/s 87A: nil tax if net taxable income ≤ ₹5L (old regime)
export const OLD_REGIME_87A_LIMIT = 500_000

// ── Surcharge Brackets ────────────────────────────────────────────────────────
// Surcharge applies on income tax (before cess)
export const SURCHARGE_BRACKETS = [
  { above: 10_000_000, rateNew: 0.25, rateOld: 0.37 },  // >₹1Cr
  { above: 5_000_000, rateNew: 0.25, rateOld: 0.25 },   // >₹50L to ₹1Cr — wait, let me correct
  { above: 2_000_000, rateNew: 0.25, rateOld: 0.25 },
  { above: 1_000_000, rateNew: 0.15, rateOld: 0.15 },
  { above: 500_000, rateNew: 0.10, rateOld: 0.10 },
]

// Correct surcharge thresholds based on TOTAL income
export const SURCHARGE_SLABS = [
  { above: 50_000_000, rateNew: 0.25, rateOld: 0.37 },  // >₹5Cr
  { above: 20_000_000, rateNew: 0.25, rateOld: 0.25 },  // >₹2Cr
  { above: 10_000_000, rateNew: 0.15, rateOld: 0.15 },  // >₹1Cr
  { above: 5_000_000, rateNew: 0.10, rateOld: 0.10 },   // >₹50L
]

export const CESS_RATE = 0.04

// ── Capital Gains Rates (Budget 2024, post July 23, 2024) ─────────────────────
export const CG_RATES = {
  LISTED: {
    STCG_RATE: 0.20,          // <12 months, raised from 15%
    LTCG_RATE: 0.125,         // >12 months, raised from 10%
    LTCG_EXEMPTION: 125_000,  // ₹1.25L exemption (raised from ₹1L)
    STCG_MONTHS: 12,
  },
  UNLISTED: {
    STCG_RATE: null,          // slab rate (variable)
    LTCG_RATE: 0.125,         // 12.5% without indexation (Budget 2024)
    LTCG_EXEMPTION: 0,
    STCG_MONTHS: 24,
  },
}

// ── NRI Tax ───────────────────────────────────────────────────────────────────
export const NRI_TDS_RATE = 0.30
export const NRI_SURCHARGE_RATE = 0.10  // flat 10% for NRI perquisite TDS

// ── Section 192AC Startup Deferral ────────────────────────────────────────────
export const STARTUP_DEFERRAL_YEARS = 5
export const STARTUP_MAX_TURNOVER = 1_000_000_000  // ₹100 crore

// ── DTAA Countries (major ones) ───────────────────────────────────────────────
export const DTAA_COUNTRIES = [
  { country: 'USA', rate: 0.25 },
  { country: 'UK', rate: 0.15 },
  { country: 'Germany', rate: 0.10 },
  { country: 'Singapore', rate: 0.15 },
  { country: 'UAE', rate: 0 },
  { country: 'Canada', rate: 0.25 },
  { country: 'Australia', rate: 0.15 },
  { country: 'Netherlands', rate: 0.10 },
  { country: 'Japan', rate: 0.10 },
  { country: 'France', rate: 0.10 },
]

// ── FMV Sensitivity Multipliers ───────────────────────────────────────────────
export const SCENARIO_MULTIPLIERS = [-0.40, -0.20, 0, 0.20, 0.40, 0.60]
