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
    title: `${symbol} Active Buyers - User Growth & Engagement Analysis`,
    description: `${symbol} active buyers analysis with user growth trends, buyer engagement metrics, and customer acquisition. Understand ${symbol}'s marketplace demand.`,
    keywords: [
      `${symbol} active buyers`,
      `${symbol} user growth`,
      `${symbol} customer count`,
      `${symbol} buyer engagement`,
      `${symbol} marketplace users`,
      `${symbol} customer acquisition`,
    ],
    openGraph: {
      title: `${symbol} Active Buyers | User Growth & Customer Metrics`,
      description: `Comprehensive active buyers analysis for ${symbol} with user growth and engagement trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/active-buyers/${ticker.toLowerCase()}`,
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

export default async function ActiveBuyersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/active-buyers/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const activeBuyersFaqs = [
    {
      question: `What are ${symbol} active buyers?`,
      answer: `${symbol} active buyers are customers who have made at least one purchase on ${companyName}'s marketplace within a defined period (typically 12 months). This metric measures the size of the engaged customer base and is a key indicator of marketplace health and demand.`
    },
    {
      question: `Why are active buyers important for ${symbol}?`,
      answer: `Active buyers are crucial for ${companyName} because they represent the demand side of the marketplace. Growing active buyers indicates successful customer acquisition, platform appeal, and network effects. More buyers attract more sellers, creating a positive growth cycle.`
    },
    {
      question: `How does ${symbol} grow active buyers?`,
      answer: `${companyName} grows active buyers through: marketing and advertising campaigns, product expansion and selection, improving user experience and discovery, offering competitive pricing and deals, expanding geographically, and leveraging word-of-mouth and referral programs.`
    },
    {
      question: `What's a good active buyer growth rate for ${symbol}?`,
      answer: `For marketplace platforms like ${companyName}, active buyer growth of 10-30% year-over-year is typically considered healthy, though growth rates vary by market maturity. Fast-growing platforms may see 50%+ growth, while mature platforms may see single-digit growth but focus on engagement and spend per buyer.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Active Buyers`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Active Buyers - User Growth & Engagement Analysis`,
      description: `Comprehensive active buyers analysis for ${symbol} (${companyName}) with user growth and engagement trends.`,
      url: pageUrl,
      keywords: [`${symbol} active buyers`, `${symbol} user growth`, `${symbol} customer count`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(activeBuyersFaqs),
    getTableSchema({
      name: `${symbol} Active Buyers History`,
      description: `Historical Active Buyers data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Active Buyers', 'Change'],
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
            <span>{symbol} Active Buyers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Active Buyers</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - User growth, customer count & buyer engagement</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
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

          {/* Active Buyers Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold mb-2">Active Buyers Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol}'s active buyers, user growth, and customer engagement metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full User Metrics
              </Link>
            </div>
          </section>

          {/* Active Buyers Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Active Buyer Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Active Buyers', desc: 'Customers who purchased recently' },
                { name: 'Buyer Growth Rate', desc: 'YoY active buyer change' },
                { name: 'Buyer Retention Rate', desc: '% of repeat customers' },
                { name: 'GMV per Active Buyer', desc: 'Average spend per customer' },
                { name: 'Customer Acquisition Cost', desc: 'CAC for new buyers' },
                { name: 'Buyer Frequency', desc: 'Average orders per buyer' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Active Buyers Tell You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Active Buyers Tell You</h2>
            <div className="space-y-3">
              {[
                'Growing active buyers indicates successful customer acquisition and marketplace appeal',
                'High buyer retention rates show strong product-market fit and customer satisfaction',
                'Increasing spend per buyer demonstrates growing engagement and platform value',
                'Buyers are the demand side of marketplaces - more buyers attract more sellers and inventory',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-violet-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Buyer Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} active buyers and customer growth trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Buyers
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {activeBuyersFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="active-buyers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
