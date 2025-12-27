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
    title: `${symbol} Capital Expenditures - CapEx Analysis & Investment Trends`,
    description: `${symbol} capital expenditure analysis with CapEx trends, investment efficiency, and asset spending patterns. Understand how ${symbol} invests in property, plant, and equipment.`,
    keywords: [
      `${symbol} capex`,
      `${symbol} capital expenditures`,
      `${symbol} capital spending`,
      `${symbol} CapEx analysis`,
      `${symbol} investment trends`,
      `${symbol} PP&E spending`,
    ],
    openGraph: {
      title: `${symbol} Capital Expenditures | CapEx Analysis & Trends`,
      description: `Comprehensive capital expenditure analysis for ${symbol} with CapEx trends and investment metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/capex/${ticker.toLowerCase()}`,
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

export default async function CapexPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/capex/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const capexFaqs = [
    {
      question: `What is ${symbol} capital expenditure?`,
      answer: `${symbol} capital expenditures (CapEx) represent the funds used by ${companyName} to acquire, upgrade, and maintain physical assets such as property, plant, equipment, and technology infrastructure. This shows how much the company invests in long-term growth.`
    },
    {
      question: `How is CapEx calculated for ${symbol}?`,
      answer: `CapEx for ${symbol} is found in the cash flow statement under investing activities. It includes purchases of property, plant, and equipment (PP&E), technology investments, and other long-term asset acquisitions minus any proceeds from asset sales.`
    },
    {
      question: `Is high CapEx good or bad for ${symbol}?`,
      answer: `High CapEx for ${symbol} can indicate growth investments and expansion, which is positive if it leads to revenue growth. However, excessive CapEx relative to cash flow may strain liquidity. The key is whether investments generate adequate returns.`
    },
    {
      question: `What is ${symbol} CapEx to sales ratio?`,
      answer: `The CapEx to sales ratio shows how much ${companyName} invests in capital assets relative to revenue. A higher ratio indicates capital-intensive operations, while a lower ratio suggests more asset-light business models. Industry comparison is essential.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} CapEx`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Capital Expenditures - CapEx Analysis & Investment Trends`,
      description: `Comprehensive capital expenditure analysis for ${symbol} (${companyName}) with CapEx trends and investment efficiency metrics.`,
      url: pageUrl,
      keywords: [`${symbol} capex`, `${symbol} capital expenditures`, `${symbol} CapEx analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(capexFaqs),
    getTableSchema({
      name: `${symbol} Capex History`,
      description: `Historical Capex data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Capex', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} CapEx</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Capital Expenditures</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - CapEx analysis & investment spending trends</p>

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

          {/* CapEx Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold mb-2">Capital Expenditure Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed CapEx metrics, trends, and investment efficiency analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Cash Flow Statements
              </Link>
            </div>
          </section>

          {/* CapEx Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key CapEx Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total CapEx', desc: 'Annual capital spending' },
                { name: 'CapEx to Revenue', desc: 'Capital intensity ratio' },
                { name: 'CapEx to OCF', desc: 'Reinvestment rate' },
                { name: 'Maintenance CapEx', desc: 'Sustaining investments' },
                { name: 'Growth CapEx', desc: 'Expansion investments' },
                { name: 'CapEx Growth Rate', desc: 'YoY spending change' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What CapEx Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What CapEx Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Higher CapEx often indicates growth investments in new facilities, equipment, or technology',
                'CapEx trends show whether the company is expanding, maintaining, or contracting operations',
                'CapEx to revenue ratio reveals capital intensity and competitive dynamics of the industry',
                'Declining CapEx may signal reduced growth opportunities or improved asset efficiency',
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
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} capital expenditures and investment trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {capexFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="capex" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
