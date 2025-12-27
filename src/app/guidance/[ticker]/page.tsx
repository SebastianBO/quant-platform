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
    title: `${symbol} Company Guidance - Management Outlook & Forward Guidance`,
    description: `${symbol} company guidance and management outlook. View forward guidance, revenue projections, earnings expectations, and management commentary on future performance.`,
    keywords: [
      `${symbol} guidance`,
      `${symbol} company guidance`,
      `${symbol} management guidance`,
      `${symbol} forward guidance`,
      `${symbol} outlook`,
      `${symbol} projections`,
    ],
    openGraph: {
      title: `${symbol} Company Guidance | Management Outlook & Projections`,
      description: `Comprehensive ${symbol} company guidance including revenue projections, earnings outlook, and management commentary.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/guidance/${ticker.toLowerCase()}`,
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

export default async function GuidancePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/guidance/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const guidanceFaqs = [
    {
      question: `What is ${symbol} company guidance?`,
      answer: `${symbol} company guidance refers to the forward-looking statements and projections provided by ${companyName} management about expected future performance, including revenue, earnings, and key business metrics.`
    },
    {
      question: `Where can I find ${symbol} management guidance?`,
      answer: `${symbol} management guidance is typically provided during quarterly earnings calls, annual reports, and investor presentations. This page aggregates the latest guidance and outlook from ${companyName}.`
    },
    {
      question: `How often does ${symbol} update guidance?`,
      answer: `${symbol} typically updates its forward guidance quarterly during earnings releases, though guidance may be revised mid-quarter if material changes occur in the business or market conditions.`
    },
    {
      question: `Is ${symbol} guidance reliable?`,
      answer: `Company guidance from ${symbol} represents management's best estimates based on current information. However, actual results may differ due to market conditions, competitive dynamics, and other unforeseen factors. Always consider guidance as one of many factors in investment decisions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Guidance`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Company Guidance - Management Outlook & Forward Guidance`,
      description: `Comprehensive company guidance and management outlook for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} guidance`, `${symbol} company guidance`, `${symbol} management outlook`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(guidanceFaqs),
    getTableSchema({
      name: `${symbol} Guidance History`,
      description: `Historical Guidance data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Guidance', 'Change'],
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
            <span>{symbol} Guidance</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Company Guidance</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Management outlook & forward guidance</p>

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

          {/* Guidance Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Management Guidance Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Company guidance represents {companyName}'s management team's forward-looking expectations for business performance.
                This includes revenue projections, earnings estimates, margin outlooks, and key operational metrics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Revenue Guidance</p>
                  <p className="text-lg">View forward revenue projections</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Earnings Guidance</p>
                  <p className="text-lg">EPS and profit expectations</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Margin Outlook</p>
                  <p className="text-lg">Gross and operating margin targets</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Growth Targets</p>
                  <p className="text-lg">Long-term growth expectations</p>
                </div>
              </div>
            </div>
          </section>

          {/* Guidance Types */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Guidance Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'Revenue Guidance', desc: 'Top-line sales expectations for upcoming quarters and fiscal years' },
                { title: 'EPS Guidance', desc: 'Earnings per share projections and profitability outlook' },
                { title: 'Operating Margin', desc: 'Expected profit margins and operational efficiency targets' },
                { title: 'Capital Expenditure', desc: 'Planned investments in business infrastructure and growth' },
                { title: 'Free Cash Flow', desc: 'Expected cash generation after capital expenses' },
                { title: 'Segment Performance', desc: 'Guidance for individual business units or product lines' },
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
            <p className="text-muted-foreground mb-6">Get detailed analysis with guidance tracking and forecasts</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {guidanceFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="guidance" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
