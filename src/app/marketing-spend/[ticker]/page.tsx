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
    title: `${symbol} Marketing Spend - Advertising & Marketing Investment Analysis`,
    description: `${symbol} marketing spend analysis with advertising investment, marketing ROI, and brand building metrics. Understand how ${symbol} invests in marketing and advertising to drive growth.`,
    keywords: [
      `${symbol} marketing spend`,
      `${symbol} advertising`,
      `${symbol} marketing investment`,
      `${symbol} marketing ROI`,
      `${symbol} advertising budget`,
      `${symbol} brand investment`,
    ],
    openGraph: {
      title: `${symbol} Marketing Spend | Advertising Investment Analysis`,
      description: `Comprehensive marketing spend analysis for ${symbol} with advertising investment and ROI metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/marketing-spend/${ticker.toLowerCase()}`,
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

export default async function MarketingSpendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/marketing-spend/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const marketingSpendFaqs = [
    {
      question: `What is ${symbol} marketing spend?`,
      answer: `${symbol} marketing spend represents ${companyName}'s investment in advertising, promotional activities, brand building, digital marketing, sponsorships, and customer acquisition. This spending drives brand awareness, customer engagement, and sales growth.`
    },
    {
      question: `How much does ${symbol} spend on marketing?`,
      answer: `${companyName}'s marketing expenditure is typically reported as part of selling, general, and administrative (SG&A) expenses or disclosed separately in earnings calls and filings. Companies may report marketing as a percentage of revenue or absolute dollar amounts across different channels.`
    },
    {
      question: `Why is marketing spend important for ${symbol}?`,
      answer: `Marketing spend is crucial for ${symbol} because it drives brand equity, customer acquisition, market share gains, pricing power, and long-term competitive positioning. Strategic marketing investment can generate significant returns through increased sales and brand value.`
    },
    {
      question: `What drives ${symbol} marketing investment?`,
      answer: `${companyName}'s marketing investment is driven by growth objectives, competitive dynamics, product launches, brand building needs, digital transformation, customer acquisition costs, market expansion plans, and the expected return on marketing spend.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Marketing Spend`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Marketing Spend - Advertising & Marketing Investment Analysis`,
      description: `Comprehensive marketing spend analysis for ${symbol} (${companyName}) with advertising investment and ROI insights.`,
      url: pageUrl,
      keywords: [`${symbol} marketing spend`, `${symbol} advertising`, `${symbol} marketing investment`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(marketingSpendFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} Marketing Spend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Marketing Spend</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Advertising & marketing investment analysis</p>

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

          {/* Marketing Spend Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📢</div>
              <h2 className="text-2xl font-bold mb-2">Marketing Investment Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed marketing spend metrics, advertising investment, and ROI analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Marketing Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Marketing Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Marketing Spend', desc: 'Total advertising investment' },
                { name: 'Marketing to Revenue %', desc: 'Investment intensity' },
                { name: 'Marketing ROI', desc: 'Return on investment' },
                { name: 'Digital Marketing %', desc: 'Digital channel allocation' },
                { name: 'Customer Acquisition Cost', desc: 'Cost to acquire customers' },
                { name: 'Brand Investment', desc: 'Long-term brand building' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Marketing Spend Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Marketing Spend Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Increased marketing spend often indicates growth initiatives and market expansion plans',
                'High marketing ROI demonstrates effective brand building and customer acquisition',
                'Digital marketing allocation reflects modern consumer engagement strategies',
                'Marketing efficiency improvements can drive margin expansion and profitability',
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
            <h2 className="text-2xl font-bold mb-4">Complete Marketing Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} marketing spend and advertising investment</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Marketing
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketingSpendFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="marketing-spend" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
