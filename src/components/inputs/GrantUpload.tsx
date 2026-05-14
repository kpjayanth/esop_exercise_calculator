import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import { formatGrantDate, parseGrantDate } from '@/lib/grantUtils'
import type { Grant, RoundingRule } from '@/types/grant.types'

interface Props {
  onGrantsLoaded: (grants: Grant[]) => void
}

export function GrantUpload({ onGrantsLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [grants, setGrants] = useState<Grant[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })

        const parsed: Grant[] = rows.map((row, i) => {
          // Flexible header matching (case-insensitive)
          const get = (keys: string[]) => {
            for (const k of keys) {
              const match = Object.keys(row).find((rk) => rk.toLowerCase().includes(k.toLowerCase()))
              if (match) return row[match]
            }
            return null
          }

          const grantId = String(get(['grant id', 'grantid', 'grant']) ?? `G${i + 1}`)
          const dateRaw = get(['date', 'dob', 'grant date'])
          const dateOfGrant = parseGrantDate(dateRaw)
          const totalOptions = Number(get(['options', 'total options', 'granted']) ?? 0)
          const exercisePrice = Number(get(['exercise price', 'strike', 'price']) ?? 0)
          const vestedOptions = Number(get(['vested', 'net vested', 'available']) ?? 0)
          const conversionRatio = Number(get(['options to shares ratio', 'ratio', 'conversion ratio', 'conversion']) ?? 1)
          const roundingRaw = String(get(['rounding', 'round']) ?? 'ROUND_DOWN').toUpperCase()
          const rounding: RoundingRule = ['ROUND_UP', 'ROUND_NEAREST', 'ROUND_DOWN'].includes(roundingRaw)
            ? (roundingRaw as RoundingRule)
            : 'ROUND_DOWN'

          return { grantId, dateOfGrant, totalOptions, exercisePrice, vestedOptions, conversionRatio, rounding }
        }).filter((g) => g.vestedOptions > 0)

        if (parsed.length === 0) {
          setError('No vested grants found. Ensure "Vested" column has values > 0.')
          return
        }
        setGrants(parsed)
      } catch {
        setError('Could not parse file. Please use the provided Excel format.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  const totalVested = grants?.reduce((s, g) => s + g.vestedOptions, 0) ?? 0

  function loadSampleData() {
    const sample: Grant[] = [
      { grantId: 'G1', dateOfGrant: new Date('2020-05-01'), totalOptions: 50, exercisePrice: 10, vestedOptions: 30, conversionRatio: 0.5, rounding: 'ROUND_DOWN' },
      { grantId: 'G2', dateOfGrant: new Date('2023-06-01'), totalOptions: 100, exercisePrice: 100, vestedOptions: 25, conversionRatio: 1, rounding: 'ROUND_DOWN' },
    ]
    setGrants(sample)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E85936] to-[#f97316] flex items-center justify-center mx-auto mb-4 shadow-md">
            <FileSpreadsheet size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#111827]">Load Your Grant Data</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Upload your grant Excel file to get started. Data stays in your browser.
          </p>
        </div>

        {/* Drop zone */}
        {!grants && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-[#E85936] bg-[#FFF3F0]'
                : 'border-[#E5E7EB] bg-white hover:border-[#E85936] hover:bg-[#FFF9F8]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
            />
            <Upload size={32} className="mx-auto mb-3 text-[#9CA3AF]" />
            <p className="text-sm font-medium text-[#374151]">
              Drop your Excel file here, or <span className="text-[#E85936]">browse</span>
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">.xlsx · .xls · .csv</p>
            <button
              onClick={(e) => { e.stopPropagation(); loadSampleData() }}
              className="mt-3 text-xs text-[#9CA3AF] hover:text-[#E85936] underline underline-offset-2 transition-colors"
            >
              Try sample data →
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Parsed grants preview */}
        {grants && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
              <CheckCircle size={15} className="text-green-500" />
              <p className="text-sm font-semibold text-[#111827]">
                {grants.length} Grant{grants.length !== 1 ? 's' : ''} Found
              </p>
              <span className="ml-auto text-xs text-[#9CA3AF]">{totalVested.toLocaleString('en-IN')} options available</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#9CA3AF] bg-[#F9FAFB] border-b border-[#F3F4F6]">
                  <th className="px-4 py-2 text-left font-medium">Grant</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Strike</th>
                  <th className="px-4 py-2 text-right font-medium">Vested</th>
                  <th className="px-4 py-2 text-right font-medium">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((g) => (
                  <tr key={g.grantId} className="border-b border-[#F9FAFB] last:border-0">
                    <td className="px-4 py-2.5 font-medium text-[#374151]">{g.grantId}</td>
                    <td className="px-4 py-2.5 text-[#6B7280]">{formatGrantDate(g.dateOfGrant)}</td>
                    <td className="px-4 py-2.5 text-right text-[#374151]">₹{g.exercisePrice.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#111827]">{g.vestedOptions.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right">
                      {g.conversionRatio === 1 ? (
                        <span className="text-[#9CA3AF]">1 : 1</span>
                      ) : (
                        <span className="font-semibold text-[#374151]">{g.conversionRatio} : 1</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-5 py-3 flex items-center justify-between">
              <button
                onClick={() => { setGrants(null); setError(null) }}
                className="text-xs text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                ← Upload different file
              </button>
              <button
                onClick={() => onGrantsLoaded(grants)}
                className="flex items-center gap-2 h-9 px-5 rounded-xl bg-[#E85936] text-white text-sm font-semibold hover:bg-[#d44d2e] transition-colors shadow-sm"
              >
                Calculate Tax
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Format guide */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
          <p className="text-xs font-semibold text-[#374151] mb-2">Expected Excel Format</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#6B7280]">
              <thead>
                <tr className="font-medium text-[#9CA3AF]">
                  <td className="pr-3 py-1">Grant Id</td>
                  <td className="pr-3 py-1">Date Of Grant</td>
                  <td className="pr-3 py-1">Options</td>
                  <td className="pr-3 py-1">Exercise Price</td>
                  <td className="pr-3 py-1">Vested</td>
                  <td className="pr-3 py-1">Options to Shares Ratio</td>
                  <td className="py-1">Rounding</td>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[#374151]">
                  <td className="pr-3 py-0.5">G1</td>
                  <td className="pr-3 py-0.5">01/05/2020</td>
                  <td className="pr-3 py-0.5">50</td>
                  <td className="pr-3 py-0.5">10</td>
                  <td className="pr-3 py-0.5">30</td>
                  <td className="pr-3 py-0.5 font-medium">0.5</td>
                  <td className="py-0.5">ROUND_DOWN</td>
                </tr>
                <tr className="text-[#374151]">
                  <td className="pr-3 py-0.5">G2</td>
                  <td className="pr-3 py-0.5">01/06/2023</td>
                  <td className="pr-3 py-0.5">100</td>
                  <td className="pr-3 py-0.5">100</td>
                  <td className="pr-3 py-0.5">25</td>
                  <td className="pr-3 py-0.5 text-[#9CA3AF]">1 <span className="text-[#C4C4C4]">(default)</span></td>
                  <td className="py-0.5 text-[#9CA3AF]">ROUND_DOWN</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-[#9CA3AF]"><span className="font-medium text-[#6B7280]">Vested</span> = Net vested options available to exercise</p>
            <p className="text-xs text-[#9CA3AF]"><span className="font-medium text-[#6B7280]">Options to Shares Ratio</span> = How many shares 1 option yields (e.g. 0.5 means 2 options → 1 share). Defaults to <span className="font-medium">1</span> if omitted.</p>
            <p className="text-xs text-[#9CA3AF]"><span className="font-medium text-[#6B7280]">Rounding</span> = ROUND_DOWN · ROUND_UP · ROUND_NEAREST. Defaults to ROUND_DOWN.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
