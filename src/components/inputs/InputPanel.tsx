import { useState, useEffect } from 'react'
import { Layers, Calculator } from 'lucide-react'
import { Label, Tooltip, HelpIcon } from '@/components/ui/index'
import { formatIndianInput, toIndianWords } from '@/lib/formatters'
import { clamp } from '@/lib/utils'
import { computeFIFO, weightedStrikePrice } from '@/lib/grantUtils'
import type { PerquisiteInputs } from '@/types/tax.types'
import type { Grant } from '@/types/grant.types'

interface Props {
  inputs: PerquisiteInputs
  onChange: (inputs: PerquisiteInputs) => void
  grants: Grant[]          // effective grants at exerciseDate (for options logic)
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
            <HelpIcon />
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
  // (FIFO grant allocation cards are shown in the output panel, not here)
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

  function commitOptions(v: number) {
    const clamped = Math.min(Math.max(1, v), totalVested)
    const newAllocations = computeFIFO(grants, clamped)
    const newStrike = weightedStrikePrice(newAllocations)
    onChange({ ...inputs, numberOfOptions: clamped, strikePrice: newStrike })
  }

  return (
    <div className="space-y-5">

      {/* ── GROUP 1: Exercise setup — drives Grant Allocation ── */}
      <div className="rounded-lg border border-[#F1F1F4] bg-[#F6F9FB] p-4 space-y-4">
        {/* Section label — Layers icon links this visually to the Grant Allocation card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-[#99A1B7]" />
            <span className="text-[10px] font-semibold text-[#99A1B7] uppercase tracking-widest">Exercise</span>
          </div>
          <span className="text-[10px] text-[#99A1B7] font-medium">shapes grant allocation</span>
        </div>

        {/* Date of Exercise */}
        <Field label="Date of Exercise" tooltip="Planned exercise date. Options vested on or before this date are available to exercise.">
          <input
            type="date"
            value={exerciseDate.toISOString().split('T')[0]}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const d = new Date(e.target.value)
              if (!isNaN(d.getTime())) onExerciseDateChange(d)
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#DBDFE9] bg-white focus:outline-none focus:border-[#E85936] transition-colors text-[#374151]"
          />
        </Field>

        {/* Options to Exercise */}
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
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#DBDFE9] bg-white focus:outline-none focus:border-[#E85936] transition-colors"
              />
              <span className="text-xs text-[#99A1B7] whitespace-nowrap shrink-0">
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
            <div className="flex justify-between text-[10px] text-[#C4C4C4]">
              <span>1</span>
              <span>{totalVested.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Field>
      </div>

      {/* ── GROUP 2: Tax inputs ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Calculator size={11} className="text-[#99A1B7]" />
          <span className="text-[10px] font-semibold text-[#99A1B7] uppercase tracking-widest">Tax</span>
        </div>

        {/* FMV */}
        <Field label="FMV at Exercise" tooltip="Current fair market value per share (from latest company valuation / 409A)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1B7] text-sm">₹</span>
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
              className="w-full pl-7 pr-3 py-2.5 text-base font-semibold rounded-lg border border-[#DBDFE9] focus:outline-none focus:border-[#E85936] transition-colors"
            />
          </div>
          {inputs.fmvAtExercise > 0 && (
            <p className="text-[11px] text-[#99A1B7] mt-1 pl-1">{toIndianWords(inputs.fmvAtExercise)}</p>
          )}
        </Field>

        {/* Net Taxable Income */}
        <Field label="Net Taxable Income (Salary)" tooltip="Enter your net taxable income from salary — after all deductions you are claiming (standard deduction, HRA, 80C, 80D, etc.). This is the figure on which slab tax is computed before adding your ESOP perquisite.">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99A1B7] text-sm">₹</span>
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
              className="w-full pl-7 pr-3 py-2.5 text-base font-semibold rounded-lg border border-[#DBDFE9] focus:outline-none focus:border-[#E85936] transition-colors"
            />
          </div>
          {inputs.annualSalaryIncome > 0 && (
            <p className="text-[11px] text-[#99A1B7] mt-1 pl-1">{toIndianWords(inputs.annualSalaryIncome)}</p>
          )}
        </Field>

        {/* Tax Regime */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-[#252F4A] leading-4">Tax Regime</span>
            <Tooltip text="New regime (Budget 2025 slabs) vs Old regime. We'll show both anyway.">
              <HelpIcon />
            </Tooltip>
          </div>
          <div className="flex items-center bg-[#F5F8FA] rounded-[6px] p-[3px] gap-[2px] border border-[#F1F1F4]">
            {(['NEW', 'OLD'] as const).map((regime) => (
              <button
                key={regime}
                onClick={() => set('regime', regime)}
                className={`px-4 py-1 rounded-[4px] text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  inputs.regime === regime
                    ? 'bg-white text-[#071437]'
                    : 'text-[#99A1B7] hover:text-[#252F4A]'
                }`}
              >
                {regime === 'NEW' ? 'New' : 'Old'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onResetGrants}
        className="w-full text-xs text-[#99A1B7] hover:text-[#E85936] transition-colors py-1 text-center"
      >
        ↺ Load different grant file
      </button>
    </div>
  )
}
