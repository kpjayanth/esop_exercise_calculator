import { Card } from '@/components/ui/index'
import { TaxSummaryCard } from '@/components/results/TaxSummaryCard'
import { TaxBreakdownRows } from '@/components/results/TaxBreakdownRows'
import { TaxWaterfallChart } from '@/components/results/TaxWaterfallChart'
import { SlabWaterfallExplainer } from '@/components/results/SlabWaterfallExplainer'
import { RegimeComparison } from '@/components/results/RegimeComparison'
import { ScenarioTable } from '@/components/results/ScenarioTable'
import { ThresholdAlert } from '@/components/results/ThresholdAlert'
import { InputSummaryCard } from '@/components/results/InputSummaryCard'
import { usePerquisiteTax, useRegimeComparison, useScenarios } from '@/hooks/useTaxEngine'
import type { PerquisiteInputs } from '@/types/tax.types'

interface Props {
  inputs: PerquisiteInputs
  totalVested: number
  optionsSelected: number
  totalShares: number
  exerciseDate: Date
}

export function PerquisiteScenario({ inputs, totalVested, optionsSelected, totalShares, exerciseDate }: Props) {
  const result = usePerquisiteTax(inputs)
  const comparison = useRegimeComparison(inputs)
  const scenarios = useScenarios(inputs)

  const hasValues = inputs.fmvAtExercise > 0 && inputs.numberOfOptions > 0

  if (!hasValues) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF3F0] flex items-center justify-center mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm font-medium text-[#374151]">Enter your grant details to see the tax breakdown</p>
        <p className="text-xs text-[#9CA3AF] mt-1">Fill in strike price, FMV, and number of options on the left</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 0. Input summary + bracket */}
      <InputSummaryCard inputs={inputs} result={result} totalVested={totalVested} optionsSelected={optionsSelected} totalShares={totalShares} exerciseDate={exerciseDate} />

      {/* 1. Hero summary */}
      <TaxSummaryCard result={result} />

      {/* 2. Threshold alert (conditionally shown) */}
      {result.thresholdGap && (
        <ThresholdAlert gap={result.thresholdGap} />
      )}

      {/* 3. Simple per-share breakdown */}
      <Card className="p-4 space-y-1">
        <p className="text-sm font-semibold text-[#111827] mb-3">Perquisite Calculation</p>
        <TaxBreakdownRows result={result} />
      </Card>

      {/* 4. Slab waterfall — the core explainer */}
      <Card className="p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-[#111827]">How your {(inputs.regime === 'NEW' ? 'New' : 'Old')} Regime rate is derived</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Your perquisite is taxed at your marginal (topmost) slab rate — not a flat rate</p>
        </div>
        <SlabWaterfallExplainer
          result={result}
          annualSalaryIncome={inputs.annualSalaryIncome}
          regime={inputs.regime}
        />
      </Card>

      {/* 5. Gross-to-net value waterfall chart */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-[#111827] mb-4">Value Waterfall</p>
        <TaxWaterfallChart result={result} />
        <p className="text-xs text-[#9CA3AF] mt-2 text-center">
          Gross Value → Exercise Cost → Taxes → Net Gain
        </p>
      </Card>

      {/* 6. New vs Old regime comparison */}
      <Card className="p-4">
        <RegimeComparison comparison={comparison} />
      </Card>

      {/* 7. FMV sensitivity table */}
      <Card className="p-4">
        <ScenarioTable scenarios={scenarios} />
      </Card>

      <p className="text-xs text-[#9CA3AF] text-center pb-2">
        Estimates for FY 2025-26. Consult a tax advisor before exercising.
      </p>
    </div>
  )
}
