export type Regime = 'NEW' | 'OLD'
export type GrantType = 'ESOP' | 'RSU' | 'SAR'
export type CompanyType = 'LISTED' | 'UNLISTED_STARTUP' | 'UNLISTED_OTHER'
export type ResidentialStatus = 'RESIDENT' | 'NRI'
export type ExerciseMethod = 'CASH' | 'CASHLESS'

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface PerquisiteInputs {
  grantType: GrantType
  strikePrice: number
  fmvAtExercise: number
  numberOfOptions: number
  annualSalaryIncome: number
  regime: Regime
  residentialStatus: ResidentialStatus
  companyType: CompanyType
  isDPIITRecognized: boolean
}

export interface CapGainsInputs {
  fmvAtExercise: number    // cost of acquisition
  salePrice: number
  numberOfShares: number
  holdingMonths: number
  companyType: CompanyType
  annualSalaryIncome: number
  perquisite: number       // already-taxed perquisite (adds to income for STCG unlisted)
  regime: Regime
}

export interface StartupInputs extends PerquisiteInputs {
  exerciseDate: string     // ISO date
  isDPIITRecognized: boolean
  incorporationDate: string
  annualTurnover: number
}

export interface NRIInputs {
  strikePrice: number
  fmvAtExercise: number
  numberOfOptions: number
  grantType: GrantType
  dtaaCountry: string | null
  dtaaRate: number | null   // override rate from DTAA treaty
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface SlabLine {
  label: string
  income: number
  rate: number
  tax: number
}

export interface ThresholdGap {
  nextBracketAt: number
  gapAmount: number
  currentSurchargeRate: number
  nextSurchargeRate: number
  potentialSaving: number
}

export interface MarginalSlabLine extends SlabLine {
  startIncome: number     // where in the income stack this slab starts (for viz)
  salaryFillsUpTo: number // how much salary fills in this slab (for viz)
  isPartiallyUsed: boolean
}

export interface PerquisiteResult {
  perquisite: number
  totalIncome: number
  baseTaxOnTotal: number
  baseTaxWithoutESOP: number
  marginalTaxOnESOP: number
  surcharge: number
  cess: number
  totalTax: number
  netGain: number
  effectiveTaxRate: number
  exerciseCost: number
  grossValue: number
  slabBreakdown: SlabLine[]
  marginalSlabBreakdown: MarginalSlabLine[]  // slabs the perquisite falls into
  standardDeduction: number
  netSalaryIncome: number  // after std deduction
  thresholdGap: ThresholdGap | null
  applied87A: boolean
}

export interface RegimeComparison {
  newRegime: PerquisiteResult
  oldRegime: PerquisiteResult
  betterRegime: Regime
  saving: number
}

export interface ScenarioRow {
  label: string
  fmv: number
  perquisite: number
  totalTax: number
  netGain: number
  effectiveTaxRate: number
  isCurrent: boolean
}

export interface CapGainsResult {
  gainType: 'STCG' | 'LTCG'
  capitalGain: number
  taxableGain: number
  taxRate: number
  capitalGainsTax: number
  cessOnCG: number
  totalCGTax: number
  costOfAcquisition: number
  saleValue: number
  netProceeds: number
}

export interface DeferralResult {
  eligible: boolean
  ineligibilityReason: string | null
  taxDeferred: number
  deferralExpiryDate: string   // 5 years from exercise
  triggers: string[]
}

export interface NRIResult {
  perquisite: number
  applicableRate: number
  tdsBaseTax: number
  surcharge: number
  cess: number
  totalTDS: number
  netGain: number
  usingDTAA: boolean
  dtaaCountry: string | null
}
