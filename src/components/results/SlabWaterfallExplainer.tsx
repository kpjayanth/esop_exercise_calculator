import { Info } from 'lucide-react'
import { formatCurrency, formatPercent, formatCompact } from '@/lib/formatters'
import { Tooltip } from '@/components/ui/index'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
  annualSalaryIncome: number
  regime: 'NEW' | 'OLD'
}

export function SlabWaterfallExplainer({ result, annualSalaryIncome, regime }: Props) {
  const {
    netSalaryIncome,
    standardDeduction,
    perquisite,
    marginalSlabBreakdown,
    surcharge,
    cess,
    totalTax,
    effectiveTaxRate,
    applied87A,
  } = result

  if (perquisite <= 0) return null

  const slabBaseTax = marginalSlabBreakdown.reduce((s, l) => s + l.tax, 0)
  const maxBar = Math.max(...marginalSlabBreakdown.map((l) => l.income), 1)

  // Color by slab rate
  function slabColor(rate: number) {
    if (rate === 0) return { bg: 'bg-green-100', text: 'text-green-700', bar: '#16A34A' }
    if (rate <= 0.10) return { bg: 'bg-blue-100', text: 'text-blue-700', bar: '#3B82F6' }
    if (rate <= 0.15) return { bg: 'bg-indigo-100', text: 'text-indigo-700', bar: '#6366F1' }
    if (rate <= 0.20) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: '#F59E0B' }
    if (rate <= 0.25) return { bg: 'bg-orange-100', text: 'text-orange-700', bar: '#F97316' }
    return { bg: 'bg-red-100', text: 'text-red-700', bar: '#E85936' }
  }

  return (
    <div className="space-y-4">
      {/* Context: income build-up + standard deduction */}
      <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] px-4 py-3 space-y-2.5">
        {/* Step 1: gross → net */}
        <div className="flex items-center gap-2">
          <Info size={13} className="text-[#6B7280] shrink-0" />
          <span className="text-xs font-semibold text-[#374151]">
            {regime === 'NEW' ? 'New' : 'Old'} Regime — how your taxable income is built up
          </span>
        </div>
        <div className="space-y-1.5 pl-5 text-xs text-[#6B7280]">
          <div className="flex justify-between">
            <span>Gross Salary</span>
            <span className="font-medium text-[#111827]">{formatCompact(annualSalaryIncome)}</span>
          </div>
          {standardDeduction > 0 && (
            <div className="flex justify-between text-[#9CA3AF]">
              <span>
                Less: Standard Deduction
                <span className="ml-1 text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                  {regime === 'NEW' ? '₹75,000 · New Regime' : '₹50,000 · Old Regime'}
                </span>
              </span>
              <span className="font-medium text-[#A05C45]">−{formatCompact(standardDeduction)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#EBEBEB] pt-1.5">
            <span className="font-semibold text-[#374151]">Net Taxable Salary</span>
            <span className="font-semibold text-[#111827]">{formatCompact(netSalaryIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ ESOP Perquisite</span>
            <span className="font-medium text-[#3F7D5A]">+{formatCompact(perquisite)}</span>
          </div>
          <div className="flex justify-between border-t border-[#EBEBEB] pt-1.5">
            <span className="font-semibold text-[#374151]">Total Income for Slab</span>
            <span className="font-semibold text-[#111827]">{formatCompact(netSalaryIncome + perquisite)}</span>
          </div>
        </div>
        <p className="pl-5 text-[11px] text-[#9CA3AF]">
          Your net salary already fills the lower slabs — the perquisite is taxed at your{' '}
          <span className="font-semibold text-[#E85936]">marginal (topmost) rate</span>, not a flat rate.
        </p>
      </div>

      {/* Slab table */}
      {applied87A ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span className="font-semibold">Rebate u/s 87A applied</span> — Your total income is below the
          rebate threshold, so the entire income tax is waived. Effective rate: 0%.
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs text-[#9CA3AF]">
                <th className="text-left px-4 py-2.5 font-medium">Slab</th>
                <th className="text-right px-4 py-2.5 font-medium hidden sm:table-cell">Income in slab</th>
                <th className="px-3 py-2.5 font-medium hidden md:table-cell w-32">Proportion</th>
                <th className="text-right px-4 py-2.5 font-medium">Rate</th>
                <th className="text-right px-4 py-2.5 font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {marginalSlabBreakdown.map((slab, i) => {
                const colors = slabColor(slab.rate)
                return (
                  <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-400')}`}
                          style={{ backgroundColor: colors.bar }} />
                        <span className="font-medium text-[#374151]">{slab.label}</span>
                        {slab.isPartiallyUsed && (
                          <Tooltip text={`Salary fills ₹${(slab.salaryFillsUpTo / 1000).toFixed(0)}K of this bracket. Perquisite uses the remaining room.`}>
                            <span className="text-[10px] text-[#9CA3AF] border border-[#E5E7EB] rounded px-1 cursor-help">partial</span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[#374151] hidden sm:table-cell">
                      {formatCurrency(slab.income)}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(slab.income / maxBar) * 100}%`,
                            backgroundColor: colors.bar,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {formatPercent(slab.rate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#E85936]">
                      {slab.tax > 0 ? `−${formatCurrency(slab.tax)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
                <td className="px-4 py-2.5 text-xs font-semibold text-[#374151]">Slab Tax</td>
                <td className="px-4 py-2.5 text-right text-xs font-semibold text-[#374151] hidden sm:table-cell">
                  {formatCurrency(perquisite)}
                </td>
                <td className="hidden md:table-cell" />
                <td className="px-4 py-2.5 text-right text-xs text-[#6B7280]">
                  avg {formatPercent(perquisite > 0 ? slabBaseTax / perquisite : 0)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs font-semibold text-[#E85936]">
                  −{formatCurrency(slabBaseTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Build-up to effective rate */}
      {!applied87A && (
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-[#F9FAFB] px-4 py-2.5 border-b border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#374151]">From slab tax → effective rate on perquisite</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {[
              { label: 'Slab income tax', value: slabBaseTax, note: `avg ${formatPercent(perquisite > 0 ? slabBaseTax / perquisite : 0)} on perquisite` },
              ...(surcharge > 0 ? [{ label: 'Surcharge', value: surcharge, note: 'on income tax' }] : []),
              { label: 'Health & Education Cess (4%)', value: cess, note: 'on tax + surcharge' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2.5 text-sm">
                <div>
                  <span className="text-[#6B7280]">{row.label}</span>
                  <span className="text-xs text-[#9CA3AF] ml-2">{row.note}</span>
                </div>
                <span className="text-[#E85936] font-medium">−{formatCurrency(row.value)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3 bg-[#FFF7F5]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#111827]">Total tax on perquisite</span>
                <span className="text-xs text-[#9CA3AF]">= effective rate</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#E85936]">−{formatCurrency(totalTax)}</span>
                <span className="text-sm font-bold text-white bg-[#E85936] rounded-full px-2.5 py-0.5">
                  {formatPercent(effectiveTaxRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
