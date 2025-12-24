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
    title: `${symbol} KST Indicator Analysis - Know Sure Thing Oscillator`,
    description: `${symbol} KST (Know Sure Thing) indicator analysis with momentum oscillator signals. Track ${symbol} trend direction and momentum with Martin Pring's KST.`,
    keywords: [
      `${symbol} KST`,
      `${symbol} know sure thing`,
      `${symbol} KST indicator`,
      `${symbol} momentum oscillator`,
      `${symbol} KST signals`,
      `${symbol} martin pring`,
    ],
    openGraph: {
      title: `${symbol} KST Indicator Analysis | Know Sure Thing Oscillator`,
      description: `Comprehensive ${symbol} KST analysis with momentum signals and trend direction.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/know-sure-thing/${ticker.toLowerCase()}`,
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

export default async function KSTPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/know-sure-thing/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const kstFaqs = [
    {
      question: `What is ${symbol} KST indicator?`,
      answer: `${symbol} KST (Know Sure Thing) is a momentum oscillator developed by Martin Pring that combines four different rate-of-change timeframes. Currently trading at $${price.toFixed(2)}, KST smooths price momentum to identify trend changes and momentum shifts.`
    },
    {
      question: `How do you read ${symbol} KST signals?`,
      answer: `Read ${symbol} KST signals by watching the KST line crossing its signal line and the zero line. Bullish when KST crosses above signal line or zero. Bearish when KST crosses below. Divergences between price and KST warn of potential reversals.`
    },
    {
      question: `What makes ${symbol} KST different from other oscillators?`,
      answer: `${symbol} KST is unique because it combines four different timeframes (10, 15, 20, 30 periods) weighted by importance, providing a more comprehensive view of momentum than single-period oscillators like RSI or Stochastic.`
    },
    {
      question: `Is ${symbol} showing bullish KST signals?`,
      answer: `${symbol} is currently ${isPositive ? 'showing positive' : 'showing negative'} movement with a ${Math.abs(changePercent).toFixed(2)}% change. Check the KST analysis below for detailed momentum oscillator signals and crossovers.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Technical Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} KST`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} KST Indicator Analysis - Know Sure Thing Oscillator`,
      description: `Comprehensive KST analysis for ${symbol} (${companyName}) with momentum signals and trend direction.`,
      url: pageUrl,
      keywords: [`${symbol} KST`, `${symbol} know sure thing`, `${symbol} technical analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(kstFaqs),
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
            <span>{symbol} KST</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} KST Indicator Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Know Sure Thing momentum oscillator</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-sky-600/20 to-blue-600/20 p-8 rounded-xl border border-sky-500/30 mb-8">
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

          {/* KST Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">KST Indicator Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'ROC 1', desc: '10-period Rate of Change', value: 'Weighted × 1' },
                { name: 'ROC 2', desc: '15-period Rate of Change', value: 'Weighted × 2' },
                { name: 'ROC 3', desc: '20-period Rate of Change', value: 'Weighted × 3' },
                { name: 'ROC 4', desc: '30-period Rate of Change', value: 'Weighted × 4' },
                { name: 'KST Line', desc: 'Weighted sum of ROCs', value: 'Main momentum oscillator' },
                { name: 'Signal Line', desc: '9-period SMA of KST', value: 'Trigger line for crossovers' },
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
            <h2 className="text-2xl font-bold mb-4">KST Trading Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• KST line crossing above signal line</li>
                  <li>• KST crossing above zero line (neutral to bullish)</li>
                  <li>• Bullish divergence: price makes lower low, KST makes higher low</li>
                  <li>• KST in positive territory and rising</li>
                  <li>• Strong upward slope in both KST and signal lines</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Signals</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• KST line crossing below signal line</li>
                  <li>• KST crossing below zero line (neutral to bearish)</li>
                  <li>• Bearish divergence: price makes higher high, KST makes lower high</li>
                  <li>• KST in negative territory and falling</li>
                  <li>• Strong downward slope in both KST and signal lines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full KST Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered technical analysis with real-time KST signals</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {kstFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="know-sure-thing" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
