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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
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
              <h1 className="text-2xl font-bold">Your Portfolios</h1>
              <p className="text-muted-foreground">
                Track and analyze your investments
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowConnect(true)}
            className="bg-green-600 hover:bg-green-500"
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
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Total Portfolio Value</h2>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold">
                  ${portfolios.reduce((sum, p) => sum + p.totalValue, 0).toLocaleString()}
                </span>
                <span className={cn(
                  "text-lg flex items-center gap-1",
                  portfolios.reduce((sum, p) => sum + p.dayChange, 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
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
                className="bg-card border border-border rounded-2xl p-6 hover:border-green-500/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/portfolio/${portfolio.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{portfolio.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {portfolio.institution}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      ${portfolio.totalValue.toLocaleString()}
                    </p>
                    <p className={cn(
                      "text-sm flex items-center justify-end gap-1",
                      portfolio.dayChange >= 0 ? "text-green-500" : "text-red-500"
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
                        className="px-2 py-1 bg-secondary rounded text-xs font-mono"
                      >
                        {h.symbol}
                      </span>
                    ))}
                    {portfolio.holdings.length > 6 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
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
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No portfolios connected</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
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
          <div className="bg-card border border-border rounded-xl p-6">
            <PieChart className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-bold mb-2">Portfolio Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered insights on your holdings, diversification, and risk.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-bold mb-2">Performance Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track your gains, losses, and overall portfolio performance over time.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <Wallet className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-bold mb-2">Multi-Account Support</h3>
            <p className="text-sm text-muted-foreground">
              Connect multiple brokerage accounts and view everything in one place.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
