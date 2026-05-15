import { Layers } from 'lucide-react'
import { computeFIFO, formatGrantDate } from '@/lib/grantUtils'
import { formatCurrency, formatCompact } from '@/lib/formatters'
import type { Grant } from '@/types/grant.types'

// Muted, desaturated segment colors (warm → cool palette, up to 8 grants)
const SEGMENT_COLORS = ['#A87060', '#7A9070', '#6A80A0', '#9070A8', '#A09060', '#608070', '#8070A0', '#70A080']

interface AllocationRow {
  grantId: string
  dateOfGrant: Date
  exercisePrice: number
  optionsAllocated: number
  sharesAllocated: number
  conversionRatio: number
  available: number
  perquisite: number
  color: string
}

interface Props {
  grants: Grant[]
  numberOfOptions: number
  fmvAtExercise: number
}

// ── Card layout (1–2 grants) ──────────────────────────────────────────────────
function GrantCard({ row, fmvAtExercise, hasConversion }: { row: AllocationRow; fmvAtExercise: number; hasConversion: boolean }) {
  const isFull = row.optionsAllocated === row.available
  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ backgroundColor: row.color }}
          />
          <span className="text-xs font-bold text-[#111827] truncate">{row.grantId}</span>
          <span className="text-[11px] text-[#9CA3AF] shrink-0">{formatGrantDate(row.dateOfGrant)}</span>
          {isFull && (
            <span className="text-[9px] bg-[#FFF3F0] text-[#E85936] px-1.5 py-0.5 rounded font-semibold shrink-0">Full</span>
          )}
        </div>
        <span className="text-[11px] text-[#6B7280] shrink-0 ml-2">
          ₹{row.exercisePrice.toLocaleString('en-IN')}
          <span className="text-[10px] text-[#9CA3AF]">/sh</span>
        </span>
      </div>

      <div className={`grid divide-x divide-[#F3F4F6] ${hasConversion ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div className="px-3 py-2.5">
          <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Available</p>
          <p className="text-sm font-bold text-[#374151] tabular-nums">{row.available.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">options</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Selected</p>
          <p className={`text-sm font-bold tabular-nums ${isFull ? 'text-[#E85936]' : 'text-[#374151]'}`}>
            {row.optionsAllocated.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">options</p>
        </div>
        {hasConversion && (
          <div className="px-3 py-2.5">
            <p className="text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Shares</p>
            <p className="text-sm font-bold text-[#111827] tabular-nums">{row.sharesAllocated.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">×{row.conversionRatio} ratio</p>
          </div>
        )}
      </div>

      {fmvAtExercise > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#FAFAF9] border-t border-[#F3F4F6]">
          <span className="text-[10px] text-[#9CA3AF]">
            (₹{fmvAtExercise.toLocaleString('en-IN')} − ₹{row.exercisePrice}) × {row.sharesAllocated}
          </span>
          <span className={`text-sm font-bold tabular-nums ${row.perquisite > 0 ? 'text-[#3F7D5A]' : 'text-[#9CA3AF]'}`}>
            {row.perquisite > 0 ? formatCurrency(row.perquisite) : '—'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Table layout (3+ grants) ──────────────────────────────────────────────────
function GrantTable({ rows, fmvAtExercise, hasConversion }: { rows: AllocationRow[]; fmvAtExercise: number; hasConversion: boolean }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Grant</th>
            <th className="text-left px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide hidden sm:table-cell">Date</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Strike</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Avail</th>
            <th className="text-right px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Selected</th>
            {hasConversion && (
              <th className="text-right px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Shares</th>
            )}
            {fmvAtExercise > 0 && (
              <th className="text-right px-3 py-2 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Perquisite</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isFull = row.optionsAllocated === row.available
            return (
              <tr key={row.grantId} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="font-bold text-[#111827] text-xs">{row.grantId}</span>
                    {isFull && (
                      <span className="text-[9px] bg-[#FFF3F0] text-[#E85936] px-1.5 py-0.5 rounded font-semibold">Full</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[11px] text-[#9CA3AF] hidden sm:table-cell">
                  {formatGrantDate(row.dateOfGrant)}
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] text-[#6B7280] tabular-nums">
                  ₹{row.exercisePrice.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-medium text-[#374151] tabular-nums">
                  {row.available.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`text-xs font-bold tabular-nums ${isFull ? 'text-[#E85936]' : 'text-[#374151]'}`}>
                    {row.optionsAllocated.toLocaleString('en-IN')}
                  </span>
                </td>
                {hasConversion && (
                  <td className="px-3 py-2.5 text-right text-xs text-[#374151] tabular-nums">
                    {row.sharesAllocated.toLocaleString('en-IN')}
                    <span className="text-[10px] text-[#9CA3AF] ml-1">×{row.conversionRatio}</span>
                  </td>
                )}
                {fmvAtExercise > 0 && (
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-xs font-bold tabular-nums ${row.perquisite > 0 ? 'text-[#3F7D5A]' : 'text-[#9CA3AF]'}`}>
                      {row.perquisite > 0 ? formatCompact(row.perquisite) : '—'}
                    </span>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Allocation bar (shared) ───────────────────────────────────────────────────
