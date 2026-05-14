// Indian number formatting (lakhs/crores)

export function formatINR(amount: number, decimals = 0): string {
  if (!isFinite(amount)) return '—'
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${sign}₹${formatted}`
}

export function formatCurrency(amount: number): string {
  return formatINR(amount, 0)
}

export function formatCurrencyWithDecimal(amount: number): string {
  return formatINR(amount, 2)
}

export function formatLakhs(amount: number): string {
  if (!isFinite(amount)) return '—'
  const lakhs = amount / 100_000
  if (Math.abs(lakhs) >= 100) {
    const crores = amount / 10_000_000
    return `₹${crores.toFixed(2)}Cr`
  }
  return `₹${lakhs.toFixed(2)}L`
}

export function formatCompact(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)}Cr`
  if (abs >= 100_000) return `${sign}₹${(abs / 100_000).toFixed(2)}L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`
  return `${sign}₹${abs.toFixed(0)}`
}

export function formatPercent(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

// Format a raw typed string into Indian comma-separated display (preserves decimal)
export function formatIndianInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  if (!cleaned) return ''
  const [intPart, ...decParts] = cleaned.split('.')
  const intNum = parseInt(intPart || '0', 10)
  const formatted = isNaN(intNum) ? '' : intNum.toLocaleString('en-IN')
  return decParts.length > 0 ? `${formatted}.${decParts.join('')}` : formatted
}

// Convert a number to Indian words (e.g. 5497200 → "Fifty Four Lakh Ninety Seven Thousand Two Hundred")
export function toIndianWords(n: number): string {
  if (!n || !isFinite(n) || n <= 0) return ''
  n = Math.floor(n)

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ]
  const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigit(x: number): string {
    if (x === 0) return ''
    if (x < 20) return ones[x]
    return tensWords[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '')
  }

  function threeDigit(x: number): string {
    if (x === 0) return ''
    if (x < 100) return twoDigit(x)
    return ones[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + twoDigit(x % 100) : '')
  }

  const crore   = Math.floor(n / 10_000_000)
  const lakh    = Math.floor((n % 10_000_000) / 100_000)
  const thousand = Math.floor((n % 100_000) / 1_000)
  const remainder = n % 1_000

  const parts: string[] = []
  if (crore)     parts.push(threeDigit(crore) + ' Crore')
  if (lakh)      parts.push(twoDigit(lakh) + ' Lakh')
  if (thousand)  parts.push(twoDigit(thousand) + ' Thousand')
  if (remainder) parts.push(threeDigit(remainder))

  return parts.join(' ')
}
