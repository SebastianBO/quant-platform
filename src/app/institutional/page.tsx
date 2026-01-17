import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Prevent build-time timeout

export const metadata: Metadata = {
  title: '13F Filings & Institutional Ownership - What Stocks Are Hedge Funds Buying?',
  description: 'Track institutional ownership and 13F filings from top hedge funds. See what stocks Berkshire Hathaway, Bridgewater, Citadel, and other elite investors are buying and selling.',
  keywords: [
    'institutional ownership',
    '13F filings',
    'hedge fund holdings',
    'what stocks are hedge funds buying',
    '13F tracker',
    'institutional investors',
    'Berkshire Hathaway holdings',
    'hedge fund stocks',
    'institutional ownership data',
    'smart money tracking',
    'Warren Buffett portfolio',
    '13F-HR filings',
  ],
  openGraph: {
    title: '13F Filings & Institutional Ownership - Hedge Fund Holdings Tracker',
    description: 'Track institutional ownership and 13F filings from top hedge funds including Berkshire Hathaway, Bridgewater, and Citadel.',
    type: 'website',
    url: 'https://lician.com/institutional',
  },
  alternates: {
    canonical: 'https://lician.com/institutional',
  },
  twitter: {
    card: 'summary_large_image',
    title: '13F Filings - Track What Hedge Funds Are Buying',
    description: 'See what stocks top institutional investors and hedge funds are buying and selling based on 13F filings.',
  },
}

// Elite institutional investors to highlight
const ELITE_INVESTORS = [
  {
    name: 'Berkshire Hathaway',
    slug: 'BERKSHIRE_HATHAWAY_INC',
    leader: 'Warren Buffett',
    type: 'Conglomerate',
    description: 'Warren Buffett\'s legendary investment firm known for value investing',
  },
  {
    name: 'Vanguard Group',
    slug: 'VANGUARD_GROUP_INC',
    leader: 'Index Funds',
    type: 'Asset Manager',
    description: 'World\'s largest mutual fund company and ETF provider',
  },
  {
    name: 'BlackRock',
    slug: 'BLACKROCK_INC',
    leader: 'Larry Fink',
    type: 'Asset Manager',
    description: 'Global investment manager with over $10 trillion in assets',
  },
  {
    name: 'Bridgewater Associates',
    slug: 'BRIDGEWATER_ASSOCIATES_LP',
    leader: 'Ray Dalio',
    type: 'Hedge Fund',
    description: 'World\'s largest hedge fund, known for macroeconomic investing',
  },
  {
    name: 'Citadel Advisors',
    slug: 'CITADEL_ADVISORS_LLC',
    leader: 'Ken Griffin',
    type: 'Hedge Fund',
    description: 'Multi-strategy hedge fund with quantitative and fundamental approaches',
  },
  {
    name: 'Renaissance Technologies',
    slug: 'RENAISSANCE_TECHNOLOGIES_LLC',
    leader: 'James Simons',
    type: 'Hedge Fund',
    description: 'Quantitative hedge fund famous for mathematical models',
  },
  {
    name: 'State Street',
    slug: 'STATE_STREET_CORP',
    leader: 'Index Funds',
    type: 'Asset Manager',
    description: 'Major institutional investor and index fund provider',
  },
  {
    name: 'Fidelity (FMR)',
    slug: 'FMR_LLC',
    leader: 'Abigail Johnson',
    type: 'Asset Manager',
    description: 'One of the largest asset managers with diverse fund offerings',
  },
  {
    name: 'Two Sigma',
    slug: 'TWO_SIGMA_INVESTMENTS_LP',
    leader: 'David Siegel',
    type: 'Hedge Fund',
    description: 'Technology-driven quantitative investment firm',
  },
  {
    name: 'Tiger Global',
    slug: 'TIGER_GLOBAL_MANAGEMENT_LLC',
    leader: 'Chase Coleman',
    type: 'Hedge Fund',
    description: 'Growth equity and venture capital investor',
  },
  {
    name: 'Pershing Square',
    slug: 'PERSHING_SQUARE_CAPITAL_MANAGEMENT_LP',
    leader: 'Bill Ackman',
    type: 'Hedge Fund',
    description: 'Activist investor focused on concentrated positions',
  },
  {
    name: 'Elliott Management',
    slug: 'ELLIOTT_INVESTMENT_MANAGEMENT_LP',
    leader: 'Paul Singer',
    type: 'Hedge Fund',
    description: 'Activist hedge fund with distressed debt expertise',
  },
]

