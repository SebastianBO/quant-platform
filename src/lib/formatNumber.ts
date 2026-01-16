/**
 * Shared number formatting utilities with module-level caching
 * Optimized for React performance - avoids function recreation on each render
 */

// Module-level cache for formatted values
const formatCache = new Map<string, string>()
const CACHE_MAX_SIZE = 1000

/**
 * Format large numbers with appropriate suffixes (T, B, M, K)
 * Results are cached to avoid repeated formatting
 */
export function formatLargeNumber(num: number | undefined | null, prefix = '$'): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A'

  const cacheKey = `${prefix}:${num}`
  const cached = formatCache.get(cacheKey)
  if (cached) return cached

  let result: string
  const absNum = Math.abs(num)

  if (absNum >= 1e12) {
    result = `${prefix}${(num / 1e12).toFixed(2)}T`
  } else if (absNum >= 1e9) {
    result = `${prefix}${(num / 1e9).toFixed(2)}B`
  } else if (absNum >= 1e6) {
    result = `${prefix}${(num / 1e6).toFixed(2)}M`
  } else if (absNum >= 1e3) {
    result = `${prefix}${(num / 1e3).toFixed(1)}K`
  } else {
    result = `${prefix}${num.toLocaleString()}`
  }

  // Limit cache size to prevent memory leaks
  if (formatCache.size >= CACHE_MAX_SIZE) {
    const firstKey = formatCache.keys().next().value
    if (firstKey) formatCache.delete(firstKey)
  }

  formatCache.set(cacheKey, result)
  return result
}

/**
 * Format number without prefix (for ratios, percentages, etc.)
 */
export function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A'

  const cacheKey = `compact:${num}`
  const cached = formatCache.get(cacheKey)
  if (cached) return cached

  let result: string
  const absNum = Math.abs(num)

  if (absNum >= 1e12) {
    result = `${(num / 1e12).toFixed(1)}T`
  } else if (absNum >= 1e9) {
    result = `${(num / 1e9).toFixed(1)}B`
  } else if (absNum >= 1e6) {
    result = `${(num / 1e6).toFixed(1)}M`
  } else {
    result = num.toLocaleString()
  }

  if (formatCache.size >= CACHE_MAX_SIZE) {
    const firstKey = formatCache.keys().next().value
    if (firstKey) formatCache.delete(firstKey)
  }

  formatCache.set(cacheKey, result)
  return result
}

/**
 * Format percentage with sign
 */
export function formatPercent(num: number | undefined | null, decimals = 2): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A'

  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * Format currency value
 */
export function formatCurrency(num: number | undefined | null, decimals = 2): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A'
  return `$${num.toFixed(decimals)}`
}
