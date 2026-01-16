import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Authentication utilities for API routes
 * Provides secure user authentication and admin verification
 */

// Environment variable validation
function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value
}

// Create authenticated Supabase client
function createServerSupabase() {
  const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseKey = getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Get the authenticated user from the request
 * Validates the Authorization header or session cookie
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{
  userId: string
  email: string | null
  isPremium: boolean
} | null> {
  try {
    const supabase = createServerSupabase()

    // Check Authorization header first
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return null
      }

      // Get premium status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      return {
        userId: user.id,
        email: user.email || null,
        isPremium: profile?.is_premium || false
      }
    }

    // Check for session cookie (for browser requests)
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)

      if (error || !user) {
        // Try to refresh the session
        if (refreshToken) {
          const { data: { user: refreshedUser } } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          })
          if (refreshedUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_premium')
              .eq('id', refreshedUser.id)
              .single()

            return {
              userId: refreshedUser.id,
              email: refreshedUser.email || null,
              isPremium: profile?.is_premium || false
            }
          }
        }
        return null
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      return {
        userId: user.id,
        email: user.email || null,
        isPremium: profile?.is_premium || false
      }
    }

    return null
  } catch (error) {
    logger.error('Auth error', { error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<
  | { user: { userId: string; email: string | null; isPremium: boolean }; error: null }
  | { user: null; error: NextResponse }
> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return { user, error: null }
}

/**
 * Require premium subscription - returns error response if not premium
 */
export async function requirePremium(request: NextRequest): Promise<
  | { user: { userId: string; email: string | null; isPremium: boolean }; error: null }
  | { user: null; error: NextResponse }
> {
  const authResult = await requireAuth(request)

  if (authResult.error) {
    return authResult
  }

  if (!authResult.user.isPremium) {
    return {
      user: null,
      error: NextResponse.json(
        {
          error: 'Premium subscription required',
          upgrade_url: '/premium'
        },
        { status: 403 }
      )
    }
  }

  return { user: authResult.user, error: null }
}

/**
 * Verify admin password from request header
 * IMPORTANT: Admin password must be set in environment variables
 */
export function verifyAdminPassword(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD

  // CRITICAL: Require admin password to be set - no fallback
  if (!adminPassword) {
    logger.error('CRITICAL: ADMIN_PASSWORD environment variable is not set')
    return false
  }

  const providedPassword = request.headers.get('x-admin-password') ||
                           request.nextUrl.searchParams.get('password')

  if (!providedPassword) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (providedPassword.length !== adminPassword.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < adminPassword.length; i++) {
    mismatch |= adminPassword.charCodeAt(i) ^ providedPassword.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Require admin access - returns error response if not admin
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!verifyAdminPassword(request)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 401 }
    )
  }
  return null
}

/**
 * Verify cron job secret
 * Used for scheduled job endpoints
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    // Allow in development without secret
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    logger.error('CRON_SECRET environment variable is not set')
    return false
  }

  const providedSecret = request.headers.get('authorization')?.replace('Bearer ', '') ||
                         request.nextUrl.searchParams.get('secret')

  return providedSecret === cronSecret
}

/**
 * Get Supabase admin client with service role key
 * Only use for operations that require elevated privileges
 */
export function getSupabaseAdmin() {
  return createServerSupabase()
}
