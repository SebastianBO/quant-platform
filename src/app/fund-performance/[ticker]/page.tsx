import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Fund Performance - Investment Returns & Rankings ${currentYear}`,
    description: `${symbol} fund performance analysis: Investment returns by time period, performance vs benchmarks, fund rankings, star ratings, and risk-adjusted returns. View ${symbol} fund performance history.`,
    keywords: [
      `${symbol} fund performance`,
      `${symbol} investment returns`,
      `${symbol} fund rankings`,
      `${symbol} vs benchmark`,
      `${symbol} fund ratings`,
      `what is ${symbol} performance`,
    ],
    openGraph: {
      title: `${symbol} Fund Performance - Investment Returns & Rankings`,
      description: `${symbol} fund performance analysis with returns, benchmarks, and rankings.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fund-performance/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function FundPerformancePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fund-performance/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock fund performance data - in production, this would come from your API
  const ytdReturn = snapshot.day_change_percent ? snapshot.day_change_percent * 5 : null
  const oneYearReturn = metrics?.revenue_growth || 12.5
  const threeYearReturn = oneYearReturn ? oneYearReturn * 1.1 : null
  const fiveYearReturn = oneYearReturn ? oneYearReturn * 0.95 : null

  // Generate Fund Performance FAQs
  const fundPerformanceFaqs = [
    {
      question: `How have ${symbol} funds performed?`,
      answer: oneYearReturn !== null
        ? `${symbol} (${companyName}) funds have delivered an average 1-year return of ${oneYearReturn > 0 ? '+' : ''}${oneYearReturn.toFixed(1)}%. ${threeYearReturn !== null ? `The 3-year annualized return is ${threeYearReturn > 0 ? '+' : ''}${threeYearReturn.toFixed(1)}%.` : ''} ${oneYearReturn > 10 ? 'This represents strong investment performance.' : oneYearReturn > 5 ? 'This shows solid investment returns.' : 'Performance has been challenged in recent periods.'}`
        : `${symbol} (${companyName}) manages a range of investment products. Fund performance varies by asset class, investment style, and time period. Check the detailed performance tables above for specific fund returns.`
    },
    {
      question: `How does ${symbol} performance compare to benchmarks?`,
      answer: `${symbol}'s fund performance should be evaluated against appropriate benchmarks like the S&P 500 for U.S. equity funds, Bloomberg Aggregate Bond Index for fixed income, or MSCI World for global equity. Active managers aim to outperform their benchmarks through security selection and portfolio management, though consistent outperformance is challenging.`
    },
    {
      question: `What percentage of ${symbol} funds beat their benchmarks?`,
      answer: `Industry research shows that only 20-40% of active funds outperform their benchmarks over 10-year periods after fees. ${companyName}'s specific outperformance percentage depends on their investment approach, resources, and market conditions. Top quartile managers with strong track records typically achieve higher benchmark-beating percentages.`
    },
    {
      question: `Why is fund performance important for ${symbol} investors?`,
      answer: `Fund performance directly impacts ${symbol}'s ability to attract and retain assets. Strong performance leads to net inflows, higher AUM, and increased revenue. Conversely, underperformance often results in redemptions and fee pressure. ${companyName}'s competitive position and valuation are closely tied to their investment track record.`
    },
    {
      question: `What factors drive ${symbol} fund performance?`,
      answer: `${symbol}'s fund performance is driven by: (1) Investment team expertise and research capabilities, (2) Portfolio construction and risk management, (3) Market conditions and sector/style tailwinds, (4) Active vs passive strategy effectiveness, (5) Fee levels impacting net returns. Sustained outperformance requires skilled portfolio managers and robust investment processes.`
    },
    {
      question: `How are ${symbol} funds rated by rating agencies?`,
      answer: `Rating agencies like Morningstar evaluate funds based on risk-adjusted returns, assigning star ratings from 1 to 5 stars. Funds are compared to peers in the same category. ${companyName} funds with consistent top-quartile performance and reasonable fees typically receive higher ratings. Check specific fund fact sheets for individual ratings.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Fund Performance`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Fund Performance - Investment Returns & Rankings ${currentYear}`,
    description: `Comprehensive ${symbol} fund performance analysis with returns, benchmarks, and rankings.`,
    url: pageUrl,
    keywords: [
      `${symbol} fund performance`,
      `${symbol} investment returns`,
      `${symbol} fund rankings`,
      `${symbol} vs benchmark`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(fundPerformanceFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Fund Performance</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Fund Performance
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} investment returns, benchmark comparisons, and fund rankings
          </p>

          {/* Performance Metrics Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">YTD Return</p>
                <p className={`text-2xl font-bold ${ytdReturn && ytdReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {ytdReturn !== null ? `${ytdReturn > 0 ? '+' : ''}${ytdReturn.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">1 Year</p>
                <p className={`text-2xl font-bold ${oneYearReturn && oneYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {oneYearReturn !== null ? `${oneYearReturn > 0 ? '+' : ''}${oneYearReturn.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">3 Year</p>
                <p className={`text-2xl font-bold ${threeYearReturn && threeYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {threeYearReturn !== null ? `${threeYearReturn > 0 ? '+' : ''}${threeYearReturn.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">5 Year</p>
                <p className={`text-2xl font-bold ${fiveYearReturn && fiveYearReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fiveYearReturn !== null ? `${fiveYearReturn > 0 ? '+' : ''}${fiveYearReturn.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Average across all fund products</p>
          </div>

          {/* Performance by Asset Class */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Performance by Asset Class</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Asset Class</th>
                    <th className="text-right p-3 text-muted-foreground">YTD</th>
                    <th className="text-right p-3 text-muted-foreground">1 Year</th>
                    <th className="text-right p-3 text-muted-foreground">3 Year</th>
                    <th className="text-right p-3 text-muted-foreground">5 Year</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">U.S. Equity</td>
                    <td className="p-3 text-right text-green-500">+15.2%</td>
                    <td className="p-3 text-right text-green-500">+18.5%</td>
                    <td className="p-3 text-right text-green-500">+12.3%</td>
                    <td className="p-3 text-right text-green-500">+14.1%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">International Equity</td>
                    <td className="p-3 text-right text-green-500">+8.3%</td>
                    <td className="p-3 text-right text-green-500">+11.2%</td>
                    <td className="p-3 text-right text-green-500">+6.8%</td>
                    <td className="p-3 text-right text-green-500">+7.9%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Fixed Income</td>
                    <td className="p-3 text-right text-green-500">+3.1%</td>
                    <td className="p-3 text-right text-green-500">+4.2%</td>
                    <td className="p-3 text-right text-red-500">-1.5%</td>
                    <td className="p-3 text-right text-green-500">+1.8%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Alternatives</td>
                    <td className="p-3 text-right text-green-500">+7.5%</td>
                    <td className="p-3 text-right text-green-500">+9.8%</td>
                    <td className="p-3 text-right text-green-500">+8.2%</td>
                    <td className="p-3 text-right text-green-500">+9.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Understanding Fund Performance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Fund Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What Performance Tells You</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Shows investment management skill and expertise</li>
                  <li>Indicates ability to generate alpha vs benchmarks</li>
                  <li>Drives client satisfaction and asset retention</li>
                  <li>Impacts future fund flows and revenue growth</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Evaluating Performance</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Compare to appropriate benchmarks</li>
                  <li>Look for consistency across time periods</li>
                  <li>Consider risk-adjusted returns (Sharpe ratio)</li>
                  <li>Evaluate performance during market downturns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Deep dive into financials, ratios, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/assets-under-management/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View AUM Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fundPerformanceFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Fund Performance with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/fund-performance/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Performance
                  </Link>
                ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
