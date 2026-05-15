import { useState, useEffect } from 'react'
import { Calculator } from 'lucide-react'
import { motion } from 'framer-motion'
import { InputPanel } from '@/components/inputs/InputPanel'
import { GrantUpload } from '@/components/inputs/GrantUpload'
import { PerquisiteScenario } from '@/components/scenarios/PerquisiteScenario'
import { NRIScenario } from '@/components/scenarios/NRIScenario'
import { computeFIFO, weightedStrikePrice, totalVested as getTotalVested, totalSharesFromAllocations } from '@/lib/grantUtils'
import type { PerquisiteInputs } from '@/types/tax.types'
import type { Grant } from '@/types/grant.types'

type TabId = 'perquisite' | 'nri'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'perquisite', label: 'Exercise Tax', icon: <Calculator size={14} /> },
  // { id: 'nri', label: 'NRI', icon: <Globe size={14} /> },
]

const DEFAULT_INPUTS: PerquisiteInputs = {
  grantType: 'ESOP',
  strikePrice: 0,
  fmvAtExercise: 0,
  numberOfOptions: 0,
  annualSalaryIncome: 0,
  regime: 'NEW',
  residentialStatus: 'RESIDENT',
  companyType: 'UNLISTED_OTHER',
  isDPIITRecognized: false,
}

/** Sort grant IDs oldest-first (the default FIFO order). */
function defaultGrantOrder(grants: Grant[]): string[] {
  return [...grants]
    .sort((a, b) => a.dateOfGrant.getTime() - b.dateOfGrant.getTime())
    .map((g) => g.grantId)
}

export function AppShell() {
  const [grants, setGrants] = useState<Grant[] | null>(null)
  const [inputs, setInputs] = useState<PerquisiteInputs>(DEFAULT_INPUTS)
  const [activeTab, setActiveTab] = useState<TabId>('perquisite')
  const [exerciseDate, setExerciseDate] = useState<Date>(() => new Date())
  const [totalShares, setTotalShares] = useState(0)
  // User-controllable exercise order (array of grant IDs, first = exercised first)
  const [grantOrder, setGrantOrder] = useState<string[]>([])

  const grantsTotalVested = grants ? getTotalVested(grants) : 0

  // When grants are loaded, seed initial options (all vested), strike, and default order
  function handleGrantsLoaded(loadedGrants: Grant[]) {
    const order = defaultGrantOrder(loadedGrants)
    setGrants(loadedGrants)
    setGrantOrder(order)
    const maxVested = getTotalVested(loadedGrants)
    const allocations = computeFIFO(loadedGrants, maxVested, order)
    const strike = weightedStrikePrice(allocations)
    const shares = totalSharesFromAllocations(allocations)
    setTotalShares(shares)
    setInputs((prev) => ({
      ...prev,
      numberOfOptions: maxVested,
      strikePrice: strike,
    }))
  }

  // Keep strikePrice and totalShares in sync with order/numberOfOptions changes
  useEffect(() => {
    if (!grants) return
    const allocations = computeFIFO(grants, inputs.numberOfOptions, grantOrder)
    const strike = weightedStrikePrice(allocations)
    const shares = totalSharesFromAllocations(allocations)
    setTotalShares(shares)
    if (strike !== inputs.strikePrice) {
      setInputs((prev) => ({ ...prev, strikePrice: strike }))
    }
  }, [inputs.numberOfOptions, grants, grantOrder])

  // Tax engine sees shares (not options) as the unit; strike is per share
  const effectiveInputs: PerquisiteInputs = {
    ...inputs,
    numberOfOptions: totalShares,        // tax engine: (FMV - strike) × shares
    residentialStatus: activeTab === 'nri' ? 'NRI' : 'RESIDENT',
  }

  if (!grants) {
    return <GrantUpload onGrantsLoaded={handleGrantsLoaded} />
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E85936] to-[#f97316] flex items-center justify-center">
              <Calculator size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827] leading-none">ESOP Tax Calculator</p>
              <p className="text-xs text-[#9CA3AF] leading-none mt-0.5">FY 2025-26 · Indian Tax Rules</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

          {/* Left: Input Panel */}
          <div>
            <div
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
              style={{ borderLeft: '4px solid #E85936' }}
            >
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#F3F4F6]">
                <Calculator size={14} className="text-[#E85936]" />
                <p className="text-sm font-semibold text-[#111827]">Grant Details</p>
              </div>
              <InputPanel
                inputs={inputs}
                onChange={setInputs}
                grants={grants}
                onResetGrants={() => { setGrants(null); setInputs(DEFAULT_INPUTS); setGrantOrder([]) }}
                exerciseDate={exerciseDate}
                onExerciseDateChange={setExerciseDate}
              />
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {/* Tab navigation — only shown when more than one tab is active */}
            {TABS.length > 1 && (
              <div className="flex gap-1 bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-1 mb-4 w-fit">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#E85936] text-white shadow-sm'
                        : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'perquisite' && (
                <PerquisiteScenario
                  inputs={effectiveInputs}
                  grants={grants}
                  grantOrder={grantOrder}
                  onReorder={(newOrder) => setGrantOrder(newOrder)}
                  onResetOrder={() => setGrantOrder(defaultGrantOrder(grants))}
                  defaultOrder={defaultGrantOrder(grants)}
                  totalVested={grantsTotalVested}
                  optionsSelected={inputs.numberOfOptions}
                  totalShares={totalShares}
                  exerciseDate={exerciseDate}
                />
              )}
              {activeTab === 'nri' && <NRIScenario inputs={effectiveInputs} />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
