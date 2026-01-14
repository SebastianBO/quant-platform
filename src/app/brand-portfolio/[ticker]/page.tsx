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
    title: `${symbol} Brand Portfolio - Product Brands & Portfolio Strategy`,
    description: `${symbol} brand portfolio analysis with product brands, portfolio strategy, and brand equity metrics. Understand how ${symbol} manages its portfolio of brands and products.`,
    keywords: [
      `${symbol} brand portfolio`,
      `${symbol} brands`,
      `${symbol} product portfolio`,
      `${symbol} brand strategy`,
      `${symbol} portfolio management`,
      `${symbol} brand equity`,
    ],
    openGraph: {
      title: `${symbol} Brand Portfolio | Product Brands & Strategy`,
      description: `Comprehensive brand portfolio analysis for ${symbol} with product brands and portfolio strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/brand-portfolio/${ticker.toLowerCase()}`,
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

export default async function BrandPortfolioPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/brand-portfolio/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const brandPortfolioFaqs = [
    {
      question: `What is ${symbol} brand portfolio?`,
      answer: `${symbol} brand portfolio encompasses all the brands, products, and sub-brands owned and managed by ${companyName}. It represents the company's strategic approach to serving different market segments, price points, and customer needs through multiple brand offerings.`
    },
    {
      question: `How does ${symbol} manage its brand portfolio?`,
      answer: `${companyName} manages its brand portfolio through strategic positioning, resource allocation, brand architecture, portfolio pruning, M&A activity, brand building investments, and continuous evaluation of each brand's contribution to overall growth and profitability.`
    },
    {
      question: `Why is brand portfolio important for ${symbol}?`,
      answer: `Brand portfolio is crucial for ${symbol} because it enables market segmentation, risk diversification, pricing flexibility, competitive differentiation, and cross-selling opportunities. A strong portfolio of brands can drive sustainable growth and premium valuations.`
    },
    {
      question: `What makes a strong brand portfolio for ${symbol}?`,
      answer: `A strong brand portfolio for ${companyName} includes high-equity brands, clear positioning, complementary offerings, balanced risk exposure, innovation pipeline, geographic diversification, and brands that generate sustainable competitive advantages and pricing power.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Brand Portfolio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Brand Portfolio - Product Brands & Portfolio Strategy`,
      description: `Comprehensive brand portfolio analysis for ${symbol} (${companyName}) with product brands and strategic insights.`,
      url: pageUrl,
      keywords: [`${symbol} brand portfolio`, `${symbol} brands`, `${symbol} portfolio strategy`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(brandPortfolioFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Brand Portfolio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Brand Portfolio</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Product brands & portfolio strategy</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
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

          {/* Brand Portfolio Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold mb-2">Brand Portfolio Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed brand portfolio metrics, product brands, and strategic positioning for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Company Analysis
              </Link>
            </div>
          </section>

          {/* Portfolio Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Portfolio Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Number of Brands', desc: 'Total brand count' },
                { name: 'Top Brand Revenue %', desc: 'Leading brand contribution' },
                { name: 'Brand Equity Score', desc: 'Portfolio brand strength' },
                { name: 'Portfolio Diversity', desc: 'Risk distribution' },
                { name: 'Premium Brand Mix', desc: 'High-end brand share' },
                { name: 'Brand Growth Rate', desc: 'Portfolio expansion' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Brand Portfolio Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Brand Portfolio Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Diversified brand portfolio reduces dependency risk and enables multi-segment growth',
                'Strong heritage brands provide stable cash flow and market presence',
                'Emerging brands in the portfolio signal innovation and future growth potential',
                'Premium brand concentration indicates pricing power and margin expansion opportunities',
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
            <h2 className="text-2xl font-bold mb-4">Complete Brand Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} brand portfolio and product strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Brands
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {brandPortfolioFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="brand-portfolio" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
