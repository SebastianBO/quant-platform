"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { BinanceCryptoWebSocket, CryptoQuote, getBinanceWebSocket } from './binance-crypto'

interface UseCryptoQuotesOptions {
  symbols: string[]
  onQuote?: (quote: CryptoQuote) => void
  onError?: (error: Error) => void
}

interface UseCryptoQuotesResult {
  quotes: Map<string, CryptoQuote>
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  reconnect: () => void
}

/**
 * React hook for FREE real-time crypto quotes via Binance WebSocket
 *
 * No API key required! All crypto pairs available!
 *
 * @example
 * ```tsx
 * const { quotes, isConnected } = useCryptoQuotes({
 *   symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
 * })
 *
 * // Access quote
 * const btcQuote = quotes.get('BTCUSDT')
 * console.log(btcQuote?.price) // e.g., 67500.50
 * ```
 */
export function useCryptoQuotes({
  symbols,
  onQuote,
  onError
}: UseCryptoQuotesOptions): UseCryptoQuotesResult {
  const [quotes, setQuotes] = useState<Map<string, CryptoQuote>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const wsRef = useRef<BinanceCryptoWebSocket | null>(null)
  const unsubscribesRef = useRef<(() => void)[]>([])

  // Memoize symbol list
  const symbolsKey = symbols.sort().join(',')

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      wsRef.current = getBinanceWebSocket()

      const unsubStatus = wsRef.current.onStatus((status) => {
        setIsConnected(status === 'connected')
        if (status === 'disconnected') {
          setIsLoading(false)
        }
      })

      const unsubError = wsRef.current.onError((err) => {
        setError(err)
        onError?.(err)
      })

      unsubscribesRef.current.push(unsubStatus, unsubError)

      await wsRef.current.connect()

      symbols.forEach(symbol => {
        const unsub = wsRef.current!.subscribe(symbol, (quote) => {
          setQuotes(prev => {
            const next = new Map(prev)
            next.set(quote.symbol, quote)
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
    unsubscribesRef.current.forEach(unsub => unsub())
    unsubscribesRef.current = []
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    connect()
    return () => disconnect()
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
 * Hook for a single crypto pair's real-time quote
 */
export function useCryptoQuote(symbol: string) {
  const { quotes, isConnected, isLoading, error } = useCryptoQuotes({
    symbols: [symbol]
  })

  return {
    quote: quotes.get(symbol.toUpperCase()) || null,
    isConnected,
    isLoading,
    error
  }
}
