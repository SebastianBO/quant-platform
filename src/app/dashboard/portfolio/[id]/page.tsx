"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
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

  const fetchPortfolioDetails = useCallback(async () => {
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_portfolio_by_id', {
          p_portfolio_id: portfolioId,
          include_holdings: true
        })

      if (!rpcError && rpcData) {
        let portfolioData = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData
        if (Array.isArray(portfolioData)) {
          portfolioData = portfolioData[0]
        }

        // Map holdings to investments
        const investments = (portfolioData.holdings || []).map((h: any) => ({
          id: h.id,
          ticker: h.ticker || h.asset_identifier,
          asset_identifier: h.asset_identifier,
          shares: h.shares || h.quantity,
          quantity: h.quantity,
          avg_cost: h.avg_cost || h.average_cost || h.purchase_price,
          purchase_price: h.purchase_price,
          current_price: h.current_price,
          market_value: h.market_value || h.current_value,
          company_name: h.company_name || h.asset_name
        }))

        setPortfolio({
          ...portfolioData,
          investments
        })
        setLoading(false)
        return
      }

      console.log('RPC failed, falling back to direct query:', rpcError)

      // Fallback: Direct query
      const { data: portfolioData, error: queryError } = await supabase
        .from('portfolios')
        .select(`
          *,
          investments (
            id,
            ticker,
            shares,
            avg_cost,
            current_price,
            market_value
          )
        `)
        .eq('id', portfolioId)
        .single()

      if (queryError) {
        console.error('Error fetching portfolio:', queryError)
        setError('Portfolio not found')
        setLoading(false)
        return
      }

      setPortfolio(portfolioData)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load portfolio')
    }
    setLoading(false)
  }, [portfolioId, supabase])

  useEffect(() => {
    fetchPortfolioDetails()
  }, [fetchPortfolioDetails])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolioDetails()
    setRefreshing(false)
  }

  const calculateTotalValue = (investments: Investment[]) => {
    return investments.reduce((sum, inv) => {
      const value = inv.market_value || (inv.shares * (inv.current_price || inv.avg_cost || 0))
      return sum + value
    }, 0)
  }

  const calculateTotalCost = (investments: Investment[]) => {
    return investments.reduce((sum, inv) => {
      const cost = inv.shares * (inv.avg_cost || inv.purchase_price || 0)
      return sum + cost
    }, 0)
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

  const totalValue = calculateTotalValue(portfolio.investments)
  const totalCost = calculateTotalCost(portfolio.investments)
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
                const ticker = investment.ticker || investment.asset_identifier || 'Unknown'
                const shares = investment.shares || investment.quantity || 0
                const avgCost = investment.avg_cost || investment.purchase_price || 0
                const currentPrice = investment.current_price || avgCost
                const marketValue = investment.market_value || (shares * currentPrice)
                const costBasis = shares * avgCost
                const gain = marketValue - costBasis
                const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
                const positionIsPositive = gain >= 0

                return (
                  <Card
                    key={investment.id}
                    className="bg-card border-border hover:border-green-500/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Logo placeholder */}
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <span className="font-bold text-sm">{ticker.charAt(0)}</span>
                          </div>

                          <div>
                            <p className="font-semibold">{ticker}</p>
                            <p className="text-sm text-muted-foreground">
                              {shares} shares @ {formatCurrency(avgCost, portfolio.currency)}
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
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
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
    </div>
  )
}
