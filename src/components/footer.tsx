import Link from "next/link"
import { Twitter, Linkedin, Github, Youtube } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Stocks: [
      { label: "Market News", href: "/news" },
      { label: "Stock Screener", href: "/screener" },
      { label: "Analyst Ratings", href: "/analyst-ratings" },
      { label: "Insider Trading", href: "/insider-trading" },
      { label: "Institutional Holdings", href: "/institutional" },
      { label: "Short Interest", href: "/short-interest" },
    ],
    Markets: [
      { label: "Premarket", href: "/markets/premarket" },
      { label: "After Hours", href: "/markets/after-hours" },
      { label: "Top Gainers", href: "/markets/top-gainers" },
      { label: "Top Losers", href: "/markets/top-losers" },
      { label: "Most Active", href: "/markets/most-active" },
    ],
    "Asset Classes": [
      { label: "Bonds & Treasury", href: "/bonds" },
      { label: "Forex", href: "/forex" },
      { label: "Commodities", href: "/commodities" },
      { label: "Crypto", href: "/crypto" },
      { label: "ETFs", href: "/etfs" },
      { label: "Options", href: "/options" },
      { label: "Biotech", href: "/biotech" },
    ],
    Calendars: [
      { label: "Earnings Calendar", href: "/earnings" },
      { label: "Dividends Calendar", href: "/dividends" },
      { label: "Economic Calendar", href: "/economic-calendar" },
      { label: "IPO Calendar", href: "/ipo" },
      { label: "Stock Splits", href: "/stock-splits" },
    ],
    Learn: [
      { label: "Stock Analysis Guide", href: "/learn/stock-analysis" },
      { label: "DCF Valuation", href: "/learn/dcf-valuation" },
      { label: "P/E Ratio Guide", href: "/learn/pe-ratio" },
      { label: "Dividend Investing", href: "/learn/dividend-investing" },
      { label: "AI in Stock Analysis", href: "/learn/ai-stock-analysis" },
    ],
    Sectors: [
      { label: "Technology", href: "/sectors/technology" },
      { label: "Healthcare", href: "/sectors/healthcare" },
      { label: "Financials", href: "/sectors/financials" },
      { label: "Energy", href: "/sectors/energy" },
      { label: "All Sectors", href: "/sectors" },
    ],
  }

  return (
    <footer className="bg-secondary/30 border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Lician</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered stock analysis for smarter investment decisions.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Lician. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Premium
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
