import { TrendingUp } from 'lucide-react'
import { formatCompact, formatCurrency } from '@/lib/formatters'
import type { PerquisiteInputs, PerquisiteResult } from '@/types/tax.types'

interface Props {
  inputs: PerquisiteInputs
  result: PerquisiteResult
  totalVested: number
  optionsSelected: number
  totalShares: number
  exerciseDate: Date
}

function formatExerciseDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function slabColor(rate: number) {
  if (rate === 0)    return { bg: 'bg-[#F1F5F2]', text: 'text-[#3F6B52]', pill: 'bg-[#5A8A6E]' }
  if (rate <= 0.05)  return { bg: 'bg-[#F1F4F8]', text: 'text-[#4A6580]', pill: 'bg-[#6A8FAD]' }
  if (rate <= 0.10)  return { bg: 'bg-[#F3F2F8]', text: 'text-[#58537A]', pill: 'bg-[#7A749E]' }
  if (rate <= 0.15)  return { bg: 'bg-[#F5F3F8]', text: 'text-[#5E5278]', pill: 'bg-[#8A7AA0]' }
  if (rate <= 0.20)  return { bg: 'bg-[#F8F5F0]', text: 'text-[#7A6040]', pill: 'bg-[#A08060]' }
  if (rate <= 0.25)  return { bg: 'bg-[#F8F3F0]', text: 'text-[#805040]', pill: 'bg-[#A87060]' }
  return               { bg: 'bg-[#F8F1F0]', text: 'text-[#854840]', pill: 'bg-[#A86058]' }
}

export function InputSummaryCard({ inputs, result, totalVested, optionsSelected, totalShares, exerciseDate }: Props) {
  // Find the highest slab the perquisite falls into
  const topSlab = result.marginalSlabBreakdown.length > 0
    ? result.marginalSlabBreakdown.reduce((max, s) => s.rate > max.rate ? s : max)
    : null

  const colors = topSlab ? slabColor(topSlab.rate) : slabColor(0)
  const bracketRate = topSlab ? `${(topSlab.rate * 100).toFixed(0)}%` : '—'
  const bracketLabel = topSlab?.label ?? '—'

  const hasConversion = optionsSelected !== totalShares
  const stats = [
    {
      label: 'FMV at Exercise',
      value: formatCurrency(inputs.fmvAtExercise),
      sub: 'per share',
    },
    {
      label: 'Available to Exercise',
      value: totalVested.toLocaleString('en-IN'),
      sub: 'vested options',
    },
    {
      label: 'Options → Shares',
      value: hasConversion
        ? `${optionsSelected.toLocaleString('en-IN')} → ${totalShares.toLocaleString('en-IN')}`
        : optionsSelected.toLocaleString('en-IN'),
      sub: hasConversion
        ? `${totalShares.toLocaleString('en-IN')} shares to receive`
        : `of ${totalVested.toLocaleString('en-IN')} available`,
    },
    {
      label: 'Annual Salary',
      value: formatCompact(inputs.annualSalaryIncome),
      sub: inputs.regime === 'NEW' ? 'New Regime' : 'Old Regime',
    },
  ]

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#E85936]" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">Exercise Summary</span>
        </div>
        <span className="text-[11px] text-[#9CA3AF] font-medium">as of {formatExerciseDate(exerciseDate)}</span>
      </div>

      {/* Stats grid */}
      <div className="bg-white grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#F3F4F6]">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-3.5">
            <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-lg font-bold text-[#111827] leading-none">{s.value}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bracket strip */}
      <div className={`${colors.bg} border-t border-[#E5E7EB] px-5 py-3 flex flex-wrap items-center gap-3`}>
        <span className="text-[11px] font-semibold text-[#374151] uppercase tracking-wide">
          Marginal Tax Bracket
        </span>

        {/* Big rate badge */}
        <div className={`flex items-baseline gap-1 px-3 py-1 rounded-full ${colors.pill} shadow-sm`}>
          <span className="text-sm font-black text-white">{bracketRate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${colors.text}`}>{bracketLabel} slab</span>
          <span className="text-[#D1D5DB]">·</span>
          <span className="text-xs text-[#6B7280]">{inputs.regime === 'NEW' ? 'New' : 'Old'} Regime</span>
        </div>

        {result.applied87A && (
          <span className="ml-auto text-xs font-semibold text-[#3F7D5A] bg-[#F1F5F2] px-2.5 py-0.5 rounded-full">
            87A Rebate — Zero Tax
          </span>
        )}

        {!result.applied87A && topSlab && (
          <span className="ml-auto text-[11px] text-[#6B7280]">
            {formatCompact(inputs.annualSalaryIncome)} salary
            <span className="mx-1 text-[#D1D5DB]">+</span>
            {formatCompact(result.perquisite)} perquisite
            <span className="mx-1 text-[#D1D5DB]">=</span>
            <span className={`font-semibold ${colors.text}`}>{formatCompact(result.totalIncome)} total income</span>
          </span>
        )}
      </div>
    </div>
  )
}
