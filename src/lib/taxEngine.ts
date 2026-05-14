import {
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  NEW_REGIME_STANDARD_DEDUCTION,
  OLD_REGIME_STANDARD_DEDUCTION,
  NEW_REGIME_87A_LIMIT,
  OLD_REGIME_87A_LIMIT,
  SURCHARGE_SLABS,
  CESS_RATE,
  CG_RATES,
  NRI_TDS_RATE,
  NRI_SURCHARGE_RATE,
  STARTUP_DEFERRAL_YEARS,
  STARTUP_MAX_TURNOVER,
  SCENARIO_MULTIPLIERS,
} from './constants'
import type {
  Regime,
  PerquisiteInputs,
  CapGainsInputs,
  NRIInputs,
  StartupInputs,
  PerquisiteResult,
  RegimeComparison,
  ScenarioRow,
  CapGainsResult,
  DeferralResult,
  NRIResult,
  SlabLine,
  MarginalSlabLine,
  ThresholdGap,
} from '../types/tax.types'

// ── Slab tax computation ──────────────────────────────────────────────────────

function getSlabs(regime: Regime) {
  return regime === 'NEW' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS
}

function getStandardDeduction(regime: Regime) {
  return regime === 'NEW' ? NEW_REGIME_STANDARD_DEDUCTION : OLD_REGIME_STANDARD_DEDUCTION
}

export function computeSlabTax(
  grossIncome: number,
  regime: Regime,
): { slabs: SlabLine[]; baseTax: number; netIncome: number; applied87A: boolean } {
  const stdDeduction = getStandardDeduction(regime)
  const netIncome = Math.max(0, grossIncome - stdDeduction)
  const slabs = getSlabs(regime)
  const lines: SlabLine[] = []
  let remaining = netIncome
  let prev = 0
  let baseTax = 0

  for (const slab of slabs) {
    if (remaining <= 0) break
    const bracket = Math.min(remaining, slab.upTo - prev)
    const tax = bracket * slab.rate
    if (bracket > 0) {
      lines.push({
        label: slab.upTo === Infinity
          ? `Above ₹${(prev / 100_000).toFixed(0)}L`
          : `₹${(prev / 100_000).toFixed(0)}L – ₹${(slab.upTo / 100_000).toFixed(0)}L`,
        income: bracket,
        rate: slab.rate,
        tax,
      })
    }
    baseTax += tax
    remaining -= bracket
    prev = slab.upTo
  }

  // Rebate u/s 87A
  const limit87A = regime === 'NEW' ? NEW_REGIME_87A_LIMIT : OLD_REGIME_87A_LIMIT
  const applied87A = netIncome <= limit87A
  if (applied87A) {
    baseTax = 0
  }

  return { slabs: lines, baseTax, netIncome, applied87A }
}

// ── Surcharge with marginal relief ────────────────────────────────────────────

export function computeSurcharge(income: number, baseTax: number, regime: Regime): number {
  const bracket = SURCHARGE_SLABS.find((s) => income > s.above)
  if (!bracket) return 0

  const rate = regime === 'NEW' ? bracket.rateNew : bracket.rateOld
  const rawSurcharge = baseTax * rate

  // Marginal relief: surcharge cannot exceed income exceeding the bracket
  const excessIncome = income - bracket.above
  const marginalRelief = Math.max(0, rawSurcharge - excessIncome)
  return Math.max(0, rawSurcharge - marginalRelief)
}

function computeThresholdGap(totalIncome: number, regime: Regime): ThresholdGap | null {
  // Find the next surcharge threshold above current income
  const thresholds = [...SURCHARGE_SLABS].reverse()
  const current = thresholds.find((s) => totalIncome > s.above) ?? null
  const nextIdx = current
    ? SURCHARGE_SLABS.findIndex((s) => s.above === current.above) - 1
    : SURCHARGE_SLABS.length - 1

  if (nextIdx < 0) return null

  const next = SURCHARGE_SLABS[nextIdx]
  const gapAmount = next.above - totalIncome

  if (gapAmount <= 0 || gapAmount > next.above * 0.1) return null  // only show if within 10%

  return {
    nextBracketAt: next.above,
    gapAmount,
    currentSurchargeRate: current ? (regime === 'NEW' ? current.rateNew : current.rateOld) : 0,
    nextSurchargeRate: regime === 'NEW' ? next.rateNew : next.rateOld,
    potentialSaving: 0, // computed after full tax calc
  }
}

