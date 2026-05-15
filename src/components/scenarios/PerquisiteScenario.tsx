import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/index'
import { TaxSummaryCard } from '@/components/results/TaxSummaryCard'
import { TaxBreakdownRows } from '@/components/results/TaxBreakdownRows'
import { SlabWaterfallExplainer } from '@/components/results/SlabWaterfallExplainer'
import { ScenarioTable } from '@/components/results/ScenarioTable'
import { ThresholdAlert } from '@/components/results/ThresholdAlert'
import { InputSummaryCard } from '@/components/results/InputSummaryCard'
import { usePerquisiteTax, useScenarios } from '@/hooks/useTaxEngine'
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
  const scenarios = useScenarios(inputs)
  const [slabOpen, setSlabOpen] = useState(false)

  const hasValues = inputs.fmvAtExercise > 0 && inputs.numberOfOptions > 0 && inputs.annualSalaryIncome > 0

  if (!hasValues) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        {/* Icon stack */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] flex items-center justify-center shadow-lg">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="4" y="18" width="6" height="14" rx="1.5" fill="#E85936" opacity="0.9"/>
              <rect x="13" y="10" width="6" height="22" rx="1.5" fill="#E85936" opacity="0.6"/>
              <rect x="22" y="4" width="6" height="28" rx="1.5" fill="#E85936" opacity="0.35"/>
              <path d="M28 6 L32 2" stroke="#E85936" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="32" cy="2" r="2" fill="#E85936"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#E85936] flex items-center justify-center shadow">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3v8M3 7h8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h3 className="text-base font-bold text-[#111827] mb-1">Enter FMV & Salary to see your tax</h3>
        <p className="text-sm text-[#6B7280] text-center mb-6 max-w-xs">
          Fill in the Fair Market Value and your Annual Salary — both are needed to determine your tax slab.
        </p>

        {/* What you'll see */}
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

        <p className="text-[11px] text-[#C4C4C4] mt-6">FY 2025-26 · Indian Tax Rules · All calculations are client-side</p>
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

      {/* 4. Slab explainer — accordion, closed by default */}
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
    </div>
  )
}
