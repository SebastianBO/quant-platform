import { describe, it, expect } from 'vitest'
import {
  formatLargeNumber,
  formatCompactNumber,
  formatPercent,
  formatCurrency,
} from '@/lib/formatNumber'

describe('formatLargeNumber', () => {
  it('returns N/A for undefined', () => {
    expect(formatLargeNumber(undefined)).toBe('N/A')
  })

  it('returns N/A for null', () => {
    expect(formatLargeNumber(null)).toBe('N/A')
  })

  it('returns N/A for NaN', () => {
    expect(formatLargeNumber(NaN)).toBe('N/A')
  })

  it('formats trillions correctly', () => {
    expect(formatLargeNumber(1_500_000_000_000)).toBe('$1.50T')
    expect(formatLargeNumber(2_000_000_000_000)).toBe('$2.00T')
  })

  it('formats billions correctly', () => {
    expect(formatLargeNumber(1_500_000_000)).toBe('$1.50B')
    expect(formatLargeNumber(1_000_000_000)).toBe('$1.00B')
    // 500M is below 1B threshold, so shows as M
    expect(formatLargeNumber(500_000_000)).toBe('$500.00M')
  })

  it('formats millions correctly', () => {
    expect(formatLargeNumber(1_500_000)).toBe('$1.50M')
    expect(formatLargeNumber(50_000_000)).toBe('$50.00M')
  })

  it('formats thousands correctly', () => {
    expect(formatLargeNumber(1_500)).toBe('$1.5K')
    expect(formatLargeNumber(50_000)).toBe('$50.0K')
  })

  it('formats small numbers correctly', () => {
    expect(formatLargeNumber(500)).toBe('$500')
    expect(formatLargeNumber(50)).toBe('$50')
  })

  it('handles custom prefix', () => {
    expect(formatLargeNumber(1_000_000, '€')).toBe('€1.00M')
    expect(formatLargeNumber(1_000_000, '')).toBe('1.00M')
  })

  it('handles negative numbers', () => {
    expect(formatLargeNumber(-1_500_000_000)).toBe('$-1.50B')
    expect(formatLargeNumber(-50_000)).toBe('$-50.0K')
  })

  it('caches results for repeated calls', () => {
    const result1 = formatLargeNumber(1_000_000)
    const result2 = formatLargeNumber(1_000_000)
    expect(result1).toBe(result2)
    expect(result1).toBe('$1.00M')
  })
})

describe('formatCompactNumber', () => {
  it('returns N/A for undefined', () => {
    expect(formatCompactNumber(undefined)).toBe('N/A')
  })

  it('returns N/A for null', () => {
    expect(formatCompactNumber(null)).toBe('N/A')
  })

  it('returns N/A for NaN', () => {
    expect(formatCompactNumber(NaN)).toBe('N/A')
  })

  it('formats trillions without prefix', () => {
    expect(formatCompactNumber(1_500_000_000_000)).toBe('1.5T')
  })

  it('formats billions without prefix', () => {
    expect(formatCompactNumber(1_500_000_000)).toBe('1.5B')
  })

  it('formats millions without prefix', () => {
    expect(formatCompactNumber(1_500_000)).toBe('1.5M')
  })

  it('formats smaller numbers with toLocaleString', () => {
    expect(formatCompactNumber(1_500)).toBe('1,500')
    expect(formatCompactNumber(500)).toBe('500')
  })
})

describe('formatPercent', () => {
  it('returns N/A for undefined', () => {
    expect(formatPercent(undefined)).toBe('N/A')
  })

  it('returns N/A for null', () => {
    expect(formatPercent(null)).toBe('N/A')
  })

  it('returns N/A for NaN', () => {
    expect(formatPercent(NaN)).toBe('N/A')
  })

  it('formats positive percentages with plus sign', () => {
    expect(formatPercent(5.25)).toBe('+5.25%')
    expect(formatPercent(0)).toBe('+0.00%')
  })

  it('formats negative percentages', () => {
    expect(formatPercent(-5.25)).toBe('-5.25%')
  })

  it('respects decimal places parameter', () => {
    expect(formatPercent(5.2567, 1)).toBe('+5.3%')
    expect(formatPercent(5.2567, 3)).toBe('+5.257%')
  })
})

describe('formatCurrency', () => {
  it('returns N/A for undefined', () => {
    expect(formatCurrency(undefined)).toBe('N/A')
  })

  it('returns N/A for null', () => {
    expect(formatCurrency(null)).toBe('N/A')
  })

  it('returns N/A for NaN', () => {
    expect(formatCurrency(NaN)).toBe('N/A')
  })

  it('formats currency with default decimals', () => {
    expect(formatCurrency(123.456)).toBe('$123.46')
    expect(formatCurrency(50)).toBe('$50.00')
  })

  it('respects decimal places parameter', () => {
    expect(formatCurrency(123.456, 1)).toBe('$123.5')
    expect(formatCurrency(123.456, 3)).toBe('$123.456')
  })
})
