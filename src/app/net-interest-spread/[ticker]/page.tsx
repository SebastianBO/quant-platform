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
    title: `${symbol} Net Interest Spread - NIS Analysis & Margins`,
    description: `${symbol} net interest spread analysis with NIS trends, margin expansion, and profitability metrics. Track ${symbol}'s lending spreads and unit economics.`,
    keywords: [
      `${symbol} net interest spread`,
      `${symbol} NIS`,
      `${symbol} interest margin`,
      `${symbol} lending spread`,
      `${symbol} interest rate spread`,
      `${symbol} unit economics`,
    ],
    openGraph: {
      title: `${symbol} Net Interest Spread | NIS & Margin Analysis`,
      description: `Comprehensive net interest spread analysis for ${symbol} with margin trends and profitability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/net-interest-spread/${ticker.toLowerCase()}`,
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

export default async function NetInterestSpreadPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/net-interest-spread/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What is ${symbol} net interest spread?`,
      answer: `${symbol} net interest spread (NIS) is the difference between the interest rate charged on loans and the cost of funds. For ${companyName}, this represents the core profitability of lending operations before operating expenses.`
    },
    {
      question: `Why is net interest spread important for ${symbol}?`,
      answer: `Net interest spread is crucial for ${symbol} as it directly impacts profitability and sustainability. Higher spreads indicate better pricing power, efficient funding, and stronger unit economics in the lending business.`
    },
    {
      question: `What is a good net interest spread for ${symbol}?`,
      answer: `A healthy net interest spread for ${symbol} typically ranges from 5-10% for consumer lenders, though this varies by product type and risk profile. Compare ${symbol}'s NIS to competitors and track trends over time.`
    },
    {
      question: `How can ${symbol} improve net interest spread?`,
      answer: `${symbol} can improve NIS by: raising loan rates (if market allows), reducing funding costs, improving credit quality to justify higher rates, and optimizing the product mix toward higher-margin offerings.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Net Interest Spread`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Net Interest Spread - NIS Analysis & Margins`,
      description: `Comprehensive net interest spread analysis for ${symbol} (${companyName}) with margin trends and unit economics.`,
      url: pageUrl,
      keywords: [`${symbol} net interest spread`, `${symbol} NIS`, `${symbol} lending margin`],
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
    getTableSchema({
      name: `${symbol} Net Interest Spread History`,
      description: `Historical Net Interest Spread data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Net Interest Spread', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Lending Metrics</Link>
            {' / '}
            <span>{symbol} Net Interest Spread</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Net Interest Spread</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - NIS analysis & lending margins</p>

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

          {/* Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Net Interest Spread Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed analysis of {symbol} lending margins, NIS trends, and unit economics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key NIS Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Net Interest Spread', desc: 'Loan rate minus funding cost' },
                { name: 'Average Loan Rate', desc: 'Weighted avg interest rate' },
                { name: 'Cost of Funds', desc: 'Blended funding cost' },
                { name: 'NIS Trend', desc: 'Quarterly spread movement' },
                { name: 'Product Mix Impact', desc: 'Mix effect on spread' },
                { name: 'Spread vs Peers', desc: 'Competitive comparison' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Net Interest Spread</h2>
            <div className="space-y-3">
              {[
                'Higher NIS indicates better pricing power and competitive positioning',
                'Expanding spreads suggest improving unit economics and profitability',
                'NIS must cover operating costs, credit losses, and provide profit margin',
                'Monitor spread compression as competition or funding costs increase',
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
            <h2 className="text-2xl font-bold mb-4">Complete Margin Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} net interest spread and profitability metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Margins
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

          <RelatedLinks ticker={symbol} currentPage="net-interest-spread" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
