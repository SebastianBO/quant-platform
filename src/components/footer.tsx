"use client"

import Link from "next/link"
import NewsletterSignup from "./NewsletterSignup"
import MobileAppPromo from "./MobileAppPromo"

// Popular stocks for SEO internal linking
const POPULAR_STOCKS = {
  megaCap: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO'],
  growth: ['PLTR', 'COIN', 'SNOW', 'DDOG', 'CRWD', 'NET', 'MDB', 'ZS'],
  dividend: ['JNJ', 'PG', 'KO', 'PEP', 'HD', 'JPM', 'V', 'MA'],
  tech: ['AMD', 'CRM', 'ADBE', 'ORCL', 'INTC', 'QCOM', 'TXN', 'INTU'],
}

// Popular comparison pairs for SEO
const POPULAR_COMPARISONS = [
  { slug: 'aapl-vs-msft', label: 'AAPL vs MSFT' },
  { slug: 'nvda-vs-amd', label: 'NVDA vs AMD' },
  { slug: 'googl-vs-meta', label: 'GOOGL vs META' },
  { slug: 'tsla-vs-rivn', label: 'TSLA vs RIVN' },
  { slug: 'jpm-vs-bac', label: 'JPM vs BAC' },
  { slug: 'amzn-vs-wmt', label: 'AMZN vs WMT' },
  { slug: 'ko-vs-pep', label: 'KO vs PEP' },
  { slug: 'spy-vs-qqq', label: 'SPY vs QQQ' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Research: [
      { label: "Stock Screener", href: "/screener" },
      { label: "Stock Battle", href: "/battle" },
      { label: "Portfolio Tracker", href: "/portfolio" },
      { label: "DCF Calculator", href: "/tools/dcf" },
      { label: "Stock Comparisons", href: "/compare" },
      { label: "Analyst Ratings", href: "/analyst-ratings" },
    ],
    Markets: [
      { label: "Market Pulse", href: "/markets" },
      { label: "Biotech Catalysts", href: "/biotech" },
      { label: "Top Gainers", href: "/markets/top-gainers" },
      { label: "Top Losers", href: "/markets/top-losers" },
      { label: "Most Active", href: "/markets/most-active" },
      { label: "Market News", href: "/news" },
    ],
    "Asset Classes": [
      { label: "ETFs", href: "/etfs" },
      { label: "Bonds & Treasury", href: "/bonds" },
      { label: "Commodities", href: "/commodities" },
      { label: "Forex", href: "/forex" },
      { label: "Crypto", href: "/crypto" },
      { label: "Options", href: "/options" },
    ],
    Calendars: [
      { label: "Earnings Calendar", href: "/earnings" },
      { label: "FDA Calendar", href: "/biotech/fda-calendar" },
      { label: "Dividends Calendar", href: "/dividends" },
      { label: "Economic Calendar", href: "/economic-calendar" },
      { label: "IPO Calendar", href: "/ipo" },
      { label: "Ex-Dividend Dates", href: "/ex-dividend" },
    ],
    Tools: [
      { label: "Newsletter", href: "/newsletter" },
      { label: "Biotech Screener", href: "/screener/biotech-catalysts" },
      { label: "Stock Analysis", href: "/learn/stock-analysis" },
      { label: "DCF Valuation", href: "/learn/dcf-valuation" },
      { label: "Dividend Investing", href: "/learn/dividend-investing" },
      { label: "Investment Strategies", href: "/learn/strategies" },
    ],
    Sectors: [
      { label: "Technology", href: "/sectors/technology" },
      { label: "Healthcare", href: "/sectors/healthcare" },
      { label: "Financials", href: "/sectors/financials" },
      { label: "Energy", href: "/sectors/energy" },
      { label: "Industrials", href: "/sectors/industrials" },
      { label: "All Sectors", href: "/sectors" },
    ],
  }

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.08] py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Popular Stock Links - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Popular Stocks</h3>
          <div className="flex flex-wrap gap-2">
            {[...POPULAR_STOCKS.megaCap, ...POPULAR_STOCKS.tech.slice(0, 4)].map((ticker) => (
              <Link
                key={ticker}
                href={`/stock/${ticker}`}
                className="px-3 py-1.5 bg-white/[0.05] rounded-lg text-sm text-[#868f97] hover:text-white hover:bg-white/[0.08] transition-colors duration-100"
              >
                {ticker}
              </Link>
            ))}
          </div>
        </div>

        {/* Stock Predictions Links - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Stock Predictions {currentYear}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {[...POPULAR_STOCKS.megaCap].map((ticker) => (
              <Link
                key={`pred-${ticker}`}
                href={`/prediction/${ticker.toLowerCase()}`}
                className="text-sm text-[#868f97] hover:text-[#4ebe96] transition-colors duration-100 py-1"
              >
                {ticker} Prediction
              </Link>
            ))}
          </div>
        </div>

        {/* Should I Buy Links - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Investment Decisions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {[...POPULAR_STOCKS.megaCap].map((ticker) => (
              <Link
                key={`buy-${ticker}`}
                href={`/should-i-buy/${ticker.toLowerCase()}`}
                className="text-sm text-[#868f97] hover:text-[#4ebe96] transition-colors duration-100 py-1"
              >
                Buy {ticker}?
              </Link>
            ))}
          </div>
        </div>

        {/* Stock Comparisons - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Popular Stock Comparisons</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COMPARISONS.map((pair) => (
              <Link
                key={pair.slug}
                href={`/compare/${pair.slug}`}
                className="px-3 py-1.5 bg-white/[0.05] rounded-lg text-sm text-[#868f97] hover:text-white hover:bg-white/[0.08] transition-colors duration-100"
              >
                {pair.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Sector Predictions - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Sector Predictions {currentYear}</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: 'technology', label: 'Technology' },
              { slug: 'healthcare', label: 'Healthcare' },
              { slug: 'financials', label: 'Financials' },
              { slug: 'energy', label: 'Energy' },
              { slug: 'consumer-discretionary', label: 'Consumer' },
              { slug: 'industrials', label: 'Industrials' },
              { slug: 'materials', label: 'Materials' },
              { slug: 'utilities', label: 'Utilities' },
              { slug: 'real-estate', label: 'Real Estate' },
            ].map((sector) => (
              <Link
                key={sector.slug}
                href={`/predictions/${sector.slug}`}
                className="px-3 py-1.5 bg-white/[0.05] rounded-lg text-sm text-[#868f97] hover:text-white hover:bg-white/[0.08] transition-colors duration-100"
              >
                {sector.label} Predictions
              </Link>
            ))}
          </div>
        </div>

        {/* Best Stocks Categories - SEO Internal Linking */}
        <div className="mb-10 pb-10 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-white mb-4">Best Stocks by Category</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'dividend', label: 'Dividend Stocks' },
              { key: 'growth', label: 'Growth Stocks' },
              { key: 'value', label: 'Value Stocks' },
              { key: 'tech', label: 'Tech Stocks' },
              { key: 'ai', label: 'AI Stocks' },
              { key: 'etf', label: 'ETFs' },
              { key: 'blue-chip', label: 'Blue Chip' },
              { key: 'reit', label: 'REITs' },
              { key: 'small-cap', label: 'Small Cap' },
              { key: 'large-cap', label: 'Large Cap' },
            ].map((cat) => (
              <Link
                key={cat.key}
                href={`/best-stocks/${cat.key}`}
                className="px-3 py-1.5 bg-white/[0.05] rounded-lg text-sm text-[#868f97] hover:text-white hover:bg-white/[0.08] transition-colors duration-100"
              >
                Best {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-8 sm:mb-12">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg text-white">Lician</span>
            </Link>
            <p className="text-sm text-[#868f97] mb-4">
              AI-powered stock analysis and predictions for smarter investment decisions.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="/api/stripe/quick-checkout?plan=annual"
                prefetch={false}
                className="px-4 py-2 bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-lg text-sm font-medium transition-colors duration-100"
              >
                Get Premium
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="min-w-0">
              <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">{category}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 block py-1 min-h-[32px] flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Stock Pages - Comprehensive SEO Coverage */}
        <div className="mb-8 pb-8 border-b border-white/[0.08]">
          <details className="group">
            <summary className="text-sm font-semibold text-white cursor-pointer flex items-center gap-2">
              <span>More Stock Pages</span>
              <svg className="w-4 h-4 group-open:rotate-180 transition-transform duration-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {[...POPULAR_STOCKS.dividend, ...POPULAR_STOCKS.growth].map((ticker) => (
                <Link
                  key={`more-${ticker}`}
                  href={`/stock/${ticker}`}
                  className="text-sm text-[#868f97] hover:text-[#4ebe96] transition-colors duration-100 py-1"
                >
                  {ticker} Stock
                </Link>
              ))}
            </div>
          </details>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-8 pb-8 border-b border-white/[0.08]">
          <NewsletterSignup source="footer" variant="card" />
        </div>

        {/* Mobile App Promo */}
        <div className="mb-8 pb-8 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#4ebe96] rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-black">L</span>
            </div>
            <div>
              <p className="font-medium text-sm text-white">Get Lician on Mobile</p>
              <p className="text-xs text-[#868f97]">Track portfolios on the go</p>
            </div>
          </div>
          <MobileAppPromo variant="footer" />
        </div>

        {/* Bottom Links */}
        <div className="border-t border-white/[0.08] pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#868f97] text-center sm:text-left">
            © {currentYear} Lician. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <Link
              href="/sitemap.xml"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 py-2 min-h-[44px] flex items-center"
            >
              Sitemap
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 py-2 min-h-[44px] flex items-center"
            >
              Dashboard
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 py-2 min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 py-2 min-h-[44px] flex items-center"
            >
              Terms of Service
            </Link>
            <Link
              href="/disclaimer"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100 py-2 min-h-[44px] flex items-center"
            >
              Disclaimer
            </Link>
          </div>
        </div>

        {/* SEO Disclaimer */}
        <div className="mt-8 text-xs text-[#868f97]/60">
          <p>
            Stock predictions and analysis provided by Lician are for informational purposes only and should not be
            considered financial advice. Past performance does not guarantee future results. Always conduct your
            own research and consider consulting a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Minimal footer variant for pages that want less internal linking
export function FooterMinimal() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.08] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-white rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">L</span>
            </div>
            <span className="font-medium text-white">Lician</span>
          </div>
          <p className="text-sm text-[#868f97]">© {currentYear} Lician. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
