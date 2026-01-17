"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, LogIn, Briefcase, ChevronRight as ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparkline?: number[]
}

interface TrendingStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  signals?: string[] // WHY it's moving - our competitive edge
  score?: number
}

interface RecentStock {
  symbol: string
  name: string
  price: number
  changePercent: number
  timestamp: number
}

interface UserPortfolio {
  id: string
  name: string
  currency: string
  totalValue: number
  changePercent: number
  holdingsCount: number
}

// Types for RPC and Supabase responses
interface RpcPortfolioHolding {
  current_value?: number
  market_value?: number
  quantity?: number
  current_price?: number
  purchase_price?: number
  total_cost_basis?: number
}

interface RpcPortfolio {
  id: string
  name: string
  currency?: string
  holdings?: RpcPortfolioHolding[]
  investments?: RpcPortfolioHolding[]
}

interface SupabasePortfolioInvestment {
  id: string
  quantity?: number
  purchase_price?: number
  current_price?: number
  current_value?: number
}

interface SupabasePortfolio {
  id: string
  name: string
  currency?: string
  investments?: SupabasePortfolioInvestment[]
}

interface AuthUser {
  id: string
  email?: string
}

// Mini sparkline component
function MiniSparkline({ data, positive }: { data: number[], positive: boolean }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 60
  const height = 24
  const padding = 2

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#4ebe96" : "#ff5c5c"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Market index card
function MarketCard({ index }: { index: MarketIndex }) {
  const isPositive = index.changePercent >= 0

  return (
    <div className="p-3 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] motion-safe:transition-colors motion-safe:duration-150 ease-out cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#868f97] truncate">{index.name}</span>
        <MiniSparkline data={index.sparkline || []} positive={isPositive} />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold tabular-nums">{index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={cn(
          "text-xs tabular-nums",
          isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
        )}>
          {isPositive ? "+" : ""}{typeof index.changePercent === 'number' ? index.changePercent.toFixed(2) : '0.00'}%
        </span>
      </div>
    </div>
  )
}

