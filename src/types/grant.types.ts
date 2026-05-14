export type RoundingRule = 'ROUND_DOWN' | 'ROUND_UP' | 'ROUND_NEAREST'

export interface Grant {
  grantId: string
  dateOfGrant: Date
  totalOptions: number
  exercisePrice: number       // per share
  vestedOptions: number       // net vested options available to exercise
  conversionRatio: number     // options-to-shares ratio (e.g. 0.5 = 2 options → 1 share); default 1
  rounding: RoundingRule      // how to round fractional shares; default ROUND_DOWN
}

export interface GrantAllocation {
  grantId: string
  dateOfGrant: Date
  exercisePrice: number
  optionsAllocated: number
  sharesAllocated: number     // actual shares after ratio + rounding
  conversionRatio: number
  rounding: RoundingRule
}
