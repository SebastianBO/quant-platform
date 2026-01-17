'use client'

import { forwardRef, useState, useEffect, memo, useCallback } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// COMPANY LOGO COMPONENT
// Fetches company logos from our API first, then falls back to Clearbit/EODHD
// Uses in-memory cache to avoid repeated API calls
// =============================================================================

export interface CompanyLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stock ticker symbol (e.g., AAPL, NVDA) */
  ticker: string
  /** Company name for fallback initials */
  name?: string
  /** Logo size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Optional direct logo URL (overrides auto-fetch) */
  logoUrl?: string
  /** Show border around logo */
  bordered?: boolean
}

const sizeMap = {
  xs: 'size-4',
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-8',
  xl: 'size-10',
}

const fontSizeMap = {
  xs: 'text-[8px]',
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-[13px]',
  xl: 'text-[16px]',
}

// =============================================================================
// LOGO CACHE
// In-memory cache to avoid repeated API calls for the same ticker
// Persists across component re-renders within the same session
// =============================================================================

interface CachedLogo {
  url: string | null
  fallbackClearbit: string | null
  fallbackEodhd: string
  timestamp: number
}

const logoCache = new Map<string, CachedLogo>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const pendingRequests = new Map<string, Promise<CachedLogo>>()

/**
 * Fetch logo URL from our API with caching
 */
async function fetchLogoFromApi(ticker: string): Promise<CachedLogo> {
  const upperTicker = ticker.toUpperCase()
  const cacheKey = upperTicker

  // Check cache first
  const cached = logoCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached
  }

  // Check if there's already a pending request for this ticker
  const pending = pendingRequests.get(cacheKey)
  if (pending) {
    return pending
  }

  // Create new request
  const requestPromise = (async (): Promise<CachedLogo> => {
    try {
      const response = await fetch(`/api/company/${upperTicker}/assets`, {
        // Use Next.js cache for deduplication
        next: { revalidate: 3600 }
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()

      const result: CachedLogo = {
        url: data.logo?.url || null,
        fallbackClearbit: data._fallbacks?.clearbit || null,
        fallbackEodhd: data._fallbacks?.eodhd || `https://eodhistoricaldata.com/img/logos/US/${upperTicker}.png`,
        timestamp: Date.now()
      }

      // Cache the result
      logoCache.set(cacheKey, result)
      return result
    } catch (error) {
      // On error, return fallback-only result
      const result: CachedLogo = {
        url: null,
        fallbackClearbit: null,
        fallbackEodhd: `https://eodhistoricaldata.com/img/logos/US/${upperTicker}.png`,
        timestamp: Date.now()
      }
      // Cache with shorter TTL on error (5 minutes)
      result.timestamp = Date.now() - CACHE_TTL_MS + 5 * 60 * 1000
      logoCache.set(cacheKey, result)
      return result
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, requestPromise)
  return requestPromise
}

// =============================================================================
// COMPANY LOGO COMPONENT
// =============================================================================

export const CompanyLogo = memo(forwardRef<HTMLDivElement, CompanyLogoProps>(
  function CompanyLogo(
    {
      ticker,
      name,
      size = 'md',
      logoUrl: providedLogoUrl,
      bordered = false,
      className,
      ...props
    },
    ref
  ) {
    const [logoState, setLogoState] = useState<{
      primaryUrl: string | null
      fallbackUrls: string[]
      currentIndex: number
      hasError: boolean
    }>({
      primaryUrl: providedLogoUrl || null,
      fallbackUrls: [],
      currentIndex: 0,
      hasError: false
    })

    const [isLoading, setIsLoading] = useState(!providedLogoUrl)

    // Fetch logo URL from API when component mounts (if no logoUrl provided)
    useEffect(() => {
      if (providedLogoUrl) {
        setLogoState({
          primaryUrl: providedLogoUrl,
          fallbackUrls: [`https://eodhistoricaldata.com/img/logos/US/${ticker.toUpperCase()}.png`],
          currentIndex: 0,
          hasError: false
        })
        setIsLoading(false)
        return
      }

      let isMounted = true

      fetchLogoFromApi(ticker).then((result) => {
        if (!isMounted) return

        const fallbacks: string[] = []
        if (result.fallbackClearbit) fallbacks.push(result.fallbackClearbit)
        fallbacks.push(result.fallbackEodhd)

        setLogoState({
          primaryUrl: result.url,
          fallbackUrls: fallbacks,
          currentIndex: 0,
          hasError: false
        })
        setIsLoading(false)
      })

      return () => {
        isMounted = false
      }
    }, [ticker, providedLogoUrl])

    // Determine current URL to display
    const getCurrentUrl = useCallback(() => {
      if (logoState.hasError) return null

      if (logoState.currentIndex === 0 && logoState.primaryUrl) {
        return logoState.primaryUrl
      }

      // Using fallback URLs
      const fallbackIndex = logoState.primaryUrl
        ? logoState.currentIndex - 1
        : logoState.currentIndex

      if (fallbackIndex >= 0 && fallbackIndex < logoState.fallbackUrls.length) {
        return logoState.fallbackUrls[fallbackIndex]
      }

      return null
    }, [logoState])

    const currentUrl = getCurrentUrl()
    const showImage = !isLoading && currentUrl

    // Generate initials for fallback
    const initials = (name || ticker)
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const handleError = useCallback(() => {
      const totalUrls = (logoState.primaryUrl ? 1 : 0) + logoState.fallbackUrls.length
      const nextIndex = logoState.currentIndex + 1

      if (nextIndex < totalUrls) {
        // Try next URL
        setLogoState((prev) => ({
          ...prev,
          currentIndex: nextIndex
        }))
      } else {
        // All URLs failed, show initials
        setLogoState((prev) => ({
          ...prev,
          hasError: true
        }))
      }
    }, [logoState.primaryUrl, logoState.fallbackUrls.length, logoState.currentIndex])

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md flex items-center justify-center overflow-hidden',
          'bg-[#1a1a1a]', // Neutral dark background (Fey-style)
          bordered && 'border border-white/[0.08]',
          sizeMap[size],
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={currentUrl}
            alt={`${ticker} logo`}
            className="size-full object-contain p-0.5"
            onError={handleError}
            loading="lazy"
          />
        ) : (
          <span className={cn(
            'font-semibold text-[#868f97]', // Neutral gray text (Fey muted color)
            fontSizeMap[size]
          )}>
            {initials}
          </span>
        )}
      </div>
    )
  }
))

