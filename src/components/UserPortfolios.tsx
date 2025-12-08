"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-browser"
import { Plus, Briefcase, TrendingUp, TrendingDown, Users, MessageCircle, ChevronRight } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Investment {
  id: string
  ticker: string
  shares: number
  avg_cost: number | null
  current_price: number | null
  market_value: number | null
}

interface Portfolio {
  id: string
  name: string
  description: string | null
  currency: string
  created_at: string
  investments: Investment[]
  access_type?: 'owner' | 'member'
}

interface UserProfile {
  id: string
  email: string | undefined
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export default function UserPortfolios() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get current user directly from Supabase client
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      // Get user profile
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

      // Try the RPC function first (handles both owned and member portfolios)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_portfolios', {
          p_user_id: authUser.id,
          include_holdings: true
        })

      if (!rpcError && rpcData) {
        let portfolios = typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData
        if (!Array.isArray(portfolios)) {
          portfolios = portfolios ? [portfolios] : []
        }
        // Map holdings to investments for consistency
        portfolios = portfolios.map((p: any) => ({
          ...p,
          investments: (p.holdings || []).map((h: any) => ({
            id: h.id,
            ticker: h.ticker || h.asset_identifier,
            shares: h.shares || h.quantity,
            avg_cost: h.avg_cost || h.average_cost,
            current_price: h.current_price,
            market_value: h.market_value || h.current_value
          }))
        }))
        setPortfolios(portfolios)
        setLoading(false)
        return
      }

      console.log('RPC failed, falling back to manual queries:', rpcError)

      // Fallback: Get owned portfolios
      const { data: ownedPortfolios } = await supabase
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
        .eq('user_id', authUser.id)

      // Get portfolios user is a member of
      const { data: membershipData } = await supabase
        .from('portfolio_members')
        .select('portfolio_id')
        .eq('user_id', authUser.id)
        .eq('status', 'accepted')

      let memberPortfolios: any[] = []
      if (membershipData && membershipData.length > 0) {
        const memberPortfolioIds = membershipData.map((m: any) => m.portfolio_id)
        const { data: memberPortfoliosData } = await supabase
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
          .in('id', memberPortfolioIds)

        memberPortfolios = (memberPortfoliosData || []).map((p: any) => ({
          ...p,
          access_type: 'member'
        }))
      }

      // Combine and deduplicate
      const allPortfolios = [
        ...(ownedPortfolios || []).map((p: any) => ({ ...p, access_type: 'owner' })),
        ...memberPortfolios
      ]

      // Remove duplicates by id
      const uniquePortfolios = allPortfolios.filter((p, index, self) =>
        index === self.findIndex(t => t.id === p.id)
      )

      setPortfolios(uniquePortfolios)
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
        .insert([{
          user_id: user.id,
          name: newPortfolioName,
          currency: 'USD'
        }])
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

  const calculatePortfolioValue = (investments: Investment[]) => {
    return investments.reduce((sum, inv) => sum + (inv.market_value || 0), 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Sign in
            </Button>
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Welcome */}
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Welcome back, {user.full_name || user.username || 'Investor'}
                </h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolios Grid */}
      {portfolios.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No portfolios yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first portfolio to start tracking your investments
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
            const totalValue = calculatePortfolioValue(portfolio.investments)
            const holdingsCount = portfolio.investments.length

            return (
              <Card
                key={portfolio.id}
                className="bg-card border-border hover:border-green-500/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      {portfolio.access_type === 'member' && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                          Shared
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Open chat
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Open members
                        }}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                  {portfolio.description && (
                    <p className="text-muted-foreground text-sm">{portfolio.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Total Value</span>
                      <span className="text-xl font-bold text-green-500">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Holdings</span>
                      <span className="font-medium">{holdingsCount} positions</span>
                    </div>

                    {/* Holdings Preview */}
                    {portfolio.investments.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center py-1 border-t border-border/50">
                        <span className="font-medium text-sm">{inv.ticker}</span>
                        <span className="text-muted-foreground text-sm">
                          {inv.shares} shares
                        </span>
                      </div>
                    ))}
                    {holdingsCount > 3 && (
                      <p className="text-muted-foreground text-xs text-center">
                        +{holdingsCount - 3} more positions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
