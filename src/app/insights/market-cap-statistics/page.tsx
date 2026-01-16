import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Market Cap Statistics: Largest Companies & Market Cap Tiers | Lician',
  description: 'Comprehensive market capitalization statistics: largest US companies by market cap, mega/large/mid/small cap definitions, concentration metrics, and market cap distribution data.',
  keywords: [
    'market cap statistics',
    'largest companies by market cap',
    'market capitalization',
    'mega cap stocks',
    'large cap stocks',
    'market cap tiers',
    'trillion dollar companies',
    'biggest companies in the world',
    'market cap distribution',
  ],
  openGraph: {
    title: 'Market Cap Statistics - Largest Companies & Cap Tiers',
    description: 'Complete guide to market capitalization: largest companies, cap tiers, concentration metrics, and distribution analysis.',
    type: 'article',
    url: `${SITE_URL}/insights/market-cap-statistics`,
  },
  alternates: {
    canonical: `${SITE_URL}/insights/market-cap-statistics`,
  },
}

// Market Cap Tier Definitions
const marketCapTiers = [
  {
    tier: 'Mega Cap',
    definition: '$200B+',
    examples: 'AAPL, MSFT, NVDA, GOOGL, AMZN',
    count: '~40 companies',
    totalMarketCap: '$32.5T',
    percentOfMarket: '61.5%',
  },
  {
    tier: 'Large Cap',
    definition: '$10B - $200B',
    examples: 'NFLX, AMD, UBER, INTC, CVS',
    count: '~450 companies',
    totalMarketCap: '$14.8T',
    percentOfMarket: '28.0%',
  },
  {
    tier: 'Mid Cap',
    definition: '$2B - $10B',
    examples: 'LYFT, ETSY, SNAP, ROKU',
    count: '~800 companies',
    totalMarketCap: '$4.2T',
    percentOfMarket: '8.0%',
  },
  {
    tier: 'Small Cap',
    definition: '$300M - $2B',
    examples: 'Various growth stocks',
    count: '~2,200 companies',
    totalMarketCap: '$1.2T',
    percentOfMarket: '2.3%',
  },
  {
    tier: 'Micro Cap',
    definition: '$50M - $300M',
    examples: 'Emerging companies',
    count: '~1,800 companies',
    totalMarketCap: '$130B',
    percentOfMarket: '0.2%',
  },
  {
    tier: 'Nano Cap',
    definition: '<$50M',
    examples: 'Very small companies',
    count: '~700 companies',
    totalMarketCap: '$8B',
    percentOfMarket: '<0.1%',
  },
]

// Trillion Dollar Club
const trillionDollarClub = [
  { name: 'Apple Inc.', ticker: 'AAPL', marketCap: '$3.42T', yearJoined: 2018, peakCap: '$3.5T' },
  { name: 'Microsoft Corp.', ticker: 'MSFT', marketCap: '$3.18T', yearJoined: 2019, peakCap: '$3.3T' },
  { name: 'NVIDIA Corp.', ticker: 'NVDA', marketCap: '$2.95T', yearJoined: 2024, peakCap: '$3.4T' },
  { name: 'Amazon.com Inc.', ticker: 'AMZN', marketCap: '$2.28T', yearJoined: 2020, peakCap: '$2.5T' },
  { name: 'Alphabet Inc.', ticker: 'GOOGL', marketCap: '$2.14T', yearJoined: 2020, peakCap: '$2.3T' },
  { name: 'Meta Platforms', ticker: 'META', marketCap: '$1.52T', yearJoined: 2024, peakCap: '$1.6T' },
  { name: 'Berkshire Hathaway', ticker: 'BRK.B', marketCap: '$1.01T', yearJoined: 2024, peakCap: '$1.05T' },
]

