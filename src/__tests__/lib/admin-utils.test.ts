import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatNumber, formatTimeAgo, getDataFreshness } from '@/app/admin/utils'

describe('formatNumber', () => {
  it('formats millions correctly', () => {
    expect(formatNumber(1500000)).toBe('1.5M')
    expect(formatNumber(2000000)).toBe('2.0M')
  })

  it('formats thousands correctly', () => {
    expect(formatNumber(1500)).toBe('1.5K')
    expect(formatNumber(50000)).toBe('50.0K')
  })

  it('formats small numbers correctly', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(999)).toBe('999')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('handles edge cases at boundaries', () => {
    expect(formatNumber(1000)).toBe('1.0K')
    expect(formatNumber(1000000)).toBe('1.0M')
  })
})

describe('formatTimeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-16T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for times less than a minute ago', () => {
    expect(formatTimeAgo('2026-01-16T11:59:30Z')).toBe('just now')
  })

  it('returns minutes ago for times less than an hour', () => {
    expect(formatTimeAgo('2026-01-16T11:30:00Z')).toBe('30m ago')
    expect(formatTimeAgo('2026-01-16T11:55:00Z')).toBe('5m ago')
  })

  it('returns hours ago for times less than a day', () => {
    expect(formatTimeAgo('2026-01-16T10:00:00Z')).toBe('2h ago')
    expect(formatTimeAgo('2026-01-16T00:00:00Z')).toBe('12h ago')
  })

  it('returns days ago for times more than a day', () => {
    expect(formatTimeAgo('2026-01-15T12:00:00Z')).toBe('1d ago')
    expect(formatTimeAgo('2026-01-14T12:00:00Z')).toBe('2d ago')
  })
})

describe('getDataFreshness', () => {
  it('returns empty for tables with no data', () => {
    expect(getDataFreshness('any_table', 0)).toBe('empty')
    expect(getDataFreshness('prices', 0)).toBe('empty')
  })

  it('returns fresh for price/realtime tables', () => {
    expect(getDataFreshness('stock_prices', 100)).toBe('fresh')
    expect(getDataFreshness('realtime_quotes', 1)).toBe('fresh')
  })

  it('returns correct freshness for earnings tables', () => {
    expect(getDataFreshness('earnings_reports', 500)).toBe('fresh')
    expect(getDataFreshness('earnings_data', 50)).toBe('stale')
  })

  it('returns correct freshness for short tables', () => {
    expect(getDataFreshness('short_interest', 5000)).toBe('fresh')
    expect(getDataFreshness('short_volume', 500)).toBe('stale')
  })

  it('returns fresh for unknown table types with data', () => {
    expect(getDataFreshness('unknown_table', 1)).toBe('fresh')
    expect(getDataFreshness('custom_data', 1000000)).toBe('fresh')
  })
})
