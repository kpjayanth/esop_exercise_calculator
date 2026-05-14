import { useState } from 'react'
import { Globe, Info } from 'lucide-react'
import { Card, Label, Select, Badge } from '@/components/ui/index'
import { useNRITax } from '@/hooks/useTaxEngine'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { DTAA_COUNTRIES } from '@/lib/constants'
import type { PerquisiteInputs } from '@/types/tax.types'

interface Props {
  inputs: PerquisiteInputs
}

export function NRIScenario({ inputs }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string>('none')

  const dtaaCountry = DTAA_COUNTRIES.find((c) => c.country === selectedCountry) ?? null

  const nriInputs = {
    strikePrice: inputs.strikePrice,
    fmvAtExercise: inputs.fmvAtExercise,
    numberOfOptions: inputs.numberOfOptions,
    grantType: inputs.grantType,
    dtaaCountry: dtaaCountry?.country ?? null,
    dtaaRate: dtaaCountry?.rate ?? null,
  }

  const result = useNRITax(nriInputs)

  const hasValues = inputs.fmvAtExercise > 0 && inputs.numberOfOptions > 0

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-2">
          <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">NRI ESOP Taxation</p>
            <p className="text-xs text-blue-700 leading-5">
              For Non-Resident Indians, ESOP perquisite income is taxable in India (source country rule).
              TDS is deducted at a flat <strong>30% rate</strong> plus 10% surcharge plus 4% cess.
              If your country of residence has a DTAA (Double Tax Avoidance Agreement) with India,
              a lower withholding rate may apply.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#6B7280]" />
          <p className="text-sm font-semibold text-[#111827]">Country of Residence</p>
        </div>

        <div className="space-y-1.5">
          <Label>Select Country (for DTAA benefit)</Label>
          <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="none">No DTAA / Standard rate (30%)</option>
            {DTAA_COUNTRIES.map((c) => (
              <option key={c.country} value={c.country}>
                {c.country} — {c.rate === 0 ? 'Exempt' : `${(c.rate * 100).toFixed(0)}% DTAA rate`}
              </option>
            ))}
          </Select>
        </div>

        {dtaaCountry && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
            India-{dtaaCountry.country} DTAA: Withholding rate capped at{' '}
            <strong>{dtaaCountry.rate === 0 ? 'Exempt' : formatPercent(dtaaCountry.rate)}</strong>.
            Actual benefit depends on specific treaty provisions — consult your tax advisor.
          </div>
        )}
      </Card>

      {hasValues ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#111827]">TDS Calculation</p>
            <Badge variant={result.usingDTAA ? 'success' : 'info'}>
              {result.usingDTAA ? `DTAA: ${formatPercent(result.applicableRate)}` : `Standard: ${formatPercent(result.applicableRate)}`}
            </Badge>
          </div>

          <div className="space-y-2 divide-y divide-[#F9FAFB]">
            {[
              { label: 'Perquisite Income', value: formatCurrency(result.perquisite), cls: 'text-[#16A34A] font-semibold' },
              { label: `TDS Base (${formatPercent(result.applicableRate)})`, value: `−${formatCurrency(result.tdsBaseTax)}`, cls: 'text-[#E85936]' },
              { label: 'Surcharge (10% flat for NRI)', value: `−${formatCurrency(result.surcharge)}`, cls: 'text-[#E85936]' },
              { label: 'Health & Education Cess (4%)', value: `−${formatCurrency(result.cess)}`, cls: 'text-[#E85936]' },
              { label: 'Total TDS Deducted', value: `−${formatCurrency(result.totalTDS)}`, cls: 'text-[#E85936] font-semibold' },
              { label: 'Net Gain (after TDS)', value: formatCurrency(result.netGain), cls: result.netGain >= 0 ? 'text-[#16A34A] font-bold' : 'text-[#E85936] font-bold' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-[#6B7280]">{r.label}</span>
                <span className={r.cls}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Comparison with DTAA vs standard */}
          {!result.usingDTAA && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">💡 Check DTAA eligibility</p>
              <p className="text-xs text-amber-700">
                Select your country of residence above to see if a DTAA treaty reduces your withholding rate.
                For example, UAE residents may have nil withholding under the India-UAE DTAA.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-[#6B7280]">Enter grant details on the left to see NRI TDS calculation</p>
        </Card>
      )}

      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-[#111827]">Key Rules for NRI ESOPs</p>
        <div className="space-y-2">
          {[
            { title: 'Taxable in India', desc: 'Perquisite income on Indian ESOPs is always taxable in India, regardless of where you live.' },
            { title: 'Form 15CA/15CB', desc: 'Companies must file these before remitting proceeds to your foreign bank account.' },
            { title: 'DTAA Credit', desc: 'If you pay tax in India, you can claim a foreign tax credit in your country of residence (varies by treaty).' },
            { title: 'Capital Gains', desc: 'When you sell, capital gains are also taxable in India. Listed shares: LTCG 12.5% after 12 months.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-2 text-xs">
              <span className="text-[#E85936] font-bold shrink-0">→</span>
              <div>
                <span className="font-medium text-[#374151]">{item.title}: </span>
                <span className="text-[#6B7280]">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> NRI taxation on ESOPs involves complex DTAA provisions, Form 15CA/15CB
          requirements, and foreign tax credit claims. The estimates above are indicative only.
          Please consult a Chartered Accountant with NRI taxation expertise before exercising.
        </p>
      </div>
    </div>
  )
}
