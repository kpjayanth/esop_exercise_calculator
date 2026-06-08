import { formatPercent } from '@/lib/formatters'
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

function Tile({ label, value, sub, valueClass = 'text-[#071437]' }: { label: string; value: React.ReactNode; sub?: React.ReactNode; valueClass?: string }) {
  return (
    <div className="bg-[#F6F9FB] rounded-lg p-4">
      <p className="text-[11px] font-[500] text-[#99A1B7] uppercase tracking-[0.06em] mb-2">{label}</p>
      <p className={`text-[18px] font-semibold leading-[18px] tracking-tight ${valueClass}`}>{value}</p>
      {sub && <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-1.5">{sub}</p>}
    </div>
  )
}

export function InputSummaryCard({ result, optionsSelected, totalShares, costToAcquire }: Props) {
  const { totalTax, netGain, effectiveTaxRate } = result
  const totalCashOutflow = costToAcquire + totalTax
  const hasConversion = optionsSelected !== totalShares

  return (
    <div className="rounded-lg overflow-hidden border border-[#F1F1F4] bg-white" style={{ boxShadow: '0 3px 4px rgba(0,0,0,0.03)' }}>
      <div className="px-5 pt-4 pb-1">
        <span className="text-[11px] font-[500] text-[#99A1B7] uppercase tracking-[0.06em]">Exercise Summary</span>
      </div>

      {/* Narrative sentence */}
      <div className="mx-5 my-3 px-4 py-3.5 bg-[#F6F9FB] rounded-lg border border-[#F1F1F4]">
        <p className="text-[14px] leading-[20px] font-[500] text-[#99A1B7]">
          If you exercise{' '}
          <span className="font-semibold text-[#071437]">{optionsSelected.toLocaleString('en-IN')} ESOPs</span>
          {hasConversion && (
            <> (<span className="font-semibold text-[#252F4A]">{totalShares.toLocaleString('en-IN')} shares</span>)</>
          )}{' '}
          today, you will spend{' '}
          <span className="font-semibold text-[#252F4A]"><Amt value={costToAcquire} /></span>{' '}
          to acquire them and pay{' '}
          <span className="font-semibold text-[#A05C45]"><Amt value={totalTax} /></span>{' '}
          as perquisite tax — making your total cash outflow{' '}
          <span className="font-semibold text-[#252F4A]"><Amt value={totalCashOutflow} /></span>.
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
