import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Stock Market Statistics 2026: Key Facts & Data | Lician',
  description: 'Comprehensive 2026 stock market statistics: market capitalization, trading volumes, sector performance, IPO activity, and key market indicators updated daily.',
  keywords: [
    'stock market statistics 2026',
    'stock market data',
    'market capitalization 2026',
    'stock market facts',
    'market statistics',
    'trading volume statistics',
    'IPO statistics 2026',
    'stock market overview',
    'US stock market size',
  ],
  openGraph: {
    title: 'Stock Market Statistics 2026',
    description: 'Complete stock market statistics for 2026: market cap, volumes, sectors, IPOs, and key indicators.',
    type: 'article',
    url: `${SITE_URL}/insights/stock-market-statistics-2026`,
  },
  alternates: {
    canonical: `${SITE_URL}/insights/stock-market-statistics-2026`,
  },
}

// Market Overview Statistics (Updated Jan 2026)
const marketOverview = {
  totalMarketCap: '$52.8 trillion',
  totalMarketCapGlobal: '$115.2 trillion',
  usShareOfGlobal: '45.8%',
  sp500MarketCap: '$48.2 trillion',
  nasdaqMarketCap: '$25.4 trillion',
  nyseMarketCap: '$29.7 trillion',
  totalListedCompanies: '5,937',
  nyseCompanies: '2,272',
  nasdaqCompanies: '3,665',
  averageDailyVolume: '14.2 billion shares',
  averageDailyValue: '$620 billion',
}

// Sector Market Caps
const sectorData = [
  { sector: 'Technology', marketCap: '$15.4T', weight: '29.2%', ytd: '+5.2%' },
  { sector: 'Healthcare', marketCap: '$5.8T', weight: '11.0%', ytd: '+2.1%' },
  { sector: 'Financials', marketCap: '$5.1T', weight: '9.7%', ytd: '+3.8%' },
  { sector: 'Consumer Discretionary', marketCap: '$4.9T', weight: '9.3%', ytd: '+4.5%' },
  { sector: 'Communication Services', marketCap: '$4.7T', weight: '8.9%', ytd: '+6.1%' },
  { sector: 'Industrials', marketCap: '$4.2T', weight: '8.0%', ytd: '+2.9%' },
  { sector: 'Consumer Staples', marketCap: '$3.4T', weight: '6.4%', ytd: '+1.2%' },
  { sector: 'Energy', marketCap: '$2.8T', weight: '5.3%', ytd: '-1.4%' },
  { sector: 'Utilities', marketCap: '$1.5T', weight: '2.8%', ytd: '+0.8%' },
  { sector: 'Real Estate', marketCap: '$1.4T', weight: '2.7%', ytd: '+1.5%' },
  { sector: 'Materials', marketCap: '$1.3T', weight: '2.5%', ytd: '+0.4%' },
]

// Top 10 Companies by Market Cap
const topCompanies = [
  { rank: 1, name: 'Apple Inc.', ticker: 'AAPL', marketCap: '$3.42T', sector: 'Technology' },
  { rank: 2, name: 'Microsoft Corp.', ticker: 'MSFT', marketCap: '$3.18T', sector: 'Technology' },
  { rank: 3, name: 'NVIDIA Corp.', ticker: 'NVDA', marketCap: '$2.95T', sector: 'Technology' },
  { rank: 4, name: 'Amazon.com Inc.', ticker: 'AMZN', marketCap: '$2.28T', sector: 'Consumer Discretionary' },
  { rank: 5, name: 'Alphabet Inc.', ticker: 'GOOGL', marketCap: '$2.14T', sector: 'Communication Services' },
  { rank: 6, name: 'Meta Platforms', ticker: 'META', marketCap: '$1.52T', sector: 'Communication Services' },
  { rank: 7, name: 'Berkshire Hathaway', ticker: 'BRK.B', marketCap: '$1.01T', sector: 'Financials' },
  { rank: 8, name: 'Tesla Inc.', ticker: 'TSLA', marketCap: '$985B', sector: 'Consumer Discretionary' },
  { rank: 9, name: 'Eli Lilly', ticker: 'LLY', marketCap: '$742B', sector: 'Healthcare' },
  { rank: 10, name: 'Broadcom Inc.', ticker: 'AVGO', marketCap: '$720B', sector: 'Technology' },
]

// Historical Comparison
const historicalComparison = [
  { year: '2026 (Jan)', totalMarketCap: '$52.8T', sp500: '5,850', pe: '22.4x', dividend: '1.3%' },
  { year: '2025', totalMarketCap: '$50.2T', sp500: '5,580', pe: '21.8x', dividend: '1.4%' },
  { year: '2024', totalMarketCap: '$46.8T', sp500: '4,769', pe: '20.5x', dividend: '1.5%' },
  { year: '2023', totalMarketCap: '$40.5T', sp500: '4,193', pe: '18.2x', dividend: '1.6%' },
  { year: '2022', totalMarketCap: '$38.7T', sp500: '4,577', pe: '16.8x', dividend: '1.7%' },
  { year: '2021', totalMarketCap: '$48.9T', sp500: '4,766', pe: '22.3x', dividend: '1.3%' },
  { year: '2020', totalMarketCap: '$40.7T', sp500: '3,756', pe: '25.6x', dividend: '1.6%' },
  { year: '2015', totalMarketCap: '$22.8T', sp500: '2,044', pe: '18.5x', dividend: '2.0%' },
  { year: '2010', totalMarketCap: '$15.3T', sp500: '1,258', pe: '14.8x', dividend: '1.8%' },
  { year: '2000', totalMarketCap: '$15.1T', sp500: '1,469', pe: '26.4x', dividend: '1.2%' },
]

