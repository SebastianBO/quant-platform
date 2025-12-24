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
    title: `${symbol} Advertising Revenue - Ad Revenue Analysis & Trends`,
    description: `${symbol} advertising revenue analysis with ad revenue growth, sponsored listings, and monetization trends. Understand ${symbol}'s advertising business model.`,
    keywords: [
      `${symbol} advertising revenue`,
      `${symbol} ad revenue`,
      `${symbol} sponsored products`,
      `${symbol} advertising growth`,
      `${symbol} ad monetization`,
      `${symbol} sponsored listings`,
    ],
    openGraph: {
      title: `${symbol} Advertising Revenue | Ad Revenue & Sponsored Listings`,
      description: `Comprehensive advertising revenue analysis for ${symbol} with ad revenue growth and monetization trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/advertising-revenue/${ticker.toLowerCase()}`,
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

export default async function AdvertisingRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/advertising-revenue/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const advertisingFaqs = [
    {
      question: `What is ${symbol} advertising revenue?`,
      answer: `${symbol} advertising revenue represents income from sellers and brands paying to promote their products or services on the platform. This includes sponsored product listings, display ads, search ads, and other promotional placements across the marketplace.`
    },
    {
      question: `How does ${symbol} generate advertising revenue?`,
      answer: `${companyName} generates advertising revenue through: sponsored product ads in search results, display advertising on product pages, video ads, brand stores, retargeting campaigns, and performance-based advertising where sellers pay per click or conversion.`
    },
    {
      question: `Why is advertising revenue important for ${symbol}?`,
      answer: `Advertising revenue is highly valuable for ${companyName} because it has exceptionally high margins (80%+), scales with marketplace growth, requires minimal incremental costs, and taps into sellers' willingness to pay for customer acquisition and visibility on the platform.`
    },
    {
      question: `How fast is ${symbol} advertising revenue growing?`,
      answer: `Marketplace advertising is typically one of the fastest-growing revenue segments for platforms like ${companyName}. Growth rates often exceed 20-30% annually as more sellers adopt performance marketing and compete for visibility. Check the financials for ${symbol}'s specific growth rate.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Advertising Revenue`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Advertising Revenue - Ad Revenue Analysis & Trends`,
      description: `Comprehensive advertising revenue analysis for ${symbol} (${companyName}) with ad revenue growth and monetization trends.`,
      url: pageUrl,
      keywords: [`${symbol} advertising revenue`, `${symbol} ad revenue`, `${symbol} sponsored products`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(advertisingFaqs),
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
            <span>{symbol} Advertising Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Advertising Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Ad revenue, sponsored listings & monetization trends</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 mb-8">
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

          {/* Advertising Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📢</div>
              <h2 className="text-2xl font-bold mb-2">Advertising Revenue Analysis</h2>
              <p className="text-muted-foreground mb-6">Analyze {symbol}'s advertising revenue, sponsored listings, and ad monetization trends</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Advertising Metrics
              </Link>
            </div>
          </section>

          {/* Advertising Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Advertising Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Advertising Revenue', desc: 'Sponsored ads & promotions' },
                { name: 'Ad Revenue Growth Rate', desc: 'YoY advertising change' },
                { name: 'Ad Revenue per User', desc: 'Monetization efficiency' },
                { name: 'Ad Load', desc: '% of listings with ads' },
                { name: 'Advertiser Count', desc: 'Active advertising sellers' },
                { name: 'ROAS', desc: 'Return on ad spend for sellers' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Advertising Revenue Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Advertising Revenue Tells You</h2>
            <div className="space-y-3">
              {[
                'Advertising revenue has exceptionally high margins (80%+) and flows directly to profitability',
                'Growing ad revenue faster than GMV shows increasing seller competition and platform monetization',
                'Marketplace advertising is one of the most valuable ad formats due to high purchase intent',
                'Ad revenue growth indicates sellers find the platform effective for customer acquisition',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-pink-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 p-8 rounded-xl border border-pink-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Advertising Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} advertising revenue and monetization strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Advertising
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {advertisingFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="advertising-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
