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
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-[#479ffa] transition-colors duration-200">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-[#479ffa] transition-colors duration-200">Financials</Link>
            {' / '}
            <span>{symbol} Marketing Spend</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Marketing Spend</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Advertising & marketing investment analysis</p>

          {/* Price Card */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8 hover:bg-white/[0.07] transition-all duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold tabular-nums ${snapshot.day_change_percent >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-[#868f97] text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold tabular-nums">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-[#868f97] text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold tabular-nums">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketing Spend Overview */}
          <section className="mb-12">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10 hover:bg-white/[0.07] transition-all duration-200">
              <div className="text-6xl mb-4">📢</div>
              <h2 className="text-2xl font-bold mb-2 text-balance">Marketing Investment Analysis</h2>
              <p className="text-[#868f97] mb-6">Detailed marketing spend metrics, advertising investment, and ROI analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ebe96] focus:ring-offset-2 focus:ring-offset-black">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Marketing Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Key Marketing Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Marketing Spend', desc: 'Total advertising investment' },
                { name: 'Marketing to Revenue %', desc: 'Investment intensity' },
                { name: 'Marketing ROI', desc: 'Return on investment' },
                { name: 'Digital Marketing %', desc: 'Digital channel allocation' },
                { name: 'Customer Acquisition Cost', desc: 'Cost to acquire customers' },
                { name: 'Brand Investment', desc: 'Long-term brand building' },
              ].map((metric, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/[0.07] transition-all duration-200">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-[#868f97]">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Marketing Spend Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">What Marketing Spend Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Increased marketing spend often indicates growth initiatives and market expansion plans',
                'High marketing ROI demonstrates effective brand building and customer acquisition',
                'Digital marketing allocation reflects modern consumer engagement strategies',
                'Marketing efficiency improvements can drive margin expansion and profitability',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[#4ebe96] text-lg">✓</span>
                  <p className="text-[#868f97]">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-[#4ebe96]/30 text-center mb-12 hover:bg-white/[0.07] transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-balance">Complete Marketing Analysis</h2>
            <p className="text-[#868f97] mb-6">Get AI-powered analysis of {symbol} marketing spend and advertising investment</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black px-8 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ebe96] focus:ring-offset-2 focus:ring-offset-black">
              Analyze {symbol} Marketing
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketingSpendFaqs.map((faq, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm p-5 rounded-lg border border-white/10 hover:bg-white/[0.07] transition-all duration-200">
                  <h3 className="font-bold text-lg mb-2 text-balance">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
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