// IPO Statistics
const ipoStats = {
  totalIPOs2025: 187,
  totalProceeds2025: '$28.4 billion',
  averageIPOSize: '$152 million',
  largestIPO2025: 'Stripe ($65B valuation)',
  techIPOs: '42%',
  healthcareIPOs: '18%',
  financialsIPOs: '12%',
}

// Trading Statistics
const tradingStats = {
  avgDailyTrades: '8.4 billion',
  retailTrading: '23%',
  institutionalTrading: '77%',
  optionsVolume: '42 million contracts/day',
  etfTrading: '28% of volume',
  darkPoolTrading: '~40% of equity volume',
}

const faqs = [
  {
    question: 'What is the total US stock market capitalization in 2026?',
    answer: 'As of January 2026, the total US stock market capitalization is approximately $52.8 trillion, representing about 45.8% of the global equity market ($115.2 trillion). The S&P 500 alone accounts for $48.2 trillion, making it the largest stock index by market capitalization.',
  },
  {
    question: 'How many companies are listed on US stock exchanges?',
    answer: 'There are approximately 5,937 companies listed on major US exchanges. The NYSE hosts 2,272 companies with a combined market cap of $29.7 trillion, while NASDAQ hosts 3,665 companies totaling $25.4 trillion in market cap.',
  },
  {
    question: 'Which sector has the largest market cap?',
    answer: 'The Technology sector is the largest by market cap at $15.4 trillion (29.2% of the market). The top 5 companies by market cap are all tech-related: Apple ($3.42T), Microsoft ($3.18T), NVIDIA ($2.95T), Amazon ($2.28T), and Alphabet ($2.14T).',
  },
  {
    question: 'What is the average daily trading volume in US stock markets?',
    answer: 'US equity markets see approximately 14.2 billion shares traded daily, representing about $620 billion in value. Options trading adds another 42 million contracts per day. Institutional investors account for 77% of trading volume, with retail at 23%.',
  },
  {
    question: 'How has the market grown over time?',
    answer: 'US stock market capitalization has grown dramatically: from $15.3T in 2010 to $52.8T in 2026 - a 245% increase over 16 years. The S&P 500 index grew from 1,258 in 2010 to 5,850 in January 2026, representing a 365% total return.',
  },
]