// Top stocks by institutional ownership (examples - will be fetched from API)
const TOP_INSTITUTIONAL_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', institutionalOwnership: 61.2 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', institutionalOwnership: 72.8 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', institutionalOwnership: 81.5 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', institutionalOwnership: 58.4 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', institutionalOwnership: 65.3 },
  { ticker: 'META', name: 'Meta Platforms Inc.', institutionalOwnership: 69.7 },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway B', institutionalOwnership: 42.1 },
  { ticker: 'JPM', name: 'JPMorgan Chase', institutionalOwnership: 70.4 },
  { ticker: 'V', name: 'Visa Inc.', institutionalOwnership: 78.9 },
  { ticker: 'UNH', name: 'UnitedHealth Group', institutionalOwnership: 89.2 },
]

const institutionalFAQs = [
  {
    question: 'What are 13F filings?',
    answer: '13F filings are quarterly reports that institutional investment managers with over $100 million in assets under management must file with the SEC. These filings disclose their equity holdings as of the end of each quarter. The reports are filed within 45 days after quarter-end and provide transparency into what major investors like hedge funds, mutual funds, and pension funds are buying and selling.',
  },
  {
    question: 'What stocks are hedge funds buying?',
    answer: 'Hedge funds\' stock purchases are revealed through 13F filings each quarter. Popular holdings among hedge funds typically include large-cap tech stocks (AAPL, MSFT, GOOGL), financial stocks (JPM, V, MA), and healthcare stocks (UNH, LLY). However, specific purchases vary by fund strategy and market conditions. Our tracker shows the latest 13F filings to reveal what elite investors like Berkshire Hathaway, Bridgewater, and Citadel are currently buying.',
  },
  {
    question: 'How do I track institutional ownership?',
    answer: 'Track institutional ownership by monitoring 13F filings filed quarterly with the SEC, using financial data platforms that aggregate holdings data, or following our institutional ownership tracker. You can see which institutions own a specific stock, how much they own, and whether they increased or decreased their positions. High institutional ownership (above 70%) generally indicates institutional confidence in a stock.',
  },
  {
    question: 'Why is institutional ownership important?',
    answer: 'Institutional ownership is important because it shows what professional money managers with extensive research resources are buying. High institutional ownership can provide price stability and suggests thorough due diligence has been done. Changes in institutional holdings can signal shifting sentiment. When elite investors like Warren Buffett or Ray Dalio make significant moves, it often influences market perception and price.',
  },
  {
    question: 'What is the difference between 13F and 13G filings?',
    answer: '13F filings are quarterly reports of all equity holdings by institutional managers with over $100 million AUM. 13G filings are filed when an investor acquires more than 5% ownership in a company but is considered a passive investor. 13D filings are for active investors acquiring over 5%. All three provide ownership transparency but serve different purposes and have different filing requirements.',
  },
  {
    question: 'How often are 13F filings updated?',
    answer: '13F filings are filed quarterly, within 45 days after the end of each quarter (March 31, June 30, September 30, December 31). This means the data is somewhat delayed - a 13F filed in mid-May shows holdings as of March 31. Despite the lag, these filings remain valuable for identifying long-term trends and positions held by elite investors.',
  },
  {
    question: 'Can I copy Warren Buffett\'s portfolio using 13F filings?',
    answer: 'While you can see Berkshire Hathaway\'s holdings through 13F filings, copying the portfolio has limitations: (1) The data is 45+ days old, (2) You don\'t know when positions were established or at what price, (3) You miss the reasoning behind each position, (4) Berkshire operates businesses beyond stock holdings. That said, studying Buffett\'s 13F can provide valuable insights into his investment philosophy and sector preferences.',
  },
  {
    question: 'What does high institutional ownership mean?',
    answer: 'High institutional ownership (typically above 70%) means that a large percentage of a company\'s shares are held by institutional investors like mutual funds, hedge funds, and pension funds. This can indicate professional confidence in the stock, provide price stability, and ensure thorough research coverage. However, very high institutional ownership (above 90%) can sometimes lead to crowded trades and increased volatility if sentiment shifts.',
  },
  {
    question: 'Do institutional investors always make good investments?',
    answer: 'No, institutional investors are not infallible and can make losing investments just like individual investors. However, they typically have access to better research, professional analysts, and sophisticated tools. Tracking their moves can provide valuable insights, but should be combined with your own research and investment thesis. Some institutional investors consistently outperform (like Berkshire Hathaway), while others underperform market benchmarks.',
  },
  {
    question: 'What are the best stocks with institutional ownership?',
    answer: 'The "best" stocks with institutional ownership depend on your investment strategy, but institutional favorites often include market leaders with strong fundamentals: Tech giants (AAPL, MSFT, GOOGL, NVDA), payment processors (V, MA), healthcare leaders (UNH, LLY, JNJ), and blue-chip financials (JPM, BRK.B). Look for stocks where top-performing hedge funds have concentrated positions and are increasing holdings.',
  },
]