// ── Marginal slab breakdown: which slabs the perquisite falls into ─────────────

function computeMarginalSlabBreakdown(
  netSalaryIncome: number,
  perquisite: number,
  regime: Regime,
): MarginalSlabLine[] {
  const slabs = getSlabs(regime)
  const lines: MarginalSlabLine[] = []
  let perqRemaining = perquisite
  let prev = 0

  for (const slab of slabs) {
    if (perqRemaining <= 0) break
    const slabTop = slab.upTo === Infinity ? netSalaryIncome + perquisite + 1 : slab.upTo

    // How much salary already fills this slab
    const salaryInSlab = Math.max(0, Math.min(netSalaryIncome, slabTop) - prev)
    // Room left in this slab for perquisite
    const roomInSlab = Math.max(0, slabTop - prev - salaryInSlab)

    if (roomInSlab > 0) {
      const perqInSlab = Math.min(perqRemaining, roomInSlab)
      lines.push({
        label: slab.upTo === Infinity
          ? `Above ₹${(prev / 100_000).toFixed(0)}L`
          : `₹${(prev / 100_000).toFixed(0)}L – ₹${(slabTop / 100_000).toFixed(0)}L`,
        income: perqInSlab,
        rate: slab.rate,
        tax: perqInSlab * slab.rate,
        startIncome: prev + salaryInSlab,  // where perquisite starts in this slab
        salaryFillsUpTo: salaryInSlab,
        isPartiallyUsed: salaryInSlab > 0,
      })
      perqRemaining -= perqInSlab
    }

    prev = slab.upTo === Infinity ? prev : slabTop
  }

  return lines
}

// ── Core perquisite tax function ──────────────────────────────────────────────

export function computePerquisiteTax(inputs: PerquisiteInputs): PerquisiteResult {
  const {
    strikePrice,
    fmvAtExercise,
    numberOfOptions,
    annualSalaryIncome,
    regime,
  } = inputs

  const perquisite = Math.max(0, (fmvAtExercise - strikePrice) * numberOfOptions)
  const exerciseCost = strikePrice * numberOfOptions
  const grossValue = fmvAtExercise * numberOfOptions
  const totalIncome = annualSalaryIncome + perquisite

  // Tax on total income (salary + perquisite)
  const { slabs, baseTax: baseTaxOnTotal, applied87A } = computeSlabTax(totalIncome, regime)

  // Tax on salary alone (to get marginal tax attributable to ESOP)
  const { baseTax: baseTaxWithoutESOP } = computeSlabTax(annualSalaryIncome, regime)

  // Marginal tax = (full tax with ESOP) - (tax without ESOP)
  // This is what the employee actually pays because of the ESOP exercise
  const surchargeWithESOP = computeSurcharge(totalIncome - getStandardDeduction(regime), baseTaxOnTotal, regime)
  const cessWithESOP = (baseTaxOnTotal + surchargeWithESOP) * CESS_RATE
  const fullTaxWithESOP = baseTaxOnTotal + surchargeWithESOP + cessWithESOP

  const surchargeWithoutESOP = computeSurcharge(annualSalaryIncome - getStandardDeduction(regime), baseTaxWithoutESOP, regime)
  const cessWithoutESOP = (baseTaxWithoutESOP + surchargeWithoutESOP) * CESS_RATE
  const fullTaxWithoutESOP = baseTaxWithoutESOP + surchargeWithoutESOP + cessWithoutESOP

  const marginalTaxOnESOP = fullTaxWithESOP - fullTaxWithoutESOP
  // Expose the ESOP-attributable components for breakdown display
  const surcharge = surchargeWithESOP - surchargeWithoutESOP
  const cess = cessWithESOP - cessWithoutESOP
  const totalTax = marginalTaxOnESOP   // tax the employee pays because of this exercise
  const netGain = perquisite - totalTax
  const effectiveTaxRate = perquisite > 0 ? totalTax / perquisite : 0

  const stdDeduction = getStandardDeduction(regime)
  const netSalaryIncome = Math.max(0, annualSalaryIncome - stdDeduction)
  const marginalSlabs = computeMarginalSlabBreakdown(netSalaryIncome, perquisite, regime)

  const thresholdGapRaw = computeThresholdGap(totalIncome, regime)
  let thresholdGap: ThresholdGap | null = null
  if (thresholdGapRaw) {
    const reducedPerquisite = perquisite - thresholdGapRaw.gapAmount - 1
    const reducedInputs = { ...inputs, numberOfOptions: reducedPerquisite > 0
      ? Math.floor(reducedPerquisite / (fmvAtExercise - strikePrice)) : 0 }
    const reducedResult = computePerquisiteTax(reducedInputs)
    thresholdGap = {
      ...thresholdGapRaw,
      potentialSaving: totalTax - reducedResult.totalTax,
    }
  }

  return {
    perquisite,
    totalIncome,
    baseTaxOnTotal: baseTaxOnTotal - baseTaxWithoutESOP,
    baseTaxWithoutESOP,
    marginalTaxOnESOP,
    surcharge,
    cess,
    totalTax,
    netGain,
    effectiveTaxRate,
    exerciseCost,
    grossValue,
    slabBreakdown: slabs,
    marginalSlabBreakdown: marginalSlabs,
    standardDeduction: stdDeduction,
    netSalaryIncome,
    thresholdGap,
    applied87A,
  }
}