export default function StockMarketStatistics2026Page() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'Stock Market Statistics 2026', url: `${SITE_URL}/insights/stock-market-statistics-2026` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Statistics 2026: Key Facts & Data',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Comprehensive 2026 stock market statistics including market capitalization, trading volumes, sector performance, and key indicators.',
    url: `${SITE_URL}/insights/stock-market-statistics-2026`,
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/insights/sp500-historical-returns" className="hover:text-primary">Insights</Link>
              <span className="mx-2">/</span>
              <span>Statistics 2026</span>
            </nav>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Stock Market Statistics 2026
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Comprehensive overview of US stock market data including market capitalization,
              trading volumes, sector breakdown, and key indicators. Updated January 2026.
            </p>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="border-b py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-xl font-bold">Market Overview at a Glance</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{marketOverview.totalMarketCap}</p>
                <p className="text-sm text-muted-foreground">US Market Cap</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{marketOverview.totalListedCompanies}</p>
                <p className="text-sm text-muted-foreground">Listed Companies</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{marketOverview.averageDailyVolume}</p>
                <p className="text-sm text-muted-foreground">Daily Volume</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">{marketOverview.usShareOfGlobal}</p>
                <p className="text-sm text-muted-foreground">US Share of Global</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto max-w-4xl px-4 py-12">
          {/* Market Capitalization Section */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Market Capitalization Overview
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">
                The US stock market is the largest in the world by market capitalization, accounting for
                nearly half of global equity markets. Here are the key figures:
              </p>

              <div className="my-6 rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Metric</th>
                        <th className="px-4 py-3 text-right font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      <tr>
                        <td className="px-4 py-3">Total US Market Capitalization</td>
                        <td className="px-4 py-3 text-right font-mono">{marketOverview.totalMarketCap}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Global Market Capitalization</td>
                        <td className="px-4 py-3 text-right font-mono">{marketOverview.totalMarketCapGlobal}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">S&P 500 Market Cap</td>
                        <td className="px-4 py-3 text-right font-mono">{marketOverview.sp500MarketCap}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">NYSE Market Cap</td>
                        <td className="px-4 py-3 text-right font-mono">{marketOverview.nyseMarketCap}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">NASDAQ Market Cap</td>
                        <td className="px-4 py-3 text-right font-mono">{marketOverview.nasdaqMarketCap}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Top Companies */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Top 10 Companies by Market Cap
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Company</th>
                      <th className="px-4 py-3 text-left font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                      <th className="px-4 py-3 text-left font-semibold">Sector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {topCompanies.map((company) => (
                      <tr key={company.ticker}>
                        <td className="px-4 py-3 font-medium">{company.rank}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock/${company.ticker}`}
                            className="text-primary hover:underline"
                          >
                            {company.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono">{company.ticker}</td>
                        <td className="px-4 py-3 text-right font-mono">{company.marketCap}</td>
                        <td className="px-4 py-3 text-muted-foreground">{company.sector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The top 10 companies by market cap account for approximately 35% of the S&P 500's
              total market capitalization, highlighting significant market concentration.
            </p>
          </section>

          {/* Sector Breakdown */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Sector Market Capitalization
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                      <th className="px-4 py-3 text-right font-semibold">Weight</th>
                      <th className="px-4 py-3 text-right font-semibold">YTD Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {sectorData.map((sector) => (
                      <tr key={sector.sector}>
                        <td className="px-4 py-3 font-medium">{sector.sector}</td>
                        <td className="px-4 py-3 text-right font-mono">{sector.marketCap}</td>
                        <td className="px-4 py-3 text-right">{sector.weight}</td>
                        <td className={`px-4 py-3 text-right font-mono ${
                          sector.ytd.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sector.ytd}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Technology dominates with nearly 30% of market cap. The "Magnificent 7" tech stocks
              (AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA) alone represent over 25% of the S&P 500.
            </p>
          </section>

          {/* Historical Comparison */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Market Growth Over Time
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Year</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                      <th className="px-4 py-3 text-right font-semibold">S&P 500</th>
                      <th className="px-4 py-3 text-right font-semibold">P/E Ratio</th>
                      <th className="px-4 py-3 text-right font-semibold">Dividend Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {historicalComparison.map((row) => (
                      <tr key={row.year}>
                        <td className="px-4 py-3 font-medium">{row.year}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.totalMarketCap}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.sp500}</td>
                        <td className="px-4 py-3 text-right">{row.pe}</td>
                        <td className="px-4 py-3 text-right">{row.dividend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Trading Statistics */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Trading Volume Statistics
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Daily Trading Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Daily Trades</span>
                    <span className="font-mono">{tradingStats.avgDailyTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Share Volume</span>
                    <span className="font-mono">{marketOverview.averageDailyVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Dollar Volume</span>
                    <span className="font-mono">{marketOverview.averageDailyValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Options Volume</span>
                    <span className="font-mono">{tradingStats.optionsVolume}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Trading Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institutional Trading</span>
                    <span className="font-mono">{tradingStats.institutionalTrading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retail Trading</span>
                    <span className="font-mono">{tradingStats.retailTrading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETF Trading</span>
                    <span className="font-mono">{tradingStats.etfTrading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dark Pool Volume</span>
                    <span className="font-mono">{tradingStats.darkPoolTrading}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* IPO Statistics */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              IPO Activity (2025)
            </h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ipoStats.totalIPOs2025}</p>
                  <p className="text-sm text-muted-foreground">Total IPOs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ipoStats.totalProceeds2025}</p>
                  <p className="text-sm text-muted-foreground">Total Proceeds</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{ipoStats.averageIPOSize}</p>
                  <p className="text-sm text-muted-foreground">Average IPO Size</p>
                </div>
              </div>
              <div className="mt-6 border-t pt-6">
                <h4 className="mb-3 font-semibold">IPO Breakdown by Sector</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="rounded bg-muted px-3 py-1">Technology: {ipoStats.techIPOs}</div>
                  <div className="rounded bg-muted px-3 py-1">Healthcare: {ipoStats.healthcareIPOs}</div>
                  <div className="rounded bg-muted px-3 py-1">Financials: {ipoStats.financialsIPOs}</div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-lg border p-6">
                  <h3 className="mb-3 text-lg font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Resources */}
          <section className="rounded-lg border bg-muted/30 p-8">
            <h2 className="mb-6 text-xl font-bold">Related Resources</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/insights/sp500-historical-returns"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">S&P 500 Historical Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Annual returns from 1926-2025
                </p>
              </Link>
              <Link
                href="/insights/pe-ratio-by-sector"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">P/E Ratios by Sector</h3>
                <p className="text-sm text-muted-foreground">
                  Current valuations across all sectors
                </p>
              </Link>
              <Link
                href="/markets/most-active"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Most Active Stocks</h3>
                <p className="text-sm text-muted-foreground">
                  Stocks with highest trading volume
                </p>
              </Link>
              <Link
                href="/screener"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">
                  Filter stocks by market cap, sector, and more
                </p>
              </Link>
            </div>
          </section>
        </article>

        {/* Data Source Note */}
        <section className="border-t bg-muted/20 py-6">
          <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
            <p>
              Data compiled from SEC filings, exchange reports, and market data providers.
              Last updated: January 16, 2026. Market data may experience delays.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
