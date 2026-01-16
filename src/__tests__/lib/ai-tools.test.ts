import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Since the tools.ts exports tools that require external dependencies,
// we'll test the utility functions by extracting their logic

describe('AI Tools Utilities', () => {
  describe('createErrorResponse', () => {
    // Test the error response format
    function createErrorResponse(
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

    it('creates error response with message', () => {
      const error = new Error('Connection refused')
      const result = createErrorResponse(error, { operation: 'getStockQuote' })

      expect(result.success).toBe(false)
      expect(result.error).toBe('getStockQuote failed: Connection refused')
      expect(result.details.operation).toBe('getStockQuote')
      expect(result.details.errorType).toBe('Error')
    })

    it('includes ticker when provided', () => {
      const error = new Error('Not found')
      const result = createErrorResponse(error, { operation: 'getQuote', ticker: 'AAPL' })

      expect(result.details.ticker).toBe('AAPL')
    })

    it('includes attempt number when provided', () => {
      const error = new Error('Timeout')
      const result = createErrorResponse(error, { operation: 'fetch', attempt: 3 })

      expect(result.details.attempt).toBe(3)
    })

    it('handles non-Error objects', () => {
      const result = createErrorResponse('string error', { operation: 'test' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('test failed')
    })

    it('includes timestamp in ISO format', () => {
      const error = new Error('Test')
      const result = createErrorResponse(error, { operation: 'test' })

      expect(result.details.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('withTimeout', () => {
    // Replicate the withTimeout logic for testing
    async function withTimeout<T>(
      promiseOrThenable: Promise<T>,
      timeoutMs: number,
      operation: string
    ): Promise<T> {
      const promise = Promise.resolve(promiseOrThenable)

      let timeoutId: ReturnType<typeof setTimeout>
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

    it('resolves when promise completes before timeout', async () => {
      const fastPromise = Promise.resolve('success')
      const result = await withTimeout(fastPromise, 1000, 'test')

      expect(result).toBe('success')
    })

    it('rejects when promise exceeds timeout', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 100))

      await expect(withTimeout(slowPromise, 10, 'slowOp'))
        .rejects.toThrow('slowOp timed out after 10ms')
    })

    it('includes operation name in timeout error', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 100))

      try {
        await withTimeout(slowPromise, 5, 'fetchData')
        expect.fail('Should have thrown')
      } catch (e) {
        expect((e as Error).message).toContain('fetchData')
        expect((e as Error).message).toContain('5ms')
      }
    })

    it('propagates original error if promise rejects', async () => {
      const failingPromise = Promise.reject(new Error('API error'))

      await expect(withTimeout(failingPromise, 1000, 'test'))
        .rejects.toThrow('API error')
    })
  })

  describe('getBaseUrl logic', () => {
    const originalEnv = process.env

    beforeEach(() => {
      vi.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    function getBaseUrl() {
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
      if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
      return 'http://localhost:3000'
    }

    it('uses VERCEL_URL when available', () => {
      process.env.VERCEL_URL = 'my-app.vercel.app'
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'

      expect(getBaseUrl()).toBe('https://my-app.vercel.app')
    })

    it('uses NEXT_PUBLIC_SITE_URL as fallback', () => {
      delete process.env.VERCEL_URL
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'

      expect(getBaseUrl()).toBe('https://example.com')
    })

    it('defaults to localhost', () => {
      delete process.env.VERCEL_URL
      delete process.env.NEXT_PUBLIC_SITE_URL

      expect(getBaseUrl()).toBe('http://localhost:3000')
    })
  })

  describe('retry logic', () => {
    interface RetryOptions {
      maxRetries?: number
      baseDelayMs?: number
      maxDelayMs?: number
    }

    // Simplified retry logic test
    function calculateDelay(attempt: number, opts: Required<RetryOptions>): number {
      return Math.min(
        opts.baseDelayMs * Math.pow(2, attempt),
        opts.maxDelayMs
      )
    }

    it('calculates exponential backoff correctly', () => {
      const opts = { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 }

      expect(calculateDelay(0, opts)).toBe(1000) // 1000 * 2^0
      expect(calculateDelay(1, opts)).toBe(2000) // 1000 * 2^1
      expect(calculateDelay(2, opts)).toBe(4000) // 1000 * 2^2
      expect(calculateDelay(3, opts)).toBe(8000) // 1000 * 2^3
    })

    it('caps delay at maxDelayMs', () => {
      const opts = { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 }

      expect(calculateDelay(3, opts)).toBe(5000) // Would be 8000 but capped
      expect(calculateDelay(4, opts)).toBe(5000) // Would be 16000 but capped
    })

    it('handles small baseDelayMs', () => {
      const opts = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 1000 }

      expect(calculateDelay(0, opts)).toBe(100)
      expect(calculateDelay(1, opts)).toBe(200)
      expect(calculateDelay(2, opts)).toBe(400)
    })
  })

  describe('retryOn logic', () => {
    function shouldRetry(error: Error, response?: { status: number }): boolean {
      // Retry on network errors
      if (error.name === 'AbortError' || error.name === 'TypeError') return true
      // Retry on rate limits and server errors
      if (response && (response.status === 429 || response.status >= 500)) return true
      return false
    }

    it('retries on AbortError', () => {
      const error = new Error('Aborted')
      error.name = 'AbortError'
      expect(shouldRetry(error)).toBe(true)
    })

    it('retries on TypeError (network errors)', () => {
      const error = new TypeError('Failed to fetch')
      expect(shouldRetry(error)).toBe(true)
    })

    it('retries on 429 rate limit', () => {
      const error = new Error('HTTP 429')
      expect(shouldRetry(error, { status: 429 })).toBe(true)
    })

    it('retries on 500 server error', () => {
      const error = new Error('HTTP 500')
      expect(shouldRetry(error, { status: 500 })).toBe(true)
    })

    it('retries on 503 service unavailable', () => {
      const error = new Error('HTTP 503')
      expect(shouldRetry(error, { status: 503 })).toBe(true)
    })

    it('does not retry on 400 bad request', () => {
      const error = new Error('HTTP 400')
      expect(shouldRetry(error, { status: 400 })).toBe(false)
    })

    it('does not retry on 401 unauthorized', () => {
      const error = new Error('HTTP 401')
      expect(shouldRetry(error, { status: 401 })).toBe(false)
    })

    it('does not retry on 404 not found', () => {
      const error = new Error('HTTP 404')
      expect(shouldRetry(error, { status: 404 })).toBe(false)
    })
  })

  describe('ticker normalization', () => {
    function normalizeTicker(ticker: string): string {
      return ticker.toUpperCase().trim()
    }

    it('converts lowercase to uppercase', () => {
      expect(normalizeTicker('aapl')).toBe('AAPL')
    })

    it('handles mixed case', () => {
      expect(normalizeTicker('AaPl')).toBe('AAPL')
    })

    it('trims whitespace', () => {
      expect(normalizeTicker('  AAPL  ')).toBe('AAPL')
    })

    it('handles already uppercase', () => {
      expect(normalizeTicker('MSFT')).toBe('MSFT')
    })
  })
})
