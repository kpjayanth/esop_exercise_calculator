import { HelpCircle } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { Tooltip } from '@/components/ui/index'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
}

interface Row {
  label: string
  value: string
  valueClass?: string
  tooltip?: string
  indent?: boolean
  bold?: boolean
}

export function TaxBreakdownRows({ result }: Props) {
  const {
    grossValue, exerciseCost, perquisite,
    baseTaxOnTotal, surcharge, cess, totalTax, netGain,
    effectiveTaxRate, applied87A,
  } = result

  const rows: Row[] = [
    {
      label: 'Gross Value (FMV × Options)',
      value: formatCurrency(grossValue),
      tooltip: 'Total value of options at current fair market value',
    },
    {
      label: 'Less: Exercise Cost (Strike × Options)',
      value: `−${formatCurrency(exerciseCost)}`,
      valueClass: 'text-[#A05C45]',
      tooltip: 'Amount you pay to exercise the options (strike price × options)',
    },
    {
      label: 'Perquisite Income',
      value: formatCurrency(perquisite),
      valueClass: 'text-[#3F7D5A] font-semibold',
      tooltip: '(FMV − Strike) × Options — this becomes taxable salary income',
      bold: true,
    },
  ]

  if (applied87A) {
    rows.push({
      label: 'Income Tax (0% — Rebate u/s 87A applied)',
      value: '₹0',
      valueClass: 'text-[#3F7D5A]',
      tooltip: 'Your total income is below ₹12L (new) or ₹5L (old), so full rebate applies',
      indent: true,
    })
  } else {
    rows.push({
      label: 'Income Tax on ESOP (marginal slab rate)',
      value: `−${formatCurrency(baseTaxOnTotal)}`,
      valueClass: 'text-[#A05C45]',
      tooltip: 'Additional tax due to ESOP income, computed at your marginal slab rate',
      indent: true,
    })
    if (surcharge > 0) {
      rows.push({
        label: 'Surcharge',
        value: `−${formatCurrency(surcharge)}`,
        valueClass: 'text-[#A05C45]',
        tooltip: 'Applicable when total income exceeds ₹50L. Computed with marginal relief.',
        indent: true,
      })
    }
    rows.push({
      label: 'Health & Education Cess (4%)',
      value: `−${formatCurrency(cess)}`,
      valueClass: 'text-[#A05C45]',
      tooltip: '4% on income tax + surcharge',
      indent: true,
    })
    rows.push({
      label: 'Total Tax',
      value: `−${formatCurrency(totalTax)}`,
      valueClass: 'text-[#A05C45] font-semibold',
      tooltip: `Effective rate on perquisite: ${formatPercent(effectiveTaxRate)}`,
      bold: true,
    })
  }

  rows.push({
    label: 'Net Gain (after tax)',
    value: formatCurrency(netGain),
    valueClass: netGain >= 0 ? 'text-[#3F7D5A] font-bold text-base' : 'text-[#A05C45] font-bold text-base',
    bold: true,
  })

  return (
    <div className="space-y-0 divide-y divide-[#F9FAFB]">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex justify-between items-center py-2.5 ${row.indent ? 'pl-4' : ''}`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {row.indent && <span className="text-[#D1D5DB] text-xs">↳</span>}
            <span className={`text-sm ${row.bold ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'}`}>
              {row.label}
            </span>
            {row.tooltip && (
              <Tooltip text={row.tooltip}>
                <HelpCircle size={11} className="text-[#D1D5DB] cursor-help shrink-0" />
              </Tooltip>
            )}
          </div>
          <span className={`text-sm ml-4 shrink-0 ${row.valueClass ?? 'text-[#374151] font-medium'}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}
