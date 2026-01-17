"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { User } from "@supabase/supabase-js"
import {
  Briefcase,
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import StockLogo from "@/components/StockLogo"

interface PortfolioHolding {
  symbol: string
  shares: number
  avg_cost: number
  current_price?: number
  change_percent?: number
}

interface Portfolio {
  id: string
  name: string
  holdings: PortfolioHolding[]
}

interface EarningsEvent {
  symbol: string
  name: string
  date: string
  time: string
}

export default function QuickActions() {
  const [user, setUser] = useState<User | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [upcomingEarnings, setUpcomingEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Check auth
    const getUser = async () => {
      try {
        const response = await supabase.auth.getUser()
        const currentUser = response?.data?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          loadUserData(currentUser.id)
        } else {
          setLoading(false)
        }
      } catch {
        setUser(null)
        setLoading(false)
      }
    }
    getUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: unknown, session: { user?: User | null } | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      }
    })

    return () => authListener?.subscription?.unsubscribe()
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      const supabase = createClient()

      // Load portfolios with holdings
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('id, name')
        .eq('user_id', userId)
        .limit(3)

      if (portfolioData) {
        const portfoliosWithHoldings: Portfolio[] = []
        for (const portfolio of portfolioData) {
          const { data: holdings } = await supabase
            .from('portfolio_holdings')
            .select('symbol, shares, avg_cost')
            .eq('portfolio_id', portfolio.id)
            .limit(5)

          portfoliosWithHoldings.push({
            ...portfolio,
            holdings: holdings || []
          })
        }
        setPortfolios(portfoliosWithHoldings)
      }

      // Load watchlist earnings (simplified - using mock for now)
      // In production, this would query the user's watchlist and cross-reference with earnings calendar
      setUpcomingEarnings([])

    } catch (error) {
      console.error('Error loading user data:', error)
    }
    setLoading(false)
  }

  // Don't render if not logged in or still loading
  if (!user || loading) {
    return null
  }

  // Don't render if no portfolios
  if (portfolios.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Track Your Investments</h3>
              <p className="text-sm text-[#868f97]">Create a portfolio to see your holdings here</p>
            </div>
            <Link
              href="/dashboard/portfolios"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 motion-safe:transition-colors motion-safe:duration-100"
            >
              Create Portfolio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Portfolio Summary */}
        {portfolios.slice(0, 1).map((portfolio) => (
          <div key={portfolio.id} className="bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">{portfolio.name}</h3>
              </div>
              <Link
                href="/dashboard/portfolios"
                className="text-xs text-[#868f97] hover:text-white flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {portfolio.holdings.slice(0, 3).map((holding) => (
                <Link
                  key={holding.symbol}
                  href={`/${holding.symbol}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.08] motion-safe:transition-colors motion-safe:duration-100"
                >
                  <StockLogo symbol={holding.symbol} size="sm" />
                  <span className="font-medium text-sm flex-1">{holding.symbol}</span>
                  <span className="text-xs text-[#868f97]">{holding.shares} shares</span>
                </Link>
              ))}
              {portfolio.holdings.length === 0 && (
                <p className="text-xs text-[#868f97] text-center py-2">
                  No holdings yet
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Quick Links */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08] p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink
              href="/earnings"
              icon={Calendar}
              label="Earnings"
              description="Calendar"
            />
            <QuickLink
              href="/stock-screener"
              icon={Search}
              label="Screener"
              description="Find stocks"
            />
            <QuickLink
              href="/markets/top-gainers"
              icon={TrendingUp}
              label="Gainers"
              description="Today's top"
            />
            <QuickLink
              href="/markets/top-losers"
              icon={TrendingDown}
              label="Losers"
              description="Today's worst"
            />
          </div>
        </div>

        {/* Upcoming Earnings (if any in watchlist) */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-sm">Upcoming Earnings</h3>
            </div>
            <Link
              href="/earnings"
              className="text-xs text-[#868f97] hover:text-white flex items-center gap-1"
            >
              Full calendar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingEarnings.length > 0 ? (
            <div className="space-y-2">
              {upcomingEarnings.map((event) => (
                <div key={event.symbol} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.05]">
                  <StockLogo symbol={event.symbol} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.symbol}</p>
                    <p className="text-xs text-[#868f97] truncate">{event.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{event.date}</p>
                    <p className="text-[10px] text-[#868f97]">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-[#868f97]">No earnings from your watchlist this week</p>
              <Link
                href="/earnings"
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                Browse all earnings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string
  icon: typeof Calendar
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.08] motion-safe:transition-colors motion-safe:duration-100"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#868f97]" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-[#868f97]">{description}</p>
      </div>
    </Link>
  )
}
