// API Rate Limiting for Public Endpoints
// Uses in-memory LRU cache with IP-based tracking

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Simple LRU-like cache with max size
const rateLimitCache = new Map<string, RateLimitEntry>()
const MAX_CACHE_SIZE = 10000

// Default limits
const DEFAULT_REQUESTS_PER_MINUTE = 60
const DEFAULT_WINDOW_MS = 60 * 1000

export interface RateLimitConfig {
  requestsPerMinute?: number
  windowMs?: number
}

function cleanupCache(): void {
  if (rateLimitCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries (first 20% of cache)
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2)
    const iterator = rateLimitCache.keys()
    for (let i = 0; i < entriesToRemove; i++) {
      const key = iterator.next().value
      if (key) rateLimitCache.delete(key)
    }
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers for the real IP (behind proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Vercel-specific header
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    return vercelForwarded.split(',')[0].trim()
  }

  return 'unknown'
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const {
    requestsPerMinute = DEFAULT_REQUESTS_PER_MINUTE,
    windowMs = DEFAULT_WINDOW_MS,
  } = config

  const ip = getClientIP(request)
  const now = Date.now()
  const key = `${ip}:${request.nextUrl.pathname}`

  // Cleanup cache if needed
  cleanupCache()

  const entry = rateLimitCache.get(key)

  if (!entry || now > entry.resetTime) {
    // Start new window
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: requestsPerMinute - 1,
      resetIn: Math.ceil(windowMs / 1000),
    }
  }

  // Within existing window
  if (entry.count >= requestsPerMinute) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    }
  }

  // Increment count
  entry.count++
  return {
    allowed: true,
    remaining: requestsPerMinute - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

export function rateLimitResponse(remaining: number, resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${resetIn} seconds.`,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetIn),
        'Retry-After': String(resetIn),
      },
    }
  )
}

export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetIn: number
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(resetIn))
  return response
}

// Wrapper for easy use in route handlers
export function withRateLimit<T extends (...args: [NextRequest, ...unknown[]]) => Promise<NextResponse>>(
  handler: T,
  config: RateLimitConfig = {}
): T {
  return (async (request: NextRequest, ...args: unknown[]) => {
    const { allowed, remaining, resetIn } = checkRateLimit(request, config)

    if (!allowed) {
      return rateLimitResponse(remaining, resetIn)
    }

    const response = await handler(request, ...args)
    return addRateLimitHeaders(response, remaining, resetIn)
  }) as T
}
