import { CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCompact, formatCurrency, formatPercent } from '@/lib/formatters'
import { Badge } from '@/components/ui/index'
import type { RegimeComparison as RegimeComparisonType } from '@/types/tax.types'

interface Props {
  comparison: RegimeComparisonType
}

export function RegimeComparison({ comparison }: Props) {
  const { newRegime, oldRegime, betterRegime, saving } = comparison

  const chartData = [
    {
      name: 'New Regime',
      Tax: Math.round(newRegime.totalTax),
      'Net Gain': Math.round(newRegime.netGain),
    },
    {
      name: 'Old Regime',
      Tax: Math.round(oldRegime.totalTax),
      'Net Gain': Math.round(oldRegime.netGain),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#111827]">New vs Old Regime</p>
        <Badge variant="success">
          <CheckCircle size={10} />
          {betterRegime === 'NEW' ? 'New' : 'Old'} saves {formatCompact(saving)}
        </Badge>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => formatCompact(v)} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={52} />
            <RechartsTooltip
              formatter={(value: unknown, name: unknown) => [formatCurrency(Number(value)), String(name ?? '')]}
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Tax" fill="#E85936" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Net Gain" fill="#16A34A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'New Regime', r: newRegime, isBetter: betterRegime === 'NEW' },
          { label: 'Old Regime', r: oldRegime, isBetter: betterRegime === 'OLD' },
        ].map(({ label, r, isBetter }) => (
          <div
            key={label}
            className={`rounded-xl border p-3 ${isBetter ? 'border-[#16A34A] bg-green-50' : 'border-[#E5E7EB] bg-[#F9FAFB]'}`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-xs font-semibold text-[#374151]">{label}</p>
              {isBetter && <CheckCircle size={12} className="text-[#16A34A]" />}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Tax</span>
                <span className="text-[#E85936] font-medium">{formatCompact(r.totalTax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Net Gain</span>
                <span className="text-[#16A34A] font-medium">{formatCompact(r.netGain)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B7280]">Effective Rate</span>
                <span className="text-[#374151] font-medium">{formatPercent(r.effectiveTaxRate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