// ── Regime comparison ─────────────────────────────────────────────────────────

export function compareRegimes(inputs: PerquisiteInputs): RegimeComparison {
  const newRegime = computePerquisiteTax({ ...inputs, regime: 'NEW' })
  const oldRegime = computePerquisiteTax({ ...inputs, regime: 'OLD' })
  const betterRegime = newRegime.totalTax <= oldRegime.totalTax ? 'NEW' : 'OLD'
  const saving = Math.abs(newRegime.totalTax - oldRegime.totalTax)

  return { newRegime, oldRegime, betterRegime, saving }
}

// ── Scenario sensitivity table ────────────────────────────────────────────────

export function computeScenarios(inputs: PerquisiteInputs): ScenarioRow[] {
  return SCENARIO_MULTIPLIERS.map((multiplier) => {
    const fmv = inputs.fmvAtExercise * (1 + multiplier)
    if (fmv <= inputs.strikePrice) {
      return {
        label: `FMV ${multiplier >= 0 ? '+' : ''}${(multiplier * 100).toFixed(0)}%`,
        fmv,
        perquisite: 0,
        totalTax: 0,
        netGain: 0,
        effectiveTaxRate: 0,
        isCurrent: multiplier === 0,
      }
    }
    const result = computePerquisiteTax({ ...inputs, fmvAtExercise: fmv })
    return {
      label: `FMV ${multiplier >= 0 ? '+' : ''}${(multiplier * 100).toFixed(0)}%`,
      fmv,
      perquisite: result.perquisite,
      totalTax: result.totalTax,
      netGain: result.netGain,
      effectiveTaxRate: result.effectiveTaxRate,
      isCurrent: multiplier === 0,
    }
  })
}

// ── Capital gains ─────────────────────────────────────────────────────────────

