import { useState } from 'react'
import { Card, Label, Input, Badge } from '@/components/ui/index'
import { useCapitalGains } from '@/hooks/useTaxEngine'
import { usePerquisiteTax } from '@/hooks/useTaxEngine'
import { formatCurrency, formatPercent, formatCompact } from '@/lib/formatters'
import type { PerquisiteInputs } from '@/types/tax.types'
import { TrendingUp, Clock } from 'lucide-react'

interface Props {
  inputs: PerquisiteInputs
}

export function CapGainsScenario({ inputs }: Props) {
  const [salePrice, setSalePrice] = useState(inputs.fmvAtExercise * 1.5)
  const [holdingMonths, setHoldingMonths] = useState(13)

  const perquisiteResult = usePerquisiteTax(inputs)

  const cgInputs = {
    fmvAtExercise: inputs.fmvAtExercise,
    salePrice,
    numberOfShares: inputs.numberOfOptions,
    holdingMonths,
    companyType: inputs.companyType,
    annualSalaryIncome: inputs.annualSalaryIncome,
    perquisite: perquisiteResult.perquisite,
    regime: inputs.regime,
  }
  const cgResult = useCapitalGains(cgInputs)

  const isLTCG = cgResult.gainType === 'LTCG'
  const minMonths = inputs.companyType === 'LISTED' ? 12 : 24
  const totalTax = perquisiteResult.totalTax + cgResult.totalCGTax
  const totalNetGain = perquisiteResult.netGain + cgResult.netProceeds - cgResult.costOfAcquisition

  return (
    <div className="space-y-4">
      {/* Context banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">How capital gains work on ESOP shares</p>
        <p className="text-xs leading-5 text-blue-700">
          When you sell shares acquired through exercise, the cost of acquisition is the{' '}
          <strong>FMV at exercise date</strong> (not your strike price — you already paid perquisite tax on
          the spread). Only the gain above this FMV is subject to capital gains tax.
        </p>
      </div>

      {/* Sale inputs */}
      <Card className="p-4 space-y-4">
        <p className="text-sm font-semibold text-[#111827]">Sale Parameters</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Expected Sale Price (per share)</Label>
            <Input
              type="number"
              prefix="₹"
              value={salePrice || ''}
              min={0}
              onChange={(e) => setSalePrice(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>FMV at Exercise (your cost basis)</Label>
            <Input
              type="number"
              prefix="₹"
              value={inputs.fmvAtExercise}
              readOnly
              className="bg-[#F9FAFB] text-[#6B7280]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Holding Period</Label>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isLTCG ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {holdingMonths} months — {isLTCG ? 'LTCG' : 'STCG'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={holdingMonths}
            onChange={(e) => setHoldingMonths(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[#9CA3AF]">
            <span>1 month</span>
            <span className="text-center">
              {minMonths}m threshold
              <br />
              <span className={`text-[10px] font-medium ${isLTCG ? 'text-green-600' : 'text-amber-600'}`}>
                LTCG applies after {minMonths} months
              </span>
            </span>
            <span>60 months</span>
          </div>
        </div>
      </Card>

      {/* CG result */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#111827]">Capital Gains Tax</p>
          <Badge variant={isLTCG ? 'success' : 'warning'}>
            <Clock size={10} />
            {isLTCG ? `LTCG @ ${formatPercent(cgResult.taxRate)}` : `STCG @ ${formatPercent(cgResult.taxRate)}`}
          </Badge>
        </div>

        <div className="space-y-2 divide-y divide-[#F9FAFB]">
          {[
            { label: 'Sale Value', value: formatCurrency(cgResult.saleValue), color: '' },
            { label: 'Cost of Acquisition (FMV at exercise)', value: `−${formatCurrency(cgResult.costOfAcquisition)}`, color: 'text-[#6B7280]' },
            { label: 'Capital Gain', value: formatCurrency(cgResult.capitalGain), color: cgResult.capitalGain >= 0 ? 'text-[#16A34A]' : 'text-[#E85936]' },
            ...(cgResult.taxableGain !== cgResult.capitalGain ? [{ label: `Less: LTCG exemption (₹1.25L)`, value: `−₹1,25,000`, color: 'text-[#6B7280]' }] : []),
            { label: `Capital Gains Tax (${formatPercent(cgResult.taxRate)})`, value: `−${formatCurrency(cgResult.capitalGainsTax)}`, color: 'text-[#E85936]' },
            { label: 'Cess (4%)', value: `−${formatCurrency(cgResult.cessOnCG)}`, color: 'text-[#E85936]' },
            { label: 'Total CG Tax', value: `−${formatCurrency(cgResult.totalCGTax)}`, color: 'text-[#E85936] font-semibold' },
            { label: 'Net from Sale', value: formatCurrency(cgResult.netProceeds), color: cgResult.netProceeds >= 0 ? 'text-[#16A34A] font-semibold' : 'text-[#E85936] font-semibold' },
          ].map((r, i) => (
            <div key={i} className="flex justify-between py-2 text-sm">
              <span className="text-[#6B7280]">{r.label}</span>
              <span className={r.color || 'text-[#374151] font-medium'}>{r.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Combined journey */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-[#16A34A]" />
          <p className="text-sm font-semibold text-[#111827]">Full ESOP Journey</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Exercise Tax', value: perquisiteResult.totalTax, color: 'text-[#E85936]' },
            { label: 'Capital Gains Tax', value: cgResult.totalCGTax, color: 'text-[#E85936]' },
            { label: 'Total Net Gain', value: totalNetGain, color: totalNetGain >= 0 ? 'text-[#16A34A]' : 'text-[#E85936]' },
          ].map((m) => (
            <div key={m.label} className="bg-[#F9FAFB] rounded-xl p-3">
              <p className={`text-lg font-bold ${m.color}`}>{formatCompact(m.value)}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3 text-center">
          Combined: ₹{formatCompact(totalTax)} in taxes on {formatCompact(cgResult.saleValue - inputs.numberOfOptions * inputs.strikePrice)} of total gains.
        </p>
      </Card>

      <p className="text-xs text-[#9CA3AF] text-center pb-2">
        Capital gains rates per Budget 2024 (post July 23, 2024). For FY 2025-26.
      </p>
    </div>
  )
}
