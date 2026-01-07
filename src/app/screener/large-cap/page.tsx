import { Metadata } from 'next'
import Link from 'next/link'
import { supabase, CompanyFundamentals } from '@/lib/supabase'

// Force dynamic rendering since we query Supabase at runtime
export const dynamic = 'force-dynamic'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

const LARGE_CAP_THRESHOLD = 100e9 // $100 billion

export const metadata: Metadata = {
  title: 'Large Cap Stocks: Best Mega Cap Stocks Over $100B Market Cap | Stock Screener',
  description: 'Find large cap stocks with market capitalizations over $100 billion. Our mega cap screener identifies the most established, stable blue-chip companies. Updated daily.',
  keywords: [
    'large cap stocks',
    'mega cap stocks',
    'blue chip stocks',
    'big cap stocks',
    '$100 billion stocks',
    'largest companies',
    'stable stocks',
    'safe stocks',
    'quality stocks',
    'market cap over 100 billion',
    'best large cap stocks',
    'magnificent seven stocks',
  ],
  openGraph: {
    title: 'Large Cap Stocks - Best Mega Cap Stocks Over $100B Market Cap',
    description: 'Find large cap stocks with market capitalizations over $100 billion.',
    type: 'article',
    url: `${SITE_URL}/screener/large-cap`,
  },
  alternates: {
    canonical: `${SITE_URL}/screener/large-cap`,
  },
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(0)}B`
  return `$${(marketCap / 1e6).toFixed(0)}M`
}

async function getLargeCapStocks(): Promise<CompanyFundamentals[]> {
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .gte('market_cap', LARGE_CAP_THRESHOLD)
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) {
    console.error('Error fetching large cap stocks:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

// Curated large cap stocks as fallback
const LARGE_CAP_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 4.13e12, pe: 33.8, revenue: 391e9, weight: 7.2 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: 3.31e12, pe: 36.2, revenue: 245e9, weight: 6.8 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', marketCap: 3.48e12, pe: 55.3, revenue: 96e9, weight: 6.5 },
  { ticker: 'GOOG', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 2.40e12, pe: 24.5, revenue: 350e9, weight: 4.1 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', marketCap: 2.35e12, pe: 42.5, revenue: 620e9, weight: 3.9 },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', marketCap: 1.58e12, pe: 28.9, revenue: 156e9, weight: 2.5 },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', marketCap: 1.02e12, pe: 15.2, revenue: 370e9, weight: 1.7 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', marketCap: 1.35e12, pe: 68.5, revenue: 97e9, weight: 2.1 },
  { ticker: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', marketCap: 780e9, pe: 85.2, revenue: 41e9, weight: 1.3 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financials', marketCap: 650e9, pe: 32.1, revenue: 36e9, weight: 1.1 },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', marketCap: 520e9, pe: 18.5, revenue: 400e9, weight: 0.9 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', marketCap: 590e9, pe: 12.1, revenue: 162e9, weight: 1.0 },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', marketCap: 750e9, pe: 38.5, revenue: 680e9, weight: 1.2 },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Financials', marketCap: 475e9, pe: 38.2, revenue: 28e9, weight: 0.8 },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', marketCap: 460e9, pe: 14.2, revenue: 345e9, weight: 0.8 },
  { ticker: 'COST', name: 'Costco Wholesale', sector: 'Consumer Staples', marketCap: 420e9, pe: 56.2, revenue: 254e9, weight: 0.7 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: 380e9, pe: 18.5, revenue: 85e9, weight: 0.6 },
  { ticker: 'HD', name: 'The Home Depot', sector: 'Consumer Discretionary', marketCap: 420e9, pe: 26.8, revenue: 157e9, weight: 0.7 },
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', marketCap: 420e9, pe: 28.4, revenue: 84e9, weight: 0.7 },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', marketCap: 310e9, pe: 14.8, revenue: 56e9, weight: 0.5 },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: 280e9, pe: 13.8, revenue: 200e9, weight: 0.5 },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Financials', marketCap: 330e9, pe: 13.2, revenue: 98e9, weight: 0.6 },
  { ticker: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples', marketCap: 270e9, pe: 26.5, revenue: 47e9, weight: 0.5 },
  { ticker: 'MRK', name: 'Merck & Co.', sector: 'Healthcare', marketCap: 250e9, pe: 12.8, revenue: 60e9, weight: 0.4 },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', marketCap: 280e9, pe: 42.5, revenue: 38e9, weight: 0.5 },
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', marketCap: 480e9, pe: 35.2, revenue: 56e9, weight: 0.8 },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', marketCap: 380e9, pe: 42.8, revenue: 39e9, weight: 0.6 },
  { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', marketCap: 850e9, pe: 98.5, revenue: 52e9, weight: 1.4 },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', marketCap: 210e9, pe: 32.5, revenue: 44e9, weight: 0.4 },
  { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', marketCap: 220e9, pe: 24.2, revenue: 92e9, weight: 0.4 },
].sort((a, b) => b.marketCap - a.marketCap)

const faqs = [
  {
    question: 'What is a large cap stock?',
    answer: 'A large cap (large capitalization) stock is a company with a market value exceeding $10 billion. Mega cap stocks exceed $200 billion. Our screener focuses on stocks above $100 billion - the most established, liquid, and influential companies in the market. These include household names like Apple, Microsoft, Google, and Amazon.',
  },
  {
    question: 'Why invest in large cap stocks?',
    answer: 'Large cap stocks offer: 1) Stability - established businesses with diversified revenues, 2) Liquidity - easy to buy/sell large positions, 3) Dividends - many pay consistent dividends, 4) Transparency - extensive analyst coverage and financial disclosures, 5) Lower volatility - typically less risky than small caps. They form the foundation of most investment portfolios.',
  },
  {
    question: 'What are the Magnificent Seven stocks?',
    answer: 'The Magnificent Seven refers to the seven largest tech-related companies dominating the S&P 500: Apple (AAPL), Microsoft (MSFT), Amazon (AMZN), Alphabet/Google (GOOG/GOOGL), Meta (META), NVIDIA (NVDA), and Tesla (TSLA). Together they represent over 30% of the S&P 500 index weight. Their performance significantly impacts overall market returns.',
  },
  {
    question: 'Are large cap stocks less risky than small caps?',
    answer: 'Generally yes. Large caps have lower volatility (beta closer to 1.0), stronger balance sheets, more diversified revenues, and greater analyst coverage. However, they are not risk-free - even giants like General Electric and Intel have declined significantly. Large caps may also underperform during bull markets when small caps rally. Diversification across market caps is prudent.',
  },
  {
    question: 'How does market cap affect stock price?',
    answer: 'Market cap = Stock Price x Shares Outstanding. A high market cap does not mean a stock is expensive - a $500 stock of a company with 100 million shares ($50B market cap) may be cheaper than a $50 stock with 2 billion shares ($100B market cap). Evaluate valuation using P/E ratio, P/S ratio, and other metrics, not stock price alone.',
  },
  {
    question: 'What is the difference between large cap and blue chip?',
    answer: 'Blue chip is a quality designation for large, well-established, financially sound companies with excellent reputations. All blue chips are large caps, but not all large caps are blue chips. A blue chip typically has decades of stable earnings, consistent dividends, and industry leadership. Think Coca-Cola, Johnson & Johnson, and Procter & Gamble.',
  },
  {
    question: 'Should my portfolio be all large cap stocks?',
    answer: 'A diversified portfolio typically includes multiple market caps. Large caps provide stability but may offer lower growth than small/mid caps. A common allocation is 60-70% large cap, 20-30% mid cap, and 10-20% small cap. Adjust based on your age, risk tolerance, and goals. Younger investors may favor more small/mid cap exposure for growth potential.',
  },
  {
    question: 'How often do large cap stocks change?',
    answer: 'The largest companies evolve over decades. In 2000, GE, Cisco, and ExxonMobil led the market. By 2024, tech giants dominate. Companies grow into mega cap status (NVIDIA in 2023-2024) or decline (Intel, Cisco). S&P 500 index reconstitution occurs quarterly. Investing in large caps requires periodic review as leaders change.',
  },
]

export default async function LargeCapPage() {
  const stocks = await getLargeCapStocks()
  const pageUrl = `${SITE_URL}/screener/large-cap`

  // Use database stocks if available, otherwise use curated list
  const displayStocks = stocks.length > 0 ? stocks : null
  const totalMarketCap = LARGE_CAP_STOCKS.reduce((sum, s) => sum + s.marketCap, 0)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: `${SITE_URL}/screener` },
    { name: 'Large Cap', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Large Cap Stocks: Best Mega Cap Stocks Over $100B Market Cap',
    description: 'Find large cap stocks with market capitalizations over $100 billion. The most established blue-chip companies.',
    url: pageUrl,
    keywords: ['large cap stocks', 'mega cap stocks', 'blue chip stocks', 'biggest companies'],
  })

  const faqSchema = getFAQSchema(faqs)

  const stocksForSchema = displayStocks || LARGE_CAP_STOCKS.map(s => ({ ticker: s.ticker }))
  const itemListSchema = getItemListSchema({
    name: 'Large Cap Stocks',
    description: 'Stocks with market cap above $100 billion',
    url: pageUrl,
    items: stocksForSchema.slice(0, 30).map((stock, index) => ({
      name: stock.ticker,
      url: `${SITE_URL}/stock/${stock.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema, itemListSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/screener" className="hover:text-foreground">Stock Screener</Link>
            {' / '}
            <span>Large Cap</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Large Cap Stocks
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Mega cap stocks with market capitalizations over $100 billion - the world's most valuable
              and established companies offering stability and quality.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-lg">
                Filter: Market Cap &gt; $100B
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                {displayStocks?.length || LARGE_CAP_STOCKS.length} Stocks Found
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                Total: {formatMarketCap(totalMarketCap)}
              </div>
            </div>
          </header>

          {/* Key Metrics Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Largest Company</p>
              <p className="text-2xl font-bold text-yellow-400">
                {LARGE_CAP_STOCKS[0].ticker}
              </p>
              <p className="text-xs text-muted-foreground">{formatMarketCap(LARGE_CAP_STOCKS[0].marketCap)}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">$1T+ Club</p>
              <p className="text-2xl font-bold text-green-500">
                {LARGE_CAP_STOCKS.filter(s => s.marketCap >= 1e12).length}
              </p>
              <p className="text-xs text-muted-foreground">Trillion dollar companies</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average P/E</p>
              <p className="text-2xl font-bold">
                {(LARGE_CAP_STOCKS.reduce((sum, s) => sum + s.pe, 0) / LARGE_CAP_STOCKS.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Technology</p>
              <p className="text-2xl font-bold text-blue-400">
                {LARGE_CAP_STOCKS.filter(s => s.sector === 'Technology').length}
              </p>
              <p className="text-xs text-muted-foreground">Tech giants</p>
            </div>
          </section>

          {/* Magnificent Seven */}
          <section className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 p-6 rounded-xl border border-yellow-500/20 mb-8">
            <h2 className="text-2xl font-bold mb-4">The Magnificent Seven</h2>
            <p className="text-muted-foreground mb-4">
              The seven tech giants dominating the market, representing over 30% of S&P 500 weight:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {['AAPL', 'MSFT', 'NVDA', 'GOOG', 'AMZN', 'META', 'TSLA'].map(ticker => {
                const stock = LARGE_CAP_STOCKS.find(s => s.ticker === ticker)
                return (
                  <Link
                    key={ticker}
                    href={`/stock/${ticker.toLowerCase()}`}
                    className="bg-card/50 p-3 rounded-lg text-center hover:bg-card transition-colors"
                  >
                    <p className="font-bold text-yellow-400">{ticker}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stock ? formatMarketCap(stock.marketCap) : '---'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Stock Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">All Large Cap Stocks (&gt;$100B)</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Market Cap</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P/E Ratio</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayStocks ? (
                      displayStocks.map((stock, index) => (
                        <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/stock/${stock.ticker.toLowerCase()}`}
                              className="font-bold text-yellow-400 hover:text-yellow-300 hover:underline"
                            >
                              {stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link href={`/stock/${stock.ticker.toLowerCase()}`} className="hover:underline">
                              {stock.company_name || stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{stock.sector || '---'}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            <span className={stock.market_cap && stock.market_cap >= 1e12 ? 'text-yellow-400' : ''}>
                              {stock.market_cap ? formatMarketCap(stock.market_cap) : '---'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {stock.pe_ratio?.toFixed(1) || '---'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {stock.revenue ? formatMarketCap(stock.revenue) : '---'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      LARGE_CAP_STOCKS.map((stock, index) => (
                        <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/stock/${stock.ticker.toLowerCase()}`}
                              className="font-bold text-yellow-400 hover:text-yellow-300 hover:underline"
                            >
                              {stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link href={`/stock/${stock.ticker.toLowerCase()}`} className="hover:underline">
                              {stock.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{stock.sector}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            <span className={stock.marketCap >= 1e12 ? 'text-yellow-400' : ''}>
                              {formatMarketCap(stock.marketCap)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {stock.pe.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {formatMarketCap(stock.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Market Cap Tiers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Market Cap Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-card p-5 rounded-xl border-2 border-yellow-500/30">
                <h3 className="font-bold text-yellow-500 mb-2">Mega Cap (&gt;$200B)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The world's largest companies. Apple, Microsoft, and others.
                </p>
                <p className="text-xs">{LARGE_CAP_STOCKS.filter(s => s.marketCap >= 200e9).length} companies</p>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-orange-500/30">
                <h3 className="font-bold text-orange-400 mb-2">Large Cap ($100-200B)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Major corporations with significant market presence.
                </p>
                <p className="text-xs">{LARGE_CAP_STOCKS.filter(s => s.marketCap >= 100e9 && s.marketCap < 200e9).length} companies</p>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-2">Large Cap ($10-100B)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Established companies, often S&P 500 members.
                </p>
                <p className="text-xs">Not shown in this screen</p>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-green-500/30">
                <h3 className="font-bold text-green-400 mb-2">Mid Cap ($2-10B)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Growing companies with expansion potential.
                </p>
                <p className="text-xs">Not shown in this screen</p>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-purple-500/30">
                <h3 className="font-bold text-purple-400 mb-2">Small Cap (&lt;$2B)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Smaller companies with higher growth/risk.
                </p>
                <p className="text-xs">See Small Cap Gems</p>
              </div>
            </div>
          </section>

          {/* Sector Breakdown */}
          <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20 mb-12">
            <h2 className="text-2xl font-bold mb-4">Sector Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                LARGE_CAP_STOCKS.reduce((acc, s) => {
                  acc[s.sector] = (acc[s.sector] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([sector, count]) => (
                  <div key={sector} className="bg-card/50 p-4 rounded-lg">
                    <p className="font-bold">{sector}</p>
                    <p className="text-sm text-muted-foreground">{count} companies</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / LARGE_CAP_STOCKS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Benefits of Large Cap */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Benefits of Large Cap Investing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-yellow-400">Stability & Safety</h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>&#8226; Diversified revenue streams</li>
                  <li>&#8226; Strong balance sheets</li>
                  <li>&#8226; Experienced management teams</li>
                  <li>&#8226; Lower beta (volatility)</li>
                  <li>&#8226; Recession resilience</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-400">Income Potential</h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>&#8226; Consistent dividend payments</li>
                  <li>&#8226; Share buyback programs</li>
                  <li>&#8226; Dividend growth track records</li>
                  <li>&#8226; Predictable cash flows</li>
                  <li>&#8226; Many are Dividend Aristocrats</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-blue-400">Accessibility</h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>&#8226; High trading liquidity</li>
                  <li>&#8226; Extensive analyst coverage</li>
                  <li>&#8226; Options and derivatives available</li>
                  <li>&#8226; Index fund inclusion</li>
                  <li>&#8226; Transparent financials</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-card p-6 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-yellow-400 group-open:rotate-180 transition-transform">&#9660;</span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Screeners */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Stock Screeners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/screener/high-dividend-yield"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128176;</p>
                <p className="font-bold">High Dividend</p>
                <p className="text-xs text-muted-foreground">Yield &gt; 3%</p>
              </Link>
              <Link
                href="/screener/low-pe-ratio"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128181;</p>
                <p className="font-bold">Low P/E Ratio</p>
                <p className="text-xs text-muted-foreground">Value stocks P/E &lt; 15</p>
              </Link>
              <Link
                href="/screener/high-growth"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128200;</p>
                <p className="font-bold">High Growth</p>
                <p className="text-xs text-muted-foreground">Revenue growth &gt; 20%</p>
              </Link>
              <Link
                href="/screener/small-cap-gems"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128142;</p>
                <p className="font-bold">Small Cap Gems</p>
                <p className="text-xs text-muted-foreground">Quality small caps</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-8 rounded-xl border border-yellow-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Analyze Large Caps with AI</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Go deeper on the world's largest companies. Our AI analyzes competitive positioning,
              valuation relative to peers, growth sustainability, and dividend safety for mega caps.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Start Large Cap Research
              </Link>
              <Link
                href="/blue-chip-stocks"
                className="bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Explore Blue Chips
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
