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

  // Hidden on mobile/tablet (< 1024px), visible on desktop (>= 1024px)
  // TODO: Consider adding mobile bottom nav or hamburger menu for mobile users
  return (
    <aside className={cn("hidden lg:block w-56 flex-shrink-0", className)}>
      <nav className="sticky top-24 space-y-6 pb-8">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-[#868f97] uppercase tracking-wider mb-2 px-3">
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
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-100",
                      isActive
                        ? "bg-[#4ebe96]/10 text-[#4ebe96] font-medium"
                        : "text-[#868f97] hover:text-white hover:bg-white/[0.08]"
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
        <div className="bg-gradient-to-br from-[#4ebe96]/10 to-[#4ebe96]/5 border border-[#4ebe96]/20 rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2">Get Full Analysis</h4>
          <p className="text-xs text-[#868f97] mb-3">
            Access AI-powered stock analysis, DCF valuations, and institutional data.
          </p>
          <Link
            href="/dashboard"
            className="block w-full text-center bg-[#4ebe96] hover:bg-[#4ebe96] text-white text-sm py-2 rounded-lg font-medium transition-colors duration-100"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  )
}
