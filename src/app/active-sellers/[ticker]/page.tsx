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
    title: `${symbol} Active Sellers - Seller Growth & Supply Analysis`,
    description: `${symbol} active sellers analysis with seller growth trends, supply metrics, and marketplace inventory. Understand ${symbol}'s marketplace supply side.`,
    keywords: [
      `${symbol} active sellers`,
      `${symbol} seller growth`,
      `${symbol} merchant count`,
      `${symbol} marketplace sellers`,
      `${symbol} supply metrics`,
      `${symbol} seller acquisition`,
    ],
    openGraph: {
      title: `${symbol} Active Sellers | Seller Growth & Supply Metrics`,
      description: `Comprehensive active sellers analysis for ${symbol} with seller growth and supply trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/active-sellers/${ticker.toLowerCase()}`,
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

export default async function ActiveSellersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/active-sellers/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const activeSellersFaqs = [
    {
      question: `What are ${symbol} active sellers?`,
      answer: `${symbol} active sellers are merchants who have listed products and generated sales on ${companyName}'s marketplace within a defined period (typically 12 months). This metric measures the supply side of the marketplace and indicates the breadth of inventory and product selection available to buyers.`
    },
    {
      question: `Why are active sellers important for ${symbol}?`,
      answer: `Active sellers are critical for ${companyName} because they provide the supply side of the marketplace. More sellers mean greater product selection, competitive pricing, and category coverage. Growing active sellers attracts more buyers, creates network effects, and generates more revenue through commissions and services.`
    },
    {
      question: `How does ${symbol} attract and retain sellers?`,
      answer: `${companyName} attracts sellers through: low barriers to entry, access to a large buyer base, seller tools and analytics, fulfillment and logistics services, marketing and advertising platforms, competitive fee structures, and seller support and education programs.`
    },
    {
      question: `What's a good active seller growth rate for ${symbol}?`,
      answer: `For marketplace platforms like ${companyName}, active seller growth of 15-40% year-over-year is typically considered strong, though this varies by market maturity. Fast-growing platforms may exceed 50%, while mature platforms focus on seller quality, GMV per seller, and retention over pure growth.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Active Sellers`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Active Sellers - Seller Growth & Supply Analysis`,
      description: `Comprehensive active sellers analysis for ${symbol} (${companyName}) with seller growth and supply trends.`,
      url: pageUrl,
      keywords: [`${symbol} active sellers`, `${symbol} seller growth`, `${symbol} merchant count`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(activeSellersFaqs),
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
            <span>{symbol} Active Sellers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Active Sellers</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Seller growth, merchant count & supply metrics</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
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

          {/* Active Sellers Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🏪</div>
              <h2 className="text-2xl font-bold mb-2">Active Sellers Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol}'s active sellers, merchant growth, and marketplace supply metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Seller Metrics
              </Link>
            </div>
          </section>

          {/* Active Sellers Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Active Seller Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Active Sellers', desc: 'Merchants with recent sales' },
                { name: 'Seller Growth Rate', desc: 'YoY active seller change' },
                { name: 'Seller Retention Rate', desc: '% of sellers still active' },
                { name: 'GMV per Active Seller', desc: 'Average revenue per merchant' },
                { name: 'Seller Concentration', desc: 'Top seller % of total GMV' },
                { name: 'New Seller Onboarding', desc: 'Monthly new seller additions' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Active Sellers Tell You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Active Sellers Tell You</h2>
            <div className="space-y-3">
              {[
                'Growing active sellers increases product selection and marketplace competitiveness',
                'High seller retention indicates platform value and seller satisfaction',
                'Increasing GMV per seller shows sellers are scaling their businesses on the platform',
                'Sellers are the supply side - more sellers with diverse inventory attracts more buyers',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-emerald-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Seller Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} active sellers and merchant growth trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Sellers
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {activeSellersFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="active-sellers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
