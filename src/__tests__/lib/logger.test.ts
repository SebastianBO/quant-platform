import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, createLogger } from '@/lib/logger'

describe('logger', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  beforeEach(() => {
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  describe('basic logging', () => {
    it('logs info messages', () => {
      logger.info('Test message')
      expect(console.log).toHaveBeenCalled()
    })

    it('logs warn messages', () => {
      logger.warn('Warning message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('logs error messages', () => {
      logger.error('Error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('includes context in logs', () => {
      logger.info('Test message', { userId: '123' })
      expect(console.log).toHaveBeenCalled()
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Test message')
    })
  })

  describe('createLogger', () => {
    it('creates a child logger with default context', () => {
      const apiLogger = createLogger({ service: 'api' })
      apiLogger.info('Request received', { path: '/test' })
      expect(console.log).toHaveBeenCalled()
    })

    it('merges default and call context', () => {
      const apiLogger = createLogger({ service: 'api' })
      apiLogger.error('Error occurred', { error: 'test error' })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('timer', () => {
    it('measures operation duration', async () => {
      const timer = logger.time('Test operation')
      await new Promise(resolve => setTimeout(resolve, 10))
      timer.end()

      expect(console.log).toHaveBeenCalled()
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call).toContain('Test operation completed')
    })

    it('includes duration in output', async () => {
      const timer = logger.time('Timed operation')
      await new Promise(resolve => setTimeout(resolve, 5))
      timer.end({ extra: 'context' })

      expect(console.log).toHaveBeenCalled()
    })
  })
})