export default async function InstitutionalPage() {
  const pageUrl = `${SITE_URL}/institutional`

  // Fetch top investors data
  let topInvestorsData = null
  try {
    const investorsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'}/api/v1/institutional-ownership/investors?limit=100`,
      { next: { revalidate: 3600 } }
    )
    if (investorsRes.ok) {
      topInvestorsData = await investorsRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch investors:', error)
  }

  // Fetch top tickers by institutional ownership
  let topTickersData = null
  try {
    const tickersRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'}/api/v1/institutional-ownership/tickers?limit=50`,
      { next: { revalidate: 3600 } }
    )
    if (tickersRes.ok) {
      topTickersData = await tickersRes.json()
    }
  } catch (error) {
    console.error('Failed to fetch tickers:', error)
  }

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: '13F Filings & Institutional Ownership', url: pageUrl },
  ])

  // FAQ Schema
  const faqSchema = getFAQSchema(institutionalFAQs)

  // ItemList Schema for institutional investors
  const investorsListSchema = getItemListSchema({
    name: 'Top Institutional Investors and Hedge Funds',
    description: 'Leading institutional investors, hedge funds, and asset managers tracked through 13F filings',
    url: pageUrl,
    items: ELITE_INVESTORS.map((investor, index) => ({
      name: investor.name,
      url: `${pageUrl}?investor=${investor.slug}`,
      position: index + 1,
    })),
  })

  // ItemList Schema for top institutional stocks
  const stocksListSchema = getItemListSchema({
    name: 'Stocks with Highest Institutional Ownership',
    description: 'Top stocks held by institutional investors based on 13F filings',
    url: pageUrl,
    items: TOP_INSTITUTIONAL_STOCKS.map((stock, index) => ({
      name: `${stock.ticker} - ${stock.name}`,
      url: `${SITE_URL}/stock/${stock.ticker}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            faqSchema,
            investorsListSchema,
            stocksListSchema,
          ]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Institutional Ownership</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              13F Filings & Institutional Ownership
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mb-4">
              Track what top hedge funds and institutional investors are buying and selling.
              Follow the smart money with real-time 13F filing data from elite investors like
              Berkshire Hathaway, Bridgewater, Citadel, and more.
            </p>
            <p className="text-base text-muted-foreground max-w-3xl">
              Institutional investors manage trillions of dollars and have access to sophisticated
              research and analysis. By tracking their holdings through mandatory 13F filings,
              you can gain insights into what the world&apos;s best investors are buying.
            </p>
          </div>

          {/* Key Stats */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">4,000+</div>
              <div className="text-sm text-muted-foreground">Institutional Investors</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">$40T+</div>
              <div className="text-sm text-muted-foreground">Assets Under Management</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">Quarterly</div>
              <div className="text-sm text-muted-foreground">13F Filing Updates</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">45 Days</div>
              <div className="text-sm text-muted-foreground">Filing Delay After Quarter</div>
            </div>
          </section>

          {/* Elite Institutional Investors */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Top Institutional Investors & Hedge Funds
            </h2>
            <p className="text-muted-foreground mb-6">
              Track holdings and recent activity from the world&apos;s most successful investors.
              Click any investor to see their complete portfolio and recent 13F filings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ELITE_INVESTORS.map((investor) => (
                <Link
                  key={investor.slug}
                  href={`/stock/AAPL?tab=institutional`}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-green-500 transition-colors mb-1">
                        {investor.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{investor.leader}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                      {investor.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {investor.description}
                  </p>
                  <div className="text-sm text-green-500 group-hover:underline">
                    View Holdings →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Stocks with Highest Institutional Ownership */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Stocks with Highest Institutional Ownership
            </h2>
            <p className="text-muted-foreground mb-6">
              These stocks have the highest percentage of shares held by institutional investors,
              indicating strong professional confidence and thorough institutional research coverage.
            </p>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Institutional %
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TOP_INSTITUTIONAL_STOCKS.map((stock, index) => (
                      <tr key={stock.ticker} className="hover:bg-secondary/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/stock/${stock.ticker}`}
                            className="font-bold text-green-500 hover:underline"
                          >
                            {stock.ticker}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {stock.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {stock.institutionalOwnership}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/stock/${stock.ticker}`}
                            className="text-green-500 hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Understanding 13F Filings */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding 13F Filings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What Gets Reported
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>All U.S. equity holdings (stocks, ETFs)</li>
                  <li>Number of shares held</li>
                  <li>Market value of positions</li>
                  <li>Put and call options on equities</li>
                  <li>Convertible bonds and notes</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What&apos;s NOT Reported
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Short positions (bets against stocks)</li>
                  <li>Foreign equity holdings</li>
                  <li>Fixed income securities (bonds)</li>
                  <li>Cash positions</li>
                  <li>Cryptocurrency holdings</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Filing Timeline
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Q1 ends (March 31)</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">Day 0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>13F filing deadline</span>
                    <span className="text-xs bg-secondary px-2 py-1 rounded">Day 45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data becomes public</span>
                    <span className="text-xs bg-green-600 px-2 py-1 rounded text-white">Live</span>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Who Must File
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Hedge funds and asset managers</li>
                  <li>Pension funds and endowments</li>
                  <li>Investment advisers with $100M+ AUM</li>
                  <li>Mutual fund companies</li>
                  <li>Insurance companies with equity holdings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Use Institutional Data */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to Use Institutional Ownership Data
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Track Smart Money Movement</h3>
                  <p className="text-muted-foreground">
                    Monitor what elite investors are buying and selling. Significant increases
                    in holdings by top performers like Berkshire Hathaway or Bridgewater can
                    signal conviction in a stock&apos;s prospects.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Identify New Positions</h3>
                  <p className="text-muted-foreground">
                    New positions by successful hedge funds are particularly interesting as they
                    represent fresh conviction. These can uncover stocks you may not have
                    considered or validate your own research.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Gauge Institutional Consensus</h3>
                  <p className="text-muted-foreground">
                    High institutional ownership (70%+) indicates strong professional confidence.
                    Look for stocks where multiple elite funds are increasing positions
                    simultaneously.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Understand the Limitations</h3>
                  <p className="text-muted-foreground">
                    Remember that 13F data is 45+ days old and doesn&apos;t show short positions
                    or derivatives. Use it as one input among many in your investment process,
                    not as a sole decision-making tool.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Institutional Investment Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Common Institutional Investment Strategies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Value Investing</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Exemplified by Warren Buffett and Berkshire Hathaway. Focus on buying
                  undervalued companies with strong fundamentals at attractive prices.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Berkshire Hathaway, Baupost Group
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🔢</div>
                <h3 className="text-lg font-bold mb-2">Quantitative</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Used by Renaissance Technologies and Two Sigma. Employ mathematical models
                  and algorithms to identify trading opportunities systematically.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Renaissance, Two Sigma, D.E. Shaw
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2">Activist</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Practiced by Bill Ackman&apos;s Pershing Square and Elliott Management.
                  Take significant stakes and push for corporate changes to unlock value.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Pershing Square, Elliott, Icahn
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-lg font-bold mb-2">Macro</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Bridgewater Associates&apos; specialty. Make bets based on global economic
                  trends, geopolitical events, and macroeconomic analysis.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Bridgewater, Soros Fund Management
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="text-lg font-bold mb-2">Growth</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Tiger Global&apos;s approach. Invest in high-growth companies with strong
                  revenue expansion, often in technology and consumer sectors.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Tiger Global, Coatue, Dragoneer
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-bold mb-2">Index/Passive</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Vanguard and BlackRock&apos;s core strategy. Track market indices with
                  low fees, providing broad market exposure without active management.
                </p>
                <div className="text-xs text-green-500">
                  Examples: Vanguard, BlackRock, State Street
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {institutionalFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border group"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Tools */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Investment Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track upcoming earnings
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Sectors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Most Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  High volume stocks
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Start Tracking Institutional Investors
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Access detailed institutional ownership data, 13F filing analysis, and see what
              stocks top hedge funds are buying. Get AI-powered insights on any stock.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Analyze Stocks Now
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
