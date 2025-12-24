import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Analyst Consensus - Consensus Estimates & Price Targets`,
    description: `${symbol} analyst consensus estimates including revenue forecasts, EPS projections, price targets, and ratings from Wall Street analysts.`,
    keywords: [
      `${symbol} consensus`,
      `${symbol} analyst consensus`,
      `${symbol} consensus estimates`,
      `${symbol} analyst estimates`,
      `${symbol} consensus price target`,
      `${symbol} Wall Street consensus`,
    ],
    openGraph: {
      title: `${symbol} Analyst Consensus | Consensus Estimates & Targets`,
      description: `Comprehensive ${symbol} analyst consensus data including earnings estimates, revenue forecasts, and price targets.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/consensus/${ticker.toLowerCase()}`,
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

export default async function ConsensusPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/consensus/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const consensusFaqs = [
    {
      question: `What is ${symbol} analyst consensus?`,
      answer: `${symbol} analyst consensus represents the average or median estimates from Wall Street analysts covering ${companyName}. This includes consensus earnings estimates, revenue forecasts, and price targets.`
    },
    {
      question: `How many analysts cover ${symbol}?`,
      answer: `The number of analysts covering ${symbol} varies over time. More coverage typically indicates higher institutional interest and can provide more reliable consensus estimates.`
    },
    {
      question: `What is ${symbol} consensus price target?`,
      answer: `The consensus price target for ${symbol} is the average of all analyst price targets. It represents where analysts expect the stock to trade over the next 12 months.`
    },
    {
      question: `How accurate is ${symbol} consensus?`,
      answer: `Analyst consensus for ${symbol} provides valuable market expectations but should be one of many factors in investment decisions. Historical accuracy varies, and actual results may differ significantly from estimates.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Consensus`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Analyst Consensus - Consensus Estimates & Price Targets`,
      description: `Comprehensive analyst consensus data for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} consensus`, `${symbol} analyst consensus`, `${symbol} estimates`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(consensusFaqs),
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
            <span>{symbol} Consensus</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Analyst Consensus</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Consensus estimates & price targets</p>

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

          {/* Consensus Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Consensus Estimates Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Analyst consensus for {companyName} aggregates estimates from multiple Wall Street research analysts
                to provide market expectations for revenue, earnings, and other key financial metrics.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">EPS Consensus</p>
                  <p className="text-lg">Average earnings per share estimates</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Revenue Consensus</p>
                  <p className="text-lg">Average revenue forecasts</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Price Target</p>
                  <p className="text-lg">12-month consensus price target</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Rating Distribution</p>
                  <p className="text-lg">Buy, hold, and sell ratings</p>
                </div>
              </div>
            </div>
          </section>

          {/* Consensus Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Consensus Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'Earnings Consensus', desc: 'Average EPS estimates for current and future quarters' },
                { title: 'Revenue Consensus', desc: 'Average sales forecasts across all covering analysts' },
                { title: 'Price Target Range', desc: 'High, low, and median analyst price targets' },
                { title: 'Growth Rate Consensus', desc: 'Expected revenue and earnings growth rates' },
                { title: 'Margin Consensus', desc: 'Average estimates for profit margins' },
                { title: 'Estimate Dispersion', desc: 'Variation in analyst estimates indicating uncertainty' },
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
            <p className="text-muted-foreground mb-6">View detailed analyst ratings and estimates</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {consensusFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="consensus" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
