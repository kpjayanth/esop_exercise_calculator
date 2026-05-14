import { AlertTriangle, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCompact, formatPercent } from '@/lib/formatters'
import type { ThresholdGap } from '@/types/tax.types'

interface Props {
  gap: ThresholdGap
}

export function ThresholdAlert({ gap }: Props) {
  const { gapAmount, nextBracketAt, currentSurchargeRate, nextSurchargeRate, potentialSaving } = gap

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-200 bg-amber-50 p-4"
    >
      <div className="flex gap-3">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-amber-900">Surcharge Threshold Alert</p>
          <p className="text-amber-800 leading-5">
            You're just <strong>{formatCompact(gapAmount)}</strong> away from the{' '}
            <strong>₹{(nextBracketAt / 10_000_000).toFixed(0)} crore</strong> surcharge bracket where
            the rate jumps from{' '}
            <strong>{formatPercent(currentSurchargeRate)}</strong> to{' '}
            <strong>{formatPercent(nextSurchargeRate)}</strong>.
          </p>
          {potentialSaving > 0 && (
            <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-amber-200">
              <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Splitting this exercise across two financial years could save approximately{' '}
                <strong className="text-amber-900">{formatCompact(potentialSaving)}</strong> in tax.
                Consider exercising up to{' '}
                <strong>{formatCompact(nextBracketAt - gap.gapAmount - 1)}</strong> of perquisite now and
                the rest in the next FY.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
