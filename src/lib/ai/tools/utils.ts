/**
 * Shared utilities for AI tools
 * Error handling, retry logic, Supabase client, timeouts
 */

import { createClient } from '@supabase/supabase-js'

// =============================================================================
// ROBUST ERROR HANDLING UTILITIES
// =============================================================================

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  timeoutMs?: number
  retryOn?: (error: Error, response?: Response) => boolean
}

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 30000,
  retryOn: (error, response) => {
    // Retry on network errors
    if (error.name === 'AbortError' || error.name === 'TypeError') return true
    // Retry on rate limits and server errors
    if (response && (response.status === 429 || response.status >= 500)) return true
    return false
  }
}

/**
 * Fetch with retry and timeout
 * - Exponential backoff with jitter
 * - Configurable timeout per request
 * - Smart retry on transient errors (429, 5xx, network)
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions }
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      // Check if we should retry based on response
      if (!response.ok && opts.retryOn(new Error(`HTTP ${response.status}`), response)) {
        if (attempt < opts.maxRetries) {
          const delay = Math.min(
            opts.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
            opts.maxDelayMs
          )
          await new Promise(r => setTimeout(r, delay))
          continue
        }
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error as Error

      // Check if retryable
      if (opts.retryOn(lastError) && attempt < opts.maxRetries) {
        const delay = Math.min(
          opts.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
          opts.maxDelayMs
        )
        await new Promise(r => setTimeout(r, delay))
        continue
      }

      throw lastError
    }
  }

  throw lastError
}

/**
 * Wrap any async operation with timeout
 * Handles both Promises and thenable objects (like Supabase query builders)
 */
export async function withTimeout<T>(
  promiseOrThenable: Promise<T> | { then: (fn: (value: T) => void) => unknown },
  timeoutMs: number,
  operation: string
): Promise<T> {
  // Convert thenable to proper Promise if needed (for Supabase query builders)
  const promise = Promise.resolve(promiseOrThenable)

  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Create detailed error response with context
 */
export function createErrorResponse(
  error: unknown,
  context: { operation: string; ticker?: string; attempt?: number }
): { success: false; error: string; details: Record<string, unknown> } {
  const err = error as Error
  return {
    success: false,
    error: `${context.operation} failed: ${err.message || 'Unknown error'}`,
    details: {
      operation: context.operation,
      ticker: context.ticker,
      errorType: err.name || 'Error',
      attempt: context.attempt,
      timestamp: new Date().toISOString(),
    }
  }
}

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

// Lazy-load Supabase client to avoid build-time errors
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseClient
}

// Base URL for internal API calls
export const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  return 'http://localhost:3000'
}

// Check if Financial Datasets API is configured
export const hasFinancialAPI = () => !!process.env.FINANCIAL_DATASETS_API_KEY
