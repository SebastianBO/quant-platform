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
    title: `${symbol} Operating Cash Flow - OCF Analysis & Trends`,
    description: `${symbol} operating cash flow analysis with OCF trends, margins, and cash generation from core operations. Understand ${symbol}'s ability to generate cash from business activities.`,
    keywords: [
      `${symbol} operating cash flow`,
      `${symbol} OCF`,
      `${symbol} cash from operations`,
      `${symbol} OCF margin`,
      `${symbol} operational cash`,
      `${symbol} CFO analysis`,
    ],
    openGraph: {
      title: `${symbol} Operating Cash Flow | OCF Analysis & Business Performance`,
      description: `Comprehensive operating cash flow analysis for ${symbol} with OCF trends and operational efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/operating-cash-flow/${ticker.toLowerCase()}`,
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

export default async function OperatingCashFlowPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/operating-cash-flow/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const ocfFaqs = [
    {
      question: `What is ${symbol} operating cash flow?`,
      answer: `${symbol} operating cash flow (OCF) represents the cash generated from ${companyName}'s core business operations. It shows how much cash the company produces from selling goods and services, excluding financing and investing activities.`
    },
    {
      question: `How is operating cash flow different from net income for ${symbol}?`,
      answer: `Operating cash flow for ${symbol} shows actual cash generated, while net income includes non-cash items like depreciation and accruals. OCF is often considered a better measure of financial health because it reflects real cash available for the business.`
    },
    {
      question: `Is positive operating cash flow good for ${symbol}?`,
      answer: `Yes, positive operating cash flow is essential for ${companyName}. It indicates the business generates sufficient cash from operations to sustain itself, fund growth, pay dividends, and reduce debt without relying on external financing.`
    },
    {
      question: `What is a good OCF margin for ${symbol}?`,
      answer: `A good OCF margin (Operating Cash Flow / Revenue) for ${symbol} typically exceeds 10-15%, though this varies by industry. Higher margins indicate strong cash generation efficiency and pricing power. Compare ${symbol}'s OCF margin to industry peers.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Operating Cash Flow`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Operating Cash Flow - OCF Analysis & Trends`,
      description: `Comprehensive operating cash flow analysis for ${symbol} (${companyName}) with OCF trends and cash generation metrics.`,
      url: pageUrl,
      keywords: [`${symbol} operating cash flow`, `${symbol} OCF`, `${symbol} cash from operations`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ocfFaqs),
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
            <span>{symbol} Operating Cash Flow</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Operating Cash Flow</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - OCF analysis & cash from core operations</p>

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

          {/* OCF Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💵</div>
              <h2 className="text-2xl font-bold mb-2">Operating Cash Flow Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed OCF metrics, trends, and cash generation from core business for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Cash Flow Statements
              </Link>
            </div>
          </section>

          {/* OCF Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Operating Cash Flow Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Operating Cash Flow', desc: 'Cash from operations' },
                { name: 'OCF Margin', desc: 'OCF as % of revenue' },
                { name: 'OCF to Net Income', desc: 'Quality of earnings' },
                { name: 'OCF Growth Rate', desc: 'YoY OCF change' },
                { name: 'Cash Conversion Cycle', desc: 'Operating efficiency' },
                { name: 'OCF per Share', desc: 'Per-share cash generation' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What OCF Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Operating Cash Flow Tells You</h2>
            <div className="space-y-3">
              {[
                'Positive and growing OCF indicates strong business fundamentals and sustainable operations',
                'OCF higher than net income suggests high-quality earnings with good cash conversion',
                'Consistent OCF generation demonstrates the company can fund operations without external capital',
                'OCF is used to calculate free cash flow, a key metric for investor returns',
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
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} operating cash flow and cash generation trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ocfFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="operating-cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
