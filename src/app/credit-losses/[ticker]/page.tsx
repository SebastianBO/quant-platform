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
    title: `${symbol} Credit Losses - Charge-Off Rates & Loss Analysis`,
    description: `${symbol} credit loss analysis with charge-off rates, loss trends, and credit quality metrics. Track ${symbol}'s loan performance and risk exposure.`,
    keywords: [
      `${symbol} credit losses`,
      `${symbol} charge-offs`,
      `${symbol} loan losses`,
      `${symbol} default rate`,
      `${symbol} credit quality`,
      `${symbol} loss rate`,
    ],
    openGraph: {
      title: `${symbol} Credit Losses | Charge-Off & Risk Analysis`,
      description: `Comprehensive credit loss analysis for ${symbol} with charge-off trends and credit quality metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/credit-losses/${ticker.toLowerCase()}`,
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

export default async function CreditLossesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/credit-losses/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What are credit losses for ${symbol}?`,
      answer: `Credit losses for ${symbol} represent loans that are written off as uncollectible. For ${companyName}, this metric reflects the cost of credit risk and is typically expressed as a percentage of the loan portfolio.`
    },
    {
      question: `Why are credit losses important for ${symbol}?`,
      answer: `Credit losses are critical for ${symbol} as they directly reduce profitability and can signal credit quality issues. Rising loss rates may indicate weakening underwriting, economic deterioration, or adverse selection in lending.`
    },
    {
      question: `What is a good credit loss rate for ${symbol}?`,
      answer: `Acceptable credit loss rates for ${symbol} vary by product type. Consumer unsecured lending typically sees 3-8% annual losses, while secured lending is lower. Compare ${symbol}'s loss rates to industry benchmarks and historical performance.`
    },
    {
      question: `How do credit losses affect ${symbol} stock price?`,
      answer: `Rising credit losses can negatively impact ${symbol}'s stock price by reducing earnings, indicating risk management issues, and raising concerns about future profitability. Stable or declining losses signal strong credit performance.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Credit Losses`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Credit Losses - Charge-Off Rates & Loss Analysis`,
      description: `Comprehensive credit loss analysis for ${symbol} (${companyName}) with charge-off trends and risk metrics.`,
      url: pageUrl,
      keywords: [`${symbol} credit losses`, `${symbol} charge-offs`, `${symbol} loan losses`],
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
      name: `${symbol} Credit Losses History`,
      description: `Historical Credit Losses data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Credit Losses', 'Change'],
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
            <span>{symbol} Credit Losses</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Credit Losses</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Charge-offs & credit risk analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
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
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Credit Loss Analysis</h2>
              <p className="text-muted-foreground mb-6">Comprehensive analysis of {symbol} charge-offs, loss trends, and credit quality metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Risk Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Credit Loss Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Charge-Off Rate', desc: 'Annual loss percentage' },
                { name: 'Net Charge-Offs', desc: 'Total losses minus recoveries' },
                { name: 'Loss Trend', desc: 'Quarterly movement' },
                { name: 'Delinquency Rate', desc: 'Late payment indicator' },
                { name: 'Loss Reserves', desc: 'Expected future losses' },
                { name: 'Recovery Rate', desc: 'Collections on charged-off loans' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Credit Losses</h2>
            <div className="space-y-3">
              {[
                'Lower loss rates indicate better underwriting and credit quality',
                'Rising losses may signal economic stress or weakening credit standards',
                'Loss rates must be priced into interest rates for sustainable lending',
                'Seasonal patterns and portfolio seasoning affect loss trends',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-orange-500 text-lg">!</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Risk Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} credit losses and risk metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Risk
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

          <RelatedLinks ticker={symbol} currentPage="credit-losses" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