// Market Concentration
const marketConcentration = [
  { companies: 'Top 1', percentOfSP500: '7.1%', percentOfUSMarket: '6.5%' },
  { companies: 'Top 5', percentOfSP500: '26.8%', percentOfUSMarket: '24.5%' },
  { companies: 'Top 10', percentOfSP500: '35.2%', percentOfUSMarket: '32.1%' },
  { companies: 'Top 25', percentOfSP500: '48.1%', percentOfUSMarket: '43.8%' },
  { companies: 'Top 50', percentOfSP500: '57.3%', percentOfUSMarket: '52.1%' },
  { companies: 'Top 100', percentOfSP500: '70.8%', percentOfUSMarket: '64.2%' },
]

// Historical Largest Companies
const historicalLargest = [
  { year: 2026, company: 'Apple', ticker: 'AAPL', marketCap: '$3.42T' },
  { year: 2024, company: 'Apple', ticker: 'AAPL', marketCap: '$2.8T' },
  { year: 2022, company: 'Apple', ticker: 'AAPL', marketCap: '$2.1T' },
  { year: 2020, company: 'Apple', ticker: 'AAPL', marketCap: '$2.0T' },
  { year: 2018, company: 'Apple', ticker: 'AAPL', marketCap: '$1.0T' },
  { year: 2016, company: 'Apple', ticker: 'AAPL', marketCap: '$580B' },
  { year: 2014, company: 'Apple', ticker: 'AAPL', marketCap: '$640B' },
  { year: 2012, company: 'Apple', ticker: 'AAPL', marketCap: '$500B' },
  { year: 2010, company: 'Exxon Mobil', ticker: 'XOM', marketCap: '$368B' },
  { year: 2008, company: 'Exxon Mobil', ticker: 'XOM', marketCap: '$492B' },
  { year: 2000, company: 'GE', ticker: 'GE', marketCap: '$475B' },
  { year: 1990, company: 'Nippon Telegraph', ticker: 'N/A', marketCap: '$164B' },
]

// Global Comparison
const globalComparison = [
  { rank: 1, company: 'Apple', country: 'USA', marketCap: '$3.42T' },
  { rank: 2, company: 'Microsoft', country: 'USA', marketCap: '$3.18T' },
  { rank: 3, company: 'NVIDIA', country: 'USA', marketCap: '$2.95T' },
  { rank: 4, company: 'Saudi Aramco', country: 'Saudi Arabia', marketCap: '$2.1T' },
  { rank: 5, company: 'Amazon', country: 'USA', marketCap: '$2.28T' },
  { rank: 6, company: 'Alphabet', country: 'USA', marketCap: '$2.14T' },
  { rank: 7, company: 'Meta Platforms', country: 'USA', marketCap: '$1.52T' },
  { rank: 8, company: 'TSMC', country: 'Taiwan', marketCap: '$920B' },
  { rank: 9, company: 'Berkshire Hathaway', country: 'USA', marketCap: '$1.01T' },
  { rank: 10, company: 'Eli Lilly', country: 'USA', marketCap: '$742B' },
]

const faqs = [
  {
    question: 'What is the largest company by market cap?',
    answer: 'As of January 2026, Apple Inc. (AAPL) is the largest company by market capitalization at approximately $3.42 trillion. Apple first reached the $1 trillion milestone in 2018 and became the first company to reach $3 trillion in 2022.',
  },
  {
    question: 'How many trillion-dollar companies are there?',
    answer: 'As of January 2026, there are 7 companies with market capitalizations exceeding $1 trillion: Apple ($3.42T), Microsoft ($3.18T), NVIDIA ($2.95T), Amazon ($2.28T), Alphabet ($2.14T), Meta ($1.52T), and Berkshire Hathaway ($1.01T). Tesla briefly joined this club in 2021 but has since dropped below.',
  },
  {
    question: 'What is the difference between large cap and mega cap stocks?',
    answer: 'Large cap stocks typically have market caps between $10 billion and $200 billion, while mega cap stocks exceed $200 billion. Mega cap companies represent about 40 companies but account for over 60% of total US market capitalization. Large caps include established but not dominant companies like Netflix, AMD, and Uber.',
  },
  {
    question: 'How concentrated is the stock market?',
    answer: 'The US stock market is highly concentrated. The top 10 companies represent 35.2% of the S&P 500 and 32.1% of total US market cap. The "Magnificent 7" tech stocks (AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA) alone account for approximately 30% of the S&P 500.',
  },
  {
    question: 'What defines a small cap vs mid cap stock?',
    answer: 'Small cap stocks have market capitalizations between $300 million and $2 billion, while mid cap stocks range from $2 billion to $10 billion. Small caps represent about 2.3% of total market cap despite numbering over 2,200 companies. Mid caps offer a balance of growth potential and stability.',
  },
]