// Trending ticker row with signals
function TrendingRow({ stock, onSelect }: { stock: TrendingStock, onSelect: (symbol: string) => void }) {
  const isPositive = stock.changePercent >= 0

  return (
    <button
      onClick={() => onSelect(stock.symbol)}
      className="w-full py-2.5 px-2 hover:bg-white/[0.05] rounded motion-safe:transition-colors motion-safe:duration-150 ease-out group text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">{stock.symbol}</p>
          <p className="text-xs text-[#868f97] truncate">{stock.name}</p>
        </div>
        <div className="text-right ml-3">
          <p className="font-medium tabular-nums text-sm">{typeof stock.price === 'number' ? stock.price.toFixed(2) : '—'}</p>
          <p className={cn(
            "text-xs tabular-nums",
            isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
          )}>
            {isPositive ? "+" : ""}{typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : '0.00'}%
          </p>
        </div>
      </div>
      {/* Signals - our competitive edge */}
      {stock.signals && stock.signals.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {stock.signals.slice(0, 3).map((signal, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-[#868f97]"
            >
              {signal}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

// Recently viewed row
function RecentRow({ stock, onSelect }: { stock: RecentStock, onSelect: (symbol: string) => void }) {
  const isPositive = stock.changePercent >= 0

  return (
    <button
      onClick={() => onSelect(stock.symbol)}
      className="w-full flex items-center justify-between py-2 px-1 hover:bg-white/[0.05] rounded motion-safe:transition-colors motion-safe:duration-150 ease-out group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">{stock.symbol}</p>
        <p className="text-xs text-[#868f97] truncate">{stock.name}</p>
      </div>
      <div className="text-right ml-3">
        <p className="font-medium tabular-nums text-sm">{typeof stock.price === 'number' ? stock.price.toFixed(2) : '—'}</p>
        <p className={cn(
          "text-xs tabular-nums",
          isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
        )}>
          {isPositive ? "+" : ""}{typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : '0.00'}%
        </p>
      </div>
    </button>
  )
}

interface MarketSidebarProps {
  onSelectTicker: (symbol: string) => void
  currentTicker?: string
}

export default function MarketSidebar({ onSelectTicker, currentTicker }: MarketSidebarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([])
  const [topGainers, setTopGainers] = useState<TrendingStock[]>([])
  const [topLosers, setTopLosers] = useState<TrendingStock[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<RecentStock[]>([])
  const [marketPage, setMarketPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewedStocks')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentlyViewed(parsed.slice(0, 15))
      } catch (e) {
        console.error('Error parsing recently viewed:', e)
      }
    }
  }, [])

  // Fetch user and portfolios
  useEffect(() => {
    const fetchUserAndPortfolios = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          // Try RPC function first
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('get_user_portfolios', {
                p_user_id: authUser.id,
                include_holdings: true
              })

            if (!rpcError && rpcData) {
              let portfolioData = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData
              if (!Array.isArray(portfolioData)) {
                portfolioData = portfolioData ? [portfolioData] : []
              }

              const mapped: UserPortfolio[] = portfolioData.map((p: RpcPortfolio) => {
                const holdings = p.holdings || p.investments || []
                const totalValue = holdings.reduce((sum: number, h: RpcPortfolioHolding) => {
                  return sum + (h.current_value || h.market_value || ((h.quantity || 0) * (h.current_price || h.purchase_price || 0)))
                }, 0)
                const totalCost = holdings.reduce((sum: number, h: RpcPortfolioHolding) => {
                  return sum + (h.total_cost_basis || ((h.quantity || 0) * (h.purchase_price || 0)))
                }, 0)
                const changePercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

                return {
                  id: p.id,
                  name: p.name,
                  currency: p.currency || 'USD',
                  totalValue,
                  changePercent,
                  holdingsCount: holdings.length
                }
              })

              setPortfolios(mapped)
            }
          } catch (rpcErr) {
            // Fallback to direct query
            const { data: portfolioData } = await supabase
              .from('portfolios')
              .select(`*, investments (id, quantity, purchase_price, current_price, current_value)`)
              .eq('user_id', authUser.id)

            if (portfolioData) {
              const mapped: UserPortfolio[] = portfolioData.map((p: SupabasePortfolio) => {
                const holdings = p.investments || []
                const totalValue = holdings.reduce((sum: number, h: SupabasePortfolioInvestment) => {
                  return sum + (h.current_value || ((h.quantity || 0) * (h.current_price || h.purchase_price || 0)))
                }, 0)
                const totalCost = holdings.reduce((sum: number, h: SupabasePortfolioInvestment) => {
                  return sum + ((h.quantity || 0) * (h.purchase_price || 0))
                }, 0)
                const changePercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

                return {
                  id: p.id,
                  name: p.name,
                  currency: p.currency || 'USD',
                  totalValue,
                  changePercent,
                  holdingsCount: holdings.length
                }
              })

              setPortfolios(mapped)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user/portfolios:', error)
      }
      setPortfolioLoading(false)
    }

    fetchUserAndPortfolios()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setPortfolios([])
      }
    })

    return () => authListener?.subscription?.unsubscribe?.()
  }, [])

  // Save current ticker to recently viewed
  useEffect(() => {
    if (!currentTicker) return

    const fetchAndSave = async () => {
      try {
        const response = await fetch(`/api/stock?ticker=${currentTicker}`)
        if (!response.ok) return
        const data = await response.json()

        const newStock: RecentStock = {
          symbol: currentTicker,
          name: data.companyFacts?.name || currentTicker,
          price: data.snapshot?.price || 0,
          changePercent: data.snapshot?.day_change_percent || 0,
          timestamp: Date.now()
        }

        setRecentlyViewed(prev => {
          const filtered = prev.filter(s => s.symbol !== currentTicker)
          const updated = [newStock, ...filtered].slice(0, 15)
          localStorage.setItem('recentlyViewedStocks', JSON.stringify(updated))
          return updated
        })
      } catch (e) {
        console.error('Error saving to recently viewed:', e)
      }
    }

    fetchAndSave()
  }, [currentTicker])

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market overview
        const overviewRes = await fetch('/api/market-overview')
        if (overviewRes.ok) {
          const data = await overviewRes.json()

          // Generate fake sparklines for demo (replace with real data)
          const generateSparkline = (basePrice: number, positive: boolean) => {
            const points = []
            let price = basePrice * (positive ? 0.98 : 1.02)
            for (let i = 0; i < 20; i++) {
              price += (Math.random() - (positive ? 0.3 : 0.7)) * (basePrice * 0.002)
              points.push(price)
            }
            return points
          }

          const indices: MarketIndex[] = [
            {
              symbol: '^GSPC',
              name: 'S&P 500',
              price: data.indices?.sp500?.price || 6000,
              change: data.indices?.sp500?.change || 0,
              changePercent: data.indices?.sp500?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.sp500?.price || 6000, (data.indices?.sp500?.changePercent || 0) >= 0)
            },
            {
              symbol: '^IXIC',
              name: 'Nasdaq',
              price: data.indices?.nasdaq?.price || 19000,
              change: data.indices?.nasdaq?.change || 0,
              changePercent: data.indices?.nasdaq?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.nasdaq?.price || 19000, (data.indices?.nasdaq?.changePercent || 0) >= 0)
            },
            {
              symbol: '^RUT',
              name: 'Russell 2000',
              price: data.indices?.russell?.price || 2500,
              change: data.indices?.russell?.change || 0,
              changePercent: data.indices?.russell?.changePercent || 0,
              sparkline: generateSparkline(data.indices?.russell?.price || 2500, (data.indices?.russell?.changePercent || 0) >= 0)
            },
            {
              symbol: '^VIX',
              name: 'VIX',
              price: data.vix?.price || 15,
              change: data.vix?.change || 0,
              changePercent: data.vix?.changePercent || 0,
              sparkline: generateSparkline(data.vix?.price || 15, (data.vix?.changePercent || 0) >= 0)
            },
            {
              symbol: 'GC=F',
              name: 'Gold',
              price: data.commodities?.gold?.price || 2600,
              change: data.commodities?.gold?.change || 0,
              changePercent: data.commodities?.gold?.changePercent || 0,
              sparkline: generateSparkline(data.commodities?.gold?.price || 2600, (data.commodities?.gold?.changePercent || 0) >= 0)
            },
            {
              symbol: 'BTC-USD',
              name: 'Bitcoin USD',
              price: data.crypto?.btc?.price || 100000,
              change: data.crypto?.btc?.change || 0,
              changePercent: data.crypto?.btc?.changePercent || 0,
              sparkline: generateSparkline(data.crypto?.btc?.price || 100000, (data.crypto?.btc?.changePercent || 0) >= 0)
            },
          ]
          setMarketIndices(indices)
        }

        // Fetch trending
        const trendingRes = await fetch('/api/trending')
        if (trendingRes.ok) {
          const data = await trendingRes.json()
          setTrendingStocks(data.trending?.slice(0, 8) || [])
          setTopGainers(data.gainers?.slice(0, 5) || [])
          setTopLosers(data.losers?.slice(0, 5) || [])
        }
      } catch (e) {
        console.error('Error fetching market data:', e)
      }
      setLoading(false)
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const visibleIndices = marketIndices.slice(marketPage * 6, (marketPage + 1) * 6)
  const totalPages = Math.ceil(marketIndices.length / 6)

  // Hidden on mobile/tablet (< 1280px), visible on extra-large screens (>= 1280px)
  // This is intentionally more restrictive than SEOSidebar to ensure optimal reading width
  return (
    <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
      <div className="space-y-6 pb-6">
        {/* Market Overview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#868f97] uppercase tracking-wider">Markets</h3>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMarketPage(p => Math.max(0, p - 1))}
                  disabled={marketPage === 0}
                  className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMarketPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={marketPage >= totalPages - 1}
                  className="p-1 rounded hover:bg-white/[0.08] disabled:opacity-30 motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />
              ))
            ) : (
              visibleIndices.map((index) => (
                <MarketCard key={index.symbol} index={index} />
              ))
            )}
          </div>
        </section>

        {/* Trending Tickers */}
        <section>
          <h3 className="text-sm font-semibold text-[#868f97] uppercase tracking-wider mb-3">Trending</h3>
          <div className="space-y-0.5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-white/[0.02] rounded animate-pulse" />
              ))
            ) : trendingStocks.length > 0 ? (
              trendingStocks.slice(0, 8).map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))
            ) : (
              <p className="text-sm text-[#868f97] py-4 text-center">No trending data</p>
            )}
          </div>
        </section>

        {/* Portfolio */}
        <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[#868f97] uppercase tracking-wider mb-3">Portfolio</h3>
          {portfolioLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : user ? (
            portfolios.length > 0 ? (
              <div className="space-y-2">
                {portfolios.slice(0, 3).map((portfolio) => {
                  const isPositive = portfolio.changePercent >= 0
                  const currencySymbol = portfolio.currency === 'USD' ? '$' : portfolio.currency === 'EUR' ? '€' : portfolio.currency === 'SEK' ? 'kr' : portfolio.currency

                  return (
                    <button
                      key={portfolio.id}
                      onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
                      className="w-full p-3 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.08] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out group text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                            {portfolio.name}
                          </p>
                          <p className="text-xs text-[#868f97]">
                            {portfolio.holdingsCount} {portfolio.holdingsCount === 1 ? 'holding' : 'holdings'}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-medium text-sm tabular-nums">
                            {currencySymbol}{portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                          <p className={cn(
                            "text-xs font-medium tabular-nums flex items-center justify-end gap-0.5",
                            isPositive ? "text-[#4ebe96]" : "text-[#ff5c5c]"
                          )}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{typeof portfolio.changePercent === 'number' ? portfolio.changePercent.toFixed(1) : '0.0'}%
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
                {portfolios.length > 3 && (
                  <Link href="/dashboard" className="block text-center py-2">
                    <span className="text-xs text-[#868f97] hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                      +{portfolios.length - 3} more portfolios
                    </span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-[#868f97]/50" />
                <p className="text-sm text-[#868f97] mb-3">No portfolios yet</p>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline" className="gap-2">
                    Create Portfolio
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[#868f97] mb-3">Sign in to access your portfolio</p>
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[#868f97] uppercase tracking-wider mb-3">Recently viewed</h3>
            <div className="space-y-0.5">
              {recentlyViewed.slice(0, 10).map((stock) => (
                <RecentRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}

        {/* Top Gainers */}
        {topGainers.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[#4ebe96]/80 uppercase tracking-wider mb-3">Top gainers</h3>
            <div className="space-y-0.5">
              {topGainers.map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}

        {/* Top Losers */}
        {topLosers.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[#ff5c5c]/80 uppercase tracking-wider mb-3">Top losers</h3>
            <div className="space-y-0.5">
              {topLosers.map((stock) => (
                <TrendingRow key={stock.symbol} stock={stock} onSelect={onSelectTicker} />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
