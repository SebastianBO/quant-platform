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
    title: `${symbol} Investing Cash Flow - Investment Activities & CapEx Analysis`,
    description: `${symbol} investing cash flow analysis with capital expenditures, acquisitions, and investment activities. Understand how ${symbol} deploys capital for long-term growth.`,
    keywords: [
      `${symbol} investing cash flow`,
      `${symbol} investment activities`,
      `${symbol} capital allocation`,
      `${symbol} CapEx spending`,
      `${symbol} acquisitions`,
      `${symbol} CFI analysis`,
    ],
    openGraph: {
      title: `${symbol} Investing Cash Flow | Capital Allocation & Investment Analysis`,
      description: `Comprehensive investing cash flow analysis for ${symbol} with capital deployment and investment activity trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/investing-cash-flow/${ticker.toLowerCase()}`,
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

export default async function InvestingCashFlowPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/investing-cash-flow/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const icfFaqs = [
    {
      question: `What is ${symbol} investing cash flow?`,
      answer: `${symbol} investing cash flow (CFI) represents cash used for or generated from investment activities. This includes capital expenditures (CapEx), acquisitions, asset sales, and investments in securities. It shows how ${companyName} deploys capital for long-term growth.`
    },
    {
      question: `Why is investing cash flow usually negative for ${symbol}?`,
      answer: `Investing cash flow is typically negative for ${symbol} because growing companies invest in property, equipment, technology, and acquisitions. Negative CFI indicates capital deployment for future growth, which is generally positive if investments generate adequate returns.`
    },
    {
      question: `What activities are in investing cash flow for ${symbol}?`,
      answer: `${symbol}'s investing cash flow includes: capital expenditures (PP&E purchases), business acquisitions, purchases/sales of marketable securities, investments in other companies, and proceeds from selling assets. These activities impact long-term value creation.`
    },
    {
      question: `Is negative investing cash flow bad for ${symbol}?`,
      answer: `Not necessarily. Negative investing cash flow for ${symbol} often indicates growth investments in assets, technology, or acquisitions. It's concerning only if investments don't generate returns or if the company can't fund investments from operating cash flow or reasonable financing.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Investing Cash Flow`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Investing Cash Flow - Investment Activities & CapEx Analysis`,
      description: `Comprehensive investing cash flow analysis for ${symbol} (${companyName}) with capital deployment and investment trends.`,
      url: pageUrl,
      keywords: [`${symbol} investing cash flow`, `${symbol} CFI`, `${symbol} capital allocation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(icfFaqs),
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
            <span>{symbol} Investing Cash Flow</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Investing Cash Flow</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Investment activities & capital allocation analysis</p>

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

          {/* Investing CF Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Investing Cash Flow Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed investment activities, CapEx, acquisitions, and capital allocation for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Cash Flow Statements
              </Link>
            </div>
          </section>

          {/* Investing CF Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investing Cash Flow Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Capital Expenditures', desc: 'PP&E investments' },
                { name: 'Business Acquisitions', desc: 'M&A spending' },
                { name: 'Investment Purchases', desc: 'Securities & investments' },
                { name: 'Asset Sales', desc: 'Proceeds from disposals' },
                { name: 'Investment Sales', desc: 'Securities sold' },
                { name: 'Net CFI', desc: 'Total investing cash flow' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Investing CF Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Investing Cash Flow Tells You</h2>
            <div className="space-y-3">
              {[
                'Negative CFI typically indicates growth investments in assets, acquisitions, or technology',
                'Large CapEx shows significant infrastructure investments for future revenue growth',
                'Acquisitions reveal management\'s growth strategy and capital allocation priorities',
                'Positive CFI may indicate asset sales or divestments, potentially for restructuring or debt reduction',
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
            <h2 className="text-2xl font-bold mb-4">Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} investing activities and capital allocation</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {icfFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="investing-cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
