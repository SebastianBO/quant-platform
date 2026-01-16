import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================================
// Rate Limiting for Public API v1 Routes
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitCache = new Map<string, RateLimitEntry>()
const MAX_CACHE_SIZE = 10000
const API_V1_REQUESTS_PER_MINUTE = 60
const WINDOW_MS = 60 * 1000

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) return vercelForwarded.split(',')[0].trim()

  return 'unknown'
}

function checkApiRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetIn: number } {
  const ip = getClientIP(request)
  const now = Date.now()
  const key = `api-v1:${ip}`

  // Cleanup cache if too large
  if (rateLimitCache.size > MAX_CACHE_SIZE) {
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2)
    const iterator = rateLimitCache.keys()
    for (let i = 0; i < entriesToRemove; i++) {
      const k = iterator.next().value
      if (k) rateLimitCache.delete(k)
    }
  }

  const entry = rateLimitCache.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: API_V1_REQUESTS_PER_MINUTE - 1, resetIn: 60 }
  }

  if (entry.count >= API_V1_REQUESTS_PER_MINUTE) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }

  entry.count++
  return {
    allowed: true,
    remaining: API_V1_REQUESTS_PER_MINUTE - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  // Rate limit check for public API v1 routes
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    const { allowed, remaining, resetIn } = checkApiRateLimit(request)

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${resetIn} seconds.`,
          limit: API_V1_REQUESTS_PER_MINUTE,
          window: '1 minute',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(API_V1_REQUESTS_PER_MINUTE),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetIn),
            'Retry-After': String(resetIn),
          },
        }
      )
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next({
      request: { headers: request.headers },
    })
    response.headers.set('X-RateLimit-Limit', String(API_V1_REQUESTS_PER_MINUTE))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(resetIn))
    return response
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
