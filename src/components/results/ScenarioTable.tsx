import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { ScenarioRow } from '@/types/tax.types'

interface Props {
  scenarios: ScenarioRow[]
}

export function ScenarioTable({ scenarios }: Props) {
  return (
    <div>
      <p className="text-[16px] leading-[16px] font-semibold text-[#071437] mb-1">FMV Sensitivity Analysis</p>
      <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mb-3">How your tax changes at different FMV values</p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr className="text-[#99A1B7] border-b border-[#F1F1F4] text-[11px] font-[500] uppercase tracking-[0.08em]">
              <th className="text-left py-2.5 px-2">Scenario</th>
              <th className="text-right py-2.5 px-2">FMV</th>
              <th className="text-right py-2.5 px-2">Perquisite</th>
              <th className="text-right py-2.5 px-2">Tax</th>
              <th className="text-right py-2.5 px-2">Net Gain</th>
              <th className="text-right py-2.5 px-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-[#F1F1F4] ${row.isCurrent ? 'bg-[#FDF1EE]' : 'hover:bg-[#F6F9FB]'}`}
              >
                <td className="py-2.5 px-2 font-[500] text-[#252F4A]">
                  {row.label}
                  {row.isCurrent && (
                    <span className="ml-1.5 text-[10px] bg-[#E85936] text-white px-1.5 py-0.5 rounded-full">
                      current
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-right text-[#252F4A]">{formatCurrency(row.fmv)}</td>
                <td className="py-2.5 px-2 text-right text-[#252F4A]">{formatCurrency(row.perquisite)}</td>
                <td className="py-2.5 px-2 text-right text-[#B42318]">{formatCurrency(row.totalTax)}</td>
                <td className={`py-2.5 px-2 text-right font-[500] ${row.netGain >= 0 ? 'text-[#027A48]' : 'text-[#B42318]'}`}>
                  {formatCurrency(row.netGain)}
                </td>
                <td className="py-2.5 px-2 text-right text-[#99A1B7]">{formatPercent(row.effectiveTaxRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#99A1B7] mt-2 px-1">← Scroll to see all columns</p>
    </div>
  )
}
