import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, IndianRupee } from 'lucide-react'
import { formatCompact, formatPercent } from '@/lib/formatters'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
}

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.6, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {format(value)}
    </motion.span>
  )
}

interface MetricProps {
  icon: React.ReactNode
  label: string
  value: number
  format: (v: number) => string
  accent?: string
  sub?: string
}

function Metric({ icon, label, value, format, accent = 'text-[#111827]', sub }: MetricProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[#9CA3AF] shrink-0">{icon}</span>
        <span className="text-[10px] sm:text-xs text-[#6B7280] font-medium leading-tight">{label}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold leading-none ${accent}`}>
        <AnimatedNumber value={value} format={format} />
      </div>
      {sub && <p className="text-[10px] sm:text-xs text-[#9CA3AF] mt-1 leading-snug">{sub}</p>}
    </div>
  )
}

export function TaxSummaryCard({ result }: Props) {
  const { perquisite, totalTax, netGain, effectiveTaxRate, exerciseCost, grossValue } = result

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* Top stripe */}
      <div className="h-1 bg-gradient-to-r from-[#E85936] via-[#f97316] to-[#E85936]" />

      <div className="p-5">
        <div className="grid grid-cols-3 gap-2">
          <Metric
            icon={<IndianRupee size={13} />}
            label="Perquisite Income"
            value={perquisite}
            format={formatCompact}
            accent="text-[#111827]"
          />
          <div className="border-l border-[#F3F4F6] pl-2 sm:pl-4">
            <Metric
              icon={<TrendingDown size={13} />}
              label="Total Tax"
              value={totalTax}
              format={formatCompact}
              accent="text-[#E85936]"
              sub={`Rate: ${formatPercent(effectiveTaxRate)}`}
            />
          </div>
          <div className="border-l border-[#F3F4F6] pl-2 sm:pl-4">
            <Metric
              icon={<TrendingUp size={13} />}
              label="Net Gain"
              value={netGain}
              format={formatCompact}
              accent={netGain >= 0 ? 'text-[#3F7D5A]' : 'text-[#A05C45]'}
              sub="After all taxes"
            />
          </div>
        </div>

        {/* Progress bar: net vs tax */}
        {perquisite > 0 && (
          <div className="mt-4">
            <div className="flex text-xs text-[#9CA3AF] justify-between mb-1">
              <span>Net keep</span>
              <span>Tax</span>
            </div>
            <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div
                className="h-full bg-[#5A8A72] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, (netGain / perquisite) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex text-xs justify-between mt-1">
              <span className="text-[#3F7D5A] font-medium">{formatPercent(Math.max(0, netGain / perquisite))}</span>
              <span className="text-[#A05C45] font-medium">{formatPercent(effectiveTaxRate)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
