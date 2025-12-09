"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MessageCircle,
  Plus,
  Settings,
  Users,
  MoreVertical
} from "lucide-react"
import PortfolioChat from "@/components/PortfolioChat"
import PortfolioMemberChat from "@/components/PortfolioMemberChat"
import PortfolioPerformanceChart from "@/components/PortfolioPerformanceChart"
import { getSymbolColor, getClearbitLogoFromSymbol } from "@/lib/logoService"
import { convertCurrency, fetchFXRates, getExchangeRate } from "@/lib/currencyUtils"

// Stock logo component with EODHD → Clearbit → fallback
function HoldingLogo({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const [logoState, setLogoState] = useState<'eodhd' | 'clearbit' | 'fallback'>('eodhd')
  const eohdUrl = `https://eodhistoricaldata.com/img/logos/US/${symbol.toUpperCase()}.png`
  const clearbitUrl = getClearbitLogoFromSymbol(symbol)
  const color = getSymbolColor(symbol)

  const handleError = () => {
    if (logoState === 'eodhd' && clearbitUrl) {
      setLogoState('clearbit')
    } else {
      setLogoState('fallback')
    }
  }

  if (logoState === 'fallback') {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold text-white"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: size * 0.4
        }}
      >
        {symbol.charAt(0)}
      </div>
    )
  }

  const currentUrl = logoState === 'eodhd' ? eohdUrl : clearbitUrl

  return (
    <img
      src={currentUrl || eohdUrl}
      alt={symbol}
      className="rounded-full object-cover bg-white"
      style={{ width: size, height: size }}
      onError={handleError}
    />
  )
}

interface Investment {
  id: string
  ticker: string
  asset_identifier?: string
  shares: number
  quantity?: number
  avg_cost: number | null
  purchase_price?: number | null
  current_price: number | null
  market_value: number | null
  company_name?: string
  // Live price data
  live_price?: number | null
  price_change?: number | null
  price_change_percent?: number | null
}

