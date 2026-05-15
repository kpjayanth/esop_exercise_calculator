import type { Grant, GrantAllocation, RoundingRule } from '@/types/grant.types'

/** Apply rounding rule to a fractional share count. */
export function applyRounding(n: number, rule: RoundingRule): number {
  switch (rule) {
    case 'ROUND_UP':      return Math.ceil(n)
    case 'ROUND_NEAREST': return Math.round(n)
    case 'ROUND_DOWN':
    default:              return Math.floor(n)
  }
}

/** Sort grants by date (oldest first) and allocate options FIFO.
 *  If customOrder (array of grantIds) is provided, use that ordering instead. */
export function computeFIFO(grants: Grant[], totalToExercise: number, customOrder?: string[]): GrantAllocation[] {
  let sorted: Grant[]
  if (customOrder && customOrder.length > 0) {
    const posMap = new Map(customOrder.map((id, i) => [id, i]))
    sorted = [...grants].sort((a, b) => (posMap.get(a.grantId) ?? 999) - (posMap.get(b.grantId) ?? 999))
  } else {
    sorted = [...grants].sort((a, b) => a.dateOfGrant.getTime() - b.dateOfGrant.getTime())
  }
  const allocations: GrantAllocation[] = []
  let remaining = Math.min(totalToExercise, totalVested(grants))

  for (const grant of sorted) {
    if (remaining <= 0) break
    const optionsAllocated = Math.min(grant.vestedOptions, remaining)
    if (optionsAllocated > 0) {
      const ratio = grant.conversionRatio ?? 1
      const rounding: RoundingRule = grant.rounding ?? 'ROUND_DOWN'
      const sharesAllocated = applyRounding(optionsAllocated * ratio, rounding)
      allocations.push({
        grantId: grant.grantId,
        dateOfGrant: grant.dateOfGrant,
        exercisePrice: grant.exercisePrice,
        optionsAllocated,
        sharesAllocated,
        conversionRatio: ratio,
        rounding,
      })
      remaining -= optionsAllocated
    }
  }
  return allocations
}

/** Total options available to exercise across all grants. */
export function totalVested(grants: Grant[]): number {
  return grants.reduce((sum, g) => sum + g.vestedOptions, 0)
}

/** Total shares to be received from a set of allocations. */
export function totalSharesFromAllocations(allocations: GrantAllocation[]): number {
  return allocations.reduce((s, a) => s + a.sharesAllocated, 0)
}

/**
 * Weighted average exercise price per share across allocations.
 * Used by the tax engine as strikePrice.
 * = totalExerciseCost / totalShares
 */
export function weightedStrikePrice(allocations: GrantAllocation[]): number {
  const totalShares = allocations.reduce((s, a) => s + a.sharesAllocated, 0)
  if (totalShares === 0) return 0
  const totalCost = allocations.reduce((s, a) => s + a.exercisePrice * a.sharesAllocated, 0)
  return totalCost / totalShares
}

/** Parse a date value from Excel (Date object, serial number, or string). */
export function parseGrantDate(raw: unknown): Date {
  if (raw instanceof Date) return raw
  if (typeof raw === 'number') {
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000))
    return d
  }
  if (typeof raw === 'string') return new Date(raw)
  return new Date()
}

/** Format date as "Mon YYYY" for display. */
export function formatGrantDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}
