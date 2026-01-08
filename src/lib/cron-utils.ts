// Shared utilities for robust cron job execution
// Used by all sync-* cron jobs for reliability

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// Supabase Client
// ============================================================================

let supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryOn?: (error: Error) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryOn: () => true,
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error | null = null
  let delay = opts.initialDelay

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry this error
      if (!opts.retryOn(lastError)) {
        throw lastError
      }

      if (attempt < opts.maxRetries) {
        console.log(`[Retry ${attempt + 1}/${opts.maxRetries}] ${lastError.message} - waiting ${delay}ms`)
        await sleep(delay)
        delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
      }
    }
  }

  throw lastError
}

// ============================================================================
// Rate Limiting
// ============================================================================

export class RateLimiter {
  private lastRequestTime = 0
  private readonly minInterval: number

  constructor(requestsPerSecond: number = 10) {
    this.minInterval = 1000 / requestsPerSecond
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    const waitTime = Math.max(0, this.minInterval - elapsed)

    if (waitTime > 0) {
      await sleep(waitTime)
    }

    this.lastRequestTime = Date.now()
  }
}

// ============================================================================
// Logging to Supabase
// ============================================================================

export interface CronLogEntry {
  job_name: string
  status: 'started' | 'running' | 'completed' | 'failed'
  details?: Record<string, unknown>
  error?: string
  duration_ms?: number
}

export async function logCronEvent(entry: CronLogEntry): Promise<void> {
  try {
    await getSupabase().from('cron_job_log').insert({
      job_name: entry.job_name,
      status: entry.status,
      details: entry.details || {},
      error_message: entry.error,
      duration_ms: entry.duration_ms,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // Don't let logging failures break the cron job
    console.error('[CronLog] Failed to log:', err)
  }
}

// Wrapper that automatically logs start/complete/fail
export async function withCronLogging<T>(
  jobName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  await logCronEvent({
    job_name: jobName,
    status: 'started',
    details: { startedAt: new Date().toISOString() },
  })

  try {
    const result = await fn()

    await logCronEvent({
      job_name: jobName,
      status: 'completed',
      duration_ms: Date.now() - startTime,
      details: { completedAt: new Date().toISOString() },
    })

    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)

    await logCronEvent({
      job_name: jobName,
      status: 'failed',
      duration_ms: Date.now() - startTime,
      error: errorMsg,
    })

    throw error
  }
}

// ============================================================================
// Batch Processing
// ============================================================================

export interface BatchResult<T> {
  item: T
  success: boolean
  result?: unknown
  error?: string
}

export interface BatchOptions {
  batchSize?: number
  delayBetweenItems?: number
  continueOnError?: boolean
}

export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<BatchResult<T>[]> {
  const { delayBetweenItems = 100, continueOnError = true } = options
  const results: BatchResult<T>[] = []

  for (const item of items) {
    try {
      const result = await processor(item)
      results.push({ item, success: true, result })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.push({ item, success: false, error: errorMsg })

      if (!continueOnError) {
        throw error
      }
    }

    if (delayBetweenItems > 0) {
      await sleep(delayBetweenItems)
    }
  }

  return results
}

// ============================================================================
// Sync State Management
// ============================================================================

export interface SyncState {
  job_name: string
  last_offset: number
  last_run: string
  items_synced: number
  status: string
}

export async function getSyncState(jobName: string): Promise<SyncState | null> {
  const { data, error } = await getSupabase()
    .from('sync_state')
    .select('*')
    .eq('job_name', jobName)
    .single()

  if (error || !data) return null
  return data as SyncState
}

export async function updateSyncState(
  jobName: string,
  updates: Partial<SyncState>
): Promise<void> {
  await getSupabase()
    .from('sync_state')
    .upsert({
      job_name: jobName,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'job_name' })
}

// ============================================================================
// Helpers
// ============================================================================

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Check if we should retry based on error type
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  // Rate limit errors - always retry
  if (message.includes('429') || message.includes('rate limit')) {
    return true
  }

  // Temporary network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('socket hang up')
  ) {
    return true
  }

  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true
  }

  // Don't retry client errors (4xx except 429)
  if (message.includes('400') || message.includes('401') || message.includes('403') || message.includes('404')) {
    return false
  }

  // Default to retry
  return true
}