interface Portfolio {
  id: string
  name: string
  description: string | null
  currency: string
  created_at: string
  user_id: string
  investments: Investment[]
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const portfolioId = params.id as string
  const supabase = createClient()

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; change: number; changePercent: number }>>({})
  const [pricesLoading, setPricesLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'ai' | 'team'>('ai')

  // Fetch live prices from EODHD
  const fetchLivePrices = useCallback(async (investments: Investment[]) => {
    if (investments.length === 0) return

    setPricesLoading(true)
    try {
      const tickers = investments
        .map(inv => inv.ticker || inv.asset_identifier)
        .filter(Boolean)
        .join(',')

      const response = await fetch(`/api/prices?tickers=${tickers}`)
      if (response.ok) {
        const data = await response.json()
        setLivePrices(data.prices || {})
        console.log('[PortfolioDetail] Live prices fetched:', Object.keys(data.prices || {}).length)
      }
    } catch (err) {
      console.error('[PortfolioDetail] Error fetching live prices:', err)
    }
    setPricesLoading(false)
  }, [])

  const fetchPortfolioDetails = useCallback(async () => {
    try {
      console.log('[PortfolioDetail] Fetching portfolio:', portfolioId)

      // Check auth status first
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[PortfolioDetail] Auth user:', user?.id)

      if (!user) {
        console.log('[PortfolioDetail] No authenticated user')
        setError('Please sign in to view this portfolio')
        setLoading(false)
        return
      }

      // First try to get portfolio where user is the owner (RLS requires user_id filter)
      let portfolioData = null

      const { data: ownedPortfolio, error: ownedError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('[PortfolioDetail] Owned portfolio query:', ownedPortfolio, ownedError)

      if (ownedPortfolio) {
        portfolioData = ownedPortfolio
      } else {
        // Check if user has member access
        console.log('[PortfolioDetail] Checking member access...')
        const { data: membership } = await supabase
          .from('portfolio_members')
          .select('portfolio_id')
          .eq('portfolio_id', portfolioId)
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle()

        console.log('[PortfolioDetail] Membership:', membership)

        if (membership) {
          // User is a member, try RPC to get portfolio (bypasses RLS)
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('get_user_portfolios', {
                p_user_id: user.id,
                include_holdings: false
              })

            if (!rpcError && rpcData) {
              const portfolios = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData
              const foundPortfolio = Array.isArray(portfolios)
                ? portfolios.find((p: any) => p.id === portfolioId)
                : null

              if (foundPortfolio) {
                portfolioData = foundPortfolio
              }
            }
          } catch (rpcErr) {
            console.log('[PortfolioDetail] RPC failed:', rpcErr)
          }
        }

        if (!portfolioData) {
          console.log('[PortfolioDetail] No access to portfolio')
          setError('Portfolio not found or access denied')
          setLoading(false)
          return
        }
      }

      // Fetch investments separately (more reliable with RLS)
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('portfolio_id', portfolioId)

      console.log('[PortfolioDetail] Investments:', investmentsData?.length || 0, investmentsError)

      // Map to consistent format
      const investments = (investmentsData || []).map((inv: any) => ({
        id: inv.id,
        ticker: inv.asset_identifier,
        asset_identifier: inv.asset_identifier,
        shares: inv.quantity || 0,
        quantity: inv.quantity,
        avg_cost: inv.purchase_price,
        purchase_price: inv.purchase_price,
        current_price: inv.current_price,
        market_value: inv.current_value || (inv.quantity * (inv.current_price || inv.purchase_price || 0)),
        company_name: inv.asset_identifier
      }))

      setPortfolio({
        ...portfolioData,
        investments
      })
      setError(null)

      // Fetch live prices after portfolio loads
      if (investments.length > 0) {
        fetchLivePrices(investments)
      }
    } catch (err) {
      console.error('[PortfolioDetail] Error:', err)
      setError('Failed to load portfolio')
    }
    setLoading(false)
  }, [portfolioId, supabase, fetchLivePrices])

  useEffect(() => {
    fetchPortfolioDetails()
    // Pre-fetch FX rates for currency conversion
    fetchFXRates()
  }, [fetchPortfolioDetails])

  // Refresh live prices every 60 seconds
  useEffect(() => {
    if (!portfolio?.investments.length) return

    const interval = setInterval(() => {
      fetchLivePrices(portfolio.investments)
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [portfolio?.investments, fetchLivePrices])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolioDetails()
    if (portfolio?.investments) {
      await fetchLivePrices(portfolio.investments)
    }
    setRefreshing(false)
  }

  // Get best available price (live > stored > avg_cost)
  const getBestPrice = (ticker: string, storedPrice: number | null, avgCost: number | null) => {
    const liveData = livePrices[ticker?.toUpperCase()]
    if (liveData?.price && liveData.price > 0) {
      return liveData.price
    }
    return storedPrice || avgCost || 0
  }

  // Calculate total value in USD first, then convert to portfolio currency
  const calculateTotalValue = (investments: Investment[], currency: string) => {
    const totalUSD = investments.reduce((sum, inv) => {
      const ticker = (inv.ticker || inv.asset_identifier || '').toUpperCase()
      const shares = inv.shares || inv.quantity || 0
      const price = getBestPrice(ticker, inv.current_price, inv.avg_cost)
      return sum + (shares * price)
    }, 0)
    // Stock prices are in USD, convert to portfolio currency
    return convertCurrency(totalUSD, 'USD', currency)
  }

  const calculateTotalCost = (investments: Investment[], currency: string) => {
    const totalCostUSD = investments.reduce((sum, inv) => {
      const cost = (inv.shares || inv.quantity || 0) * (inv.avg_cost || inv.purchase_price || 0)
      return sum + cost
    }, 0)
    // Cost basis is in USD, convert to portfolio currency
    return convertCurrency(totalCostUSD, 'USD', currency)
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-secondary animate-pulse rounded-lg" />
            <div className="h-8 w-48 bg-secondary animate-pulse rounded" />
          </div>
          <div className="grid gap-4">
            <div className="h-32 bg-secondary animate-pulse rounded-lg" />
            <div className="h-64 bg-secondary animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-destructive">{error || 'Portfolio not found'}</p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalValue = calculateTotalValue(portfolio.investments, portfolio.currency)
  const totalCost = calculateTotalCost(portfolio.investments, portfolio.currency)
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const isPositive = totalGain >= 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{portfolio.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {portfolio.currency} Account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Portfolio Summary */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalValue, portfolio.currency)}</p>
              </div>

              <div className={`flex items-center gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="text-lg font-semibold">
                  {formatCurrency(Math.abs(totalGain), portfolio.currency)} ({formatPercent(totalGainPercent)})
                </span>
                <span className="text-muted-foreground text-sm">all time</span>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Cost Basis: </span>
                  <span className="font-medium">{formatCurrency(totalCost, portfolio.currency)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Positions: </span>
                  <span className="font-medium">{portfolio.investments.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <PortfolioPerformanceChart
          portfolioId={portfolio.id}
          portfolioName={portfolio.name}
          currency={portfolio.currency}
          totalValue={totalValue}
          totalCost={totalCost}
        />

        {/* Positions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Positions ({portfolio.investments.length})</h2>
            <Button className="bg-green-600 hover:bg-green-500 text-white" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </div>

          {portfolio.investments.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No positions in this portfolio yet</p>
                <Button className="bg-green-600 hover:bg-green-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Position
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {portfolio.investments.map((investment) => {
                const ticker = (investment.ticker || investment.asset_identifier || 'Unknown').toUpperCase()
                const shares = investment.shares || investment.quantity || 0
                const avgCostUSD = investment.avg_cost || investment.purchase_price || 0

                // Use live price if available, otherwise fall back to stored price (all in USD)
                const liveData = livePrices[ticker]
                const currentPriceUSD = liveData?.price || investment.current_price || avgCostUSD
                const marketValueUSD = shares * currentPriceUSD
                const costBasisUSD = shares * avgCostUSD

                // Convert to portfolio currency for display
                const marketValue = convertCurrency(marketValueUSD, 'USD', portfolio.currency)
                const costBasis = convertCurrency(costBasisUSD, 'USD', portfolio.currency)
                const avgCost = convertCurrency(avgCostUSD, 'USD', portfolio.currency)
                const gain = marketValue - costBasis
                const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
                const positionIsPositive = gain >= 0

                // Day change from live data (percentage stays the same regardless of currency)
                const dayChange = liveData?.change || 0
                const dayChangePercent = liveData?.changePercent || 0
                const dayChangePositive = dayChange >= 0

                return (
                  <Link
                    key={investment.id}
                    href={`/stock/${ticker}`}
                    className="block"
                  >
                    <Card className="bg-card border-border hover:border-green-500/50 transition-colors cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <HoldingLogo symbol={ticker} size={44} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{ticker}</span>
                                {liveData && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${dayChangePositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {dayChangePositive ? '+' : ''}{dayChangePercent.toFixed(2)}%
                                  </span>
                                )}
                                {pricesLoading && !liveData && (
                                  <span className="text-xs text-muted-foreground animate-pulse">updating...</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {shares.toLocaleString()} shares @ {formatCurrency(avgCost, portfolio.currency)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(marketValue, portfolio.currency)}</p>
                            <div className={`flex items-center justify-end gap-1 text-sm ${positionIsPositive ? 'text-green-500' : 'text-red-500'}`}>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${positionIsPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                {positionIsPositive ? '↗' : '↘'} {Math.abs(gainPercent).toFixed(2)}%
                              </span>
                              <span>{formatCurrency(Math.abs(gain), portfolio.currency)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="space-y-4">
        {/* Chat Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode('ai')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              chatMode === 'ai'
                ? 'bg-green-500 text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            AI Advisor
          </button>
          <button
            onClick={() => setChatMode('team')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              chatMode === 'team'
                ? 'bg-green-500 text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Chat
          </button>
        </div>

        {/* Chat Content */}
        {chatMode === 'ai' ? (
          <PortfolioChat
            portfolioContext={{
              name: portfolio.name,
              currency: portfolio.currency,
              totalValue,
              positionCount: portfolio.investments.length,
              holdings: portfolio.investments.map((inv) => ({
                ticker: inv.ticker || inv.asset_identifier || 'Unknown',
                shares: inv.shares || inv.quantity || 0,
                avgCost: inv.avg_cost || inv.purchase_price || 0,
                marketValue: inv.market_value || ((inv.shares || 0) * (inv.current_price || inv.avg_cost || 0)),
              })),
            }}
          />
        ) : (
          <PortfolioMemberChat
            portfolioId={portfolio.id}
            portfolioName={portfolio.name}
          />
        )}
      </div>
    </div>
  )
}
