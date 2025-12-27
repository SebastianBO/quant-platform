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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Passive vs Active - AUM Breakdown & Mix Analysis ${currentYear}`,
    description: `${symbol} passive vs active analysis: AUM breakdown between passive index funds and active strategies, mix trends, flows by category, and performance comparison. View ${symbol} passive vs active split.`,
    keywords: [
      `${symbol} passive vs active`,
      `${symbol} index funds`,
      `${symbol} active management`,
      `${symbol} AUM mix`,
      `${symbol} passive funds`,
      `what is ${symbol} passive active split`,
    ],
    openGraph: {
      title: `${symbol} Passive vs Active - AUM Breakdown & Mix Analysis`,
      description: `${symbol} passive vs active AUM analysis with breakdown and trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/passive-vs-active/${ticker.toLowerCase()}`,
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

function formatAUM(value: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  return `$${(value / 1e6).toFixed(2)}M`
}

export default async function PassiveVsActivePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/passive-vs-active/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock passive vs active data - in production, this would come from your API
  const totalAUM = metrics?.market_cap ? metrics.market_cap * 10 : null
  const passiveAUM = totalAUM ? totalAUM * 0.55 : null
  const activeAUM = totalAUM ? totalAUM * 0.45 : null
  const passivePercent = 55
  const activePercent = 45

  // Generate Passive vs Active FAQs
  const passiveVsActiveFaqs = [
    {
      question: `What is ${symbol}'s passive vs active AUM split?`,
      answer: passiveAUM && activeAUM
        ? `${symbol} (${companyName}) manages approximately ${formatAUM(passiveAUM)} (${passivePercent}%) in passive/index strategies and ${formatAUM(activeAUM)} (${activePercent}%) in active strategies. ${passivePercent > 50 ? 'The majority of assets are in passive products, reflecting the industry shift toward low-cost indexing.' : 'Active strategies still represent the majority of AUM, though passive is growing rapidly.'} This mix significantly impacts revenue, margins, and competitive positioning.`
        : `${symbol} (${companyName}) manages a mix of passive index funds and actively managed strategies. The passive/active split affects fee revenue, margins, and flows. Check the detailed breakdown above for current figures.`
    },
    {
      question: `How has ${symbol}'s passive vs active mix changed over time?`,
      answer: `The asset management industry has seen a dramatic shift from active to passive over the past 15 years. Passive funds have grown from ~20% to over 50% of equity mutual fund and ETF assets. ${companyName} has likely experienced similar trends, with passive strategies growing faster than active. This shift is driven by: (1) Fee pressure favoring low-cost index funds, (2) Difficulty of active managers to consistently outperform, (3) Evidence supporting passive investing efficiency, (4) Growth of ETFs and target-date funds.`
    },
    {
      question: `Why does the passive vs active mix matter for ${symbol} investors?`,
      answer: `The passive/active split is crucial because: (1) Passive funds generate lower fees (0.05-0.15%) vs active (0.50-1.00%+), impacting revenue per AUM, (2) Passive products typically see stronger flows as investors favor low costs, (3) Active strategies have higher margins but face redemption risk if performance lags, (4) The mix affects ${symbol}'s competitive positioning - passive leaders benefit from scale while active specialists need strong performance. ${passivePercent > 50 ? 'Higher passive concentration may pressure margins but provide stable flows.' : 'Higher active concentration offers better margins but requires consistent performance.'}`
    },
    {
      question: `What are the advantages of ${symbol}'s passive strategies?`,
      answer: `${symbol}'s passive/index strategies offer: (1) Lower costs - expense ratios typically 0.05-0.15% vs 0.50-1.00%+ for active, (2) Tax efficiency - lower portfolio turnover reduces taxable distributions, (3) Consistent flows - passive funds tend to see steadier inflows, (4) Predictable performance - track benchmark closely with minimal tracking error, (5) Scalability - passive strategies handle large inflows without performance degradation. However, passive products generate lower fee revenue per dollar of AUM.`
    },
    {
      question: `What are the advantages of ${symbol}'s active strategies?`,
      answer: `${symbol}'s active strategies offer: (1) Higher revenue - active funds charge 0.50-1.50% vs 0.05-0.15% for passive, (2) Alpha potential - skilled managers can outperform benchmarks, (3) Risk management - active managers can reduce exposure during market stress, (4) Specialized access - alternatives and niche strategies not available passively, (5) Client solutions - customized portfolios for specific needs. However, active funds face performance pressure and redemption risk if they underperform.`
    },
    {
      question: `How do passive vs active flows differ for ${symbol}?`,
      answer: `Industry data shows passive funds have captured most net inflows over the past decade, while active funds have experienced net outflows. ${companyName} likely sees similar patterns - strong flows into low-cost index products, challenged flows in traditional active strategies. However, certain active categories like alternatives, sustainable investing, and outcome-oriented strategies can still attract assets. The flow dynamics significantly impact ${symbol}'s revenue growth and margins.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Passive vs Active`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Passive vs Active - AUM Breakdown & Mix Analysis ${currentYear}`,
    description: `Comprehensive ${symbol} passive vs active AUM analysis with breakdown and trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} passive vs active`,
      `${symbol} index funds`,
      `${symbol} active management`,
      `${symbol} AUM mix`,
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

  const faqSchema = getFAQSchema(passiveVsActiveFaqs)

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
            <span>{symbol} Passive vs Active</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Passive vs Active
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} AUM breakdown between passive and active strategies
          </p>

          {/* Passive vs Active Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Total AUM</p>
                <p className="text-3xl font-bold">
                  {formatAUM(totalAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Combined assets</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Passive AUM</p>
                <p className="text-3xl font-bold text-blue-500">
                  {formatAUM(passiveAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{passivePercent}% of total</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Active AUM</p>
                <p className="text-3xl font-bold text-purple-500">
                  {formatAUM(activeAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activePercent}% of total</p>
              </div>
            </div>
          </div>

          {/* Visual Mix Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">AUM Mix Breakdown</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex h-12 rounded-lg overflow-hidden mb-4">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white font-bold"
                  style={{ width: `${passivePercent}%` }}
                >
                  Passive {passivePercent}%
                </div>
                <div
                  className="bg-purple-500 flex items-center justify-center text-white font-bold"
                  style={{ width: `${activePercent}%` }}
                >
                  Active {activePercent}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Passive/Index Strategies</p>
                  <p className="text-2xl font-bold text-blue-500">{formatAUM(passiveAUM)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Low-cost, benchmark-tracking funds</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Strategies</p>
                  <p className="text-2xl font-bold text-purple-500">{formatAUM(activeAUM)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Research-driven, alpha-seeking funds</p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Passive vs Active Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground">Metric</th>
                    <th className="text-center p-3 text-blue-500">Passive</th>
                    <th className="text-center p-3 text-purple-500">Active</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Average Expense Ratio</td>
                    <td className="p-3 text-center text-green-500">0.08%</td>
                    <td className="p-3 text-center">0.68%</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Revenue per $1B AUM</td>
                    <td className="p-3 text-center">$800K</td>
                    <td className="p-3 text-center text-green-500">$6.8M</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">5-Year Net Flows</td>
                    <td className="p-3 text-center text-green-500">+$500B</td>
                    <td className="p-3 text-center text-red-500">-$200B</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Benchmark Outperformance</td>
                    <td className="p-3 text-center">0% (tracks)</td>
                    <td className="p-3 text-center">20-30% of funds</td>
                  </tr>
                  <tr className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">Tax Efficiency</td>
                    <td className="p-3 text-center text-green-500">High</td>
                    <td className="p-3 text-center">Lower</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Understanding Passive vs Active */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Passive vs Active</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Passive Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Very low fees (0.05-0.15%)</li>
                  <li>Consistent benchmark tracking</li>
                  <li>High tax efficiency</li>
                  <li>Strong, steady flows</li>
                  <li>Scalable without performance drag</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-purple-500 mb-2">Active Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Higher revenue per AUM</li>
                  <li>Potential to outperform benchmarks</li>
                  <li>Risk management flexibility</li>
                  <li>Access to specialized strategies</li>
                  <li>Better margins for asset manager</li>
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
              {passiveVsActiveFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Passive vs Active with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/passive-vs-active/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Mix
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
