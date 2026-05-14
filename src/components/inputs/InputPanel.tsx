import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { Label, ToggleGroup, Tooltip } from '@/components/ui/index'
import { formatCurrency, formatIndianInput, toIndianWords } from '@/lib/formatters'
import { clamp } from '@/lib/utils'
import { computeFIFO, weightedStrikePrice, formatGrantDate } from '@/lib/grantUtils'
import type { PerquisiteInputs } from '@/types/tax.types'
import type { Grant } from '@/types/grant.types'

interface Props {
  inputs: PerquisiteInputs
  onChange: (inputs: PerquisiteInputs) => void
  grants: Grant[]
  onResetGrants: () => void
  exerciseDate: Date
  onExerciseDateChange: (d: Date) => void
}

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label>{label}</Label>
        {tooltip && (
          <Tooltip text={tooltip}>
            <Info size={11} className="text-[#9CA3AF] cursor-help" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  )
}

export function InputPanel({ inputs, onChange, grants, onResetGrants, exerciseDate, onExerciseDateChange }: Props) {
  const set = <K extends keyof PerquisiteInputs>(key: K, value: PerquisiteInputs[K]) =>
    onChange({ ...inputs, [key]: value })

  const totalVested = grants.reduce((s, g) => s + g.vestedOptions, 0)

  // Local display states — comma-formatted, lets user type freely
  const [optionsDisplay, setOptionsDisplay] = useState(
    inputs.numberOfOptions ? inputs.numberOfOptions.toLocaleString('en-IN') : ''
  )
  useEffect(() => {
    setOptionsDisplay(inputs.numberOfOptions ? inputs.numberOfOptions.toLocaleString('en-IN') : '')
  }, [inputs.numberOfOptions])

  const [fmvDisplay, setFmvDisplay] = useState(
    inputs.fmvAtExercise ? formatIndianInput(String(inputs.fmvAtExercise)) : ''
  )
  useEffect(() => {
    setFmvDisplay(inputs.fmvAtExercise ? formatIndianInput(String(inputs.fmvAtExercise)) : '')
  }, [inputs.fmvAtExercise])

  const [salaryDisplay, setSalaryDisplay] = useState(
    inputs.annualSalaryIncome ? formatIndianInput(String(inputs.annualSalaryIncome)) : ''
  )
  useEffect(() => {
    setSalaryDisplay(inputs.annualSalaryIncome ? formatIndianInput(String(inputs.annualSalaryIncome)) : '')
  }, [inputs.annualSalaryIncome])

  // FIFO allocation derived from committed numberOfOptions
  const allocations = computeFIFO(grants, inputs.numberOfOptions)
  const totalAllocated = allocations.reduce((s, a) => s + a.optionsAllocated, 0)
  const totalSharesAllocated = allocations.reduce((s, a) => s + a.sharesAllocated, 0)
  const hasConversion = allocations.some((a) => a.conversionRatio !== 1)

  // Per-grant perquisite: (FMV − exercisePrice) × sharesAllocated (price is per share)
  const allocationRows = allocations.map((a) => {
    const grant = grants.find((g) => g.grantId === a.grantId)!
    return {
      ...a,
      available: grant.vestedOptions,
      perquisite: Math.max(0, inputs.fmvAtExercise - a.exercisePrice) * a.sharesAllocated,
    }
  })
  const totalPerquisite = allocationRows.reduce((s, a) => s + a.perquisite, 0)

  function commitOptions(v: number) {
    const clamped = Math.min(Math.max(1, v), totalVested)
    const newAllocations = computeFIFO(grants, clamped)
    const newStrike = weightedStrikePrice(newAllocations)
    onChange({ ...inputs, numberOfOptions: clamped, strikePrice: newStrike })
  }

  return (
    <div className="space-y-4">

      {/* 1. FMV — primary trigger */}
      <Field label="FMV at Exercise" tooltip="Current fair market value per share (from latest company valuation / 409A)">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">₹</span>
          <input
            type="text"
            inputMode="numeric"
            value={fmvDisplay}
            placeholder="e.g. 500"
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9.]/g, '')
              setFmvDisplay(formatIndianInput(e.target.value))
              const v = parseFloat(raw) || 0
              onChange({ ...inputs, fmvAtExercise: Math.max(0, v) })
            }}
            onBlur={() => setFmvDisplay(inputs.fmvAtExercise ? formatIndianInput(String(inputs.fmvAtExercise)) : '')}
            className="w-full pl-7 pr-3 py-2.5 text-base font-semibold rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E85936]/20 focus:border-[#E85936] transition-all"
          />
        </div>
        {inputs.fmvAtExercise > 0 && (
          <p className="text-[11px] text-[#9CA3AF] mt-1 pl-1">{toIndianWords(inputs.fmvAtExercise)}</p>
        )}
      </Field>

      {/* 2. Annual Salary — promoted, needed for tax slab */}
      <Field label="Annual Salary Income" tooltip="Your total salary for the year, excluding this ESOP exercise. Used to determine your marginal tax slab.">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">₹</span>
          <input
            type="text"
            inputMode="numeric"
            value={salaryDisplay}
            placeholder="e.g. 20,00,000"
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              setSalaryDisplay(formatIndianInput(e.target.value))
              const v = parseInt(raw, 10) || 0
              set('annualSalaryIncome', Math.max(0, v))
            }}
            onBlur={() => setSalaryDisplay(inputs.annualSalaryIncome ? formatIndianInput(String(inputs.annualSalaryIncome)) : '')}
            className="w-full pl-7 pr-3 py-2.5 text-base font-semibold rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E85936]/20 focus:border-[#E85936] transition-all"
          />
        </div>
        {inputs.annualSalaryIncome > 0 && (
          <p className="text-[11px] text-[#9CA3AF] mt-1 pl-1">{toIndianWords(inputs.annualSalaryIncome)}</p>
        )}
      </Field>

      {/* 3. Date of Exercise */}
      <Field label="Date of Exercise" tooltip="Planned exercise date. Options vested on or before this date are available to exercise.">
        <input
          type="date"
          value={exerciseDate.toISOString().split('T')[0]}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => {
            const d = new Date(e.target.value)
            if (!isNaN(d.getTime())) onExerciseDateChange(d)
          }}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E85936]/20 focus:border-[#E85936] transition-all text-[#374151]"
        />
      </Field>

      {/* 4. Options to Exercise */}
      <Field label="Options to Exercise" tooltip={`How many vested options you want to exercise. Max: ${totalVested.toLocaleString('en-IN')} (total net vested)`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={optionsDisplay}
              placeholder={`1 – ${totalVested.toLocaleString('en-IN')}`}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '')
                const formatted = raw ? Number(raw).toLocaleString('en-IN') : ''
                setOptionsDisplay(formatted)
                const v = Number(raw)
                if (raw !== '' && !isNaN(v) && v >= 1) commitOptions(v)
              }}
              onBlur={() => {
                const v = Number(optionsDisplay.replace(/,/g, ''))
                const clamped = !v || v < 1 ? 1 : Math.min(v, totalVested)
                commitOptions(clamped)
                setOptionsDisplay(clamped.toLocaleString('en-IN'))
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E85936]/20 focus:border-[#E85936] transition-all"
            />
            <span className="text-xs text-[#9CA3AF] whitespace-nowrap shrink-0">
              max {totalVested.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={totalVested}
            step={1}
            value={clamp(inputs.numberOfOptions, 1, totalVested)}
            onChange={(e) => {
              const v = Number(e.target.value)
              setOptionsDisplay(v.toLocaleString('en-IN'))
              commitOptions(v)
            }}
            className="w-full accent-[#E85936]"
          />
          <div className="flex justify-between text-xs text-[#9CA3AF]">
            <span>1</span>
            <span>{totalVested.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Field>

      {/* 5. FIFO Grant Cards */}
      {allocationRows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Grants Selected (FIFO)</p>
            <span className="text-[10px] text-[#9CA3AF]">
              {totalAllocated.toLocaleString('en-IN')} opts
              {hasConversion && <> → {totalSharesAllocated.toLocaleString('en-IN')} sh</>}
              {' '}/ {totalVested.toLocaleString('en-IN')}
            </span>
          </div>

          {allocationRows.map((a) => (
            <div key={a.grantId} className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111827]">{a.grantId}</span>
                  <span className="text-[11px] text-[#9CA3AF]">{formatGrantDate(a.dateOfGrant)}</span>
                  {a.optionsAllocated === a.available && (
                    <span className="text-[10px] bg-[#FFF3F0] text-[#E85936] px-1.5 py-0.5 rounded-md font-semibold">Full</span>
                  )}
                </div>
                <span className="text-[11px] text-[#6B7280]">
                  Strike <span className="font-semibold">₹{a.exercisePrice.toLocaleString('en-IN')}</span>/share
                </span>
              </div>

              <div className={`grid divide-x divide-[#F3F4F6] ${hasConversion ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="px-3 py-2.5">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Available</p>
                  <p className="text-sm font-bold text-[#374151]">{a.available.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">options</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Selected</p>
                  <p className={`text-sm font-bold ${a.optionsAllocated === a.available ? 'text-[#E85936]' : 'text-[#374151]'}`}>
                    {a.optionsAllocated.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">options</p>
                </div>
                {hasConversion && (
                  <div className="px-3 py-2.5">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1">Shares</p>
                    <p className="text-sm font-bold text-[#111827]">{a.sharesAllocated.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">×{a.conversionRatio} ratio</p>
                  </div>
                )}
              </div>

              {inputs.fmvAtExercise > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAF8] border-t border-[#F3F4F6]">
                  <span className="text-[10px] text-[#9CA3AF]">
                    (FMV − ₹{a.exercisePrice}) × {a.sharesAllocated} shares
                  </span>
                  <span className={`text-sm font-bold ${a.perquisite > 0 ? 'text-[#3F7D5A]' : 'text-[#9CA3AF]'}`}>
                    {a.perquisite > 0 ? formatCurrency(a.perquisite) : '—'}
                  </span>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div>
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Total Perquisite</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {totalAllocated.toLocaleString('en-IN')} options
                {hasConversion && <> → <span className="font-medium text-[#374151]">{totalSharesAllocated.toLocaleString('en-IN')} shares</span></>}
              </p>
            </div>
            <span className="text-base font-bold text-[#3F7D5A]">
              {inputs.fmvAtExercise > 0 ? formatCurrency(totalPerquisite) : '—'}
            </span>
          </div>
        </div>
      )}

      {/* 6. Tax Regime — compact footer toggle */}
      <div className="pt-1 border-t border-[#F3F4F6]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-[#6B7280]">Tax Regime</span>
            <Tooltip text="New regime (Budget 2025 slabs) vs Old regime. We'll show both anyway.">
              <Info size={11} className="text-[#9CA3AF] cursor-help" />
            </Tooltip>
          </div>
          <ToggleGroup
            options={[
              { value: 'NEW', label: 'New Regime' },
              { value: 'OLD', label: 'Old Regime' },
            ]}
            value={inputs.regime}
            onChange={(v) => set('regime', v)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onResetGrants}
        className="w-full text-xs text-[#9CA3AF] hover:text-[#E85936] transition-colors py-1 text-center"
      >
        ↺ Load different grant file
      </button>
    </div>
  )
}
