"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Wallet,
  Calculator,
  BarChart3,
  TrendingUp,
  Search,
  Calendar,
  FileText,
  PieChart,
  Bell,
  Settings,
  History,
  Sparkles,
  ArrowUp,
  Plus,
  MoreHorizontal,
  Flame,
  Building2,
  LineChart,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"
import StockLogo from "@/components/StockLogo"

// Financial tool actions
const FINANCIAL_TOOLS = [
  { id: "portfolio", label: "Connect Portfolio", icon: Wallet, href: "/dashboard/portfolios" },
  { id: "screener", label: "Stock Screener", icon: BarChart3, href: "/screener" },
  { id: "compare", label: "Compare Stocks", icon: LineChart, href: "/compare" },
  { id: "earnings", label: "Earnings Calendar", icon: Calendar, href: "/earnings" },
  { id: "more", label: "More", icon: MoreHorizontal, href: null },
]

// Sidebar navigation items
const SIDEBAR_ITEMS = [
  { id: "new", icon: Plus, label: "New chat", href: "/" },
  { id: "search", icon: Search, label: "Search", href: "/screener" },
  { id: "markets", icon: TrendingUp, label: "Markets", href: "/markets" },
  { id: "history", icon: History, label: "History", href: "/dashboard" },
]

const SIDEBAR_BOTTOM = [
  { id: "portfolio", icon: Briefcase, label: "Portfolio", href: "/dashboard/portfolios" },
  { id: "tools", icon: PieChart, label: "Tools", href: "/tools" },
  { id: "alerts", icon: Bell, label: "Alerts", href: "/dashboard/alerts" },
  { id: "settings", icon: Settings, label: "Settings", href: "/dashboard/settings" },
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
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [movers, setMovers] = useState<Mover[]>([])
  const [showMoreTools, setShowMoreTools] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
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

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return
    setIsSubmitting(true)

    // Navigate to chat with the query
    router.push(`/?q=${encodeURIComponent(input.trim())}`)
  }

  const handleToolClick = (tool: typeof FINANCIAL_TOOLS[0]) => {
    if (tool.id === "more") {
      setShowMoreTools(!showMoreTools)
    } else if (tool.href) {
      router.push(tool.href)
    }
  }

  // More tools dropdown
  const MORE_TOOLS = [
    { label: "Calculate Taxes", icon: Calculator, href: "/tools/tax-calculator" },
    { label: "DCF Valuation", icon: FileText, href: "/tools/dcf" },
    { label: "Insider Trading", icon: Building2, href: "/insider-trading" },
    { label: "Top Gainers", icon: Flame, href: "/markets/top-gainers" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-14 flex flex-col items-center py-4 border-r border-border bg-card/50">
        {/* Logo */}
        <Link href="/" className="mb-6">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </Link>

        {/* Top nav items */}
        <nav className="flex flex-col items-center gap-2">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav items */}
        <nav className="flex flex-col items-center gap-2">
          {SIDEBAR_BOTTOM.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Lician AI</span>
            <span className="text-xs text-muted-foreground">v1.0</span>
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

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10">
            What can I do for you?
          </h1>

          {/* Chat input */}
          <div className="w-full max-w-2xl">
            <div className="relative bg-card border border-border rounded-2xl shadow-lg">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Ask about any stock, market trends, or financial analysis..."
                className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent text-lg pr-24 py-4 px-5 focus-visible:ring-0"
                disabled={isSubmitting}
              />

              {/* Input actions */}
              <div className="absolute left-4 bottom-3 flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute right-4 bottom-3 flex items-center gap-2">
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isSubmitting}
                  className={cn(
                    "w-9 h-9 rounded-xl transition-all",
                    input.trim()
                      ? "bg-green-600 hover:bg-green-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tool integration hint */}
            <div className="flex items-center justify-between px-2 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>Connect your portfolio for personalized insights</span>
              </div>
              <div className="flex items-center gap-1">
                {movers.slice(0, 4).map((mover) => (
                  <Link
                    key={mover.symbol}
                    href={`/${mover.symbol}`}
                    className="w-6 h-6 rounded-full overflow-hidden hover:scale-110 transition-transform"
                    title={mover.symbol}
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
                    <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
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
        </div>

        {/* Bottom promotional card */}
        {movers.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-6">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="flex-1">
                <p className="font-medium mb-1">Today's Market Movers</p>
                <p className="text-sm text-muted-foreground">
                  {movers[0]?.symbol} {movers[0]?.changePercent > 0 ? "+" : ""}{movers[0]?.changePercent?.toFixed(2)}%
                  {movers[1] && ` · ${movers[1].symbol} ${movers[1].changePercent > 0 ? "+" : ""}${movers[1].changePercent?.toFixed(2)}%`}
                </p>
              </div>
              <div className="flex -space-x-2">
                {movers.slice(0, 3).map((mover) => (
                  <Link
                    key={mover.symbol}
                    href={`/${mover.symbol}`}
                    className="w-10 h-10 rounded-full border-2 border-background overflow-hidden hover:scale-110 transition-transform z-10"
                  >
                    <StockLogo symbol={mover.symbol} size="md" />
                  </Link>
                ))}
              </div>
            </div>
            {/* Pagination dots */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-foreground" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
