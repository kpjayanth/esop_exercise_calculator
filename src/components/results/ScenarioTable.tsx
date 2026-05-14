import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { ScenarioRow } from '@/types/tax.types'

interface Props {
  scenarios: ScenarioRow[]
}

export function ScenarioTable({ scenarios }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#111827] mb-3">FMV Sensitivity Analysis</p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[#9CA3AF] border-b border-[#F3F4F6]">
              <th className="text-left py-2 px-2 font-medium">Scenario</th>
              <th className="text-right py-2 px-2 font-medium">FMV</th>
              <th className="text-right py-2 px-2 font-medium">Perquisite</th>
              <th className="text-right py-2 px-2 font-medium">Tax</th>
              <th className="text-right py-2 px-2 font-medium">Net Gain</th>
              <th className="text-right py-2 px-2 font-medium">Eff. Rate</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((row) => (
              <tr
                key={row.label}
                className={`border-b border-[#F9FAFB] ${row.isCurrent ? 'bg-[#FFF7F5]' : 'hover:bg-[#F9FAFB]'}`}
              >
                <td className="py-2 px-2 font-medium text-[#374151]">
                  {row.label}
                  {row.isCurrent && (
                    <span className="ml-1.5 text-[10px] bg-[#E85936] text-white px-1.5 py-0.5 rounded-full">
                      current
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-right text-[#374151]">{formatCurrency(row.fmv)}</td>
                <td className="py-2 px-2 text-right text-[#374151]">{formatCurrency(row.perquisite)}</td>
                <td className="py-2 px-2 text-right text-[#E85936]">{formatCurrency(row.totalTax)}</td>
                <td className={`py-2 px-2 text-right font-medium ${row.netGain >= 0 ? 'text-[#16A34A]' : 'text-[#E85936]'}`}>
                  {formatCurrency(row.netGain)}
                </td>
                <td className="py-2 px-2 text-right text-[#6B7280]">{formatPercent(row.effectiveTaxRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
