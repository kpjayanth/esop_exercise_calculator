import { useState, useEffect, useRef } from 'react'
import { ChevronDown, CalendarDays, IndianRupee, TrendingUp, Layers } from 'lucide-react'
import { Card } from '@/components/ui/index'
import { TaxSummaryCard } from '@/components/results/TaxSummaryCard'
import { TaxBreakdownRows } from '@/components/results/TaxBreakdownRows'
import { SlabWaterfallExplainer } from '@/components/results/SlabWaterfallExplainer'
import { ScenarioTable } from '@/components/results/ScenarioTable'
import { ThresholdAlert } from '@/components/results/ThresholdAlert'
import { InputSummaryCard } from '@/components/results/InputSummaryCard'
import { GrantAllocationBlock } from '@/components/results/GrantAllocationBlock'
import { usePerquisiteTax, useScenarios } from '@/hooks/useTaxEngine'
import { computeFIFO } from '@/lib/grantUtils'
import type { PerquisiteInputs } from '@/types/tax.types'
import type { Grant } from '@/types/grant.types'

interface Props {
  inputs: PerquisiteInputs
  grants: Grant[]
  grantOrder: string[]
  onReorder: (newOrder: string[]) => void
  onResetOrder: () => void
  defaultOrder: string[]
  totalVested: number
  optionsSelected: number
  totalShares: number
  exerciseDate: Date
}

export function PerquisiteScenario({ inputs, grants, grantOrder, onReorder, onResetOrder, defaultOrder, totalVested, optionsSelected, totalShares, exerciseDate }: Props) {
  const result = usePerquisiteTax(inputs)
  const scenarios = useScenarios(inputs)

  // Cost to acquire = Σ(optionsAllocated × exercisePrice per option) across grants
  const allocations = computeFIFO(grants, optionsSelected, grantOrder)
  const costToAcquire = allocations.reduce((sum, a) => sum + a.optionsAllocated * a.exercisePrice, 0)
  const [slabOpen, setSlabOpen] = useState(false)
  const [grantBlockOpen, setGrantBlockOpen] = useState(true)
  const hasValuesRef = useRef(false)

  const hasValues = inputs.fmvAtExercise > 0 && inputs.numberOfOptions > 0 && inputs.annualSalaryIncome > 0

  // Auto-collapse grant block the first time tax details become available
  useEffect(() => {
    if (hasValues && !hasValuesRef.current) {
      setGrantBlockOpen(false)
      hasValuesRef.current = true
    }
  }, [hasValues])

  const formattedDate = exerciseDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  // Determine FY from exercise date (Indian FY: Apr–Mar)
  const fy = exerciseDate.getMonth() >= 3
    ? `FY ${exerciseDate.getFullYear()}–${String(exerciseDate.getFullYear() + 1).slice(2)}`
    : `FY ${exerciseDate.getFullYear() - 1}–${String(exerciseDate.getFullYear()).slice(2)}`

  return (
    <div className="space-y-4">
      {/* Shared exercise date context — visible above all cards */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays size={14} className="text-[#99A1B7]" />
          <span className="text-[#99A1B7] text-xs">Exercise Date</span>
          <span className="font-semibold text-[#252F4A] text-xs">{formattedDate}</span>
        </div>
        <span className="text-[11px] font-medium text-[#99A1B7] bg-[#F6F9FB] border border-[#F1F1F4] rounded-full px-2.5 py-0.5">
          {fy}
        </span>
      </div>

      {/* 0. Grant allocation — always visible, FIFO breakdown in output area */}
      <GrantAllocationBlock
        grants={grants}
        grantOrder={grantOrder}
        onReorder={onReorder}
        onResetOrder={onResetOrder}
        defaultOrder={defaultOrder}
        numberOfOptions={optionsSelected}
        fmvAtExercise={inputs.fmvAtExercise}
        isOpen={grantBlockOpen}
        onToggle={() => setGrantBlockOpen((o) => !o)}
      />

      {!hasValues ? (
        /* Empty state — shown below grant block until FMV + Salary are filled */
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <h3 className="text-base font-bold text-[#071437] mb-1">Enter FMV &amp; Salary to see your tax</h3>
          <p className="text-sm text-[#99A1B7] text-center mb-5 max-w-xs">
            Fill in the Fair Market Value and your Annual Salary — both are needed to determine your tax slab.
          </p>
          <div className="w-full max-w-sm space-y-2">
            {[
              { icon: <IndianRupee size={14} className="text-[#99A1B7]" />, label: 'Perquisite income & total tax' },
              { icon: <TrendingUp size={14} className="text-[#99A1B7]" />, label: 'FMV sensitivity scenarios' },
              { icon: <Layers size={14} className="text-[#99A1B7]" />, label: 'Marginal slab & surcharge breakdown' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-[#F1F1F4]">
                <span className="w-7 h-7 rounded-lg bg-[#F6F9FB] flex items-center justify-center shrink-0">{item.icon}</span>
                <span className="text-xs text-[#99A1B7]">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#C4C4C4] mt-5">FY 2025-26 · Indian Tax Rules · All calculations are client-side</p>
        </div>
      ) : (
        <>
          {/* 1. Hero tax summary — most important, shown first */}
          <TaxSummaryCard result={result} />

          {/* 2. Exercise summary + bracket */}
          <InputSummaryCard inputs={inputs} result={result} totalVested={totalVested} optionsSelected={optionsSelected} totalShares={totalShares} costToAcquire={costToAcquire} />

          {/* 3. Threshold alert (conditionally shown) */}
          {result.thresholdGap && (
            <ThresholdAlert gap={result.thresholdGap} />
          )}

          {/* 4. Per-share breakdown */}
          <Card className="px-5 py-5">
            <p className="text-sm font-semibold text-[#071437]">Tax Calculation Breakdown</p>
            <p className="text-[11px] text-[#99A1B7] mt-0.5 mb-5">Detailed step-by-step calculation of your ESOP tax liability</p>
            <TaxBreakdownRows result={result} />
          </Card>

          {/* 5. Slab explainer — accordion, closed by default */}
          <Card className="overflow-hidden">
            <button
              onClick={() => setSlabOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-[#071437]">
                  How your {inputs.regime === 'NEW' ? 'New' : 'Old'} Regime rate is derived
                </p>
                <p className="text-xs text-[#99A1B7] mt-0.5">
                  Your perquisite is taxed at your marginal (topmost) slab rate — not a flat rate
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-[#99A1B7] shrink-0 ml-3 transition-transform duration-200 ${slabOpen ? 'rotate-180' : ''}`}
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

          <p className="text-xs text-[#99A1B7] text-center pb-2">
            Estimates for {fy}. Consult a tax advisor before exercising.
          </p>
        </>
      )}
    </div>
  )
}
