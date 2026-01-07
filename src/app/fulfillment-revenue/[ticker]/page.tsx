import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Fulfillment Revenue - Logistics & Warehousing Analysis`,
    description: `${symbol} fulfillment revenue analysis with logistics fees, warehousing trends, and shipping revenue. Understand ${symbol}'s fulfillment services monetization.`,
    keywords: [
      `${symbol} fulfillment revenue`,
      `${symbol} logistics fees`,
      `${symbol} warehousing revenue`,
      `${symbol} shipping fees`,
      `${symbol} FBA revenue`,
      `${symbol} fulfillment services`,
    ],
    openGraph: {
      title: `${symbol} Fulfillment Revenue | Logistics & Warehousing Fees`,
      description: `Comprehensive fulfillment revenue analysis for ${symbol} with logistics and warehousing fee trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fulfillment-revenue/${ticker.toLowerCase()}`,
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

export default async function FulfillmentRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fulfillment-revenue/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const fulfillmentFaqs = [
    {
      question: `What is ${symbol} fulfillment revenue?`,
      answer: `${symbol} fulfillment revenue represents income generated from providing logistics, warehousing, and shipping services to sellers on its marketplace. This includes storage fees, pick-and-pack fees, shipping charges, and related fulfillment services (similar to Amazon's FBA model).`
    },
    {
      question: `How does ${symbol} generate fulfillment revenue?`,
      answer: `${companyName} generates fulfillment revenue by charging sellers for: warehouse storage (per cubic foot), order fulfillment (pick, pack, ship), inbound shipping to warehouses, returns processing, long-term storage fees, and special handling for oversized items.`
    },
    {
      question: `Why is fulfillment revenue important for ${symbol}?`,
      answer: `Fulfillment revenue is valuable for ${companyName} because it creates a high-margin, recurring revenue stream while increasing seller dependency on the platform. Sellers using fulfillment services are less likely to leave, and the company gains control over the end-to-end customer experience.`
    },
    {
      question: `What are the margins on ${symbol} fulfillment services?`,
      answer: `Fulfillment services typically offer higher margins than basic marketplace commissions for ${symbol}. Once infrastructure is built, incremental fulfillment revenue has favorable unit economics, though capital investment in warehouses and logistics networks is substantial.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Fulfillment Revenue`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Fulfillment Revenue - Logistics & Warehousing Analysis`,
      description: `Comprehensive fulfillment revenue analysis for ${symbol} (${companyName}) with logistics and warehousing fee trends.`,
      url: pageUrl,
      keywords: [`${symbol} fulfillment revenue`, `${symbol} logistics fees`, `${symbol} warehousing revenue`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fulfillmentFaqs),
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
            <span>{symbol} Fulfillment Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Fulfillment Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Logistics fees, warehousing & fulfillment services</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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

          {/* Fulfillment Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold mb-2">Fulfillment Revenue Analysis</h2>
              <p className="text-muted-foreground mb-6">Analyze {symbol}'s fulfillment revenue, logistics fees, and warehousing monetization</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Fulfillment Metrics
              </Link>
            </div>
          </section>

          {/* Fulfillment Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Fulfillment Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Fulfillment Revenue', desc: 'Logistics & warehousing fees' },
                { name: 'Revenue per Unit Fulfilled', desc: 'Average fulfillment fee' },
                { name: 'FBA Adoption Rate', desc: '% of sellers using fulfillment' },
                { name: 'Storage Fee Revenue', desc: 'Warehousing charges' },
                { name: 'Shipping Fee Revenue', desc: 'Delivery & logistics fees' },
                { name: 'Fulfillment Growth Rate', desc: 'YoY revenue change' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Fulfillment Revenue Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Fulfillment Revenue Tells You</h2>
            <div className="space-y-3">
              {[
                'Growing fulfillment revenue indicates sellers are increasingly relying on the platform for logistics',
                'High fulfillment adoption creates strong seller lock-in and competitive moats',
                'Fulfillment services improve customer experience through faster, more reliable shipping',
                'Fulfillment revenue growth faster than GMV shows successful monetization of logistics',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-blue-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Fulfillment Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} fulfillment revenue and logistics strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Fulfillment
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fulfillmentFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="fulfillment-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
