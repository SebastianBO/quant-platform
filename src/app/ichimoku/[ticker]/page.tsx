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
    title: `${symbol} Ichimoku Cloud Analysis - Technical Indicator Signals`,
    description: `${symbol} Ichimoku Cloud analysis with Tenkan-sen, Kijun-sen, Senkou Span A/B, and Chikou Span. Track ${symbol} trend direction and trading signals.`,
    keywords: [
      `${symbol} ichimoku`,
      `${symbol} ichimoku cloud`,
      `${symbol} tenkan sen`,
      `${symbol} kijun sen`,
      `${symbol} ichimoku signals`,
      `${symbol} kumo cloud`,
    ],
    openGraph: {
      title: `${symbol} Ichimoku Cloud Analysis | Technical Indicator Signals`,
      description: `Comprehensive ${symbol} Ichimoku Cloud analysis with trend signals and support/resistance levels.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ichimoku/${ticker.toLowerCase()}`,
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

export default async function IchimokuPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ichimoku/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const ichimokuFaqs = [
    {
      question: `What is ${symbol} Ichimoku Cloud?`,
      answer: `${symbol} Ichimoku Cloud is a comprehensive technical indicator that shows support/resistance levels, trend direction, and momentum. Currently trading at $${price.toFixed(2)}, the cloud provides multiple data points in a single view for trend analysis.`
    },
    {
      question: `How do you read ${symbol} Ichimoku signals?`,
      answer: `${symbol} Ichimoku signals are read by analyzing five components: Tenkan-sen (Conversion Line), Kijun-sen (Base Line), Senkou Span A/B (Leading Spans forming the cloud), and Chikou Span (Lagging Span). Bullish signals occur when price is above the cloud, bearish when below.`
    },
    {
      question: `What are the components of ${symbol} Ichimoku Cloud?`,
      answer: `${symbol} Ichimoku Cloud consists of five lines: Tenkan-sen (9-period), Kijun-sen (26-period), Senkou Span A (average of Tenkan and Kijun projected 26 periods ahead), Senkou Span B (52-period midpoint projected ahead), and Chikou Span (current price shifted back 26 periods).`
    },
    {
      question: `Is ${symbol} showing bullish Ichimoku signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the Ichimoku Cloud analysis below for detailed trend signals, support/resistance levels, and crossover patterns.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Ichimoku`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Ichimoku Cloud Analysis - Technical Indicator Signals`,
      description: `Comprehensive Ichimoku Cloud analysis for ${symbol} (${companyName}) with trend signals and support/resistance levels.`,
      url: pageUrl,
      keywords: [`${symbol} ichimoku`, `${symbol} ichimoku cloud`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ichimokuFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Technical Analysis</Link>
            {' / '}
            <span>{symbol} Ichimoku Cloud</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Ichimoku Cloud Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Ichimoku Kinko Hyo indicator signals</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Change</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
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

          {/* Ichimoku Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ichimoku Cloud Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Tenkan-sen', desc: 'Conversion Line (9-period)', value: 'Fast moving average' },
                { name: 'Kijun-sen', desc: 'Base Line (26-period)', value: 'Medium-term trend indicator' },
                { name: 'Senkou Span A', desc: 'Leading Span A', value: 'Average of Tenkan and Kijun' },
                { name: 'Senkou Span B', desc: 'Leading Span B (52-period)', value: 'Longer-term support/resistance' },
                { name: 'Chikou Span', desc: 'Lagging Span', value: 'Price shifted back 26 periods' },
                { name: 'Kumo Cloud', desc: 'Cloud between Spans', value: 'Support/resistance zone' },
              ].map((component, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-lg">{component.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{component.desc}</p>
                  <p className="text-xs text-muted-foreground">{component.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trading Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ichimoku Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price trading above the Kumo cloud</li>
                  <li>• Tenkan-sen crossing above Kijun-sen (TK Cross)</li>
                  <li>• Chikou Span above price from 26 periods ago</li>
                  <li>• Cloud turning from red to green (Span A > Span B)</li>
                  <li>• Price bouncing off cloud support</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Price trading below the Kumo cloud</li>
                  <li>• Tenkan-sen crossing below Kijun-sen</li>
                  <li>• Chikou Span below price from 26 periods ago</li>
                  <li>• Cloud turning from green to red (Span A &lt; Span B)</li>
                  <li>• Price rejecting at cloud resistance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full Ichimoku Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time Ichimoku signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ichimokuFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="ichimoku" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
