"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-browser"
import { Plus, Briefcase, Users, MessageCircle, ChevronRight, TrendingUp, TrendingDown, Link2, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import ConnectBrokerage from "./ConnectBrokerage"
import { getSymbolColor, getClearbitLogoFromSymbol } from "@/lib/logoService"
import { calculatePortfolioValueWithConversion, formatCurrencyValue, convertCurrency, getStockCurrency } from "@/lib/currencyUtils"
import type { User } from "@supabase/supabase-js"

interface Investment {
  id: string
  ticker: string
  asset_identifier?: string
  shares: number
  quantity?: number
  avg_cost: number | null
  purchase_price?: number | null
  current_price: number | null
  current_value?: number | null
  market_value: number | null
  total_cost_basis?: number | null
}

interface Portfolio {
  id: string
  name: string
  description: string | null
  currency: string
  created_at: string
  investments: Investment[]
  access_type?: 'owner' | 'member'
  // Sync status fields
  plaid_item_id?: string | null
  tink_connected?: boolean
  last_synced?: string | null
}

interface SyncStatus {
  provider: 'plaid' | 'tink' | null
  lastSynced: Date | null
  isSyncing: boolean
  error: string | null
}

interface UserProfile {
  id: string
  email: string | undefined
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

// RPC/API response types for portfolio data
interface RpcPortfolioResponse {
  id: string
  name: string
  description?: string | null
  currency: string
  created_at?: string
  plaid_item_id?: string | null
  tink_connected?: boolean
  last_synced?: string | null
  holdings?: RpcHoldingResponse[]
  investments?: RpcHoldingResponse[]
}

interface RpcHoldingResponse {
  id: string
  ticker?: string
  asset_identifier?: string
  quantity?: number
  purchase_price?: number | null
  current_price?: number | null
  current_value?: number | null
  total_cost_basis?: number | null
  currency?: string
}

interface MembershipRecord {
  portfolio_id: string
}

interface SupabaseInvestmentRecord {
  id: string
  asset_identifier?: string
  quantity?: number
  purchase_price?: number | null
  total_cost_basis?: number | null
  current_price?: number | null
  current_value?: number | null
  currency?: string
}

interface SupabasePortfolioRecord {
  id: string
  name: string
  description?: string | null
  currency: string
  created_at?: string
  plaid_item_id?: string | null
  tink_connected?: boolean
  last_synced?: string | null
  investments?: SupabaseInvestmentRecord[]
}

// Stock logo component with EODHD → Clearbit → fallback
function HoldingLogo({ symbol, size = 32 }: { symbol: string; size?: number }) {
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
        className="rounded-full flex items-center justify-center font-bold text-white border-2 border-background"
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
      className="rounded-full object-cover bg-white border-2 border-background"
      style={{ width: size, height: size }}
      onError={handleError}
    />
  )
}

// Stacked logos component
function StackedLogos({ holdings, max = 4 }: { holdings: Investment[]; max?: number }) {
  const displayHoldings = holdings.slice(0, max)
  const remaining = holdings.length - max

  if (holdings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Briefcase className="w-4 h-4" />
        <span>No holdings yet</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayHoldings.map((holding, index) => (
          <div key={holding.id} style={{ zIndex: max - index }}>
            <HoldingLogo symbol={holding.ticker} size={28} />
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <div
          className="rounded-full bg-secondary flex items-center justify-center text-xs font-medium border-2 border-background ml-1"
          style={{ width: 28, height: 28, marginLeft: -8, zIndex: 0 }}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

export default function UserPortfolios() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showConnectBrokerage, setShowConnectBrokerage] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState("")
  const [creating, setCreating] = useState(false)
  const [syncingPortfolios, setSyncingPortfolios] = useState<Set<string>>(new Set())
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({})

  // Sync a connected portfolio
  const syncPortfolio = async (portfolio: Portfolio) => {
    if (!user) return

    const portfolioId = portfolio.id
    setSyncingPortfolios(prev => new Set(prev).add(portfolioId))

    try {
      if (portfolio.plaid_item_id) {
        // Sync Plaid portfolio
        const response = await fetch('/api/plaid/get-investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        if (!response.ok) throw new Error('Sync failed')
      } else if (portfolio.tink_connected) {
        // Sync Tink portfolio
        const response = await fetch('/api/tink/get-investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        if (!response.ok) throw new Error('Sync failed')
      }

      // Update last sync time
      setLastSyncTimes(prev => ({
        ...prev,
        [portfolioId]: new Date().toISOString()
      }))

      // Refresh portfolio data
      await fetchUserData()
    } catch (error) {
      console.error('Error syncing portfolio:', error)
    } finally {
      setSyncingPortfolios(prev => {
        const next = new Set(prev)
        next.delete(portfolioId)
        return next
      })
    }
  }

  // Format relative time
  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('[UserPortfolios] Auth user:', authUser?.id)

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser({
        id: authUser.id,
        email: authUser.email,
        username: profile?.username || null,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null
      })

      // Try RPC function first (like portfoliocare-expo)
      let portfoliosFound = false
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_portfolios', {
            p_user_id: authUser.id,
            include_holdings: true
          })

        if (!rpcError && rpcData) {
          console.log('[UserPortfolios] RPC returned portfolios:', rpcData.length)
          let portfolios = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData
          if (!Array.isArray(portfolios)) {
            portfolios = portfolios ? [portfolios] : []
          }

          const mappedPortfolios = portfolios.map((p: RpcPortfolioResponse) => ({
            ...p,
            investments: (p.holdings || p.investments || []).map((inv: RpcHoldingResponse) => ({
              id: inv.id,
              ticker: inv.ticker || inv.asset_identifier,
              asset_identifier: inv.asset_identifier,
              shares: inv.quantity || 0,
              quantity: inv.quantity,
              avg_cost: inv.purchase_price,
              purchase_price: inv.purchase_price,
              current_price: inv.current_price,
              current_value: inv.current_value,
              market_value: inv.current_value || ((inv.quantity || 0) * (inv.current_price || inv.purchase_price || 0)),
              total_cost_basis: inv.total_cost_basis,
              currency: inv.currency
            }))
          }))

          setPortfolios(mappedPortfolios)
          portfoliosFound = true
        } else {
          console.log('[UserPortfolios] RPC failed or returned no data:', rpcError)
        }
      } catch (rpcErr) {
        console.log('[UserPortfolios] RPC not available:', rpcErr)
      }

      // Fallback to direct queries if RPC failed
      if (!portfoliosFound) {
        console.log('[UserPortfolios] Falling back to direct queries')

        // Query portfolios with investments
        const { data: ownedPortfolios, error: portfolioError } = await supabase
          .from('portfolios')
          .select(`
            *,
            investments (
              id,
              asset_identifier,
              quantity,
              purchase_price,
              total_cost_basis,
              current_price,
              current_value,
              currency
            )
          `)
          .eq('user_id', authUser.id)

        console.log('[UserPortfolios] Owned portfolios:', ownedPortfolios?.length || 0, portfolioError)

        if (portfolioError) {
          console.error('Error fetching portfolios:', portfolioError)
        }

        // Map to consistent format
        const mappedPortfolios = (ownedPortfolios || []).map((p: SupabasePortfolioRecord) => ({
          ...p,
          access_type: 'owner' as const,
          investments: (p.investments || []).map((inv: SupabaseInvestmentRecord) => ({
            id: inv.id,
            ticker: inv.asset_identifier,
            asset_identifier: inv.asset_identifier,
            shares: inv.quantity || 0,
            quantity: inv.quantity,
            avg_cost: inv.purchase_price,
            purchase_price: inv.purchase_price,
            current_price: inv.current_price,
            current_value: inv.current_value,
            market_value: inv.current_value || ((inv.quantity || 0) * (inv.current_price || inv.purchase_price || 0)),
            total_cost_basis: inv.total_cost_basis,
            currency: inv.currency // Include stored currency for proper conversion
          }))
        }))

        const { data: membershipData } = await supabase
          .from('portfolio_members')
          .select('portfolio_id')
          .eq('user_id', authUser.id)
          .eq('status', 'accepted')

        console.log('[UserPortfolios] Membership data:', membershipData?.length || 0)

        let memberPortfolios: Portfolio[] = []
        if (membershipData && membershipData.length > 0) {
          const memberPortfolioIds = membershipData.map((m: MembershipRecord) => m.portfolio_id)
          const { data: memberPortfoliosData } = await supabase
            .from('portfolios')
            .select(`
              *,
              investments (
                id,
                asset_identifier,
                quantity,
                purchase_price,
                total_cost_basis,
                current_price,
                current_value,
                currency
              )
            `)
            .in('id', memberPortfolioIds)

          memberPortfolios = (memberPortfoliosData || []).map((p: SupabasePortfolioRecord) => ({
            ...p,
            access_type: 'member' as const,
            investments: (p.investments || []).map((inv: SupabaseInvestmentRecord) => ({
              id: inv.id,
              ticker: inv.asset_identifier,
              asset_identifier: inv.asset_identifier,
              shares: inv.quantity || 0,
              quantity: inv.quantity,
              avg_cost: inv.purchase_price,
              purchase_price: inv.purchase_price,
              current_price: inv.current_price,
              current_value: inv.current_value,
              market_value: inv.current_value || ((inv.quantity || 0) * (inv.current_price || inv.purchase_price || 0)),
              total_cost_basis: inv.total_cost_basis,
              currency: inv.currency
            }))
          }))
        }

        const allPortfolios = [
          ...mappedPortfolios,
          ...memberPortfolios
        ]

        const uniquePortfolios = allPortfolios.filter((p, index, self) =>
          index === self.findIndex(t => t.id === p.id)
        )

        console.log('[UserPortfolios] Final portfolios:', uniquePortfolios.length)
        setPortfolios(uniquePortfolios)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    setLoading(false)
  }

  const createPortfolio = async () => {
    if (!newPortfolioName.trim() || !user) return

    setCreating(true)
    try {
      const { data: newPortfolio, error } = await supabase
        .from('portfolios')
        .insert([{ user_id: user.id, name: newPortfolioName, currency: 'USD' }])
        .select()
        .single()

      if (!error && newPortfolio) {
        setPortfolios([{ ...newPortfolio, investments: [] }, ...portfolios])
        setNewPortfolioName("")
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating portfolio:', error)
    }
    setCreating(false)
  }

  // Calculate portfolio value with proper currency conversion
  const getPortfolioStats = (investments: Investment[], currency: string) => {
    return calculatePortfolioValueWithConversion(investments, currency)
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return formatCurrencyValue(value, currency)
  }

  // Convert individual holding value from USD to portfolio currency
  const getHoldingValueInCurrency = (valueUSD: number, currency: string) => {
    return convertCurrency(valueUSD, 'USD', currency)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Sign in to view your portfolios</p>
          <p className="text-muted-foreground text-sm mb-4">
            Create and manage your investment portfolios
          </p>
          <a href="/login">
            <Button className="bg-green-600 hover:bg-green-500 text-white">
              Sign in
            </Button>
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Welcome Header */}
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent rounded-2xl p-6 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-green-500/25">
              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {user.full_name?.split(' ')[0] || user.username || 'Investor'}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowConnectBrokerage(!showConnectBrokerage)
                setShowCreateForm(false)
              }}
              variant="outline"
              className="border-green-500/50 hover:bg-green-500/10"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect Brokerage
            </Button>
            <Button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                setShowConnectBrokerage(false)
              }}
              className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Connect Brokerage Section */}
      {showConnectBrokerage && user && (
        <ConnectBrokerage
          userId={user.id}
          onConnectionSuccess={() => {
            setShowConnectBrokerage(false)
            fetchUserData() // Refresh portfolios after connection
          }}
        />
      )}

      {/* Create Portfolio Form */}
      {showCreateForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Create New Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Portfolio name"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === 'Enter' && createPortfolio()}
              />
              <Button
                onClick={createPortfolio}
                disabled={creating || !newPortfolioName.trim()}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {portfolios.length === 0 ? (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium mb-2">No portfolios yet</p>
            <p className="text-muted-foreground mb-6">
              Create your first portfolio to start tracking investments
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => {
            // Calculate portfolio value with proper currency conversion
            const stats = getPortfolioStats(portfolio.investments, portfolio.currency)
            const holdingsCount = portfolio.investments.length
            const isPositive = stats.totalGainLoss >= 0

            return (
              <Card
                key={portfolio.id}
                className="bg-card border-border hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{portfolio.name}</h3>
                        {portfolio.access_type === 'member' && (
                          <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full flex-shrink-0">
                            Shared
                          </span>
                        )}
                      </div>
                      {portfolio.description && (
                        <p className="text-muted-foreground text-sm truncate">{portfolio.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Sync button for connected portfolios */}
                      {(portfolio.plaid_item_id || portfolio.tink_connected) && (
                        <button
                          className={`p-1.5 rounded-lg hover:bg-secondary transition-colors ${syncingPortfolios.has(portfolio.id) ? 'animate-pulse' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            syncPortfolio(portfolio)
                          }}
                          disabled={syncingPortfolios.has(portfolio.id)}
                          title={`Last synced: ${formatRelativeTime(lastSyncTimes[portfolio.id] || portfolio.last_synced)}`}
                        >
                          <RefreshCw className={`w-4 h-4 ${syncingPortfolios.has(portfolio.id) ? 'animate-spin text-green-500' : 'text-muted-foreground'}`} />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation() }}
                      >
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation() }}
                      >
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>

                  {/* Value - Now with proper currency conversion */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-green-500 tabular-nums">
                      {formatCurrency(stats.totalValueInPortfolioCurrency, portfolio.currency)}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-muted-foreground">
                        {holdingsCount} {holdingsCount === 1 ? 'holding' : 'holdings'} • {portfolio.currency}
                      </p>
                      {holdingsCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {isPositive ? '+' : ''}{stats.totalGainLossPercent.toFixed(1)}%
                        </span>
                      )}
                      {/* Connected broker indicator */}
                      {portfolio.plaid_item_id && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Plaid
                        </span>
                      )}
                      {portfolio.tink_connected && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Tink
                        </span>
                      )}
                    </div>
                    {/* Last sync time for connected portfolios */}
                    {(portfolio.plaid_item_id || portfolio.tink_connected) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Synced {formatRelativeTime(lastSyncTimes[portfolio.id] || portfolio.last_synced)}</span>
                      </div>
                    )}
                  </div>

                  {/* Holdings Preview - Values in portfolio currency */}
                  {holdingsCount > 0 ? (
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      {portfolio.investments.slice(0, 3).map((inv) => {
                        // Get stock's native currency based on ticker
                        const stockCurrency = getStockCurrency(inv.ticker || '')
                        // Value is in stock's native currency, convert to portfolio currency
                        const valueInStockCurrency = inv.market_value || inv.current_value || 0
                        const valueInPortfolioCurrency = convertCurrency(valueInStockCurrency, stockCurrency, portfolio.currency)

                        return (
                          <div key={inv.id} className="flex items-center gap-3">
                            <HoldingLogo symbol={inv.ticker} size={32} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{inv.ticker}</p>
                              <p className="text-xs text-muted-foreground">
                                {inv.shares} shares
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm tabular-nums">
                                {formatCurrency(valueInPortfolioCurrency, portfolio.currency)}
                              </p>
                              {inv.avg_cost && inv.current_price && (
                                <p className={`text-xs tabular-nums ${
                                  inv.current_price >= inv.avg_cost ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {inv.current_price >= inv.avg_cost ? '+' : ''}
                                  {(((inv.current_price - inv.avg_cost) / inv.avg_cost) * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {holdingsCount > 3 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <StackedLogos holdings={portfolio.investments.slice(3)} max={3} />
                          <span className="text-xs text-muted-foreground">
                            +{holdingsCount - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add your first holding</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
