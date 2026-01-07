'use client'

import { useMemo } from 'react'

interface LastUpdatedProps {
  /**
   * The timestamp when the data was last updated.
   * Can be a Date object, ISO string, or Unix timestamp in milliseconds.
   */
  timestamp: Date | string | number
  /**
   * Optional className for additional styling
   */
  className?: string
  /**
   * Whether to show the schema.org dateModified markup
   * @default true
   */
  includeSchema?: boolean
  /**
   * Optional prefix text
   * @default "Last Updated"
   */
  prefix?: string
}

/**
 * Formats a timestamp for display with relative time for recent updates
 * and absolute time for older updates.
 */
function formatTimestamp(timestamp: Date | string | number): {
  display: string
  iso: string
  isRecent: boolean
} {
  const date = timestamp instanceof Date
    ? timestamp
    : typeof timestamp === 'string'
      ? new Date(timestamp)
      : new Date(timestamp)

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const iso = date.toISOString()

  // Relative time for updates within 24 hours
  if (diffMinutes < 1) {
    return { display: 'Just now', iso, isRecent: true }
  }
  if (diffMinutes < 60) {
    return {
      display: `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`,
      iso,
      isRecent: true
    }
  }
  if (diffHours < 24) {
    return {
      display: `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`,
      iso,
      isRecent: true
    }
  }
  if (diffDays < 7) {
    return {
      display: `${diffDays} day${diffDays === 1 ? '' : 's'} ago`,
      iso,
      isRecent: false
    }
  }

  // Absolute time for older updates
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }

  // Format in EST timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'America/New_York',
  })

  return { display: formatter.format(date), iso, isRecent: false }
}

/**
 * LastUpdated Component
 *
 * Displays a "Last Updated" timestamp with:
 * - Relative time for recent updates (e.g., "Updated 2 hours ago")
 * - Absolute time for older updates (e.g., "January 7, 2026 at 3:45 PM EST")
 * - schema.org dateModified markup for SEO
 *
 * @example
 * <LastUpdated timestamp={new Date()} />
 * <LastUpdated timestamp="2026-01-07T15:45:00Z" prefix="Data refreshed" />
 */
export function LastUpdated({
  timestamp,
  className = '',
  includeSchema = true,
  prefix = 'Last Updated',
}: LastUpdatedProps) {
  const { display, iso, isRecent } = useMemo(
    () => formatTimestamp(timestamp),
    [timestamp]
  )

  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
    >
      {/* Clock icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>

      {/* Timestamp with optional schema markup */}
      <span>
        {prefix}:{' '}
        {includeSchema ? (
          <time
            dateTime={iso}
            itemProp="dateModified"
            className={isRecent ? 'text-green-500/80' : ''}
          >
            {display}
          </time>
        ) : (
          <span className={isRecent ? 'text-green-500/80' : ''}>
            {display}
          </span>
        )}
      </span>
    </div>
  )
}

/**
 * Server-side version of LastUpdated that doesn't use client-side hooks.
 * Use this in Server Components when you want static rendering.
 */
export function LastUpdatedStatic({
  timestamp,
  className = '',
  includeSchema = true,
  prefix = 'Last Updated',
}: LastUpdatedProps) {
  const date = timestamp instanceof Date
    ? timestamp
    : typeof timestamp === 'string'
      ? new Date(timestamp)
      : new Date(timestamp)

  const iso = date.toISOString()

  // For SSR, always use absolute time format to avoid hydration mismatches
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'America/New_York',
  })

  const display = formatter.format(date)

  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
    >
      {/* Clock icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>

      {/* Timestamp with optional schema markup */}
      <span>
        {prefix}:{' '}
        {includeSchema ? (
          <time dateTime={iso} itemProp="dateModified">
            {display}
          </time>
        ) : (
          <span>{display}</span>
        )}
      </span>
    </div>
  )
}

export default LastUpdated
