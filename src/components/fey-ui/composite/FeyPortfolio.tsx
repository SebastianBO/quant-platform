'use client'

import { memo, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Text } from '../base/Text'
import { PriceBadge, AvatarBadge, LiveBadge } from '../base/Badge'
import { Card, CardHeader, CardContent } from '../base/Card'
import { FeySparkline } from './FeyCharts'
import { transitions } from '../animations'
import { formatLargeNumber, formatCompactNumber } from '@/lib/formatNumber'

// =============================================================================
// TYPES
// =============================================================================

export interface Holding {
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  change: number
  changePercent: number
  value: number
  gainLoss: number
  gainLossPercent: number
  sparkline?: number[]
}

export interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparkline?: number[]
  alerts?: Array<{ type: 'above' | 'below'; price: number }>
}

// =============================================================================
// PORTFOLIO SUMMARY CARD
// =============================================================================

interface FeyPortfolioSummaryProps {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  className?: string
}

export const FeyPortfolioSummary = memo(function FeyPortfolioSummary({
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  dayGainLoss,
  dayGainLossPercent,
  className,
}: FeyPortfolioSummaryProps) {
  const isPositiveTotal = totalGainLoss >= 0
  const isPositiveDay = dayGainLoss >= 0

  return (
    <motion.div
      className={cn(
        'p-5 rounded-xl',
        'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]',
        'border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      <div className="flex items-center justify-between mb-4">
        <Text variant="label" className="text-[10px] text-[#555]">PORTFOLIO VALUE</Text>
        <LiveBadge color="green" size="xs">Live</LiveBadge>
      </div>

      <Text variant="body" className="text-3xl font-bold text-white mb-1">
        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Text>

      <div className="flex items-center gap-4 mt-3">
        <div>
          <Text variant="caption" className="text-[10px] text-[#555] mb-0.5">Total Gain/Loss</Text>
          <div className="flex items-center gap-2">
            <Text variant="body" className={cn(
              'font-semibold',
              isPositiveTotal ? 'text-[#4ebe96]' : 'text-[#e15241]'
            )}>
              {isPositiveTotal ? '+' : ''}{totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <PriceBadge value={totalGainLossPercent} size="xs" />
          </div>
        </div>

        <div className="w-px h-8 bg-white/[0.08]" />

        <div>
          <Text variant="caption" className="text-[10px] text-[#555] mb-0.5">Today</Text>
          <div className="flex items-center gap-2">
            <Text variant="body" className={cn(
              'font-semibold',
              isPositiveDay ? 'text-[#4ebe96]' : 'text-[#e15241]'
            )}>
              {isPositiveDay ? '+' : ''}{dayGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <PriceBadge value={dayGainLossPercent} size="xs" />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// =============================================================================
// HOLDING ROW
// =============================================================================

interface HoldingRowProps {
  holding: Holding
  index: number
  expanded?: boolean
  onToggle?: () => void
}

const HoldingRow = memo(function HoldingRow({
  holding,
  index,
  expanded,
  onToggle,
}: HoldingRowProps) {
  const isPositive = holding.gainLossPercent >= 0

  return (
    <motion.div
      className={cn(
        'border-b border-white/[0.04] last:border-0',
        'hover:bg-white/[0.02] transition-colors cursor-pointer'
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onToggle}
    >
      <div className="flex items-center p-3 gap-3">
        {/* Symbol & Name */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <AvatarBadge
            name={holding.symbol}
            size="md"
            color={isPositive ? 'bg-[#4ebe96]' : 'bg-[#e15241]'}
          />
          <div>
            <Text variant="body" className="font-semibold text-[13px]">{holding.symbol}</Text>
            <Text variant="caption" className="text-[10px] truncate max-w-[80px]">{holding.name}</Text>
          </div>
        </div>

        {/* Shares */}
        <div className="min-w-[60px] text-right">
          <Text variant="caption" className="text-[10px] text-[#555]">Shares</Text>
          <Text variant="body" className="text-[12px]">{holding.shares.toLocaleString()}</Text>
        </div>

        {/* Avg Cost */}
        <div className="min-w-[70px] text-right">
          <Text variant="caption" className="text-[10px] text-[#555]">Avg Cost</Text>
          <Text variant="body" className="text-[12px] font-mono">${holding.avgCost.toFixed(2)}</Text>
        </div>

        {/* Current Price */}
        <div className="min-w-[80px] text-right">
          <Text variant="caption" className="text-[10px] text-[#555]">Price</Text>
          <Text variant="body" className="text-[12px] font-mono">${holding.currentPrice.toFixed(2)}</Text>
        </div>

        {/* Sparkline */}
        {holding.sparkline && (
          <div className="hidden sm:block">
            <FeySparkline data={holding.sparkline} positive={isPositive} />
          </div>
        )}

        {/* Value */}
        <div className="min-w-[90px] text-right">
          <Text variant="caption" className="text-[10px] text-[#555]">Value</Text>
          <Text variant="body" className="text-[12px] font-semibold">${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </div>

        {/* Gain/Loss */}
        <div className="min-w-[100px] text-right">
          <Text variant="caption" className="text-[10px] text-[#555]">Gain/Loss</Text>
          <div className="flex items-center justify-end gap-1">
            <Text variant="body" className={cn(
              'text-[12px] font-semibold',
              isPositive ? 'text-[#4ebe96]' : 'text-[#e15241]'
            )}>
              {isPositive ? '+' : ''}${Math.abs(holding.gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <PriceBadge value={holding.gainLossPercent} size="xs" />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-3 pb-3 bg-white/[0.02]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-3 grid grid-cols-4 gap-4 text-center">
              <div>
                <Text variant="caption" className="text-[10px] text-[#555]">Day Change</Text>
                <Text variant="body" className={cn(
                  'text-[12px] font-semibold',
                  holding.change >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'
                )}>
                  {holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                </Text>
              </div>
              <div>
                <Text variant="caption" className="text-[10px] text-[#555]">Cost Basis</Text>
                <Text variant="body" className="text-[12px]">
                  ${(holding.avgCost * holding.shares).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </div>
              <div>
                <Text variant="caption" className="text-[10px] text-[#555]">% of Portfolio</Text>
                <Text variant="body" className="text-[12px]">--</Text>
              </div>
              <div>
                <Link
                  href={`/stock/${holding.symbol}`}
                  className="text-[#479ffa] text-[11px] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// =============================================================================
// PORTFOLIO HOLDINGS
// =============================================================================

interface FeyPortfolioHoldingsProps {
  holdings: Holding[]
  className?: string
  title?: string
}

export const FeyPortfolioHoldings = memo(function FeyPortfolioHoldings({
  holdings,
  className,
  title = 'Holdings',
}: FeyPortfolioHoldingsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'value' | 'gainLoss' | 'symbol'>('value')

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value
        case 'gainLoss':
          return b.gainLossPercent - a.gainLossPercent
        case 'symbol':
          return a.symbol.localeCompare(b.symbol)
        default:
          return 0
      }
    })
  }, [holdings, sortBy])

  return (
    <motion.div
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-[#1a1a1a] border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <Text variant="subtitle" className="font-semibold">{title}</Text>
        <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
          {(['value', 'gainLoss', 'symbol'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors',
                sortBy === sort
                  ? 'bg-white/[0.1] text-white'
                  : 'text-[#555] hover:text-white'
              )}
            >
              {sort === 'gainLoss' ? 'G/L' : sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Holdings List */}
      <div className="overflow-x-auto">
        {sortedHoldings.map((holding, i) => (
          <HoldingRow
            key={holding.symbol}
            holding={holding}
            index={i}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}
      </div>

      {holdings.length === 0 && (
        <div className="p-8 text-center">
          <Text variant="caption" className="text-[#555]">No holdings yet</Text>
        </div>
      )}
    </motion.div>
  )
})

// =============================================================================
// WATCHLIST
// =============================================================================

interface FeyWatchlistProps {
  items: WatchlistItem[]
  className?: string
  title?: string
  onRemove?: (symbol: string) => void
  onAddAlert?: (symbol: string) => void
}

export const FeyWatchlist = memo(function FeyWatchlist({
  items,
  className,
  title = 'Watchlist',
  onRemove,
  onAddAlert,
}: FeyWatchlistProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-[#1a1a1a] border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Text variant="subtitle" className="font-semibold">{title}</Text>
          <span className="px-1.5 py-0.5 text-[10px] bg-white/[0.05] rounded text-[#555]">
            {items.length}
          </span>
        </div>
        <button className="text-[#479ffa] text-[11px] hover:underline">
          + Add Stock
        </button>
      </div>

      {/* Items */}
      <div>
        {items.map((item, i) => (
          <motion.div
            key={item.symbol}
            className={cn(
              'flex items-center p-3 gap-3',
              'border-b border-white/[0.04] last:border-0',
              'hover:bg-white/[0.02] transition-colors group'
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link href={`/stock/${item.symbol}`} className="flex items-center gap-3 flex-1">
              <AvatarBadge
                name={item.symbol}
                size="md"
                color={item.changePercent >= 0 ? 'bg-[#4ebe96]' : 'bg-[#e15241]'}
              />
              <div className="flex-1 min-w-0">
                <Text variant="body" className="font-semibold text-[13px]">{item.symbol}</Text>
                <Text variant="caption" className="text-[10px] truncate">{item.name}</Text>
              </div>
            </Link>

            {item.sparkline && (
              <FeySparkline data={item.sparkline} positive={item.changePercent >= 0} />
            )}

            <div className="text-right">
              <Text variant="body" className="font-mono text-[13px]">
                ${item.price.toFixed(2)}
              </Text>
              <PriceBadge value={item.changePercent} size="xs" />
            </div>

            {/* Actions (show on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onAddAlert && (
                <button
                  onClick={(e) => { e.preventDefault(); onAddAlert(item.symbol) }}
                  className="p-1.5 hover:bg-white/[0.05] rounded"
                  title="Add alert"
                >
                  <svg className="size-3.5 text-[#555] hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
              )}
              {onRemove && (
                <button
                  onClick={(e) => { e.preventDefault(); onRemove(item.symbol) }}
                  className="p-1.5 hover:bg-white/[0.05] rounded"
                  title="Remove"
                >
                  <svg className="size-3.5 text-[#555] hover:text-[#e15241]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-8 text-center">
          <Text variant="caption" className="text-[#555]">No stocks in watchlist</Text>
        </div>
      )}
    </motion.div>
  )
})

// =============================================================================
// QUICK TRADE CARD
// =============================================================================

interface FeyQuickTradeProps {
  symbol: string
  price: number
  change: number
  changePercent: number
  className?: string
  onBuy?: (shares: number) => void
  onSell?: (shares: number) => void
}

export const FeyQuickTrade = memo(function FeyQuickTrade({
  symbol,
  price,
  change,
  changePercent,
  className,
  onBuy,
  onSell,
}: FeyQuickTradeProps) {
  const [shares, setShares] = useState(1)
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const total = shares * price

  return (
    <Card className={cn('max-w-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AvatarBadge name={symbol} size="md" />
            <div>
              <Text variant="subtitle" className="font-bold">{symbol}</Text>
              <Text variant="body" className="text-white font-semibold">
                ${price.toFixed(2)}
              </Text>
            </div>
          </div>
          <PriceBadge value={changePercent} size="md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Buy/Sell Toggle */}
        <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
          {(['buy', 'sell'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              className={cn(
                'flex-1 py-2 text-[12px] font-semibold rounded-md transition-colors',
                action === a
                  ? a === 'buy'
                    ? 'bg-[#4ebe96] text-black'
                    : 'bg-[#e15241] text-white'
                  : 'text-[#555] hover:text-white'
              )}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Shares Input */}
        <div>
          <Text variant="caption" className="text-[10px] text-[#555] mb-1">Shares</Text>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className={cn(
              'w-full px-3 py-2 rounded-lg',
              'bg-white/[0.03] border border-white/[0.08]',
              'text-white text-[14px] font-mono',
              'focus:outline-none focus:border-[#479ffa]/50'
            )}
          />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
          <Text variant="caption" className="text-[#555]">Estimated Total</Text>
          <Text variant="body" className="font-bold text-white">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </div>

        {/* Submit */}
        <button
          onClick={() => action === 'buy' ? onBuy?.(shares) : onSell?.(shares)}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-[13px] transition-colors',
            action === 'buy'
              ? 'bg-[#4ebe96] text-black hover:bg-[#4ebe96]/90'
              : 'bg-[#e15241] text-white hover:bg-[#e15241]/90'
          )}
        >
          {action === 'buy' ? 'Buy' : 'Sell'} {shares} {shares === 1 ? 'Share' : 'Shares'}
        </button>
      </CardContent>
    </Card>
  )
})

// Types are exported at their declaration points above
