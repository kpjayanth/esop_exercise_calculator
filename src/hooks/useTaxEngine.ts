import { useMemo } from 'react'
import {
  computePerquisiteTax,
  compareRegimes,
  computeScenarios,
  computeCapitalGains,
  checkStartupDeferral,
  computeNRITax,
} from '@/lib/taxEngine'
import type {
  PerquisiteInputs,
  CapGainsInputs,
  StartupInputs,
  NRIInputs,
  PerquisiteResult,
  RegimeComparison,
  ScenarioRow,
  CapGainsResult,
  DeferralResult,
  NRIResult,
} from '@/types/tax.types'

export function usePerquisiteTax(inputs: PerquisiteInputs): PerquisiteResult {
  return useMemo(() => computePerquisiteTax(inputs), [
    inputs.grantType,
    inputs.strikePrice,
    inputs.fmvAtExercise,
    inputs.numberOfOptions,
    inputs.annualSalaryIncome,
    inputs.regime,
    inputs.residentialStatus,
    inputs.companyType,
    inputs.isDPIITRecognized,
  ])
}

export function useRegimeComparison(inputs: PerquisiteInputs): RegimeComparison {
  return useMemo(() => compareRegimes(inputs), [
    inputs.strikePrice,
    inputs.fmvAtExercise,
    inputs.numberOfOptions,
    inputs.annualSalaryIncome,
    inputs.companyType,
  ])
}

export function useScenarios(inputs: PerquisiteInputs): ScenarioRow[] {
  return useMemo(() => computeScenarios(inputs), [
    inputs.strikePrice,
    inputs.fmvAtExercise,
    inputs.numberOfOptions,
    inputs.annualSalaryIncome,
    inputs.regime,
  ])
}

export function useCapitalGains(inputs: CapGainsInputs): CapGainsResult {
  return useMemo(() => computeCapitalGains(inputs), [
    inputs.fmvAtExercise,
    inputs.salePrice,
    inputs.numberOfShares,
    inputs.holdingMonths,
    inputs.companyType,
    inputs.annualSalaryIncome,
    inputs.perquisite,
    inputs.regime,
  ])
}

export function useStartupDeferral(inputs: StartupInputs): DeferralResult {
  return useMemo(() => checkStartupDeferral(inputs), [
    inputs.isDPIITRecognized,
    inputs.incorporationDate,
    inputs.annualTurnover,
    inputs.exerciseDate,
    inputs.strikePrice,
    inputs.fmvAtExercise,
    inputs.numberOfOptions,
    inputs.annualSalaryIncome,
    inputs.regime,
  ])
}

export function useNRITax(inputs: NRIInputs): NRIResult {
  return useMemo(() => computeNRITax(inputs), [
    inputs.strikePrice,
    inputs.fmvAtExercise,
    inputs.numberOfOptions,
    inputs.dtaaRate,
    inputs.dtaaCountry,
  ])
}
