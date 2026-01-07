"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useRealTimeQuote } from '@/lib/websocket'

interface RealTimePriceProps {
  symbol: string
  initialPrice?: number
  showChange?: boolean
  showVolume?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Real-time stock price component with WebSocket updates
 *
 * Uses Yahoo Finance's FREE WebSocket - no API key required!
 * Shows live price updates with flash animations on price changes.
 */
export default function RealTimePrice({
  symbol,
  initialPrice,
  showChange = true,
  showVolume = false,
  size = 'md',
  className
}: RealTimePriceProps) {
  // No API key needed - uses Yahoo Finance's free WebSocket!
  const { quote, isConnected, isLoading, error } = useRealTimeQuote(symbol)

  const [flashClass, setFlashClass] = useState<'flash-up' | 'flash-down' | null>(null)
  const [displayPrice, setDisplayPrice] = useState(initialPrice || 0)

  // Update display price and trigger flash animation
  useEffect(() => {
    if (quote?.price && quote.price !== displayPrice) {
      const isUp = quote.price > displayPrice
      setFlashClass(isUp ? 'flash-up' : 'flash-down')
      setDisplayPrice(quote.price)

      // Remove flash after animation
      const timer = setTimeout(() => setFlashClass(null), 300)
      return () => clearTimeout(timer)
    }
  }, [quote?.price, displayPrice])

  // Size classes
  const sizeClasses = {
    sm: {
      price: 'text-lg font-semibold',
      change: 'text-xs',
      volume: 'text-xs'
    },
    md: {
      price: 'text-2xl font-bold',
      change: 'text-sm',
      volume: 'text-sm'
    },
    lg: {
      price: 'text-4xl font-bold',
      change: 'text-base',
      volume: 'text-base'
    }
  }

  const sizes = sizeClasses[size]

  // Determine change color
  const changeColor = quote?.change !== undefined
    ? quote.change >= 0 ? 'text-green-500' : 'text-red-500'
    : 'text-muted-foreground'

  // Format price
  const formattedPrice = displayPrice > 0
    ? `$${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'

  // Format change
  const formattedChange = quote?.change !== undefined
    ? `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`
    : null

  // Format volume
  const formattedVolume = quote?.volume
    ? quote.volume.toLocaleString('en-US')
    : null

  // Connection indicator
  const statusIndicator = (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
      )}
      title={isConnected ? 'Real-time' : 'Connecting...'}
    />
  )

  return (
    <div className={cn('inline-flex flex-col', className)}>
      {/* Price with flash animation */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            sizes.price,
            'transition-colors duration-300',
            flashClass === 'flash-up' && 'text-green-400',
            flashClass === 'flash-down' && 'text-red-400'
          )}
        >
          {formattedPrice}
        </span>
        {statusIndicator}
      </div>

      {/* Change */}
      {showChange && formattedChange && (
        <span className={cn(sizes.change, changeColor)}>
          {formattedChange}
        </span>
      )}

      {/* Volume */}
      {showVolume && formattedVolume && (
        <span className={cn(sizes.volume, 'text-muted-foreground')}>
          Vol: {formattedVolume}
        </span>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <span className="text-xs text-yellow-500">
          Using delayed data
        </span>
      )}
    </div>
  )
}

/**
 * Real-time ticker tape showing multiple symbols
 */
export function RealTimeTicker({
  symbols,
  className
}: {
  symbols: string[]
  className?: string
}) {
  return (
    <div className={cn('flex gap-6 overflow-x-auto py-2', className)}>
      {symbols.map(symbol => (
        <div key={symbol} className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-semibold text-muted-foreground">{symbol}</span>
          <RealTimePrice symbol={symbol} size="sm" showChange={false} />
        </div>
      ))}
    </div>
  )
}

/**
 * Real-time price table for multiple stocks
 */
export function RealTimePriceTable({
  symbols,
  className
}: {
  symbols: string[]
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      {symbols.map(symbol => (
        <div
          key={symbol}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <span className="font-medium">{symbol}</span>
          <RealTimePrice symbol={symbol} size="sm" />
        </div>
      ))}
    </div>
  )
}
