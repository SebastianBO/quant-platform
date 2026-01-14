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
    title: `${symbol} Funding Costs - Cost of Capital & Financing Analysis`,
    description: `${symbol} funding cost analysis with cost of capital, financing rates, and funding efficiency metrics. Track ${symbol}'s borrowing costs and capital structure.`,
    keywords: [
      `${symbol} funding costs`,
      `${symbol} cost of capital`,
      `${symbol} financing rates`,
      `${symbol} borrowing costs`,
      `${symbol} debt financing`,
      `${symbol} capital costs`,
    ],
    openGraph: {
      title: `${symbol} Funding Costs | Cost of Capital Analysis`,
      description: `Comprehensive funding cost analysis for ${symbol} with financing rates and capital efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/funding-costs/${ticker.toLowerCase()}`,
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

export default async function FundingCostsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/funding-costs/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What are funding costs for ${symbol}?`,
      answer: `Funding costs for ${symbol} represent the interest rate and fees paid to borrow capital for lending operations. For ${companyName}, this includes costs from warehouse lines, asset-backed securities, deposits, and other debt instruments.`
    },
    {
      question: `Why are funding costs important for ${symbol}?`,
      answer: `Funding costs are critical for ${symbol} as they directly impact profitability through net interest spread. Lower funding costs enable competitive loan pricing while maintaining margins, or higher profitability at market rates.`
    },
    {
      question: `What is a good funding cost for ${symbol}?`,
      answer: `Competitive funding costs for ${symbol} typically range from 3-8% depending on credit profile and market conditions. Established lenders with strong credit ratings generally achieve lower costs than newer, unrated companies.`
    },
    {
      question: `How can ${symbol} reduce funding costs?`,
      answer: `${symbol} can reduce funding costs through: improved credit ratings, diversified funding sources, asset-backed securitization, deposit gathering (if applicable), and strong lender relationships.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Funding Costs`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Funding Costs - Cost of Capital & Financing Analysis`,
      description: `Comprehensive funding cost analysis for ${symbol} (${companyName}) with financing rates and capital efficiency.`,
      url: pageUrl,
      keywords: [`${symbol} funding costs`, `${symbol} cost of capital`, `${symbol} financing rates`],
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
            <span>{symbol} Funding Costs</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Funding Costs</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Cost of capital & financing analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
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
              <div className="text-6xl mb-4">🏦</div>
              <h2 className="text-2xl font-bold mb-2">Funding Cost Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed analysis of {symbol} cost of capital, financing rates, and funding efficiency</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Funding Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Weighted Avg Cost', desc: 'Blended funding rate' },
                { name: 'Funding Mix', desc: 'Debt vs equity breakdown' },
                { name: 'Cost Trend', desc: 'Quarterly cost movement' },
                { name: 'Funding Capacity', desc: 'Available borrowing capacity' },
                { name: 'Debt Maturity', desc: 'Refinancing schedule' },
                { name: 'Credit Spreads', desc: 'Cost vs benchmark rates' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Funding Costs</h2>
            <div className="space-y-3">
              {[
                'Lower funding costs directly improve net interest margins and profitability',
                'Diversified funding sources reduce concentration risk and improve stability',
                'Rising interest rate environments increase funding costs and compress spreads',
                'Access to low-cost funding is a key competitive advantage in lending',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-amber-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Capital Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} funding costs and capital structure</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Funding
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

          <RelatedLinks ticker={symbol} currentPage="funding-costs" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
