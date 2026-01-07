"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { YahooFinanceWebSocket, YahooQuote, getYahooWebSocket } from './yahoo-finance'

export interface RealTimeQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdate: number
  previousPrice: number | null
  dayHigh?: number
  dayLow?: number
}

interface UseRealTimeQuotesOptions {
  symbols: string[]
  onQuote?: (quote: YahooQuote) => void
  onError?: (error: Error) => void
}

interface UseRealTimeQuotesResult {
  quotes: Map<string, RealTimeQuote>
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  reconnect: () => void
}

/**
 * React hook for FREE real-time stock quotes via Yahoo Finance WebSocket
 *
 * No API key required! Unlimited quotes!
 *
 * @example
 * ```tsx
 * const { quotes, isConnected } = useRealTimeQuotes({
 *   symbols: ['AAPL', 'MSFT', 'GOOGL']
 * })
 *
 * // Access quote
 * const appleQuote = quotes.get('AAPL')
 * console.log(appleQuote?.price)
 * ```
 */
export function useRealTimeQuotes({
  symbols,
  onQuote,
  onError
}: UseRealTimeQuotesOptions): UseRealTimeQuotesResult {
  const [quotes, setQuotes] = useState<Map<string, RealTimeQuote>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const wsRef = useRef<YahooFinanceWebSocket | null>(null)
  const unsubscribesRef = useRef<(() => void)[]>([])
  const initialPricesRef = useRef<Map<string, number>>(new Map())

  // Memoize symbol list to prevent unnecessary reconnections
  const symbolsKey = symbols.sort().join(',')

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get or create WebSocket instance (no API key needed!)
      wsRef.current = getYahooWebSocket()

      // Set up status listener
      const unsubStatus = wsRef.current.onStatus((status) => {
        setIsConnected(status === 'connected')
        if (status === 'disconnected') {
          setIsLoading(false)
        }
      })

      // Set up error listener
      const unsubError = wsRef.current.onError((err) => {
        setError(err)
        onError?.(err)
      })

      unsubscribesRef.current.push(unsubStatus, unsubError)

      // Connect
      await wsRef.current.connect()

      // Subscribe to all symbols
      symbols.forEach(symbol => {
        const unsub = wsRef.current!.subscribe(symbol, (quote) => {
          // Update quotes
          setQuotes(prev => {
            const next = new Map(prev)
            const existing = next.get(quote.id)

            // Store initial price for calculating change
            if (!initialPricesRef.current.has(quote.id)) {
              initialPricesRef.current.set(quote.id, quote.previousClose || quote.price)
            }

            const initialPrice = initialPricesRef.current.get(quote.id)!
            const change = quote.change ?? (quote.price - initialPrice)
            const changePercent = quote.changePercent ?? ((change / initialPrice) * 100)

            next.set(quote.id, {
              symbol: quote.id,
              price: quote.price,
              change,
              changePercent,
              volume: quote.dayVolume || (existing?.volume || 0),
              lastUpdate: quote.time || Date.now(),
              previousPrice: existing?.price || null,
              dayHigh: quote.dayHigh,
              dayLow: quote.dayLow
            })

            return next
          })

          onQuote?.(quote)
        })

        unsubscribesRef.current.push(unsub)
      })

      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Connection failed'))
      setIsLoading(false)
    }
  }, [symbolsKey, onQuote, onError])

  const disconnect = useCallback(() => {
    // Unsubscribe from everything
    unsubscribesRef.current.forEach(unsub => unsub())
    unsubscribesRef.current = []
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [connect, disconnect])

  // Connect on mount and when symbols change
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    quotes,
    isConnected,
    isLoading,
    error,
    reconnect
  }
}

/**
 * Hook for a single symbol's real-time quote
 * No API key required - uses Yahoo Finance WebSocket
 */
export function useRealTimeQuote(symbol: string) {
  const { quotes, isConnected, isLoading, error } = useRealTimeQuotes({
    symbols: [symbol]
  })

  return {
    quote: quotes.get(symbol.toUpperCase()) || null,
    isConnected,
    isLoading,
    error
  }
}
