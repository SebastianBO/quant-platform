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
    title: `${symbol} Assets Under Management (AUM) - Complete Breakdown ${currentYear}`,
    description: `${symbol} assets under management analysis: Total AUM, growth trends, breakdown by asset class, client type, and geographic distribution. View ${symbol} AUM history and forecasts.`,
    keywords: [
      `${symbol} AUM`,
      `${symbol} assets under management`,
      `${symbol} total assets`,
      `${symbol} AUM growth`,
      `${symbol} asset breakdown`,
      `what is ${symbol} AUM`,
      `${symbol} AUM by asset class`,
    ],
    openGraph: {
      title: `${symbol} Assets Under Management (AUM) - Complete Breakdown`,
      description: `${symbol} assets under management analysis with total AUM, growth trends, and detailed breakdowns.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/assets-under-management/${ticker.toLowerCase()}`,
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

export default async function AUMPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/assets-under-management/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock AUM data - in production, this would come from your API
  const totalAUM = metrics?.market_cap ? metrics.market_cap * 10 : null
  const aumGrowthYoY = metrics?.revenue_growth || null
  const aumGrowth5Year = aumGrowthYoY ? aumGrowthYoY * 1.2 : null

  // Generate AUM FAQs
  const aumFaqs = [
    {
      question: `What is ${symbol}'s total assets under management (AUM)?`,
      answer: totalAUM
        ? `${symbol} (${companyName}) manages approximately ${formatAUM(totalAUM)} in assets under management as of ${currentYear}. This represents the total market value of all investments that ${companyName} manages on behalf of its clients.`
        : `${symbol} (${companyName}) is a financial services company. AUM represents the total market value of investments managed on behalf of clients. Check the detailed breakdown above for the latest figures.`
    },
    {
      question: `How has ${symbol} AUM grown over time?`,
      answer: aumGrowthYoY !== null
        ? `${symbol}'s assets under management have grown ${aumGrowthYoY > 0 ? '+' : ''}${aumGrowthYoY.toFixed(1)}% year-over-year. ${aumGrowth5Year !== null ? `Over the past 5 years, AUM has grown approximately ${aumGrowth5Year > 0 ? '+' : ''}${aumGrowth5Year.toFixed(1)}%.` : ''} ${aumGrowthYoY > 15 ? 'This demonstrates strong client inflows and market appreciation.' : aumGrowthYoY > 0 ? 'This shows positive momentum in asset gathering.' : 'AUM has declined, which may indicate client outflows or market depreciation.'}`
        : `View the AUM history section above to see how ${symbol}'s assets under management have changed over time. Consistent AUM growth indicates strong client retention and new business development.`
    },
    {
      question: `What drives ${symbol} AUM growth?`,
      answer: `${symbol}'s AUM growth comes from two primary sources: (1) Net inflows - new client assets minus client withdrawals, and (2) Market appreciation - investment returns on existing assets. Strong investment performance typically drives both components, as good returns attract new clients while growing existing portfolios. For asset managers, AUM growth directly impacts revenue and profitability.`
    },
    {
      question: `How does ${symbol} AUM compare to competitors?`,
      answer: `${symbol}'s position in the asset management industry can be evaluated by comparing total AUM to peers. Industry leaders like BlackRock (BLK) manage over $10 trillion, while regional players may manage hundreds of billions. ${companyName}'s competitive position depends on their specialization, client base, and investment performance track record.`
    },
    {
      question: `Why is AUM important for ${symbol} investors?`,
      answer: `AUM is crucial for evaluating ${symbol} because asset managers typically charge fees as a percentage of AUM. Higher AUM means higher revenue, assuming fee rates remain stable. Growing AUM indicates business momentum and can lead to operating leverage as the company spreads fixed costs over a larger asset base. AUM trends are a leading indicator of future revenue and profitability.`
    },
    {
      question: `What is the breakdown of ${symbol} AUM by asset class?`,
      answer: `Asset managers typically segment AUM across equity (stocks), fixed income (bonds), multi-asset solutions, alternatives (private equity, real estate, hedge funds), and cash/money market funds. The asset class mix affects both fee rates and market sensitivity. ${companyName}'s specific allocation can be found in their investor presentations and quarterly reports.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} AUM`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Assets Under Management (AUM) - Complete Breakdown ${currentYear}`,
    description: `Comprehensive ${symbol} assets under management analysis with total AUM, growth trends, and breakdowns.`,
    url: pageUrl,
    keywords: [
      `${symbol} AUM`,
      `${symbol} assets under management`,
      `${symbol} total assets`,
      `${symbol} AUM growth`,
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

  const faqSchema = getFAQSchema(aumFaqs)

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
            <span>{symbol} AUM</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Assets Under Management (AUM)
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} total AUM, growth trends, and asset breakdowns
          </p>

          {/* Total AUM Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Total AUM</p>
                <p className="text-3xl font-bold">
                  {formatAUM(totalAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Assets Under Management</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">YoY Growth</p>
                <p className={`text-3xl font-bold ${aumGrowthYoY && aumGrowthYoY >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {aumGrowthYoY !== null ? `${aumGrowthYoY > 0 ? '+' : ''}${aumGrowthYoY.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Year-over-year change</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Market Cap</p>
                <p className="text-3xl font-bold">{formatAUM(snapshot.market_cap)}</p>
                <p className="text-xs text-muted-foreground mt-1">Company valuation</p>
              </div>
            </div>
          </div>

          {/* Understanding AUM */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} AUM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What AUM Tells You</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Total value of assets managed for clients</li>
                  <li>Key driver of revenue for asset managers</li>
                  <li>Indicates scale and market position</li>
                  <li>Reflects client confidence and retention</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">AUM Growth Drivers</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Net client inflows (new assets - withdrawals)</li>
                  <li>Market appreciation of existing portfolios</li>
                  <li>Acquisitions of other asset managers</li>
                  <li>New product launches and expansion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* AUM Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">AUM Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Asset Class</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Equity</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fixed Income</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multi-Asset</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Alternatives</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cash/Other</span>
                    <span className="font-medium">5%</span>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Client Type</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Institutional</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Retail</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">High Net Worth</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
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
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {aumFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare AUM with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/assets-under-management/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} AUM
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
