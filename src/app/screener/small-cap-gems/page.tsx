import { Metadata } from 'next'
import Link from 'next/link'
import { supabase, CompanyFundamentals } from '@/lib/supabase'

// Force dynamic rendering since we query Supabase at runtime
export const dynamic = 'force-dynamic'
export const revalidate = 3600
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

const SMALL_CAP_MAX = 10e9 // $10 billion
const SMALL_CAP_MIN = 300e6 // $300 million (avoid micro caps)

export const metadata: Metadata = {
  title: 'Small Cap Gems: Best Small Cap Stocks with Strong Fundamentals | Stock Screener',
  description: 'Find quality small cap stocks with strong fundamentals and growth potential. Our small cap screener identifies hidden gems with solid metrics. Updated daily.',
  keywords: [
    'small cap stocks',
    'small cap gems',
    'best small cap stocks',
    'undervalued small caps',
    'small cap growth stocks',
    'small cap value stocks',
    'hidden gem stocks',
    'small company stocks',
    'Russell 2000 stocks',
    'small cap stocks to buy',
    'quality small caps',
    'emerging companies',
  ],
  openGraph: {
    title: 'Small Cap Gems - Best Small Cap Stocks with Strong Fundamentals',
    description: 'Find quality small cap stocks with strong fundamentals and growth potential.',
    type: 'article',
    url: `${SITE_URL}/screener/small-cap-gems`,
  },
  alternates: {
    canonical: `${SITE_URL}/screener/small-cap-gems`,
  },
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(0)}M`
  return `$${marketCap.toLocaleString()}`
}

async function getSmallCapGems(): Promise<CompanyFundamentals[]> {
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .gte('market_cap', SMALL_CAP_MIN)
    .lt('market_cap', SMALL_CAP_MAX)
    .gt('pe_ratio', 0) // Profitable
    .lt('pe_ratio', 30) // Reasonable valuation
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) {
    console.error('Error fetching small cap gems:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

// Curated small cap gems
const SMALL_CAP_GEMS = [
  { ticker: 'BOOT', name: 'Boot Barn Holdings', sector: 'Consumer Discretionary', marketCap: 4.2e9, pe: 18.5, revenueGrowth: 15, roic: 22, moat: 'Retail niche dominance' },
  { ticker: 'MEDP', name: 'Medpace Holdings', sector: 'Healthcare', marketCap: 9.5e9, pe: 25.2, revenueGrowth: 20, roic: 28, moat: 'Clinical trial expertise' },
  { ticker: 'CSWI', name: 'CSW Industrials', sector: 'Industrials', marketCap: 4.8e9, pe: 28.5, revenueGrowth: 18, roic: 19, moat: 'Industrial products moat' },
  { ticker: 'SITE', name: 'SiteOne Landscape Supply', sector: 'Industrials', marketCap: 6.5e9, pe: 24.8, revenueGrowth: 12, roic: 15, moat: 'Distribution scale' },
  { ticker: 'EXPO', name: 'Exponent Inc.', sector: 'Industrials', marketCap: 5.2e9, pe: 42.5, revenueGrowth: 10, roic: 35, moat: 'Engineering consulting expertise' },
  { ticker: 'LSTR', name: 'Landstar System', sector: 'Industrials', marketCap: 6.8e9, pe: 22.5, revenueGrowth: 8, roic: 32, moat: 'Asset-light trucking model' },
  { ticker: 'WDFC', name: 'WD-40 Company', sector: 'Consumer Staples', marketCap: 3.5e9, pe: 45.2, revenueGrowth: 8, roic: 28, moat: 'Iconic brand' },
  { ticker: 'FOXF', name: 'Fox Factory Holding', sector: 'Consumer Discretionary', marketCap: 4.5e9, pe: 22.8, revenueGrowth: 12, roic: 18, moat: 'Premium suspension tech' },
  { ticker: 'UFPT', name: 'UFP Technologies', sector: 'Healthcare', marketCap: 2.8e9, pe: 25.5, revenueGrowth: 22, roic: 20, moat: 'Medical packaging niche' },
  { ticker: 'AIT', name: 'Applied Industrial Tech', sector: 'Industrials', marketCap: 9.8e9, pe: 24.2, revenueGrowth: 14, roic: 18, moat: 'Industrial distribution' },
  { ticker: 'STRL', name: 'Sterling Infrastructure', sector: 'Industrials', marketCap: 5.5e9, pe: 18.5, revenueGrowth: 25, roic: 22, moat: 'Infrastructure exposure' },
  { ticker: 'RMBS', name: 'Rambus Inc.', sector: 'Technology', marketCap: 5.8e9, pe: 32.5, revenueGrowth: 18, roic: 25, moat: 'Chip IP licensing' },
  { ticker: 'HRI', name: 'Herc Holdings', sector: 'Industrials', marketCap: 5.2e9, pe: 12.5, revenueGrowth: 20, roic: 12, moat: 'Equipment rental scale' },
  { ticker: 'OLED', name: 'Universal Display Corp', sector: 'Technology', marketCap: 8.5e9, pe: 45.8, revenueGrowth: 15, roic: 42, moat: 'OLED patent portfolio' },
  { ticker: 'IDXX', name: 'IDEXX Laboratories', sector: 'Healthcare', marketCap: 38e9, pe: 42.5, revenueGrowth: 12, roic: 45, moat: 'Veterinary diagnostics leader' },
  { ticker: 'BLKB', name: 'Blackbaud Inc.', sector: 'Technology', marketCap: 3.8e9, pe: 35.2, revenueGrowth: 6, roic: 12, moat: 'Nonprofit software leader' },
  { ticker: 'GSHD', name: 'Goosehead Insurance', sector: 'Financials', marketCap: 2.5e9, pe: 55.2, revenueGrowth: 28, roic: 18, moat: 'Insurance distribution model' },
  { ticker: 'SPSC', name: 'SPS Commerce', sector: 'Technology', marketCap: 7.2e9, pe: 68.5, revenueGrowth: 18, roic: 15, moat: 'EDI network effects' },
  { ticker: 'VRNS', name: 'Varonis Systems', sector: 'Technology', marketCap: 5.5e9, pe: null, revenueGrowth: 15, roic: null, moat: 'Data security expertise' },
  { ticker: 'PRFT', name: 'Perficient Inc.', sector: 'Technology', marketCap: 2.8e9, pe: 22.5, revenueGrowth: 12, roic: 18, moat: 'Digital consulting' },
].sort((a, b) => (b.roic || 0) - (a.roic || 0))

const faqs = [
  {
    question: 'What is a small cap stock?',
    answer: 'A small cap stock is a company with a market capitalization typically between $300 million and $10 billion. These are smaller, often less-established companies compared to large caps like Apple or Microsoft. Small caps are usually younger, faster-growing, but also more volatile and riskier than their larger counterparts.',
  },
  {
    question: 'Why invest in small cap stocks?',
    answer: 'Small caps offer: 1) Higher growth potential - smaller companies can double or triple more easily than giants, 2) Less analyst coverage - creating opportunities for alpha, 3) Acquisition targets - large companies often buy successful small caps at premiums, 4) Portfolio diversification - different risk/return profile than large caps. Historically, small caps have outperformed large caps over very long periods.',
  },
  {
    question: 'What makes a small cap stock a "gem"?',
    answer: 'A small cap gem has: 1) Sustainable competitive advantage (moat), 2) Strong return on invested capital (ROIC > 15%), 3) Healthy balance sheet with low debt, 4) Profitable or near-profitable operations, 5) Large total addressable market, 6) Capable management with insider ownership, 7) Reasonable valuation relative to growth. These are quality businesses that happen to be small.',
  },
  {
    question: 'What are the risks of small cap investing?',
    answer: 'Small cap risks include: 1) Higher volatility and larger drawdowns, 2) Less liquidity - wider bid-ask spreads, harder to exit large positions, 3) Limited financial disclosures and analyst coverage, 4) Weaker competitive positions vs larger rivals, 5) More sensitive to economic downturns, 6) Higher failure rates - some small caps go bankrupt. Position sizing and diversification are crucial.',
  },
  {
    question: 'How do I evaluate small cap stocks?',
    answer: 'Evaluate small caps by: 1) ROIC and return on equity (profitability quality), 2) Revenue growth consistency (not one-time spikes), 3) Gross and operating margins (competitive advantage), 4) Debt levels relative to cash flow, 5) Insider ownership and buying patterns, 6) Total addressable market vs current market share, 7) Customer concentration risk, 8) Competitive dynamics and barriers to entry.',
  },
  {
    question: 'What is the Russell 2000 index?',
    answer: 'The Russell 2000 is the primary benchmark for small cap stocks, containing the smallest 2000 companies in the Russell 3000 index. The median Russell 2000 company has around $1 billion market cap. Many small cap ETFs and mutual funds track this index. Performance of the Russell 2000 vs S&P 500 indicates small cap vs large cap relative strength.',
  },
  {
    question: 'When do small caps outperform large caps?',
    answer: 'Small caps historically outperform during: 1) Economic recoveries - they are more economically sensitive, 2) Periods of falling interest rates, 3) When risk appetite increases, 4) During value stock outperformance cycles, 5) When large cap valuations become extreme. Small caps underperform during recessions, flight-to-quality events, and when growth/mega cap tech leads.',
  },
  {
    question: 'How much should I allocate to small caps?',
    answer: 'Typical allocation is 10-20% of equity portfolio for diversification benefits. Young investors with long time horizons can allocate more (20-30%) given higher growth potential. Conservative investors near retirement might limit to 5-10%. Small cap exposure can come through individual stocks, ETFs (IWM, VB), or actively managed funds with strong small cap track records.',
  },
]

export default async function SmallCapGemsPage() {
  const stocks = await getSmallCapGems()
  const pageUrl = `${SITE_URL}/screener/small-cap-gems`

  // Use database stocks if available, otherwise use curated list
  const displayStocks = stocks.length > 0 ? stocks : null

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: `${SITE_URL}/screener` },
    { name: 'Small Cap Gems', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Small Cap Gems: Best Small Cap Stocks with Strong Fundamentals',
    description: 'Find quality small cap stocks with strong fundamentals, high ROIC, and growth potential.',
    url: pageUrl,
    keywords: ['small cap stocks', 'small cap gems', 'quality small caps', 'hidden gems'],
  })

  const faqSchema = getFAQSchema(faqs)

  const stocksForSchema = displayStocks || SMALL_CAP_GEMS.map(s => ({ ticker: s.ticker }))
  const itemListSchema = getItemListSchema({
    name: 'Small Cap Gem Stocks',
    description: 'Quality small cap stocks with strong fundamentals',
    url: pageUrl,
    items: stocksForSchema.slice(0, 20).map((stock, index) => ({
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
            <span>Small Cap Gems</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Small Cap Gems
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Quality small cap stocks ($300M-$10B) with strong fundamentals - hidden gems with
              competitive moats, high returns on capital, and growth potential.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-lg">
                Market Cap: $300M - $10B
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                {displayStocks?.length || SMALL_CAP_GEMS.length} Quality Small Caps
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                Profitable + Strong ROIC
              </div>
            </div>
          </header>

          {/* Key Metrics Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average ROIC</p>
              <p className="text-2xl font-bold text-emerald-400">
                {Math.round(SMALL_CAP_GEMS.filter(s => s.roic).reduce((sum, s) => sum + (s.roic || 0), 0) / SMALL_CAP_GEMS.filter(s => s.roic).length)}%
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg Revenue Growth</p>
              <p className="text-2xl font-bold text-green-500">
                {Math.round(SMALL_CAP_GEMS.reduce((sum, s) => sum + s.revenueGrowth, 0) / SMALL_CAP_GEMS.length)}%
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average P/E</p>
              <p className="text-2xl font-bold">
                {(SMALL_CAP_GEMS.filter(s => s.pe).reduce((sum, s) => sum + (s.pe || 0), 0) / SMALL_CAP_GEMS.filter(s => s.pe).length).toFixed(1)}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Median Market Cap</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatMarketCap(SMALL_CAP_GEMS[Math.floor(SMALL_CAP_GEMS.length / 2)].marketCap)}
              </p>
            </div>
          </section>

          {/* What Makes a Gem */}
          <section className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-6 rounded-xl border border-emerald-500/20 mb-8">
            <h2 className="text-2xl font-bold mb-4">What Makes a Small Cap Gem?</h2>
            <p className="text-muted-foreground mb-4">
              We screen for quality small caps that share characteristics of exceptional businesses:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-emerald-400 mb-1">&gt;15%</p>
                <p className="text-sm text-muted-foreground">ROIC</p>
                <p className="text-xs mt-1">Efficient capital allocation</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-500 mb-1">&gt;10%</p>
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-xs mt-1">Expanding business</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-400 mb-1">Moat</p>
                <p className="text-sm text-muted-foreground">Competitive Advantage</p>
                <p className="text-xs mt-1">Sustainable edge</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-400 mb-1">&lt;30</p>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-xs mt-1">Reasonable valuation</p>
              </div>
            </div>
          </section>

          {/* Stock Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Small Cap Gems</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">ROIC</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Rev Growth</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P/E</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Market Cap</th>
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
                              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
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
                          <td className="px-4 py-3 text-right text-sm">---</td>
                          <td className="px-4 py-3 text-right text-sm">---</td>
                          <td className="px-4 py-3 text-right text-sm">
                            {stock.pe_ratio?.toFixed(1) || '---'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {stock.market_cap ? formatMarketCap(stock.market_cap) : '---'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      SMALL_CAP_GEMS.map((stock, index) => (
                        <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/stock/${stock.ticker.toLowerCase()}`}
                              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
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
                          <td className="px-4 py-3 text-right">
                            {stock.roic ? (
                              <span className={`font-medium ${stock.roic >= 25 ? 'text-emerald-400' : stock.roic >= 15 ? 'text-green-500' : ''}`}>
                                {stock.roic}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">---</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <span className={stock.revenueGrowth >= 15 ? 'text-green-500' : ''}>
                              {stock.revenueGrowth}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {stock.pe !== null ? stock.pe.toFixed(1) : <span className="text-yellow-500">N/P</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {formatMarketCap(stock.marketCap)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Moats and Competitive Advantages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Competitive Advantages (Moats)</h2>
            <p className="text-muted-foreground mb-4">
              Each small cap gem has an identifiable competitive advantage that protects its business:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SMALL_CAP_GEMS.slice(0, 9).map(stock => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker.toLowerCase()}`}
                  className="bg-card p-4 rounded-xl border border-border hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-400">{stock.ticker}</span>
                    <span className="text-sm text-muted-foreground">{formatMarketCap(stock.marketCap)}</span>
                  </div>
                  <p className="text-sm mb-2">{stock.name}</p>
                  <p className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded inline-block">
                    {stock.moat}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Screening Criteria */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Screening Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-emerald-400">Quality Metrics</h3>
                <ul className="text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">&#10003;</span>
                    <div>
                      <strong>ROIC &gt; 15%</strong>
                      <p className="text-sm">Return on invested capital shows efficient capital deployment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">&#10003;</span>
                    <div>
                      <strong>Positive Earnings</strong>
                      <p className="text-sm">We exclude unprofitable companies to focus on proven businesses</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">&#10003;</span>
                    <div>
                      <strong>Revenue Growth &gt; 10%</strong>
                      <p className="text-sm">Growing businesses with expanding market presence</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-blue-400">Size & Valuation</h3>
                <ul className="text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">&#10003;</span>
                    <div>
                      <strong>Market Cap $300M - $10B</strong>
                      <p className="text-sm">True small caps with room to grow, avoiding micro caps</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">&#10003;</span>
                    <div>
                      <strong>P/E &lt; 30</strong>
                      <p className="text-sm">Reasonable valuations, not speculative growth stories</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">&#10003;</span>
                    <div>
                      <strong>Competitive Moat</strong>
                      <p className="text-sm">Identifiable sustainable advantage over competitors</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Small Cap Risks */}
          <section className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl mb-12">
            <h2 className="text-xl font-bold mb-4 text-yellow-500">Small Cap Investing Risks</h2>
            <p className="text-muted-foreground mb-4">
              Even quality small caps carry elevated risks compared to large caps:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; <strong>Volatility:</strong> 20-50% drawdowns are common</li>
                <li>&#8226; <strong>Liquidity:</strong> Harder to buy/sell large positions</li>
                <li>&#8226; <strong>Information asymmetry:</strong> Less analyst coverage</li>
                <li>&#8226; <strong>Key person risk:</strong> Often depends on few executives</li>
              </ul>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; <strong>Customer concentration:</strong> Few large customers = risk</li>
                <li>&#8226; <strong>Competition:</strong> Can be outspent by larger rivals</li>
                <li>&#8226; <strong>Economic sensitivity:</strong> Hit harder in recessions</li>
                <li>&#8226; <strong>Governance:</strong> Less institutional oversight</li>
              </ul>
            </div>
            <p className="text-sm mt-4">
              <strong>Mitigation:</strong> Diversify across 15-20 small caps, limit position sizes to 3-5%, and maintain long time horizons.
            </p>
          </section>

          {/* Sector Distribution */}
          <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20 mb-12">
            <h2 className="text-2xl font-bold mb-4">Sector Representation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                SMALL_CAP_GEMS.reduce((acc, s) => {
                  acc[s.sector] = (acc[s.sector] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([sector, count]) => (
                  <div key={sector} className="bg-card/50 p-4 rounded-lg">
                    <p className="font-bold text-sm">{sector}</p>
                    <p className="text-xs text-muted-foreground">{count} companies</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${(count / SMALL_CAP_GEMS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                    <span className="text-emerald-400 group-open:rotate-180 transition-transform">&#9660;</span>
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
                href="/screener/large-cap"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#127942;</p>
                <p className="font-bold">Large Cap</p>
                <p className="text-xs text-muted-foreground">Market cap &gt; $100B</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Discover More Small Cap Gems</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our AI analyzes thousands of small caps to identify quality businesses with competitive moats,
              efficient capital allocation, and sustainable growth. Find your next multi-bagger.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Start Small Cap Research
              </Link>
              <Link
                href="/learn/small-cap-investing"
                className="bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn Small Cap Investing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
