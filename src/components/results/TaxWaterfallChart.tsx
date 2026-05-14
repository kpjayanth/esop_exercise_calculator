import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatCompact } from '@/lib/formatters'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
}

interface WaterfallEntry {
  name: string
  base: number
  value: number
  type: 'positive' | 'negative' | 'total'
}

export function TaxWaterfallChart({ result }: Props) {
  const { grossValue, exerciseCost, baseTaxOnTotal, surcharge, cess, netGain } = result

  // Waterfall: each bar floats on a transparent base
  const entries: WaterfallEntry[] = [
    { name: 'Gross\nValue', base: 0, value: grossValue, type: 'positive' },
    { name: 'Exercise\nCost', base: grossValue - exerciseCost, value: exerciseCost, type: 'negative' },
    { name: 'Income\nTax', base: netGain + cess + surcharge, value: baseTaxOnTotal, type: 'negative' },
  ]
  if (surcharge > 0) {
    entries.push({ name: 'Surcharge', base: netGain + cess, value: surcharge, type: 'negative' })
  }
  entries.push({ name: 'Cess', base: netGain, value: cess, type: 'negative' })
  entries.push({ name: 'Net Gain', base: 0, value: netGain, type: 'total' })

  const colors: Record<string, string> = {
    positive: '#16A34A',
    negative: '#E85936',
    total: '#3B82F6',
  }

  interface TooltipProps {
    active?: boolean
    payload?: Array<{ name: string; value: number; payload: WaterfallEntry }>
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload?.length) return null
    const entry = payload.find((p) => p.name === 'value')
    if (!entry) return null
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-md text-sm">
        <p className="font-semibold text-[#111827] mb-0.5">{entry.payload.name.replace('\n', ' ')}</p>
        <p className={entry.payload.type === 'negative' ? 'text-[#E85936]' : 'text-[#16A34A]'}>
          {formatCompact(entry.value)}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={entries} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCompact(v)}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <RechartsTooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine y={0} stroke="#E5E7EB" />
          {/* Transparent base for waterfall effect */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {entries.map((entry, idx) => (
              <Cell key={idx} fill={colors[entry.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
