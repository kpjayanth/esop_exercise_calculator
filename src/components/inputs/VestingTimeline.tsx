import { useMemo, useCallback } from 'react'
import { vestedAtDate } from '@/lib/grantUtils'
import type { Grant } from '@/types/grant.types'

interface Props {
  grants: Grant[]
  date: Date
  onChange: (date: Date) => void
}

export function VestingTimeline({ grants, date, onChange }: Props) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Collect all future vesting milestone dates across all grants
  const milestones = useMemo(() => {
    const events: { date: Date; label: string }[] = []
    for (const g of grants) {
      if (g.futureVesting) {
        for (const v of g.futureVesting) {
          if (v.date > today) {
            events.push({ date: v.date, label: g.grantId })
          }
        }
      }
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [grants, today])

  // No future vesting → don't render
  if (milestones.length === 0) return null

  const lastDate = milestones[milestones.length - 1].date
  const totalRange = Math.max(1, lastDate.getTime() - today.getTime())
  const totalOptions = grants.reduce((s, g) => s + g.totalOptions, 0)

  function vestedTotal(d: Date): number {
    return grants.reduce((s, g) => s + vestedAtDate(g, d), 0)
  }

  const vestedNow = grants.reduce((s, g) => s + g.vestedOptions, 0)
  const vestedSelected = vestedTotal(date)
  const fillPct = Math.min(100, (vestedSelected / totalOptions) * 100)

  // Clamp date to [today, lastDate]
  const clampedDate = new Date(Math.max(today.getTime(), Math.min(date.getTime(), lastDate.getTime())))
  const thumbPct = Math.min(100, Math.max(0,
    (clampedDate.getTime() - today.getTime()) / totalRange * 100
  ))

  // Range slider: value in days from today
  const dayRange = Math.round(totalRange / 86400000)
  const selectedDays = Math.max(0, Math.round((date.getTime() - today.getTime()) / 86400000))

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const days = Number(e.target.value)
    const newDate = new Date(today.getTime() + days * 86400000)
    onChange(newDate)
  }, [today, onChange])

  // Format date compact
  const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  // Are more options vesting after selected date?
  const maxVested = vestedTotal(lastDate)
  const moreAvailable = maxVested - vestedSelected

  return (
    <div className="space-y-2 mt-1">
      {/* Track */}
      <div className="relative h-5 flex items-center">
        {/* Grey background track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#F0F0F0]" />

        {/* Green fill — vested options */}
        <div
          className="absolute left-0 h-1.5 rounded-full bg-[#5A8A72] transition-all duration-300"
          style={{ width: `${fillPct}%` }}
        />

        {/* Milestone ticks */}
        {milestones.map((m, i) => {
          const pct = (m.date.getTime() - today.getTime()) / totalRange * 100
          if (pct <= 0 || pct >= 100) return null
          return (
            <div
              key={i}
              className="absolute w-0.5 h-2.5 rounded-full bg-[#D1D5DB]"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              title={`${m.label}: ${vestedTotal(m.date).toLocaleString('en-IN')} vested on ${fmtDate(m.date)}`}
            />
          )
        })}

        {/* Thumb visual */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-[#E85936] shadow-sm pointer-events-none transition-all duration-300"
          style={{ left: `${thumbPct}%`, transform: 'translateX(-50%)' }}
        />

        {/* Invisible range input for interaction */}
        <input
          type="range"
          min={0}
          max={dayRange}
          step={1}
          value={Math.min(selectedDays, dayRange)}
          onChange={handleSlider}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>

      {/* Labels row */}
      <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
        <span>Today · <span className="font-medium text-[#6B7280]">{vestedNow.toLocaleString('en-IN')}</span> vested</span>
        <span className="font-medium text-[#6B7280]">
          {vestedSelected.toLocaleString('en-IN')}
          <span className="text-[#9CA3AF] font-normal">/{totalOptions.toLocaleString('en-IN')}</span>
          {moreAvailable > 0 && (
            <span className="text-[#9CA3AF] font-normal"> · +{moreAvailable.toLocaleString('en-IN')} later</span>
          )}
        </span>
        <span>{fmtDate(lastDate)}</span>
      </div>
    </div>
  )
}
