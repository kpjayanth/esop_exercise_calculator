import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Info } from 'lucide-react'
import { Card, Label, Input, Badge } from '@/components/ui/index'
import { useStartupDeferral } from '@/hooks/useTaxEngine'
import { formatCurrency, formatCompact } from '@/lib/formatters'
import type { PerquisiteInputs } from '@/types/tax.types'

interface Props {
  inputs: PerquisiteInputs
}

export function StartupDeferral({ inputs }: Props) {
  const [incorporationDate, setIncorporationDate] = useState('2019-01-01')
  const [annualTurnover, setAnnualTurnover] = useState(50_000_000)
  const [exerciseDate, setExerciseDate] = useState(new Date().toISOString().split('T')[0])

  const startupInputs = {
    ...inputs,
    isDPIITRecognized: inputs.isDPIITRecognized,
    incorporationDate,
    annualTurnover,
    exerciseDate,
  }

  const deferral = useStartupDeferral(startupInputs)

  return (
    <div className="space-y-4">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-2">
          <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Section 192AC — Startup ESOP Tax Deferral</p>
            <p className="text-xs leading-5 text-blue-700">
              Employees of eligible DPIIT-recognized startups can defer paying TDS on ESOP perquisite tax for up
              to <strong>5 years</strong> from the exercise date, or until they sell the shares / leave the company
              — whichever happens first. This helps employees who receive shares but need to hold them before
              getting liquidity.
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility inputs */}
      <Card className="p-4 space-y-4">
        <p className="text-sm font-semibold text-[#111827]">Eligibility Check</p>

        <div className="space-y-1.5">
          <Label>Is company DPIIT recognized?</Label>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => inputs.isDPIITRecognized !== v && inputs}
                className={`flex-1 h-9 rounded-xl border text-sm font-medium transition-colors ${
                  inputs.isDPIITRecognized === v
                    ? 'border-[#E85936] bg-red-50 text-[#E85936]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#E85936]'
                }`}
              >
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#9CA3AF]">Set via Company Type on the left panel (select "Unlisted Startup")</p>
        </div>

        <div className="space-y-1.5">
          <Label>Company Incorporation Date</Label>
          <Input type="date" value={incorporationDate} onChange={(e) => setIncorporationDate(e.target.value)} />
          <p className="text-xs text-[#9CA3AF]">Must be on or after April 1, 2016</p>
        </div>

        <div className="space-y-1.5">
          <Label>Highest Annual Turnover (any prior year)</Label>
          <Input
            type="number"
            prefix="₹"
            value={annualTurnover || ''}
            onChange={(e) => setAnnualTurnover(Number(e.target.value) || 0)}
          />
          <p className="text-xs text-[#9CA3AF]">Must not exceed ₹100 crore</p>
        </div>

        <div className="space-y-1.5">
          <Label>Exercise Date</Label>
          <Input type="date" value={exerciseDate} onChange={(e) => setExerciseDate(e.target.value)} />
        </div>
      </Card>

      {/* Result */}
      <Card className="p-4">
        {deferral.eligible ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#16A34A]" />
              <Badge variant="success">Eligible for Tax Deferral</Badge>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-lg font-bold text-[#16A34A]">{formatCompact(deferral.taxDeferred)}</p>
              <p className="text-sm text-green-700 mt-0.5">Tax deferred (pay later, not now)</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#111827]">Deferral Expiry</p>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-[#6B7280]" />
                <span className="text-[#374151]">Tax must be paid by {deferral.deferralExpiryDate}</span>
              </div>

              <p className="text-sm font-semibold text-[#111827]">Triggers (earliest applies)</p>
              <div className="space-y-2">
                {deferral.triggers.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="text-[#E85936] font-bold shrink-0">{i + 1}.</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
              <p className="text-xs font-medium text-[#374151] mb-1">Cash Flow Benefit</p>
              <p className="text-xs text-[#6B7280] leading-5">
                Instead of paying {formatCurrency(deferral.taxDeferred)} today, you get to keep this
                capital invested for up to 5 years. At an 8% annual return, this deferral could generate
                approximately{' '}
                <strong className="text-[#374151]">
                  {formatCurrency(deferral.taxDeferred * (Math.pow(1.08, 5) - 1))}
                </strong>{' '}
                in additional returns.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-[#E85936]" />
              <Badge variant="error">Not Eligible</Badge>
            </div>
            <p className="text-sm text-[#374151]">{deferral.ineligibilityReason}</p>
            <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280] leading-5">
                To be eligible: Company must be DPIIT-recognized, incorporated after April 1, 2016, and
                have annual turnover under ₹100 crore in every prior year.
              </p>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-[#9CA3AF] text-center pb-2">
        Per Section 192AC, Income Tax Act. Consult a CA for startup-specific advice.
      </p>
    </div>
  )
}
