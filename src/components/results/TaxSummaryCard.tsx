import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, IndianRupee } from 'lucide-react'
import { formatCompact, formatPercent, formatINR } from '@/lib/formatters'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
}

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const compact = format(value)
  const full = formatINR(value, 0)
  const showTooltip = Math.abs(value) >= 1000 && compact !== full
  return (
    <span className={showTooltip ? 'relative group/amt cursor-help' : undefined}>
      <motion.span
        key={value}
        initial={{ opacity: 0.6, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {compact}
      </motion.span>
      {showTooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/amt:block z-50 bg-[#1C1C1E] text-white text-[11px] font-semibold rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
          {full}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#1C1C1E]" />
        </span>
      )}
    </span>
  )
}

export function TaxSummaryCard({ result }: Props) {
  const { perquisite, totalTax, netGain, effectiveTaxRate, grossValue, exerciseCost } = result
  const keepPct = perquisite > 0 ? Math.max(0, netGain / perquisite) : 0

  return (
    <div className="rounded-lg overflow-hidden border border-[#F1F1F4]" style={{ boxShadow: '0 3px 4px rgba(0,0,0,0.03)' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-[#F1F1F4] flex items-center justify-between">
        <span className="text-[11px] font-[500] text-[#99A1B7] uppercase tracking-[0.06em]">Tax Outcome</span>
        <span className="text-[11px] font-[500] text-[#99A1B7]">FY 2025-26</span>
      </div>

      {/* Three hero panels */}
      <div className="grid grid-cols-3 divide-x divide-[#F1F1F4]">

        {/* Panel 1 — Total ESOP Value */}
        <div className="bg-white px-5 pt-4 pb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <IndianRupee size={12} className="text-[#99A1B7]" />
            <span className="text-[11px] font-[500] text-[#99A1B7] uppercase tracking-[0.06em]">Total ESOP Value</span>
          </div>
          {/* H-34-34-600 */}
          <div className="text-[34px] font-semibold leading-[34px] text-[#071437] tracking-tight">
            <AnimatedNumber value={perquisite} format={formatCompact} />
          </div>
          {grossValue > 0 && (
            <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-2">
              <span className="text-[#252F4A]">{formatCompact(grossValue)}</span> gross
              {' '}−{' '}
              <span className="text-[#252F4A]">{formatCompact(exerciseCost)}</span> exercise cost
            </p>
          )}
        </div>

        {/* Panel 2 — Total Tax Liability */}
        <div className="bg-white px-5 pt-4 pb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingDown size={12} className="text-[#A05C45]" />
            <span className="text-[11px] font-[500] text-[#A05C45] uppercase tracking-[0.06em]">Tax Liability</span>
          </div>
          <div className="text-[34px] font-semibold leading-[34px] text-[#A05C45] tracking-tight">
            <AnimatedNumber value={totalTax} format={formatCompact} />
          </div>
          <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-2">
            Effective rate{' '}
            <span className="text-[#A05C45] font-semibold">{formatPercent(effectiveTaxRate)}</span>
          </p>
        </div>

        {/* Panel 3 — Net Gain */}
        <div className="bg-white px-5 pt-4 pb-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp size={12} className="text-[#3F7D5A]" />
            <span className="text-[11px] font-[500] text-[#3F7D5A] uppercase tracking-[0.06em]">Net Gain</span>
          </div>
          <div className={`text-[34px] font-semibold leading-[34px] tracking-tight ${netGain >= 0 ? 'text-[#3F7D5A]' : 'text-[#A05C45]'}`}>
            <AnimatedNumber value={netGain} format={formatCompact} />
          </div>
          <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-2">What you take home after tax</p>
        </div>
      </div>

      {/* Progress bar */}
      {perquisite > 0 && (
        <div className="bg-white border-t border-[#F1F1F4] px-5 py-3.5">
          <div className="flex text-[12px] font-[500] justify-between mb-1.5">
            <span className="text-[#3F7D5A]">Keep {formatPercent(keepPct)}</span>
            <span className="text-[#A05C45]">Tax {formatPercent(effectiveTaxRate)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#F1F1F4] overflow-hidden">
            <motion.div
              className="h-full bg-[#5A8A72] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${keepPct * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