// =============================================================================
// COMPANY LOGO WITH NAME - Compact ticker + logo + name combo
// =============================================================================

export interface CompanyLogoWithNameProps extends CompanyLogoProps {
  showName?: boolean
  compact?: boolean
}

export const CompanyLogoWithName = memo(forwardRef<HTMLDivElement, CompanyLogoWithNameProps>(
  function CompanyLogoWithName(
    {
      ticker,
      name,
      size = 'md',
      showName = true,
      compact = false,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          compact ? 'gap-1.5' : 'gap-2',
          className
        )}
        {...props}
      >
        <CompanyLogo ticker={ticker} name={name} size={size} />
        <div className={cn('flex', compact ? 'flex-row items-center gap-1.5' : 'flex-col')}>
          <span className={cn(
            'font-semibold text-white',
            compact ? 'text-[13px]' : 'text-[14px]'
          )}>
            {ticker}
          </span>
          {showName && name && (
            <span className={cn(
              'text-[#868f97] truncate',
              compact ? 'text-[12px]' : 'text-[11px]'
            )}>
              {name}
            </span>
          )}
        </div>
      </div>
    )
  }
))

// =============================================================================
// UTILITY: Pre-fetch logos for a list of tickers
// Useful for warming the cache before rendering lists
// =============================================================================

export async function prefetchLogos(tickers: string[]): Promise<void> {
  await Promise.all(tickers.map((ticker) => fetchLogoFromApi(ticker)))
}

// =============================================================================
// UTILITY: Clear the logo cache
// =============================================================================

export function clearLogoCache(): void {
  logoCache.clear()
}
