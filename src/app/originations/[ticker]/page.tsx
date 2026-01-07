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
    title: `${symbol} Loan Originations - Volume, Growth & Trends`,
    description: `${symbol} loan origination analysis with volume trends, growth rates, and lending activity. Track ${symbol}'s new loan production and origination metrics.`,
    keywords: [
      `${symbol} loan originations`,
      `${symbol} origination volume`,
      `${symbol} new loans`,
      `${symbol} lending volume`,
      `${symbol} loan production`,
      `${symbol} origination growth`,
    ],
    openGraph: {
      title: `${symbol} Loan Originations | Volume & Growth Analysis`,
      description: `Comprehensive loan origination analysis for ${symbol} with volume trends and lending metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/originations/${ticker.toLowerCase()}`,
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

export default async function OriginationsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/originations/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What are loan originations for ${symbol}?`,
      answer: `Loan originations for ${symbol} represent the total volume of new loans created during a specific period. This metric shows ${companyName}'s lending activity and business growth in its lending operations.`
    },
    {
      question: `Why are loan originations important for ${symbol}?`,
      answer: `Loan originations are critical for ${symbol} as they drive revenue growth, indicate market demand, and reflect the company's competitive position in lending. Higher originations typically lead to increased interest income and fees.`
    },
    {
      question: `How do loan originations affect ${symbol} stock price?`,
      answer: `Strong loan origination growth can positively impact ${symbol}'s stock price by signaling business expansion, market share gains, and future revenue potential. Declining originations may raise concerns about competitive pressures or market conditions.`
    },
    {
      question: `What is a good origination growth rate for ${symbol}?`,
      answer: `A healthy origination growth rate for ${symbol} typically ranges from 15-30% year-over-year in growth markets, though this varies by company maturity and market conditions. Compare ${symbol}'s growth to industry peers for context.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Loan Originations`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Loan Originations - Volume, Growth & Trends`,
      description: `Comprehensive loan origination analysis for ${symbol} (${companyName}) with volume trends and lending metrics.`,
      url: pageUrl,
      keywords: [`${symbol} loan originations`, `${symbol} origination volume`, `${symbol} lending growth`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqItems),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Lending Metrics</Link>
            {' / '}
            <span>{symbol} Loan Originations</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Loan Originations</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Loan volume, growth & lending trends</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
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

          {/* Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold mb-2">Loan Originations Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol} loan origination volume, growth trends, and lending activity metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Origination Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Originations', desc: 'New loan volume' },
                { name: 'Origination Growth', desc: 'YoY growth rate' },
                { name: 'Originations per Quarter', desc: 'Quarterly volume trend' },
                { name: 'Average Ticket Size', desc: 'Average loan amount' },
                { name: 'Origination Mix', desc: 'Product breakdown' },
                { name: 'Market Share', desc: 'Competitive position' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What It Means */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Loan Originations Tell You</h2>
            <div className="space-y-3">
              {[
                'Higher originations indicate strong demand and market presence',
                'Consistent growth suggests sustainable business model and competitive advantage',
                'Origination quality matters as much as volume - focus on credit standards',
                'Seasonal patterns may affect quarterly comparisons',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-purple-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Lending Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} loan originations and lending trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Metrics
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="originations" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
