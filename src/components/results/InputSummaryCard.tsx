import { formatCompact, formatPercent } from '@/lib/formatters'
import { Amt } from '@/components/ui/index'
import type { PerquisiteInputs, PerquisiteResult } from '@/types/tax.types'

interface Props {
  inputs: PerquisiteInputs
  result: PerquisiteResult
  totalVested: number
  optionsSelected: number
  totalShares: number
  costToAcquire: number
}

function Tile({ label, value, sub, valueClass = 'text-[#111827]' }: { label: string; value: React.ReactNode; sub?: React.ReactNode; valueClass?: string }) {
  return (
    <div className="bg-[#F9FAFB] rounded-xl p-4">
      <p className="text-[10px] font-medium text-[#B0B7C3] uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-xl font-semibold leading-none tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className="text-[11px] text-[#B0B7C3] mt-1.5 font-normal">{sub}</p>}
    </div>
  )
}

export function InputSummaryCard({ inputs, result, optionsSelected, totalShares, costToAcquire }: Props) {
  const { totalTax, netGain, effectiveTaxRate } = result
  const totalCashOutflow = costToAcquire + totalTax
  const hasConversion = optionsSelected !== totalShares

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm bg-white">
      <div className="px-5 pt-4 pb-1">
        <span className="text-[10px] font-medium text-[#B0B7C3] uppercase tracking-widest">Exercise Summary</span>
      </div>

      {/* Narrative sentence */}
      <div className="mx-5 my-3 px-4 py-3.5 bg-[#F9FAFB] rounded-xl border-l-[3px] border-[#E85936]">
        <p className="text-sm text-[#6B7280] leading-relaxed font-normal">
          If you exercise{' '}
          <span className="font-semibold text-[#111827]">{optionsSelected.toLocaleString('en-IN')} ESOPs</span>
          {hasConversion && (
            <> (<span className="font-semibold text-[#374151]">{totalShares.toLocaleString('en-IN')} shares</span>)</>
          )}{' '}
          today, you will spend{' '}
          <span className="font-semibold text-[#374151]"><Amt value={costToAcquire} /></span>{' '}
          to acquire them and pay{' '}
          <span className="font-semibold text-[#A05C45]"><Amt value={totalTax} /></span>{' '}
          as perquisite tax — making your total cash outflow{' '}
          <span className="font-semibold text-[#374151]"><Amt value={totalCashOutflow} /></span>.
        </p>
      </div>

      {/* 4 metric tiles */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <Tile
          label="Total Cash Outflow"
          value={<Amt value={totalCashOutflow} />}
          sub={<><Amt value={costToAcquire} /> exercise cost + <Amt value={totalTax} /> tax</>}
        />
        <Tile
          label="Effective Tax Rate"
          value={formatPercent(effectiveTaxRate)}
        />
        <Tile
          label="Net Gain"
          value={<Amt value={netGain} />}
          valueClass={netGain >= 0 ? 'text-[#3F7D5A]' : 'text-[#A05C45]'}
        />
        <Tile
          label="ESOPs Exercised"
          value={`${optionsSelected.toLocaleString('en-IN')} options`}
          sub={hasConversion ? `→ ${totalShares.toLocaleString('en-IN')} shares (after conversion)` : undefined}
        />
      </div>
    </div>
  )
}
