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
    <section className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        {/* Featured Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Research & Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArticles.map((article) => {
              const Icon = article.icon
              return (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group p-5 bg-card hover:bg-secondary/50 rounded-xl border border-border transition-all duration-200 hover:border-green-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg bg-${article.color}-500/10 group-hover:bg-${article.color}-500/20 transition-colors`}>
                      <Icon className={`w-5 h-5 text-${article.color}-500`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {article.category}
                      </span>
                      <h3 className="font-semibold mt-1 group-hover:text-green-500 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
          <h2 className="text-xl font-bold mb-4">Explore More</h2>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors hover:text-green-500"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
