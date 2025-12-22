import Link from "next/link"
import { TrendingUp, BookOpen, Target, DollarSign, Brain, BarChart3, LineChart, Briefcase } from "lucide-react"

const featuredArticles = [
  {
    title: "Stock Market Predictions 2026",
    description: "Expert forecasts and analysis for the year ahead",
    href: "/insights/2026-stock-predictions",
    icon: TrendingUp,
    category: "Insights",
    color: "green",
  },
  {
    title: "Best AI Stocks to Buy",
    description: "Top artificial intelligence investments for 2026",
    href: "/insights/ai-stocks-2026",
    icon: Brain,
    category: "Insights",
    color: "purple",
  },
  {
    title: "Best Dividend Stocks",
    description: "High-yield income investments for reliable returns",
    href: "/insights/dividend-stocks-2026",
    icon: DollarSign,
    category: "Insights",
    color: "blue",
  },
  {
    title: "How to Invest in Stocks",
    description: "Complete beginner's guide to stock investing",
    href: "/learn/how-to-invest",
    icon: BookOpen,
    category: "Learn",
    color: "orange",
  },
  {
    title: "Value Investing Guide",
    description: "Find undervalued stocks like Warren Buffett",
    href: "/learn/value-investing",
    icon: Target,
    category: "Learn",
    color: "emerald",
  },
  {
    title: "Technical Analysis",
    description: "Chart patterns and indicators explained",
    href: "/learn/technical-analysis",
    icon: LineChart,
    category: "Learn",
    color: "cyan",
  },
]

const quickLinks = [
  { label: "Earnings Calendar", href: "/earnings", icon: BarChart3 },
  { label: "Stock Screener", href: "/screener", icon: Target },
  { label: "Analyst Ratings", href: "/analyst-ratings", icon: TrendingUp },
  { label: "Insider Trading", href: "/insider-trading", icon: Briefcase },
  { label: "Treasury Yields", href: "/bonds", icon: DollarSign },
  { label: "Crypto Prices", href: "/crypto", icon: TrendingUp },
]

export default function FeaturedArticles() {
  return (
    <section className="py-8 sm:py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Featured Articles */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Featured Research & Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredArticles.map((article) => {
              const Icon = article.icon
              return (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group p-4 sm:p-5 bg-card hover:bg-secondary/50 rounded-xl border border-border transition-all duration-200 hover:border-green-500/30 min-h-[44px] flex items-start"
                >
                  <div className="flex items-start gap-3 sm:gap-4 w-full">
                    <div className={`p-2 sm:p-2.5 rounded-lg bg-${article.color}-500/10 group-hover:bg-${article.color}-500/20 transition-colors flex-shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${article.color}-500`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        {article.category}
                      </span>
                      <h3 className="font-semibold text-sm sm:text-base group-hover:text-green-500 transition-colors mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:text-green-500 min-h-[44px]"
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
