import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} 3P Seller Services - Third-Party Seller Revenue Analysis`,
    description: `${symbol} third-party seller services revenue with trends, seller fees, and platform services analysis. Understand ${symbol}'s 3P monetization strategy.`,
    keywords: [
      `${symbol} 3P seller services`,
      `${symbol} third party seller revenue`,
      `${symbol} seller fees`,
      `${symbol} marketplace services`,
      `${symbol} 3P revenue`,
      `${symbol} seller platform`,
    ],
    openGraph: {
      title: `${symbol} 3P Seller Services | Third-Party Seller Revenue`,
      description: `Comprehensive 3P seller services analysis for ${symbol} with seller fee trends and platform monetization.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/3p-seller-services/${ticker.toLowerCase()}`,
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

export default async function ThirdPartySellerServicesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/3p-seller-services/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const sellerServicesFaqs = [
    {
      question: `What are ${symbol} 3P seller services?`,
      answer: `${symbol} 3P (third-party) seller services are the suite of tools, features, and value-added services ${companyName} provides to sellers on its marketplace. These include fulfillment, advertising, analytics, payment processing, and other services sellers pay for beyond basic commissions.`
    },
    {
      question: `How does ${symbol} generate revenue from 3P seller services?`,
      answer: `${companyName} monetizes 3P sellers through: referral fees on each sale, subscription fees for premium seller accounts, fulfillment and logistics services (FBA-style), advertising and sponsored product placements, payment processing fees, and optional value-added services like warehousing or analytics tools.`
    },
    {
      question: `Why are 3P seller services important for ${symbol}?`,
      answer: `3P seller services are crucial for ${companyName} because they create high-margin revenue streams beyond basic marketplace commissions. These services increase seller stickiness, improve marketplace quality, and provide multiple monetization layers from the same seller base.`
    },
    {
      question: `What is the difference between marketplace revenue and 3P seller services for ${symbol}?`,
      answer: `Marketplace revenue for ${symbol} typically refers to basic transaction commissions, while 3P seller services include additional paid services like fulfillment, advertising, and premium tools. 3P services often have higher margins and represent a growing portion of total revenue.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} 3P Seller Services`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} 3P Seller Services - Third-Party Seller Revenue Analysis`,
      description: `Comprehensive 3P seller services analysis for ${symbol} (${companyName}) with seller fee trends and platform monetization.`,
      url: pageUrl,
      keywords: [`${symbol} 3P seller services`, `${symbol} third party seller revenue`, `${symbol} seller fees`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(sellerServicesFaqs),
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
            <span>{symbol} 3P Seller Services</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} 3P Seller Services</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Third-party seller revenue, fees & platform services</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
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

          {/* 3P Services Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold mb-2">3P Seller Services Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol}'s third-party seller services revenue, fees, and platform monetization</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Seller Metrics
              </Link>
            </div>
          </section>

          {/* 3P Services Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key 3P Seller Services Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: '3P Services Revenue', desc: 'Total seller services income' },
                { name: 'Revenue per Seller', desc: 'Average seller monetization' },
                { name: 'Service Adoption Rate', desc: '% of sellers using services' },
                { name: 'Fulfillment Revenue', desc: 'Logistics & warehousing fees' },
                { name: 'Seller Advertising Revenue', desc: 'Sponsored listings & ads' },
                { name: 'Revenue Growth Rate', desc: 'YoY services revenue change' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What 3P Services Tell You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What 3P Seller Services Tell You</h2>
            <div className="space-y-3">
              {[
                'Growing 3P services revenue indicates sellers are deeply integrated with the platform ecosystem',
                'High revenue per seller shows strong monetization beyond basic marketplace commissions',
                '3P services typically have higher margins than commission-based marketplace revenue',
                'Service adoption rates reveal seller satisfaction and platform stickiness',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-orange-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Seller Services Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} 3P seller services and monetization strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Services
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {sellerServicesFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="3p-seller-services" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
