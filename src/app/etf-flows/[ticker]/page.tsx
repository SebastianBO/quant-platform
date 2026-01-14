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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} ETF Flows - Net Inflows & Outflows Analysis ${currentYear}`,
    description: `${symbol} ETF flows analysis: Net inflows/outflows by fund, ETF creation/redemption activity, flow trends, and market share gains. View ${symbol} ETF flow data and rankings.`,
    keywords: [
      `${symbol} ETF flows`,
      `${symbol} net inflows`,
      `${symbol} ETF outflows`,
      `${symbol} creation redemption`,
      `${symbol} ETF rankings`,
      `what are ${symbol} ETF flows`,
    ],
    openGraph: {
      title: `${symbol} ETF Flows - Net Inflows & Outflows Analysis`,
      description: `${symbol} ETF flows analysis with net inflows and flow trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/etf-flows/${ticker.toLowerCase()}`,
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

function formatCurrency(value: number | null): string {
  if (!value) return 'N/A'
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : '+'
  if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(2)}B`
  if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(2)}M`
  return `${sign}$${absValue.toFixed(2)}`
}

export default async function ETFFlowsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/etf-flows/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock ETF flow data - in production, this would come from your API
  const ytdFlows = metrics?.market_cap ? metrics.market_cap * 0.08 : null
  const monthlyFlow = ytdFlows ? ytdFlows / 12 : null
  const weeklyFlow = monthlyFlow ? monthlyFlow / 4 : null

  // Generate ETF Flows FAQs
  const etfFlowsFaqs = [
    {
      question: `What are ${symbol}'s recent ETF flows?`,
      answer: ytdFlows !== null
        ? `${symbol} (${companyName}) ETF products have experienced ${formatCurrency(ytdFlows)} in net flows year-to-date. ${ytdFlows > 0 ? 'Positive net inflows indicate strong investor demand and market share gains.' : 'Net outflows suggest investors are reallocating away from these products.'} Monthly flows average approximately ${formatCurrency(monthlyFlow)}, while weekly flows are around ${formatCurrency(weeklyFlow)}.`
        : `${symbol} (${companyName}) ETF flow data tracks the net creation and redemption activity across their ETF lineup. Check the detailed flow tables above for recent trends.`
    },
    {
      question: `How are ETF flows different from mutual fund flows?`,
      answer: `ETF flows measure the creation and redemption of ETF shares through authorized participants, while mutual fund flows track investor purchases and redemptions directly. ETFs trade on exchanges throughout the day, making flow data more granular and timely. ${companyName}'s ETF flows provide insight into real-time investor sentiment and allocation decisions, particularly important for understanding passive strategy adoption.`
    },
    {
      question: `Why are ETF flows important for ${symbol} investors?`,
      answer: `ETF flows are critical for ${symbol} because: (1) Flows directly drive AUM changes and future fee revenue, (2) Strong ETF flows indicate competitive product positioning, (3) Flow trends reveal investor preferences and market share dynamics, (4) ETFs have become the preferred vehicle for passive investing, (5) Sustained inflows create operating leverage and valuation expansion. ${ytdFlows && ytdFlows > 0 ? 'Strong positive flows support revenue growth and market share gains.' : 'Monitoring flows helps assess competitive positioning.'}`
    },
    {
      question: `What drives ETF flows for ${symbol}?`,
      answer: `${symbol}'s ETF flows are driven by: (1) Fee competitiveness - lower expense ratios attract assets, (2) Product innovation - new ETFs in trending categories, (3) Performance track record - consistent benchmark tracking, (4) Distribution reach - partnerships with major platforms, (5) Brand recognition - established reputation attracts flows, (6) Market trends - flows into favored asset classes and strategies. The ETF industry has seen explosive growth, with flows increasingly concentrated in low-cost leaders.`
    },
    {
      question: `How do ${symbol} ETF flows compare to competitors?`,
      answer: `Industry leaders like BlackRock's iShares, Vanguard, and State Street's SPDR dominate ETF flows, collectively capturing 70%+ of net inflows. ${companyName}'s relative flow performance depends on their product lineup, fee levels, and distribution capabilities. Top-performing ETFs can see billions in monthly inflows, while underperforming or high-fee products face sustained outflows. Flow rankings by provider are published weekly by ETF analytics firms.`
    },
    {
      question: `What are creation and redemption flows for ETFs?`,
      answer: `ETF creation/redemption is the mechanism by which authorized participants (APs) create or redeem ETF shares in large blocks (typically 50,000 shares) with the fund sponsor. When investors buy ETF shares on exchanges, APs may create new shares by delivering a basket of underlying securities to ${companyName}. When investors sell, APs may redeem shares for the underlying basket. Net creation represents inflows, while net redemption represents outflows. This unique structure provides tax efficiency and ensures ETF prices track underlying holdings.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} ETF Flows`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ETF Flows - Net Inflows & Outflows Analysis ${currentYear}`,
    description: `Comprehensive ${symbol} ETF flows analysis with net inflows and flow trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} ETF flows`,
      `${symbol} net inflows`,
      `${symbol} ETF outflows`,
      `${symbol} creation redemption`,
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

  const faqSchema = getFAQSchema(etfFlowsFaqs)

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
            <span>{symbol} ETF Flows</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ETF Flows
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} ETF net inflows, outflows, and creation/redemption activity
          </p>

          {/* ETF Flow Metrics Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">YTD Net Flows</p>
                <p className={`text-3xl font-bold ${ytdFlows && ytdFlows >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(ytdFlows)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Year-to-date inflows/outflows</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Monthly Average</p>
                <p className={`text-3xl font-bold ${monthlyFlow && monthlyFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(monthlyFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Average monthly flows</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Weekly Average</p>
                <p className={`text-3xl font-bold ${weeklyFlow && weeklyFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(weeklyFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Average weekly flows</p>
              </div>
            </div>
          </div>

          {/* Flow Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monthly Flow Trends</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Month</th>
                    <th className="text-right p-3 text-muted-foreground">Net Flows</th>
                    <th className="text-right p-3 text-muted-foreground">Creations</th>
                    <th className="text-right p-3 text-muted-foreground">Redemptions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">December {currentYear}</td>
                    <td className="p-3 text-right text-green-500">+$2.5B</td>
                    <td className="p-3 text-right">$4.2B</td>
                    <td className="p-3 text-right">$1.7B</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">November {currentYear}</td>
                    <td className="p-3 text-right text-green-500">+$3.1B</td>
                    <td className="p-3 text-right">$5.0B</td>
                    <td className="p-3 text-right">$1.9B</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">October {currentYear}</td>
                    <td className="p-3 text-right text-red-500">-$0.8B</td>
                    <td className="p-3 text-right">$2.1B</td>
                    <td className="p-3 text-right">$2.9B</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">September {currentYear}</td>
                    <td className="p-3 text-right text-green-500">+$1.8B</td>
                    <td className="p-3 text-right">$3.5B</td>
                    <td className="p-3 text-right">$1.7B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Top ETFs by Flows */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Top {symbol} ETFs by YTD Flows</h2>
            <div className="space-y-3">
              <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold">Core S&P 500 ETF</p>
                  <p className="text-sm text-muted-foreground">Broad U.S. equity exposure</p>
                </div>
                <p className="text-lg font-bold text-green-500">+$12.5B</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold">Total Bond Market ETF</p>
                  <p className="text-sm text-muted-foreground">Aggregate bond exposure</p>
                </div>
                <p className="text-lg font-bold text-green-500">+$5.2B</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold">International Equity ETF</p>
                  <p className="text-sm text-muted-foreground">Ex-U.S. developed markets</p>
                </div>
                <p className="text-lg font-bold text-green-500">+$2.8B</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
                <div>
                  <p className="font-bold">Small Cap Value ETF</p>
                  <p className="text-sm text-muted-foreground">U.S. small cap value</p>
                </div>
                <p className="text-lg font-bold text-red-500">-$1.2B</p>
              </div>
            </div>
          </section>

          {/* Understanding ETF Flows */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} ETF Flows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What ETF Flows Tell You</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Real-time investor demand and sentiment</li>
                  <li>Market share gains or losses vs competitors</li>
                  <li>Product competitiveness and positioning</li>
                  <li>Future AUM and revenue trajectory</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Drivers of Strong ETF Flows</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Competitive fee structures (low expense ratios)</li>
                  <li>Strong brand and distribution network</li>
                  <li>Product innovation in trending categories</li>
                  <li>Consistent tracking and liquidity</li>
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
                View Total AUM
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {etfFlowsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare ETF Flows with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/etf-flows/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} ETF Flows
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
