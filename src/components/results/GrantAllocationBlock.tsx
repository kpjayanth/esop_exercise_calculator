import { Layers, GripVertical, RotateCcw } from 'lucide-react'
import { Reorder, useDragControls } from 'framer-motion'
import { computeFIFO, formatGrantDate } from '@/lib/grantUtils'
import { formatCurrency, formatCompact } from '@/lib/formatters'
import type { Grant } from '@/types/grant.types'

// Muted, desaturated segment colors
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
  grantOrder: string[]
  onReorder: (newOrder: string[]) => void
  onResetOrder: () => void
  defaultOrder: string[]
  numberOfOptions: number
  fmvAtExercise: number
}

// ── Circular progress ring ────────────────────────────────────────────────────
function ExerciseRing({ fraction, color }: { fraction: number; color: string }) {
  const size = 18
  const stroke = 2.8
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(fraction, 1)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      {/* Arc */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
      />
    </svg>
  )
}

// ── Draggable row (table layout, 3+ grants) ───────────────────────────────────
function DraggableRow({
  row, idx, fmvAtExercise, hasConversion, canReorder,
}: { row: AllocationRow; idx: number; fmvAtExercise: number; hasConversion: boolean; canReorder: boolean }) {
  const controls = useDragControls()
  const isFull = row.optionsAllocated === row.available

  return (
    <Reorder.Item
      value={row}
      dragListener={false}
      dragControls={controls}
      as="div"
      className="flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-[#FAFAFA] transition-colors border-b border-[#F3F4F6] last:border-0 group cursor-default"
      style={{ userSelect: 'none' }}
    >
      {/* Order badge */}
      <span className="w-5 h-5 rounded-full bg-[#F3F4F6] text-[10px] font-bold text-[#9CA3AF] flex items-center justify-center shrink-0">
        {idx + 1}
      </span>

      {/* Drag handle — hidden for single grant */}
      {canReorder && (
        <div
          className="text-[#D1D5DB] group-hover:text-[#9CA3AF] cursor-grab active:cursor-grabbing shrink-0 touch-none"
          onPointerDown={(e) => controls.start(e)}
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>
      )}

      {/* Exercise ring — shows fraction of grant being exercised */}
      <ExerciseRing fraction={row.optionsAllocated / row.available} color={row.color} />

      {/* Identity: Date primary; Strike + Grant ID secondary below */}
      <div className="flex flex-col justify-center flex-1 min-w-0 overflow-hidden">
        <span className="text-xs font-semibold text-[#374151] leading-tight">{formatGrantDate(row.dateOfGrant)}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] text-[#9CA3AF] leading-tight">₹{row.exercisePrice.toLocaleString('en-IN')}/sh</span>
          <span className="text-[10px] text-[#D1D5DB]">·</span>
          <span className="text-[10px] text-[#B0B0B0] leading-tight">{row.grantId}</span>
        </div>
      </div>

      {/* Stats — desktop shows all columns; mobile shows only Selected + Perquisite */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide">Avail</p>
          <p className="text-xs font-medium text-[#374151] tabular-nums">{row.available.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right min-w-[36px] sm:min-w-[44px]">
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide">Sel.</p>
          <p className={`text-xs font-bold tabular-nums ${isFull ? 'text-[#E85936]' : 'text-[#374151]'}`}>
            {row.optionsAllocated.toLocaleString('en-IN')}
          </p>
        </div>
        {hasConversion && (
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide">Shares</p>
            <p className="text-xs font-medium text-[#374151] tabular-nums">
              {row.sharesAllocated.toLocaleString('en-IN')}
              <span className="text-[10px] text-[#9CA3AF] ml-0.5">×{row.conversionRatio}</span>
            </p>
          </div>
        )}
        {fmvAtExercise > 0 && (
          <div className="text-right min-w-[48px] sm:min-w-[64px]">
            <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide">Perq.</p>
            <p className={`text-xs font-bold tabular-nums ${row.perquisite > 0 ? 'text-[#3F7D5A]' : 'text-[#9CA3AF]'}`}>
              {row.perquisite > 0 ? formatCompact(row.perquisite) : '—'}
            </p>
          </div>
        )}
      </div>
    </Reorder.Item>
  )
}


// ── Allocation bar ────────────────────────────────────────────────────────────
function AllocationBar({ rows, totalPerquisite }: { rows: AllocationRow[]; totalPerquisite: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {rows.map((r) => (
          <span key={r.grantId} className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
            <span className="font-medium">{r.grantId}</span>
            <span className="text-[#9CA3AF]">
              · {formatCompact(r.perquisite)} · {((r.perquisite / totalPerquisite) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px bg-[#F3F4F6]">
        {rows.map((r) => (
          <div
            key={r.grantId}
            className="h-full transition-all duration-500"
            style={{ width: `${(r.perquisite / totalPerquisite) * 100}%`, backgroundColor: r.color }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function GrantAllocationBlock({
  grants, grantOrder, onReorder, onResetOrder, defaultOrder, numberOfOptions, fmvAtExercise,
}: Props) {
  const allocations = computeFIFO(grants, numberOfOptions, grantOrder)

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

  // Is the user's order different from the default date-sorted FIFO?
  const isCustomOrder = JSON.stringify(grantOrder) !== JSON.stringify(defaultOrder)

  const summaryPill = hasConversion
    ? `${totalOptions.toLocaleString('en-IN')} opts → ${totalShares.toLocaleString('en-IN')} shares`
    : `${totalOptions.toLocaleString('en-IN')} options`

  function handleReorder(newRows: AllocationRow[]) {
    onReorder(newRows.map((r) => r.grantId))
  }

  const canReorder = rows.length > 1

  return (
    <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
      {/* Dark header */}
      <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers size={14} className="text-[#E85936] shrink-0" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">Grant Allocation</span>
          {isCustomOrder ? (
            <span className="text-[10px] text-[#E85936] bg-[#E85936]/15 border border-[#E85936]/30 rounded-full px-2 py-0.5 font-semibold">
              Custom Order
            </span>
          ) : (
            <span className="text-[10px] text-[#9CA3AF] bg-white/10 border border-white/15 rounded-full px-2 py-0.5 font-medium">
              FIFO · Oldest First
            </span>
          )}
          {isCustomOrder && (
            <button
              onClick={onResetOrder}
              className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-white transition-colors"
              title="Reset to oldest-first FIFO"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
        </div>
        <span className="text-[11px] font-semibold text-white bg-white/10 border border-white/15 rounded-full px-2.5 py-0.5 shrink-0">
          {summaryPill}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white p-4 flex flex-col gap-3.5">

        {/* Column headers — desktop only (mobile rows are self-labelled) */}
        <div className="hidden sm:flex items-center gap-2 px-3 pb-1 text-[9px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
          <span className="w-5 shrink-0" />
          <span className={canReorder ? 'w-3.5 shrink-0' : 'w-0'} />
          <span className="w-[18px] shrink-0" />
          <span className="flex-1">Grant</span>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
            <span>Avail</span>
            <span className="min-w-[44px]">Selected</span>
            {hasConversion && <span>Shares</span>}
            {fmvAtExercise > 0 && <span className="min-w-[64px]">Perquisite</span>}
          </div>
        </div>

        {/* Draggable rows */}
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <Reorder.Group
            axis="y"
            values={rows}
            onReorder={handleReorder}
            as="div"
            className="flex flex-col"
          >
            {rows.map((row, idx) => (
              <DraggableRow
                key={row.grantId}
                row={row}
                idx={idx}
                fmvAtExercise={fmvAtExercise}
                hasConversion={hasConversion}
                canReorder={canReorder}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* Drag hint — shown until user has reordered (only when multiple grants) */}
        {canReorder && !isCustomOrder && (
          <p className="text-[11px] text-[#C4C4C4] text-center flex items-center justify-center gap-1">
            <GripVertical size={11} />
            Drag rows to change which grants are exercised first
          </p>
        )}

        {/* Proportional bar */}
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
