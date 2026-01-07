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
    title: `${symbol} Free Cash Flow - FCF Analysis & Trends`,
    description: `${symbol} free cash flow analysis with historical trends, FCF margins, and cash generation metrics. Understand ${symbol}'s ability to generate cash after capital expenditures.`,
    keywords: [
      `${symbol} free cash flow`,
      `${symbol} FCF`,
      `${symbol} cash flow analysis`,
      `${symbol} FCF margin`,
      `${symbol} cash generation`,
      `${symbol} free cash flow trend`,
    ],
    openGraph: {
      title: `${symbol} Free Cash Flow | FCF Analysis & Cash Generation`,
      description: `Comprehensive free cash flow analysis for ${symbol} with historical trends and FCF metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/free-cash-flow/${ticker.toLowerCase()}`,
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

export default async function FreeCashFlowPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/free-cash-flow/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const fcfFaqs = [
    {
      question: `What is ${symbol} free cash flow?`,
      answer: `${symbol} free cash flow (FCF) represents the cash generated after accounting for capital expenditures. It measures how much cash ${companyName} has available to return to shareholders through dividends and buybacks, pay down debt, or reinvest in growth.`
    },
    {
      question: `How is free cash flow calculated for ${symbol}?`,
      answer: `Free cash flow for ${symbol} is calculated as Operating Cash Flow minus Capital Expenditures (CapEx). This metric shows the actual cash available after maintaining and expanding the business infrastructure.`
    },
    {
      question: `Is ${symbol} free cash flow positive or negative?`,
      answer: `View ${symbol}'s detailed cash flow statements to see current FCF trends. Positive FCF indicates ${companyName} generates more cash than it spends on capital investments, while negative FCF may indicate heavy growth investments.`
    },
    {
      question: `Why is free cash flow important for ${symbol} investors?`,
      answer: `Free cash flow is crucial because it shows ${companyName}'s ability to generate cash for shareholders. Strong and growing FCF indicates financial health, flexibility for dividends, and capacity to fund growth without raising external capital.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Free Cash Flow`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Free Cash Flow - FCF Analysis & Trends`,
      description: `Comprehensive free cash flow analysis for ${symbol} (${companyName}) with historical FCF trends and metrics.`,
      url: pageUrl,
      keywords: [`${symbol} free cash flow`, `${symbol} FCF`, `${symbol} cash flow analysis`],
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
            <span>{symbol} Free Cash Flow</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Free Cash Flow</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - FCF analysis & cash generation trends</p>

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

          {/* FCF Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2">Free Cash Flow Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed FCF metrics, trends, and cash generation analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Cash Flow Statements
              </Link>
            </div>
          </section>

          {/* FCF Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Free Cash Flow Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Operating Cash Flow', desc: 'Cash from operations' },
                { name: 'Capital Expenditures', desc: 'CapEx investments' },
                { name: 'Free Cash Flow', desc: 'OCF minus CapEx' },
                { name: 'FCF Margin', desc: 'FCF as % of revenue' },
                { name: 'FCF Yield', desc: 'FCF / Market Cap' },
                { name: 'FCF Growth Rate', desc: 'YoY FCF change' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What FCF Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Free Cash Flow Tells You</h2>
            <div className="space-y-3">
              {[
                'Positive FCF shows the company generates more cash than it spends on operations and capital investments',
                'Growing FCF indicates improving business efficiency and cash generation capabilities',
                'High FCF margin suggests strong profitability and efficient capital allocation',
                'FCF can fund dividends, share buybacks, debt repayment, or strategic acquisitions',
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
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} free cash flow, margins, and trends</p>
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

          <RelatedLinks ticker={symbol} currentPage="free-cash-flow" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
