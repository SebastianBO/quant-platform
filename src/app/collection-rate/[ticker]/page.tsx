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
    title: `${symbol} Collection Rate - Recovery & Collections Analysis`,
    description: `${symbol} collection rate analysis with recovery metrics, collections efficiency, and delinquency management. Track ${symbol}'s ability to collect on defaulted loans.`,
    keywords: [
      `${symbol} collection rate`,
      `${symbol} recovery rate`,
      `${symbol} collections`,
      `${symbol} loan recovery`,
      `${symbol} default collections`,
      `${symbol} recovery metrics`,
    ],
    openGraph: {
      title: `${symbol} Collection Rate | Recovery & Collections Analysis`,
      description: `Comprehensive collection rate analysis for ${symbol} with recovery trends and collections metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/collection-rate/${ticker.toLowerCase()}`,
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

export default async function CollectionRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/collection-rate/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqItems = [
    {
      question: `What is ${symbol} collection rate?`,
      answer: `${symbol} collection rate measures the percentage of defaulted or delinquent loan balances successfully recovered through collections efforts. For ${companyName}, this indicates the effectiveness of recovery operations and reduces net credit losses.`
    },
    {
      question: `Why is collection rate important for ${symbol}?`,
      answer: `Collection rate is important for ${symbol} because it directly reduces net losses and improves profitability. Higher collection rates indicate effective recovery processes, better loan documentation, and skilled collections operations.`
    },
    {
      question: `What is a good collection rate for ${symbol}?`,
      answer: `Good collection rates for ${symbol} typically range from 10-30% of charged-off balances for unsecured consumer lending, though this varies by product type and time horizon. Secured lending generally achieves higher recovery rates.`
    },
    {
      question: `How can ${symbol} improve collection rates?`,
      answer: `${symbol} can improve collection rates through: better collections technology, early intervention strategies, skilled collections teams, payment plan flexibility, and effective third-party agency partnerships.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Lending Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Collection Rate`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Collection Rate - Recovery & Collections Analysis`,
      description: `Comprehensive collection rate analysis for ${symbol} (${companyName}) with recovery trends and collections metrics.`,
      url: pageUrl,
      keywords: [`${symbol} collection rate`, `${symbol} recovery rate`, `${symbol} collections`],
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
            <span>{symbol} Collection Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Collection Rate</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Recovery & collections efficiency</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
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
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2">Collection Rate Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol} recovery rates, collections efficiency, and delinquency management performance</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Collections Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Recovery Rate', desc: 'Percentage recovered on defaults' },
                { name: 'Collections Efficiency', desc: 'Cost per dollar recovered' },
                { name: 'Time to Recovery', desc: 'Average collection timeline' },
                { name: 'Roll Rate', desc: 'Delinquency progression' },
                { name: 'Cure Rate', desc: 'Delinquent accounts returning current' },
                { name: 'Net Recovery', desc: 'Recoveries minus collection costs' },
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
            <h2 className="text-2xl font-bold mb-4">Understanding Collection Rates</h2>
            <div className="space-y-3">
              {[
                'Higher recovery rates reduce net credit losses and improve profitability',
                'Effective collections operations require investment in technology and talent',
                'Early intervention in delinquency typically improves recovery outcomes',
                'Collection rates vary significantly by product type and borrower segment',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-cyan-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Collections Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} collection rates and recovery metrics</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Collections
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

          <RelatedLinks ticker={symbol} currentPage="collection-rate" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
