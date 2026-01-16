/**
 * Structured logging utility for production use
 * Replaces console.log with proper logging that can be:
 * - Filtered by log level
 * - Stripped in production builds
 * - Extended to external services (Sentry, DataDog, etc.)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
}

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

// Minimum log level to output (can be configured via env)
const minLevel = (process.env.LOG_LEVEL as LogLevel) || (isDev ? 'debug' : 'info')

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[minLevel]
}

function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry

  if (isDev) {
    // Pretty format for development
    const prefix = {
      debug: '\x1b[36m[DEBUG]\x1b[0m',
      info: '\x1b[32m[INFO]\x1b[0m',
      warn: '\x1b[33m[WARN]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m',
    }[level]

    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `${prefix} ${message}${contextStr}`
  }

  // JSON format for production (structured logging)
  return JSON.stringify(entry)
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
  }

  const formatted = formatLogEntry(entry)

  switch (level) {
    case 'debug':
    case 'info':
      // eslint-disable-next-line no-console
      console.log(formatted)
      break
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(formatted)
      break
    case 'error':
      // eslint-disable-next-line no-console
      console.error(formatted)
      break
  }
}

/**
 * Timer return type for measuring operation duration
 */
interface Timer {
  end: (endContext?: LogContext) => void
}

/**
 * Logger object with methods for each log level
 *
 * @example
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Payment failed', { orderId: '456', error: err.message })
 * logger.debug('Cache hit', { key: 'user:123' })
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  /**
   * Timer utility for measuring operation duration
   *
   * @example
   * const timer = logger.time('Database query')
   * await db.query(...)
   * timer.end() // Logs: "Database query completed" with duration
   */
  time: (label: string, context?: LogContext): Timer => {
    const start = performance.now()

    return {
      end: (endContext?: LogContext) => {
        const duration = Math.round(performance.now() - start)
        logger.info(`${label} completed`, {
          ...context,
          ...endContext,
          durationMs: duration,
        })
      },
    }
  },
}

/**
 * Create a child logger with preset context
 *
 * @example
 * const apiLogger = createLogger({ service: 'api', route: '/chat' })
 * apiLogger.info('Request received', { userId: '123' })
 * // Logs: { service: 'api', route: '/chat', userId: '123' }
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...defaultContext, ...context }),
    error: (message: string, context?: LogContext) =>
      log('error', message, { ...defaultContext, ...context }),
  }
}

export default logger
