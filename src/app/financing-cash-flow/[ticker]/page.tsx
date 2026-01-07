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
    title: `${symbol} Financing Cash Flow - Debt, Dividends & Capital Raising Analysis`,
    description: `${symbol} financing cash flow analysis with debt issuance, dividend payments, buybacks, and equity financing. Understand how ${symbol} manages capital structure and returns to shareholders.`,
    keywords: [
      `${symbol} financing cash flow`,
      `${symbol} debt issuance`,
      `${symbol} dividend payments`,
      `${symbol} share buybacks`,
      `${symbol} capital raising`,
      `${symbol} CFF analysis`,
    ],
    openGraph: {
      title: `${symbol} Financing Cash Flow | Capital Structure & Shareholder Returns`,
      description: `Comprehensive financing cash flow analysis for ${symbol} with debt, dividends, and capital structure trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/financing-cash-flow/${ticker.toLowerCase()}`,
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

export default async function FinancingCashFlowPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/financing-cash-flow/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const fcfFaqs = [
    {
      question: `What is ${symbol} financing cash flow?`,
      answer: `${symbol} financing cash flow (CFF) represents cash flows from transactions with the company's owners and creditors. This includes debt issuance/repayment, dividend payments, share buybacks, and equity offerings. It shows how ${companyName} manages its capital structure.`
    },
    {
      question: `What activities are included in ${symbol} financing cash flow?`,
      answer: `${symbol}'s financing cash flow includes: debt borrowing and repayments, dividend payments to shareholders, stock buybacks (treasury stock purchases), proceeds from issuing new shares, and payments of finance lease obligations. These activities reflect capital structure decisions.`
    },
    {
      question: `Is positive or negative financing cash flow better for ${symbol}?`,
      answer: `It depends on the situation. Negative CFF for ${symbol} often indicates debt repayment, dividend payments, or buybacks (returning cash to shareholders). Positive CFF may show debt or equity financing for growth. The key is whether financing activities align with business strategy.`
    },
    {
      question: `How does financing cash flow affect ${symbol} shareholders?`,
      answer: `Financing cash flow directly impacts ${symbol} shareholders through dividends, buybacks, and capital structure changes. Share buybacks reduce shares outstanding, potentially increasing EPS. Dividend payments provide direct returns. New equity dilutes ownership while debt affects financial risk.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Financing Cash Flow`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Financing Cash Flow - Debt, Dividends & Capital Raising Analysis`,
      description: `Comprehensive financing cash flow analysis for ${symbol} (${companyName}) with capital structure and shareholder return metrics.`,
      url: pageUrl,
      keywords: [`${symbol} financing cash flow`, `${symbol} CFF`, `${symbol} capital structure`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fcfFaqs),
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
            <span>{symbol} Financing Cash Flow</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Financing Cash Flow</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Capital structure & shareholder return analysis</p>

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

          {/* Financing CF Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🏦</div>
              <h2 className="text-2xl font-bold mb-2">Financing Cash Flow Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed financing activities, debt management, dividends, and buybacks for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Cash Flow Statements
              </Link>
            </div>
          </section>

          {/* Financing CF Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Financing Cash Flow Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Debt Issuance', desc: 'New borrowings' },
                { name: 'Debt Repayment', desc: 'Principal payments' },
                { name: 'Dividend Payments', desc: 'Cash to shareholders' },
                { name: 'Share Buybacks', desc: 'Treasury stock purchases' },
                { name: 'Equity Issuance', desc: 'New shares issued' },
                { name: 'Net CFF', desc: 'Total financing cash flow' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Financing CF Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Financing Cash Flow Tells You</h2>
            <div className="space-y-3">
              {[
                'Negative CFF often shows shareholder-friendly activities like dividends and buybacks',
                'Debt issuance may fund growth investments or refinance existing obligations at better rates',
                'Consistent dividend payments and buybacks demonstrate strong cash generation and commitment to shareholders',
                'Changes in financing activities reveal management\'s views on capital costs and growth opportunities',
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
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} financing activities and capital structure</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fcfFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="financing-cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