function AllocationBar({ rows, totalPerquisite }: { rows: AllocationRow[]; totalPerquisite: number }) {
  return (
    <div className="space-y-1.5">
      {/* Inline legend: color swatch + grant ID + amount + % */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {rows.map((r) => {
          const pct = ((r.perquisite / totalPerquisite) * 100).toFixed(1)
          return (
            <span key={r.grantId} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
              <span className="font-medium">{r.grantId}</span>
              <span className="text-[#9CA3AF]">· {formatCompact(r.perquisite)} · {pct}%</span>
            </span>
          )
        })}
      </div>
      {/* Segmented bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px bg-[#F3F4F6]">
        {rows.map((r) => (
          <div
            key={r.grantId}
            className="h-full transition-all duration-500"
            style={{
              width: `${(r.perquisite / totalPerquisite) * 100}%`,
              backgroundColor: r.color,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function GrantAllocationBlock({ grants, numberOfOptions, fmvAtExercise }: Props) {
  const allocations = computeFIFO(grants, numberOfOptions)

  const rows: AllocationRow[] = allocations.map((a, i) => {
    const grant = grants.find((g) => g.grantId === a.grantId)!
    return {
      ...a,
      available: grant.vestedOptions,
      perquisite: Math.max(0, fmvAtExercise - a.exercisePrice) * a.sharesAllocated,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }
  })

  if (rows.length === 0) return null

  const totalOptions = rows.reduce((s, r) => s + r.optionsAllocated, 0)
  const totalShares = rows.reduce((s, r) => s + r.sharesAllocated, 0)
  const totalPerquisite = rows.reduce((s, r) => s + r.perquisite, 0)
  const hasConversion = rows.some((r) => r.conversionRatio !== 1)

  // ≤2 grants → rich card grid; 3+ → compact table
  const useCardLayout = rows.length <= 2

  const summaryPill = hasConversion
    ? `${totalOptions.toLocaleString('en-IN')} opts → ${totalShares.toLocaleString('en-IN')} shares`
    : `${totalOptions.toLocaleString('en-IN')} options`

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
      {/* Dark header */}
      <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#E85936]" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">Grant Allocation</span>
          <span className="text-[10px] text-[#9CA3AF] bg-white/10 border border-white/15 rounded-full px-2 py-0.5 font-medium">
            FIFO · Oldest First
          </span>
        </div>
        <span className="text-[11px] font-semibold text-white bg-white/10 border border-white/15 rounded-full px-2.5 py-0.5">
          {summaryPill}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white p-4 flex flex-col gap-3.5">
        {useCardLayout ? (
          /* Card grid for 1–2 grants */
          <div className={`grid gap-3 ${rows.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {rows.map((row) => (
              <GrantCard key={row.grantId} row={row} fmvAtExercise={fmvAtExercise} hasConversion={hasConversion} />
            ))}
          </div>
        ) : (
          /* Compact table for 3+ grants */
          <GrantTable rows={rows} fmvAtExercise={fmvAtExercise} hasConversion={hasConversion} />
        )}

        {/* Proportional bar — only when FMV is entered and multiple grants */}
        {fmvAtExercise > 0 && totalPerquisite > 0 && rows.length > 1 && (
          <AllocationBar rows={rows} totalPerquisite={totalPerquisite} />
        )}

        {/* Total footer */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <div>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Total Perquisite</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              {totalOptions.toLocaleString('en-IN')} options
              {hasConversion && (
                <> → <span className="font-medium text-[#374151]">{totalShares.toLocaleString('en-IN')} shares</span></>
              )}
            </p>
          </div>
          <span className="text-base font-bold tabular-nums text-[#3F7D5A]">
            {fmvAtExercise > 0 && totalPerquisite > 0 ? formatCurrency(totalPerquisite) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