export function computeCapitalGains(inputs: CapGainsInputs): CapGainsResult {
  const { fmvAtExercise, salePrice, numberOfShares, holdingMonths, companyType, annualSalaryIncome, perquisite, regime } = inputs

  const costOfAcquisition = fmvAtExercise * numberOfShares
  const saleValue = salePrice * numberOfShares
  const capitalGain = saleValue - costOfAcquisition

  const cgConfig = CG_RATES[companyType === 'LISTED' ? 'LISTED' : 'UNLISTED']
  const isLTCG = holdingMonths >= cgConfig.STCG_MONTHS
  const gainType: 'STCG' | 'LTCG' = isLTCG ? 'LTCG' : 'STCG'

  let taxableGain = capitalGain
  let taxRate: number
  let capitalGainsTax = 0

  if (capitalGain <= 0) {
    return {
      gainType,
      capitalGain,
      taxableGain: 0,
      taxRate: 0,
      capitalGainsTax: 0,
      cessOnCG: 0,
      totalCGTax: 0,
      costOfAcquisition,
      saleValue,
      netProceeds: saleValue - costOfAcquisition,
    }
  }

  if (isLTCG) {
    taxableGain = Math.max(0, capitalGain - cgConfig.LTCG_EXEMPTION)
    taxRate = cgConfig.LTCG_RATE
    capitalGainsTax = taxableGain * taxRate
  } else {
    // STCG
    if (companyType === 'LISTED') {
      taxRate = cgConfig.STCG_RATE!
      capitalGainsTax = capitalGain * taxRate
    } else {
      // Unlisted STCG: slab rate — compute marginal
      const totalIncomeWithGain = annualSalaryIncome + perquisite + capitalGain
      const { baseTax: taxWithGain } = computeSlabTax(totalIncomeWithGain, regime)
      const { baseTax: taxWithoutGain } = computeSlabTax(annualSalaryIncome + perquisite, regime)
      capitalGainsTax = taxWithGain - taxWithoutGain
      taxRate = capitalGain > 0 ? capitalGainsTax / capitalGain : 0
    }
  }

  const cessOnCG = capitalGainsTax * CESS_RATE
  const totalCGTax = capitalGainsTax + cessOnCG

  return {
    gainType,
    capitalGain,
    taxableGain,
    taxRate,
    capitalGainsTax,
    cessOnCG,
    totalCGTax,
    costOfAcquisition,
    saleValue,
    netProceeds: saleValue - totalCGTax,
  }
}

// ── Startup ESOP deferral ─────────────────────────────────────────────────────

export function checkStartupDeferral(inputs: StartupInputs): DeferralResult {
  const { isDPIITRecognized, incorporationDate, annualTurnover, exerciseDate } = inputs

  const ineligibilityReasons: string[] = []

  if (!isDPIITRecognized) {
    ineligibilityReasons.push('Company must be DPIIT-recognized')
  }

  const incDate = new Date(incorporationDate)
  const cutoff = new Date('2016-04-01')
  if (incDate < cutoff) {
    ineligibilityReasons.push('Company must be incorporated on or after April 1, 2016')
  }

  if (annualTurnover > STARTUP_MAX_TURNOVER) {
    ineligibilityReasons.push('Annual turnover must not exceed ₹100 crore in any prior year')
  }

  if (ineligibilityReasons.length > 0) {
    return {
      eligible: false,
      ineligibilityReason: ineligibilityReasons.join('; '),
      taxDeferred: 0,
      deferralExpiryDate: '',
      triggers: [],
    }
  }

  const result = computePerquisiteTax(inputs)
  const exDate = new Date(exerciseDate)
  exDate.setFullYear(exDate.getFullYear() + STARTUP_DEFERRAL_YEARS)

  return {
    eligible: true,
    ineligibilityReason: null,
    taxDeferred: result.totalTax,
    deferralExpiryDate: exDate.toISOString().split('T')[0],
    triggers: [
      `5 years from exercise date (${exDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })})`,
      'When you sell the shares',
      'When you leave the company',
    ],
  }
}

// ── NRI tax ───────────────────────────────────────────────────────────────────

export function computeNRITax(inputs: NRIInputs): NRIResult {
  const { strikePrice, fmvAtExercise, numberOfOptions, dtaaRate } = inputs

  const perquisite = Math.max(0, (fmvAtExercise - strikePrice) * numberOfOptions)

  // DTAA may reduce the withholding rate; otherwise standard 30%
  const applicableRate = dtaaRate !== null ? dtaaRate : NRI_TDS_RATE
  const tdsBaseTax = perquisite * applicableRate
  const surcharge = tdsBaseTax * NRI_SURCHARGE_RATE
  const cess = (tdsBaseTax + surcharge) * CESS_RATE
  const totalTDS = tdsBaseTax + surcharge + cess

  return {
    perquisite,
    applicableRate,
    tdsBaseTax,
    surcharge,
    cess,
    totalTDS,
    netGain: perquisite - totalTDS,
    usingDTAA: dtaaRate !== null,
    dtaaCountry: inputs.dtaaCountry,
  }
}
