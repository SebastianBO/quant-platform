'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Text } from '../base/Text'
import { Badge, LiveBadge } from '../base/Badge'
import {
  NotificationCard,
  BriefingCard,
  StockCard,
  AIChatCard,
} from './NotificationCard'
import { StackedCard, StackedCardGroup } from '../base/Card'

// =============================================================================
// TYPES
// =============================================================================

interface MarketMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

interface MarketBriefing {
  id: string
  title: string
  content: string
  timestamp: string
  category: 'market' | 'earnings' | 'news' | 'alert'
}

// =============================================================================
// LIVE NOTIFICATION FEED
// =============================================================================

export interface LiveNotificationFeedProps {
  className?: string
  maxItems?: number
}

export function LiveNotificationFeed({ className, maxItems = 5 }: LiveNotificationFeedProps) {
  const [topGainers, setTopGainers] = useState<MarketMover[]>([])
  const [topLosers, setTopLosers] = useState<MarketMover[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'stacked' | 'list'>('stacked')

  useEffect(() => {
    async function fetchMarketData() {
      setLoading(true)
      try {
        // Fetch top gainers
        const gainersRes = await fetch('/api/market/movers?type=gainers&limit=5')
        if (gainersRes.ok) {
          const data = await gainersRes.json()
          setTopGainers(data.movers || [])
        }

        // Fetch top losers
        const losersRes = await fetch('/api/market/movers?type=losers&limit=5')
        if (losersRes.ok) {
          const data = await losersRes.json()
          setTopLosers(data.movers || [])
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        // Use fallback mock data if API fails
        setTopGainers([
          { symbol: 'NVDA', name: 'NVIDIA Corp', price: 892.45, change: 37.82, changePercent: 4.43, volume: 45000000 },
          { symbol: 'SMCI', name: 'Super Micro', price: 1024.50, change: 38.92, changePercent: 3.95, volume: 12000000 },
          { symbol: 'AMD', name: 'AMD Inc', price: 178.23, change: 5.12, changePercent: 2.96, volume: 32000000 },
        ])
        setTopLosers([
          { symbol: 'TSLA', name: 'Tesla Inc', price: 182.63, change: -8.42, changePercent: -4.41, volume: 89000000 },
          { symbol: 'META', name: 'Meta Platforms', price: 485.22, change: -12.38, changePercent: -2.49, volume: 15000000 },
        ])
      }
      setLoading(false)
    }

    fetchMarketData()

    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Generate dynamic briefing content
  const generateBriefing = (): string => {
    if (topGainers.length > 0 && topLosers.length > 0) {
      const topGainer = topGainers[0]
      const topLoser = topLosers[0]
      return `Markets are showing mixed signals today. ${topGainer.symbol} leads gainers with a ${topGainer.changePercent.toFixed(1)}% surge, while ${topLoser.symbol} drops ${Math.abs(topLoser.changePercent).toFixed(1)}%. Tech sector showing strength in AI-related stocks.`
    }
    return 'Markets are actively trading. Check top movers for the latest opportunities.'
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/[0.05] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Text variant="title">Live Feed</Text>
          <LiveBadge color="green">Live</LiveBadge>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('stacked')}
            className={cn(
              'px-3 py-1.5 text-[12px] rounded-lg transition-colors',
              activeView === 'stacked'
                ? 'bg-white/[0.1] text-white'
                : 'text-[#868f97] hover:text-white'
            )}
          >
            Stacked
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={cn(
              'px-3 py-1.5 text-[12px] rounded-lg transition-colors',
              activeView === 'list'
                ? 'bg-white/[0.1] text-white'
                : 'text-[#868f97] hover:text-white'
            )}
          >
            List
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {activeView === 'stacked' ? (
          <motion.div
            key="stacked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-[340px]"
          >
            <StackedCardGroup className="absolute top-0 left-0 right-0">
              {/* Market Briefing */}
              <StackedCard index={0} total={4}>
                <BriefingCard
                  index={0}
                  total={4}
                  title="Market Briefing"
                  timestamp="Just now"
                  content={generateBriefing()}
                  readMoreHref="/markets"
                />
              </StackedCard>

              {/* Top Gainer */}
              {topGainers[0] && (
                <StackedCard index={1} total={4}>
                  <StockCard
                    index={1}
                    total={4}
                    ticker={topGainers[0].symbol}
                    tickerColor="bg-[#4ebe96]"
                    price={topGainers[0].price}
                    change={topGainers[0].changePercent}
                    content={`${topGainers[0].name} surges ${topGainers[0].changePercent.toFixed(1)}% on heavy volume. ${formatVolume(topGainers[0].volume)} shares traded.`}
                  />
                </StackedCard>
              )}

              {/* Top Loser */}
              {topLosers[0] && (
                <StackedCard index={2} total={4}>
                  <StockCard
                    index={2}
                    total={4}
                    ticker={topLosers[0].symbol}
                    tickerColor="bg-[#e15241]"
                    price={topLosers[0].price}
                    change={topLosers[0].changePercent}
                    content={`${topLosers[0].name} drops ${Math.abs(topLosers[0].changePercent).toFixed(1)}% amid market pressure.`}
                  />
                </StackedCard>
              )}

              {/* AI Insight */}
              <StackedCard index={3} total={4}>
                <AIChatCard
                  index={3}
                  total={4}
                  messages={[
                    { role: 'user', content: 'What are the top movers today?' },
                    {
                      role: 'assistant',
                      content: topGainers.length > 0
                        ? `Top gainers:\n${topGainers.slice(0, 3).map((s, i) => `${i + 1}. ${s.symbol} +${s.changePercent.toFixed(1)}%`).join('\n')}`
                        : 'Loading market data...',
                    },
                  ]}
                />
              </StackedCard>
            </StackedCardGroup>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Top Gainers Section */}
            <div>
              <Text variant="label" className="mb-2 text-[10px]">TOP GAINERS</Text>
              <div className="space-y-2">
                {topGainers.slice(0, 3).map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StockCard
                      ticker={stock.symbol}
                      tickerColor="bg-[#4ebe96]"
                      price={stock.price}
                      change={stock.changePercent}
                      content={`${stock.name} • ${formatVolume(stock.volume)} vol`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Top Losers Section */}
            <div>
              <Text variant="label" className="mb-2 text-[10px]">TOP LOSERS</Text>
              <div className="space-y-2">
                {topLosers.slice(0, 3).map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <StockCard
                      ticker={stock.symbol}
                      tickerColor="bg-[#e15241]"
                      price={stock.price}
                      change={stock.changePercent}
                      content={`${stock.name} • ${formatVolume(stock.volume)} vol`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// MARKET MOVERS WIDGET
// =============================================================================

export interface MarketMoversWidgetProps {
  type: 'gainers' | 'losers'
  className?: string
  limit?: number
}

export function MarketMoversWidget({ type, className, limit = 5 }: MarketMoversWidgetProps) {
  const [movers, setMovers] = useState<MarketMover[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovers() {
      setLoading(true)
      try {
        const res = await fetch(`/api/market/movers?type=${type}&limit=${limit}`)
        if (res.ok) {
          const data = await res.json()
          setMovers(data.movers || [])
        }
      } catch (error) {
        console.error('Failed to fetch movers:', error)
      }
      setLoading(false)
    }

    fetchMovers()
  }, [type, limit])

  const isGainers = type === 'gainers'
  const title = isGainers ? 'Top Gainers' : 'Top Losers'
  const color = isGainers ? 'bg-[#4ebe96]' : 'bg-[#e15241]'

  return (
    <div className={cn('bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('size-2 rounded-full', color)} />
          <Text variant="subtitle">{title}</Text>
        </div>
        <Badge variant={isGainers ? 'success' : 'error'}>
          {movers.length} stocks
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-white/[0.05] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {movers.map((stock, i) => (
            <motion.a
              key={stock.symbol}
              href={`/demo/fey-stock/${stock.symbol}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className={cn('size-8 rounded-lg flex items-center justify-center', color)}>
                  <span className="text-[11px] font-bold text-white">
                    {stock.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{stock.symbol}</p>
                  <p className="text-[11px] text-[#555] truncate max-w-[120px]">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-white tabular-nums">${stock.price.toFixed(2)}</p>
                <p className={cn('text-[11px] tabular-nums', isGainers ? 'text-[#4ebe96]' : 'text-[#e15241]')}>
                  {isGainers ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// EARNINGS CALENDAR WIDGET
// =============================================================================

interface EarningsEvent {
  symbol: string
  name: string
  date: string
  time: 'BMO' | 'AMC' | 'TBD'
  estimatedEPS?: number
}

export interface EarningsCalendarWidgetProps {
  className?: string
  daysAhead?: number
}

export function EarningsCalendarWidget({ className, daysAhead = 7 }: EarningsCalendarWidgetProps) {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true)
      try {
        const res = await fetch(`/api/earnings/upcoming?days=${daysAhead}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          setEarnings(data.earnings || [])
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
        // Mock data for demo
        setEarnings([
          { symbol: 'NVDA', name: 'NVIDIA', date: '2026-01-22', time: 'AMC', estimatedEPS: 4.62 },
          { symbol: 'MSFT', name: 'Microsoft', date: '2026-01-23', time: 'AMC', estimatedEPS: 2.78 },
          { symbol: 'TSLA', name: 'Tesla', date: '2026-01-24', time: 'AMC', estimatedEPS: 0.72 },
        ])
      }
      setLoading(false)
    }

    fetchEarnings()
  }, [daysAhead])

  return (
    <div className={cn('bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <Text variant="subtitle">Upcoming Earnings</Text>
        </div>
        <Badge variant="info">{earnings.length} this week</Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-white/[0.05] rounded-lg" />
          ))}
        </div>
      ) : earnings.length === 0 ? (
        <Text variant="caption" className="text-center py-4">
          No upcoming earnings this week
        </Text>
      ) : (
        <div className="space-y-2">
          {earnings.map((event, i) => (
            <motion.div
              key={`${event.symbol}-${event.date}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#479ffa]/20 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-[#479ffa]">
                    {event.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{event.symbol}</p>
                  <p className="text-[11px] text-[#555]">{event.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-white">{formatDate(event.date)}</p>
                <p className="text-[11px] text-[#555]">
                  {event.time} • Est. ${event.estimatedEPS?.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`
  return vol.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
