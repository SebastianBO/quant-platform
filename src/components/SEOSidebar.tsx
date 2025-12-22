"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Calendar,
  BarChart3,
  BookOpen,
  Building2,
  DollarSign,
  Globe,
  Coins,
  Bitcoin,
  PieChart,
  Target,
  Users,
  AlertTriangle,
  Newspaper,
  GraduationCap,
  LineChart,
  Briefcase,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react"

interface NavSection {
  title: string
  items: {
    href: string
    label: string
    icon: React.ElementType
  }[]
}

const navSections: NavSection[] = [
  {
    title: "Markets",
    items: [
      { href: "/markets", label: "Overview", icon: BarChart3 },
      { href: "/markets/premarket", label: "Premarket", icon: Clock },
      { href: "/markets/after-hours", label: "After Hours", icon: Clock },
      { href: "/markets/top-gainers", label: "Top Gainers", icon: ArrowUpRight },
      { href: "/markets/top-losers", label: "Top Losers", icon: ArrowDownRight },
      { href: "/markets/most-active", label: "Most Active", icon: TrendingUp },
    ],
  },
  {
    title: "Research",
    items: [
      { href: "/screener", label: "Stock Screener", icon: Target },
      { href: "/analyst-ratings", label: "Analyst Ratings", icon: Target },
      { href: "/insider-trading", label: "Insider Trading", icon: Users },
      { href: "/institutional", label: "Institutional", icon: Building2 },
      { href: "/short-interest", label: "Short Interest", icon: AlertTriangle },
      { href: "/news", label: "Market News", icon: Newspaper },
    ],
  },
  {
    title: "Calendars",
    items: [
      { href: "/earnings", label: "Earnings", icon: Calendar },
      { href: "/dividends", label: "Dividends", icon: DollarSign },
      { href: "/ipo", label: "IPO Calendar", icon: Briefcase },
      { href: "/economic-calendar", label: "Economic", icon: Calendar },
      { href: "/stock-splits", label: "Stock Splits", icon: PieChart },
    ],
  },
  {
    title: "Asset Classes",
    items: [
      { href: "/bonds", label: "Treasury Yields", icon: Landmark },
      { href: "/forex", label: "Forex", icon: Globe },
      { href: "/commodities", label: "Commodities", icon: Coins },
      { href: "/crypto", label: "Crypto", icon: Bitcoin },
      { href: "/etfs", label: "ETFs", icon: PieChart },
      { href: "/options", label: "Options", icon: LineChart },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/learn", label: "Education Hub", icon: GraduationCap },
      { href: "/learn/how-to-invest", label: "How to Invest", icon: BookOpen },
      { href: "/learn/technical-analysis", label: "Technical Analysis", icon: LineChart },
      { href: "/learn/value-investing", label: "Value Investing", icon: Target },
      { href: "/blue-chip-stocks", label: "Blue Chips", icon: Building2 },
      { href: "/penny-stocks", label: "Penny Stocks", icon: AlertTriangle },
    ],
  },
]

interface SEOSidebarProps {
  className?: string
}

export default function SEOSidebar({ className }: SEOSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn("hidden lg:block w-56 flex-shrink-0", className)}>
      <nav className="sticky top-24 space-y-6 pb-8">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-green-500/10 text-green-500 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2">Get Full Analysis</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Access AI-powered stock analysis, DCF valuations, and institutional data.
          </p>
          <Link
            href="/dashboard"
            className="block w-full text-center bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg font-medium transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  )
}