export default function MarketCapStatisticsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'Market Cap Statistics', url: `${SITE_URL}/insights/market-cap-statistics` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Market Cap Statistics: Largest Companies & Market Cap Tiers',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Comprehensive market capitalization statistics: largest companies, cap tiers, concentration metrics, and distribution analysis.',
    url: `${SITE_URL}/insights/market-cap-statistics`,
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
              <span>Market Cap Statistics</span>
            </nav>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Market Cap Statistics
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Comprehensive guide to market capitalization: largest companies, cap tiers,
              concentration metrics, and the trillion-dollar club. Updated January 2026.
            </p>
          </div>
        </section>

        {/* Trillion Dollar Club Highlight */}
        <section className="border-b bg-gradient-to-r from-yellow-500/10 to-orange-500/10 py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-4 text-center text-xl font-bold">The Trillion Dollar Club</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Only 7 companies have market caps exceeding $1 trillion
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trillionDollarClub.map((company) => (
                <Link
                  key={company.ticker}
                  href={`/stock/${company.ticker}`}
                  className="rounded-lg border bg-card px-4 py-2 text-center transition-colors hover:border-primary"
                >
                  <p className="font-semibold">{company.ticker}</p>
                  <p className="text-xs text-muted-foreground">{company.marketCap}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto max-w-4xl px-4 py-12">
          {/* Market Cap Tiers */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Market Cap Tier Definitions
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">
                Stocks are classified into tiers based on their total market capitalization.
                Understanding these tiers helps investors assess risk, growth potential, and liquidity.
              </p>

              <div className="my-6 rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Tier</th>
                        <th className="px-4 py-3 text-left font-semibold">Market Cap Range</th>
                        <th className="px-4 py-3 text-right font-semibold">Companies</th>
                        <th className="px-4 py-3 text-right font-semibold">Total Cap</th>
                        <th className="px-4 py-3 text-right font-semibold">% of Market</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {marketCapTiers.map((tier) => (
                        <tr key={tier.tier}>
                          <td className="px-4 py-3 font-medium">{tier.tier}</td>
                          <td className="px-4 py-3">{tier.definition}</td>
                          <td className="px-4 py-3 text-right">{tier.count}</td>
                          <td className="px-4 py-3 text-right font-mono">{tier.totalMarketCap}</td>
                          <td className="px-4 py-3 text-right font-mono">{tier.percentOfMarket}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border bg-blue-500/10 p-6">
                <h4 className="mb-2 font-semibold text-blue-700 dark:text-blue-400">Key Insight</h4>
                <p className="text-sm text-muted-foreground">
                  Mega cap stocks (~40 companies) represent just 0.7% of all listed companies
                  but account for 61.5% of total market capitalization. This extreme concentration
                  means index fund performance is heavily influenced by a handful of companies.
                </p>
              </div>
            </div>
          </section>

          {/* Trillion Dollar Club Detail */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Trillion Dollar Companies
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Company</th>
                      <th className="px-4 py-3 text-center font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                      <th className="px-4 py-3 text-center font-semibold">Year Joined</th>
                      <th className="px-4 py-3 text-right font-semibold">Peak Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {trillionDollarClub.map((company) => (
                      <tr key={company.ticker}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock/${company.ticker}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {company.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{company.ticker}</td>
                        <td className="px-4 py-3 text-right font-mono">{company.marketCap}</td>
                        <td className="px-4 py-3 text-center">{company.yearJoined}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{company.peakCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Timeline:</strong> Apple became the first company to reach $1T (2018), $2T (2020), and $3T (2022).
              NVIDIA was the fastest to reach $1T after going public, achieving this in just 5 years from its 2019 $100B valuation.
            </p>
          </section>

          {/* Market Concentration */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Market Concentration Statistics
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-muted-foreground">
                The US stock market shows significant concentration at the top. Here's how
                the largest companies dominate market capitalization:
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3 font-semibold">
                    S&P 500 Concentration
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y text-sm">
                        {marketConcentration.map((row) => (
                          <tr key={row.companies}>
                            <td className="px-4 py-2">{row.companies}</td>
                            <td className="px-4 py-2 text-right font-mono">{row.percentOfSP500}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="border-b bg-muted/50 px-4 py-3 font-semibold">
                    Total US Market Concentration
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y text-sm">
                        {marketConcentration.map((row) => (
                          <tr key={row.companies}>
                            <td className="px-4 py-2">{row.companies}</td>
                            <td className="px-4 py-2 text-right font-mono">{row.percentOfUSMarket}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6">
                <h4 className="mb-2 font-semibold text-yellow-700 dark:text-yellow-400">
                  Magnificent 7 Dominance
                </h4>
                <p className="text-sm text-muted-foreground">
                  The "Magnificent 7" (Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Tesla)
                  represent approximately <strong>30% of the S&P 500</strong> by market cap.
                  This concentration means that these seven stocks significantly influence
                  the performance of index funds and the broader market.
                </p>
              </div>
            </div>
          </section>

          {/* Historical Largest */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Largest Company by Market Cap: Historical
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Year</th>
                      <th className="px-4 py-3 text-left font-semibold">Company</th>
                      <th className="px-4 py-3 text-center font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {historicalLargest.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium">{row.year}</td>
                        <td className="px-4 py-3">{row.company}</td>
                        <td className="px-4 py-3 text-center font-mono">{row.ticker}</td>
                        <td className="px-4 py-3 text-right font-mono">{row.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Apple has dominated the #1 position since 2011 (with brief exceptions). Before the tech era,
              companies like Exxon Mobil (oil), GE (conglomerate), and Nippon Telegraph (telecom) held the top spot.
            </p>
          </section>

          {/* Global Comparison */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Global Top 10 by Market Cap
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Company</th>
                      <th className="px-4 py-3 text-left font-semibold">Country</th>
                      <th className="px-4 py-3 text-right font-semibold">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {globalComparison.map((company) => (
                      <tr key={company.rank}>
                        <td className="px-4 py-3 text-center font-medium">{company.rank}</td>
                        <td className="px-4 py-3 font-medium">{company.company}</td>
                        <td className="px-4 py-3 text-muted-foreground">{company.country}</td>
                        <td className="px-4 py-3 text-right font-mono">{company.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              8 of the top 10 global companies are US-based, highlighting US market dominance.
              Non-US entries include Saudi Aramco (Saudi Arabia) and TSMC (Taiwan).
            </p>
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
                href="/insights/stock-market-statistics-2026"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Stock Market Statistics 2026</h3>
                <p className="text-sm text-muted-foreground">
                  Complete market overview with volumes and IPOs
                </p>
              </Link>
              <Link
                href="/insights/pe-ratio-by-sector"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">P/E Ratios by Sector</h3>
                <p className="text-sm text-muted-foreground">
                  Valuations across all 11 GICS sectors
                </p>
              </Link>
              <Link
                href="/screener"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">
                  Filter stocks by market cap tier
                </p>
              </Link>
              <Link
                href="/markets/most-active"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Most Active Stocks</h3>
                <p className="text-sm text-muted-foreground">
                  Today's highest volume stocks
                </p>
              </Link>
            </div>
          </section>
        </article>

        {/* Data Source Note */}
        <section className="border-t bg-muted/20 py-6">
          <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
            <p>
              Market cap data compiled from exchange filings and market data providers.
              Last updated: January 16, 2026. Values fluctuate with stock prices.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
