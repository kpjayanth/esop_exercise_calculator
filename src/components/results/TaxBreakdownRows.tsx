import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { PerquisiteResult } from '@/types/tax.types'

interface Props {
  result: PerquisiteResult
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E85936] text-white text-[11px] font-bold shrink-0">
      {n}
    </span>
  )
}

function StepHeading({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <StepBadge n={n} />
      <span className="text-[14px] leading-[20px] font-semibold text-[#071437]">{label}</span>
    </div>
  )
}

function InfoRow({ label, sub, value, valueClass = 'text-[#252F4A] font-medium' }: {
  label: string
  sub?: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex justify-between items-start gap-4 px-4 py-3.5 border-b border-[#F3F4F6] last:border-0">
      <div className="min-w-0">
        <p className="text-[14px] leading-[20px] font-[500] text-[#252F4A]">{label}</p>
        {sub && <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-1">{sub}</p>}
      </div>
      <span className={`text-sm shrink-0 ${valueClass}`}>{value}</span>
    </div>
  )
}

function SummaryBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#F1F5F2] border border-[#D4E6DB] px-4 py-3.5 space-y-2">
      {children}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#F6F9FB] border border-[#F1F1F4] px-4 py-3.5 space-y-1.5">
      {children}
    </div>
  )
}

function Bullet({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12px] leading-[18px] text-[#99A1B7]">
      <span className="text-[#E85936] font-bold mt-px">▪</span>
      <p><span className="font-semibold text-[#252F4A]">{label}:</span> {value}</p>
    </div>
  )
}

export function TaxBreakdownRows({ result }: Props) {
  const {
    grossValue, exerciseCost, perquisite,
    baseTaxOnTotal, surcharge, cess, totalTax, netGain,
    effectiveTaxRate, applied87A,
  } = result

  // find the top marginal rate from marginalSlabBreakdown
  const topRate = result.marginalSlabBreakdown.length > 0
    ? Math.max(...result.marginalSlabBreakdown.map(s => s.rate))
    : null

  return (
    <div className="space-y-6 pt-1">

      {/* Step 1 — Perquisite Value */}
      <div>
        <StepHeading n={1} label="Perquisite Value Calculation" />
        <div className="rounded-lg border border-[#F1F1F4] divide-y divide-[#F1F1F4] overflow-hidden">
          <InfoRow
            label="Your ESOP Net Value"
            sub="This is the net value of your ESOPs on which tax is calculated"
            value={formatCurrency(perquisite)}
            valueClass="text-[#3F7D5A] font-semibold"
          />
        </div>
        <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7] mt-2 px-1">
          = Gross value ({formatCurrency(grossValue)}) − Exercise cost ({formatCurrency(exerciseCost)})
        </p>
      </div>

      {/* Step 2 — Tax Components */}
      <div>
        <StepHeading n={2} label="Tax Components" />
        <div className="rounded-lg border border-[#F1F1F4] divide-y divide-[#F1F1F4] overflow-hidden">
          {applied87A ? (
            <InfoRow
              label="Income Tax"
              sub="Rebate u/s 87A applied — your total income is below the rebate threshold"
              value="₹0"
              valueClass="text-[#3F7D5A] font-semibold"
            />
          ) : (
            <>
              <InfoRow
                label="Income Tax"
                sub={topRate
                  ? `Applied at your marginal rate: ${formatPercent(topRate)}, but the waterfall slab method is used — giving an effective rate of ${formatPercent(effectiveTaxRate)}`
                  : 'Applied at your marginal slab rate using the waterfall method'}
                value={formatCurrency(baseTaxOnTotal)}
                valueClass="text-[#A05C45] font-medium"
              />
              {surcharge > 0 && (
                <InfoRow
                  label="Surcharge"
                  sub="Applicable as your total income exceeds ₹50L"
                  value={`+${formatCurrency(surcharge)}`}
                  valueClass="text-[#A05C45] font-medium"
                />
              )}
              <InfoRow
                label="Health and Education Cess"
                sub="4% cess on (income tax + surcharge) as per Indian tax law"
                value={`+${formatCurrency(cess)}`}
                valueClass="text-[#A05C45] font-medium"
              />
            </>
          )}
        </div>
      </div>

      {/* Step 3 — Total Tax Summary */}
      <div>
        <StepHeading n={3} label="Total Tax Summary" />
        <SummaryBox>
          <div className="flex justify-between items-center">
            <span className="text-[14px] leading-[20px] font-[500] text-[#252F4A]">Total Tax on ESOP Gain</span>
            <span className="text-base font-bold text-[#A05C45]">{formatCurrency(totalTax)}</span>
          </div>
          <div className="flex justify-between items-start pt-1 border-t border-[#C8DDD0]">
            <div>
              <span className="text-[14px] leading-[20px] font-[500] text-[#252F4A]">Effective Tax Rate</span>
              <p className="text-[12px] leading-[18px] font-[500] text-[#99A1B7]">{formatCurrency(totalTax)} ÷ {formatCurrency(perquisite)} × 100</p>
            </div>
            <span className="text-base font-bold text-[#3F7D5A]">{formatPercent(effectiveTaxRate)}</span>
          </div>
        </SummaryBox>
      </div>

      {/* What This Means */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F6F9FB] border border-[#DBDFE9] text-[#99A1B7] text-[11px] font-bold shrink-0">?</span>
          <span className="text-[16px] leading-[16px] font-semibold text-[#071437]">What This Means</span>
        </div>
        <InfoBox>
          <Bullet
            label="Effective Tax Rate"
            value={`${formatPercent(effectiveTaxRate)} of your ESOP gain goes to taxes`}
          />
          {topRate && (
            <Bullet
              label="Marginal Rate"
              value={`${formatPercent(topRate)} is your highest income tax bracket`}
            />
          )}
          {surcharge > 0 && (
            <Bullet
              label="Surcharge Applied"
              value="Your income crossed ₹50L — surcharge is included in the total"
            />
          )}
          <Bullet
            label="Total Cash Impact"
            value={`You'll need ${formatCurrency(totalTax)} for tax payments`}
          />
          <Bullet
            label="Net Gain"
            value={`After all taxes, you take home ${formatCurrency(netGain)}`}
          />
        </InfoBox>
      </div>

    </div>
  )
}
