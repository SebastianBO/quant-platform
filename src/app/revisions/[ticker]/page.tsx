import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Estimate Revisions - Analyst Revisions & Trends`,
    description: `${symbol} analyst estimate revisions tracking. View upward and downward revisions to earnings and revenue estimates, revision trends, and analyst momentum.`,
    keywords: [
      `${symbol} revisions`,
      `${symbol} estimate revisions`,
      `${symbol} analyst revisions`,
      `${symbol} earnings revisions`,
      `${symbol} revision trends`,
      `${symbol} estimate changes`,
    ],
    openGraph: {
      title: `${symbol} Estimate Revisions | Analyst Revisions & Trends`,
      description: `Track ${symbol} analyst estimate revisions including earnings and revenue revision trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/revisions/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function RevisionsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/revisions/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const revisionsFaqs = [
    {
      question: `What are ${symbol} estimate revisions?`,
      answer: `${symbol} estimate revisions track changes in analyst forecasts over time. When analysts revise their earnings or revenue estimates for ${companyName}, it can signal changing sentiment and expectations.`
    },
    {
      question: `Are upward revisions bullish for ${symbol}?`,
      answer: `Upward estimate revisions for ${symbol} are generally considered bullish as they indicate analysts are becoming more optimistic about ${companyName}'s prospects. However, consider the magnitude and consistency of revisions.`
    },
    {
      question: `How often do analysts revise ${symbol} estimates?`,
      answer: `Analysts may revise ${symbol} estimates at any time based on new information, company announcements, earnings results, or changing market conditions. Tracking revision frequency and direction provides valuable insights.`
    },
    {
      question: `What causes ${symbol} estimate revisions?`,
      answer: `Estimate revisions for ${symbol} can be triggered by earnings reports, management guidance changes, industry trends, competitive dynamics, macroeconomic factors, or new product announcements from ${companyName}.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Revisions`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Estimate Revisions - Analyst Revisions & Trends`,
      description: `Track analyst estimate revisions for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} revisions`, `${symbol} estimate revisions`, `${symbol} analyst revisions`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(revisionsFaqs),
    getTableSchema({
      name: `${symbol} Revisions History`,
      description: `Historical Revisions data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Revisions', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            {' / '}
            <span>{symbol} Revisions</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Estimate Revisions</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Analyst revisions & trends</p>

          {/* Current Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.marketCap && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">${(snapshot.marketCap / 1e9).toFixed(2)}B</p>
                </div>
              )}
            </div>
          </div>

          {/* Revisions Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Estimate Revisions Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Estimate revisions track how analysts are changing their forecasts for {companyName} over time.
                Positive revision momentum typically indicates improving sentiment, while negative revisions may signal concerns.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Earnings Revisions</p>
                  <p className="text-lg">Changes to EPS estimates</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Revenue Revisions</p>
                  <p className="text-lg">Changes to sales forecasts</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Revision Momentum</p>
                  <p className="text-lg">Trend direction and strength</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Analyst Activity</p>
                  <p className="text-lg">Frequency of estimate updates</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revision Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revision Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'Upward Revisions', desc: 'Number of analysts raising earnings or revenue estimates' },
                { title: 'Downward Revisions', desc: 'Number of analysts lowering their forecasts' },
                { title: 'Revision Breadth', desc: 'Percentage of analysts making changes in the same direction' },
                { title: 'Revision Magnitude', desc: 'Average size of estimate changes by analysts' },
                { title: 'Revision Momentum', desc: 'Net trend of upward vs downward revisions over time' },
                { title: 'Estimate Stability', desc: 'How much consensus estimates are changing period over period' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">Track analyst revisions and estimate trends</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {revisionsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="revisions" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
