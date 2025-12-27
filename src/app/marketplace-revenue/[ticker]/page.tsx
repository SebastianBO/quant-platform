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
    title: `${symbol} Marketplace Revenue - Analysis & Growth Trends`,
    description: `${symbol} marketplace revenue analysis with growth trends, commission rates, and take rate metrics. Understand ${symbol}'s marketplace monetization strategy.`,
    keywords: [
      `${symbol} marketplace revenue`,
      `${symbol} commission revenue`,
      `${symbol} take rate`,
      `${symbol} marketplace fees`,
      `${symbol} platform revenue`,
      `${symbol} marketplace growth`,
    ],
    openGraph: {
      title: `${symbol} Marketplace Revenue | Commission & Fee Analysis`,
      description: `Comprehensive marketplace revenue analysis for ${symbol} with commission trends and take rate metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/marketplace-revenue/${ticker.toLowerCase()}`,
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

export default async function MarketplaceRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/marketplace-revenue/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const marketplaceRevenueFaqs = [
    {
      question: `What is ${symbol} marketplace revenue?`,
      answer: `${symbol} marketplace revenue is the income ${companyName} generates from facilitating transactions on its platform. This typically includes commission fees, transaction fees, listing fees, and other charges to buyers or sellers for using the marketplace.`
    },
    {
      question: `How does ${symbol} generate marketplace revenue?`,
      answer: `${companyName} generates marketplace revenue through various mechanisms: taking a percentage commission on each transaction (take rate), charging listing or subscription fees to sellers, payment processing fees, advertising fees, and premium placement charges.`
    },
    {
      question: `What is ${symbol}'s take rate?`,
      answer: `${symbol}'s take rate is the percentage of GMV (Gross Merchandise Value) that ${companyName} keeps as revenue. For example, a 15% take rate means ${symbol} keeps $15 from every $100 transaction. Take rate is a key profitability metric for marketplace businesses.`
    },
    {
      question: `Why is marketplace revenue important for ${symbol}?`,
      answer: `Marketplace revenue is crucial for ${companyName} because it scales with platform growth while requiring minimal incremental costs. High marketplace revenue with growing GMV indicates strong unit economics and a healthy, scalable business model.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Marketplace Revenue`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Marketplace Revenue - Analysis & Growth Trends`,
      description: `Comprehensive marketplace revenue analysis for ${symbol} (${companyName}) with commission trends and take rate metrics.`,
      url: pageUrl,
      keywords: [`${symbol} marketplace revenue`, `${symbol} commission revenue`, `${symbol} take rate`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(marketplaceRevenueFaqs),
    getTableSchema({
      name: `${symbol} Marketplace Revenue History`,
      description: `Historical Marketplace Revenue data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Marketplace Revenue', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Marketplace Metrics</Link>
            {' / '}
            <span>{symbol} Marketplace Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Marketplace Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Commission revenue, take rates & monetization analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketplace Revenue Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2">Marketplace Revenue Analysis</h2>
              <p className="text-muted-foreground mb-6">Analyze {symbol}'s marketplace revenue, commission structure, and take rate trends</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* Marketplace Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Marketplace Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Marketplace Revenue', desc: 'Commission & fee income' },
                { name: 'Take Rate', desc: 'Revenue as % of GMV' },
                { name: 'Revenue Growth Rate', desc: 'YoY revenue change' },
                { name: 'Revenue per Transaction', desc: 'Average monetization' },
                { name: 'Commission Rate Trends', desc: 'Pricing strategy changes' },
                { name: 'Revenue Mix', desc: 'Commission vs. other fees' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Marketplace Revenue Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Marketplace Revenue Tells You</h2>
            <div className="space-y-3">
              {[
                'Growing marketplace revenue faster than GMV indicates improving take rates and pricing power',
                'Stable or declining take rates may signal competitive pressure or strategic pricing decisions',
                'High marketplace revenue margins indicate strong unit economics and scalability',
                'Revenue per transaction trends show how effectively the platform monetizes user activity',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-green-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Revenue Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} marketplace revenue and monetization strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Revenue
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketplaceRevenueFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="marketplace-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
