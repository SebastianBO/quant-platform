"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowLeft,
  Plus,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-browser"
import PortfolioConnect from "@/components/PortfolioConnect"
import { cn } from "@/lib/utils"

interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  currentPrice: number
  costBasis: number
  value: number
  gainLoss: number
  gainLossPercent: number
}

interface Portfolio {
  id: string
  name: string
  institution: string
  lastUpdated: string
  totalValue: number
  dayChange: number
  dayChangePercent: number
  holdings: Holding[]
}

export default function PortfoliosPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [showConnect, setShowConnect] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login?redirect=/dashboard/portfolios")
        return
      }
      setUser(user)

      // Fetch user's portfolios from Supabase
      const { data: portfolioData } = await supabase
        .from("portfolios")
        .select("*, holdings(*)")
        .eq("user_id", user.id)

      if (portfolioData) {
        setPortfolios(portfolioData.map((p: any) => ({
          id: p.id,
          name: p.name || "My Portfolio",
          institution: p.institution_name || "Connected Account",
          lastUpdated: p.updated_at,
          totalValue: p.total_value || 0,
          dayChange: p.day_change || 0,
          dayChangePercent: p.day_change_percent || 0,
          holdings: p.holdings || [],
        })))
      }

      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const handleConnectionSuccess = (holdings: any[]) => {
    // Refresh the page to show new portfolio
    router.refresh()
    setShowConnect(false)
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]" />
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-black">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-balance">Your Portfolios</h1>
              <p className="text-[#868f97]">
                Track and analyze your investments
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowConnect(true)}
            className="bg-[#4ebe96] hover:bg-[#4ebe96]/90 focus-visible:ring-2 focus-visible:ring-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
        </div>

        {/* Connect modal/section */}
        {showConnect && user && (
          <div className="mb-8">
            <PortfolioConnect
              userId={user.id}
              onSuccess={handleConnectionSuccess}
            />
          </div>
        )}

        {/* Portfolio list */}
        {portfolios.length > 0 ? (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-balance">Total Portfolio Value</h2>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold tabular-nums">
                  ${portfolios.reduce((sum, p) => sum + p.totalValue, 0).toLocaleString()}
                </span>
                <span className={cn(
                  "text-lg flex items-center gap-1 tabular-nums",
                  portfolios.reduce((sum, p) => sum + p.dayChange, 0) >= 0
                    ? "text-[#4ebe96]"
                    : "text-[#ff5c5c]"
                )}>
                  {portfolios.reduce((sum, p) => sum + p.dayChange, 0) >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  ${Math.abs(portfolios.reduce((sum, p) => sum + p.dayChange, 0)).toLocaleString()} today
                </span>
              </div>
            </div>

            {/* Individual portfolios */}
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out cursor-pointer focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-balance">{portfolio.name}</h3>
                    <p className="text-sm text-[#868f97]">
                      {portfolio.institution}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold tabular-nums">
                      ${portfolio.totalValue.toLocaleString()}
                    </p>
                    <p className={cn(
                      "text-sm flex items-center justify-end gap-1 tabular-nums",
                      portfolio.dayChange >= 0 ? "text-[#4ebe96]" : "text-[#ff5c5c]"
                    )}>
                      {portfolio.dayChange >= 0 ? "+" : ""}
                      {portfolio.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Holdings preview */}
                {portfolio.holdings.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {portfolio.holdings.slice(0, 6).map((h: any) => (
                      <span
                        key={h.id}
                        className="px-2 py-1 bg-white/[0.05] border border-white/[0.08] rounded text-xs font-mono tabular-nums"
                      >
                        {h.symbol}
                      </span>
                    ))}
                    {portfolio.holdings.length > 6 && (
                      <span className="px-2 py-1 text-xs text-[#868f97] tabular-nums">
                        +{portfolio.holdings.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#4ebe96]/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-[#4ebe96]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-balance">No portfolios connected</h2>
            <p className="text-[#868f97] mb-8 max-w-md mx-auto">
              Connect your brokerage account to track your investments and get
              AI-powered insights.
            </p>
            {user && (
              <PortfolioConnect
                userId={user.id}
                onSuccess={handleConnectionSuccess}
                className="max-w-md mx-auto"
              />
            )}
          </div>
        )}

        {/* Features section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <PieChart className="w-8 h-8 text-[#479ffa] mb-4" />
            <h3 className="font-bold mb-2 text-balance">Portfolio Analysis</h3>
            <p className="text-sm text-[#868f97]">
              Get AI-powered insights on your holdings, diversification, and risk.
            </p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <TrendingUp className="w-8 h-8 text-[#4ebe96] mb-4" />
            <h3 className="font-bold mb-2 text-balance">Performance Tracking</h3>
            <p className="text-sm text-[#868f97]">
              Track your gains, losses, and overall portfolio performance over time.
            </p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <Wallet className="w-8 h-8 text-[#479ffa] mb-4" />
            <h3 className="font-bold mb-2 text-balance">Multi-Account Support</h3>
            <p className="text-sm text-[#868f97]">
              Connect multiple brokerage accounts and view everything in one place.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
