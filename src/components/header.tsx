"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, LogOut, User, TrendingUp, BarChart3, Calendar, BookOpen, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase-browser"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navMenus = {
  Stocks: {
    icon: TrendingUp,
    sections: [
      {
        title: "Research",
        links: [
          { label: "Market News", href: "/news", desc: "Latest headlines" },
          { label: "Stock Screener", href: "/screener", desc: "Filter stocks by metrics" },
          { label: "Analyst Ratings", href: "/analyst-ratings", desc: "Upgrades & downgrades" },
          { label: "Insider Trading", href: "/insider-trading", desc: "CEO & CFO transactions" },
          { label: "Institutional Holdings", href: "/institutional", desc: "13F filings & hedge funds" },
          { label: "Short Interest", href: "/short-interest", desc: "Most shorted stocks" },
        ],
      },
      {
        title: "Events",
        links: [
          { label: "Earnings Calendar", href: "/earnings", desc: "Upcoming earnings" },
          { label: "Earnings Surprises", href: "/earnings/surprises", desc: "Beats & misses" },
          { label: "IPO Calendar", href: "/ipo", desc: "Upcoming IPOs" },
          { label: "Dividends Calendar", href: "/dividends", desc: "Ex-dates & payouts" },
        ],
      },
    ],
  },
  Markets: {
    icon: BarChart3,
    sections: [
      {
        title: "Market Movers",
        links: [
          { label: "Most Active", href: "/markets/most-active", desc: "Highest volume" },
          { label: "Top Gainers", href: "/markets/top-gainers", desc: "Biggest winners" },
          { label: "Top Losers", href: "/markets/top-losers", desc: "Biggest decliners" },
          { label: "52-Week Highs", href: "/markets/52-week-high", desc: "New highs" },
          { label: "52-Week Lows", href: "/markets/52-week-low", desc: "New lows" },
        ],
      },
      {
        title: "Sectors",
        links: [
          { label: "Technology", href: "/sectors/technology", desc: "Tech stocks" },
          { label: "Healthcare", href: "/sectors/healthcare", desc: "Pharma & biotech" },
          { label: "Financials", href: "/sectors/financials", desc: "Banks & insurance" },
          { label: "All Sectors", href: "/sectors", desc: "Browse all 11 sectors" },
        ],
      },
    ],
  },
  Assets: {
    icon: Globe,
    sections: [
      {
        title: "Asset Classes",
        links: [
          { label: "Bonds & Treasury", href: "/bonds", desc: "Fixed income & yields" },
          { label: "Forex", href: "/forex", desc: "Currency markets" },
          { label: "Commodities", href: "/commodities", desc: "Gold, oil, & more" },
          { label: "Crypto", href: "/crypto", desc: "Bitcoin & altcoins" },
          { label: "ETFs", href: "/etfs", desc: "Exchange-traded funds" },
        ],
      },
      {
        title: "Macro",
        links: [
          { label: "Economic Calendar", href: "/economic-calendar", desc: "Fed, jobs, CPI" },
          { label: "Interest Rates", href: "/bonds", desc: "Treasury yields" },
        ],
      },
    ],
  },
  Learn: {
    icon: BookOpen,
    sections: [
      {
        title: "Guides",
        links: [
          { label: "Stock Analysis", href: "/learn/stock-analysis", desc: "Fundamental analysis" },
          { label: "DCF Valuation", href: "/learn/dcf-valuation", desc: "Intrinsic value" },
          { label: "P/E Ratio", href: "/learn/pe-ratio", desc: "Valuation metrics" },
          { label: "Dividend Investing", href: "/learn/dividend-investing", desc: "Income strategies" },
          { label: "AI Stock Analysis", href: "/learn/ai-stock-analysis", desc: "Machine learning" },
        ],
      },
      {
        title: "Insights",
        links: [
          { label: "2026 Predictions", href: "/insights/2026-stock-predictions", desc: "Market outlook" },
          { label: "Best Stocks 2026", href: "/insights/best-stocks-2026", desc: "Top picks" },
          { label: "AI Stocks", href: "/insights/ai-stocks-2026", desc: "AI revolution" },
          { label: "Dividend Stocks", href: "/insights/dividend-stocks-2026", desc: "Income plays" },
        ],
      },
    ],
  },
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await supabase.auth.getUser()
        setUser(response?.data?.user ?? null)
      } catch (e) {
        setUser(null)
      }
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => authListener?.subscription?.unsubscribe?.()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/stock/")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4 lg:px-8" ref={menuRef}>
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-base sm:text-lg text-foreground">Lician</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {Object.entries(navMenus).map(([name, menu]) => (
              <div key={name} className="relative">
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px] ${
                    activeMenu === name
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                  onClick={() => setActiveMenu(activeMenu === name ? null : name)}
                >
                  <menu.icon className="w-4 h-4" />
                  {name}
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === name ? "rotate-180" : ""}`} />
                </button>

                {activeMenu === name && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[500px] grid grid-cols-2 gap-6 z-50">
                    {menu.sections.map((section) => (
                      <div key={section.title}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {section.title}
                        </h4>
                        <ul className="space-y-1">
                          {section.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block p-2 rounded-lg hover:bg-secondary transition-colors group min-h-[44px] flex items-start"
                                onClick={() => setActiveMenu(null)}
                              >
                                <div>
                                  <span className="font-medium text-foreground group-hover:text-green-500 transition-colors">
                                    {link.label}
                                  </span>
                                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/premium"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {loading ? (
            <div className="w-20 h-9 bg-secondary animate-pulse rounded-lg" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className={`border-border hover:bg-secondary bg-transparent gap-2 min-h-[44px] ${
                    isDashboard ? "text-green-500 border-green-500/50" : "text-foreground"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent min-h-[44px]">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-green-600 text-white hover:bg-green-500 min-h-[44px]">Get started free</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 space-y-4">
            {Object.entries(navMenus).map(([name, menu]) => (
              <div key={name}>
                <button
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-foreground min-h-[44px]"
                  onClick={() => setActiveMenu(activeMenu === name ? null : name)}
                >
                  <span className="flex items-center gap-2">
                    <menu.icon className="w-4 h-4" />
                    {name}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === name ? "rotate-180" : ""}`} />
                </button>
                {activeMenu === name && (
                  <div className="pl-6 space-y-4 mt-2">
                    {menu.sections.map((section) => (
                      <div key={section.title}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{section.title}</h4>
                        <ul className="space-y-2">
                          {section.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="block py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center"
                                onClick={() => {
                                  setMobileMenuOpen(false)
                                  setActiveMenu(null)
                                }}
                              >
                                <div>
                                  <div className="font-medium">{link.label}</div>
                                  <div className="text-xs opacity-75">{link.desc}</div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/premium"
              className="block py-3 text-sm text-muted-foreground hover:text-foreground min-h-[44px] flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-border text-foreground bg-transparent min-h-[44px]">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground bg-transparent min-h-[44px]"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-border text-foreground bg-transparent min-h-[44px]">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-green-600 text-white min-h-[44px]">Get started free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
