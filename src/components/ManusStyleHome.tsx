"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  Calculator,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  FileText,
  Bell,
  Settings,
  Sparkles,
  Plus,
  MoreHorizontal,
  Flame,
  Building2,
  LineChart,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Newspaper,
  Shield,
  Globe,
  PenSquare,
  History,
  Star,
  Users,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"
import StockLogo from "@/components/StockLogo"
import AutonomousChat from "@/components/AutonomousChat"
import EnhancedMarketMovers from "@/components/EnhancedMarketMovers"
import { Footer } from "@/components/footer"

// Sidebar navigation - main tools
const SIDEBAR_TOP = [
  { id: "new", icon: PenSquare, label: "New chat", href: null, action: "new" },
  { id: "search", icon: Search, label: "Search", href: "/screener" },
  { id: "markets", icon: TrendingUp, label: "Markets", href: "/markets" },
  { id: "history", icon: History, label: "History", href: "/dashboard" },
]

// Sidebar - account & settings
const SIDEBAR_BOTTOM = [
  { id: "portfolio", icon: Briefcase, label: "Portfolio", href: "/dashboard/portfolios" },
  { id: "watchlist", icon: Star, label: "Watchlist", href: "/dashboard/watchlist" },
  { id: "screener", icon: BarChart3, label: "Screener", href: "/screener" },
  { id: "alerts", icon: Bell, label: "Alerts", href: "/dashboard/alerts" },
  { id: "settings", icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

// Financial tool actions (shown as pill buttons)
const FINANCIAL_TOOLS = [
  { id: "portfolio", label: "Connect Portfolio", icon: Wallet, href: "/dashboard/portfolios" },
  { id: "screener", label: "Stock Screener", icon: BarChart3, href: "/screener" },
  { id: "compare", label: "Compare Stocks", icon: LineChart, href: "/compare" },
  { id: "taxes", label: "Calculate Taxes", icon: Calculator, href: "/tools/tax-calculator" },
  { id: "more", label: "More", icon: MoreHorizontal, href: null },
]

// More tools dropdown
const MORE_TOOLS = [
  { label: "Earnings Calendar", icon: Calendar, href: "/earnings" },
  { label: "DCF Valuation", icon: FileText, href: "/tools/dcf" },
  { label: "Insider Trading", icon: Building2, href: "/insider-trading" },
  { label: "Top Gainers", icon: Flame, href: "/markets/top-gainers" },
  { label: "Short Interest", icon: TrendingDown, href: "/short-interest" },
  { label: "FDA Calendar", icon: Shield, href: "/biotech/fda-calendar" },
  { label: "Market News", icon: Newspaper, href: "/news" },
  { label: "Economic Calendar", icon: Globe, href: "/economic-calendar" },
]

// Carousel slides for bottom card
const CAROUSEL_SLIDES = [
  { id: "movers", title: "Today's Market Movers", type: "movers" },
  { id: "earnings", title: "Upcoming Earnings", type: "earnings" },
  { id: "trending", title: "Trending Research", type: "trending" },
]

interface Mover {
  symbol: string
  name: string
  price: number
  changePercent: number
}

export default function ManusStyleHome() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(300)
  const [showChat, setShowChat] = useState(false)
  const [movers, setMovers] = useState<Mover[]>([])
  const [showMoreTools, setShowMoreTools] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check for query param to auto-start chat
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setShowChat(true)
    }
  }, [searchParams])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const savedCredits = localStorage.getItem(`credits_${user.id}`)
        setCredits(savedCredits ? parseInt(savedCredits, 10) : 1000)
      } else {
        const savedCredits = localStorage.getItem("credits_anonymous")
        setCredits(savedCredits ? parseInt(savedCredits, 10) : 300)
      }

      setLoading(false)
    }
    checkAuth()

    // Fetch trending stocks
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => {
        const all = [...(data.gainers || []), ...(data.losers || [])].slice(0, 6)
        setMovers(all)
      })
      .catch(() => {})
  }, [supabase.auth])

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleToolClick = (tool: typeof FINANCIAL_TOOLS[0]) => {
    if (tool.id === "more") {
      setShowMoreTools(!showMoreTools)
    } else if (tool.href) {
      router.push(tool.href)
    }
  }

  const handleSidebarAction = (item: typeof SIDEBAR_TOP[0]) => {
    if (item.action === "new") {
      // Reset chat state
      setShowChat(false)
      setTimeout(() => setShowChat(true), 50)
    } else if (item.href) {
      router.push(item.href)
    }
  }

  const startChat = useCallback(() => {
    setShowChat(true)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={cn(
          "flex flex-col py-4 border-r border-border bg-card/50 transition-all duration-200",
          sidebarExpanded ? "w-52" : "w-14"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo - Lician brand */}
        <Link href="/" className="mb-6 flex items-center gap-3 px-3">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-background font-bold text-lg">L</span>
          </div>
          {sidebarExpanded && (
            <span className="font-semibold text-lg whitespace-nowrap">Lician</span>
          )}
        </Link>

        {/* Top nav items */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {SIDEBAR_TOP.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarAction(item)}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                item.action === "new" && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav items */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {SIDEBAR_BOTTOM.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Lician AI</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-4">
            {/* Free plan / Start trial */}
            {!loading && !user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Free plan</span>
                <span className="text-muted-foreground">|</span>
                <Link href="/premium" className="text-green-500 hover:text-green-400 font-medium">
                  Start free trial
                </Link>
              </div>
            )}

            {/* Credits */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{credits}</span>
            </div>

            {/* Share credits */}
            <button
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              title="Invite friends for free credits"
            >
              <Gift className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User/Auth */}
            {loading ? (
              <div className="w-9 h-9 bg-secondary animate-pulse rounded-full" />
            ) : user ? (
              <Link href="/dashboard">
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-green-600 hover:bg-green-500">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Chat or Welcome Screen */}
        <div className="flex-1 overflow-y-auto">
          {showChat ? (
            <div className="min-h-full flex flex-col">
              {/* Market Movers Bar - only show in chat mode */}
              <EnhancedMarketMovers />
              <div className="flex-1">
                <AutonomousChat />
              </div>
              <Footer />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center px-6 py-12">
                {/* Heading */}
                <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10">
                  What can I do for you?
                </h1>

                {/* Chat input - clicking opens the real chat */}
                <div className="w-full max-w-2xl">
                  <button
                    onClick={startChat}
                    className="w-full relative bg-card border border-border rounded-2xl shadow-lg hover:border-green-500/50 transition-all text-left"
                  >
                    <div className="min-h-[60px] py-4 px-5 text-lg text-muted-foreground">
                      Ask about any stock, market trends, or financial analysis...
                    </div>

                    {/* Input actions */}
                    <div className="absolute left-4 bottom-3 flex items-center gap-2">
                      <div className="p-2 text-muted-foreground rounded-lg">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="absolute right-4 bottom-3 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </button>

                  {/* Tool integration hint with stock logos */}
                  <div className="flex items-center justify-between px-2 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect your portfolio for personalized insights</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {movers.slice(0, 4).map((mover) => (
                        <Link
                          key={mover.symbol}
                          href={`/stock/${mover.symbol}`}
                          className="hover:scale-110 transition-transform"
                          title={`${mover.symbol} - ${mover.changePercent > 0 ? '+' : ''}${mover.changePercent?.toFixed(2)}%`}
                        >
                          <StockLogo symbol={mover.symbol} size="sm" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Financial tool buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    {FINANCIAL_TOOLS.map((tool) => (
                      <div key={tool.id} className="relative">
                        <button
                          onClick={() => handleToolClick(tool)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-full",
                            "border border-border bg-card hover:bg-secondary",
                            "text-sm font-medium transition-colors"
                          )}
                        >
                          <tool.icon className="w-4 h-4" />
                          {tool.label}
                        </button>

                        {/* More tools dropdown */}
                        {tool.id === "more" && showMoreTools && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                            {MORE_TOOLS.map((moreTool) => (
                              <Link
                                key={moreTool.label}
                                href={moreTool.href}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors"
                                onClick={() => setShowMoreTools(false)}
                              >
                                <moreTool.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{moreTool.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom carousel card */}
                {movers.length > 0 && (
                  <div className="w-full max-w-lg mt-auto pt-8">
                    <div className="relative">
                      {/* Carousel navigation */}
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <Link href="/markets" className="block">
                        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-green-500/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{CAROUSEL_SLIDES[carouselIndex].title}</p>
                            <p className="text-sm text-muted-foreground">
                              {movers[0]?.symbol} {movers[0]?.changePercent > 0 ? "+" : ""}{movers[0]?.changePercent?.toFixed(2)}%
                              {movers[1] && ` · ${movers[1].symbol} ${movers[1].changePercent > 0 ? "+" : ""}${movers[1].changePercent?.toFixed(2)}%`}
                            </p>
                          </div>
                          <div className="flex -space-x-2">
                            {movers.slice(0, 3).map((mover) => (
                              <div
                                key={mover.symbol}
                                className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
                              >
                                <StockLogo symbol={mover.symbol} size="md" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>

                      {/* Pagination dots */}
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {CAROUSEL_SLIDES.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCarouselIndex(index)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-colors",
                              index === carouselIndex ? "bg-foreground" : "bg-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close more tools */}
      {showMoreTools && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreTools(false)}
        />
      )}
    </div>
  )
}
