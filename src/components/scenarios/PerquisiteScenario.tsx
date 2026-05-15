import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/index'
import { TaxSummaryCard } from '@/components/results/TaxSummaryCard'
import { TaxBreakdownRows } from '@/components/results/TaxBreakdownRows'
import { SlabWaterfallExplainer } from '@/components/results/SlabWaterfallExplainer'
import { ScenarioTable } from '@/components/results/ScenarioTable'
import { ThresholdAlert } from '@/components/results/ThresholdAlert'
import { InputSummaryCard } from '@/components/results/InputSummaryCard'
import { GrantAllocationBlock } from '@/components/results/GrantAllocationBlock'
import { usePerquisiteTax, useScenarios } from '@/hooks/useTaxEngine'
import type { PerquisiteInputs } from '@/types/tax.types'
import type { Grant } from '@/types/grant.types'

interface Props {
  inputs: PerquisiteInputs
  grants: Grant[]
  totalVested: number
  optionsSelected: number
  totalShares: number
  exerciseDate: Date
}

export function PerquisiteScenario({ inputs, grants, totalVested, optionsSelected, totalShares, exerciseDate }: Props) {
  const result = usePerquisiteTax(inputs)
  const scenarios = useScenarios(inputs)
  const [slabOpen, setSlabOpen] = useState(false)

  const hasValues = inputs.fmvAtExercise > 0 && inputs.numberOfOptions > 0 && inputs.annualSalaryIncome > 0

  return (
    <div className="space-y-4">
      {/* 0. Grant allocation — always visible, FIFO breakdown in output area */}
      <GrantAllocationBlock
        grants={grants}
        numberOfOptions={optionsSelected}
        fmvAtExercise={inputs.fmvAtExercise}
      />

      {!hasValues ? (
        /* Empty state — shown below grant block until FMV + Salary are filled */
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <h3 className="text-base font-bold text-[#111827] mb-1">Enter FMV &amp; Salary to see your tax</h3>
          <p className="text-sm text-[#6B7280] text-center mb-5 max-w-xs">
            Fill in the Fair Market Value and your Annual Salary — both are needed to determine your tax slab.
          </p>
          <div className="w-full max-w-sm space-y-2">
            {[
              { icon: '₹', label: 'Perquisite income & total tax' },
              { icon: '📈', label: 'FMV sensitivity scenarios' },
              { icon: '🏷', label: 'Marginal slab & surcharge breakdown' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-[#F3F4F6]">
                <span className="w-7 h-7 rounded-lg bg-[#F9FAFB] flex items-center justify-center text-sm shrink-0">{item.icon}</span>
                <span className="text-xs text-[#6B7280]">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#C4C4C4] mt-5">FY 2025-26 · Indian Tax Rules · All calculations are client-side</p>
        </div>
      ) : (
        <>
          {/* 1. Exercise summary + bracket */}
          <InputSummaryCard inputs={inputs} result={result} totalVested={totalVested} optionsSelected={optionsSelected} totalShares={totalShares} exerciseDate={exerciseDate} />

          {/* 2. Hero tax summary */}
          <TaxSummaryCard result={result} />

          {/* 3. Threshold alert (conditionally shown) */}
          {result.thresholdGap && (
            <ThresholdAlert gap={result.thresholdGap} />
          )}

          {/* 4. Per-share breakdown */}
          <Card className="p-4 space-y-1">
            <p className="text-sm font-semibold text-[#111827] mb-3">Perquisite Calculation</p>
            <TaxBreakdownRows result={result} />
          </Card>

          {/* 5. Slab explainer — accordion, closed by default */}
          <Card className="overflow-hidden">
            <button
              onClick={() => setSlabOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[#111827]">
                  How your {inputs.regime === 'NEW' ? 'New' : 'Old'} Regime rate is derived
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Your perquisite is taxed at your marginal (topmost) slab rate — not a flat rate
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-[#9CA3AF] shrink-0 ml-3 transition-transform duration-200 ${slabOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {slabOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-[#F3F4F6]">
                <SlabWaterfallExplainer
                  result={result}
                  annualSalaryIncome={inputs.annualSalaryIncome}
                  regime={inputs.regime}
                />
              </div>
            )}
          </Card>

          {/* 5. FMV sensitivity table */}
          <Card className="p-4">
            <ScenarioTable scenarios={scenarios} />
          </Card>

          <p className="text-xs text-[#9CA3AF] text-center pb-2">
            Estimates for FY 2025-26. Consult a tax advisor before exercising.
          </p>
        </>
      )}
    </div>
  )
}
