import Link from "next/link"

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
    <footer className="bg-secondary/30 border-t border-border py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8 sm:mb-12">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Lician</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered stock analysis for smarter investment decisions.
            </p>
            {/* Social media links removed - will be added when accounts are set up */}
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">{category}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1 min-h-[32px] flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">© 2025 Lician. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <Link
              href="/premium"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px] flex items-center"
            >
              Premium
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px] flex items-center"
            >
              Dashboard
            </Link>
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px] flex items-center"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
