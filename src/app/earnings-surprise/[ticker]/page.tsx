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
    title: `${symbol} Earnings Surprise - Beat or Miss History`,
    description: `${symbol} earnings surprise history. Track quarterly earnings beats and misses, surprise percentage, actual vs expected EPS, and earnings surprise trends.`,
    keywords: [
      `${symbol} earnings surprise`,
      `${symbol} earnings beat`,
      `${symbol} earnings miss`,
      `${symbol} surprise history`,
      `${symbol} actual vs expected`,
      `${symbol} EPS surprise`,
    ],
    openGraph: {
      title: `${symbol} Earnings Surprise | Beat or Miss History`,
      description: `Track ${symbol} earnings surprise history including beats, misses, and surprise percentages.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/earnings-surprise/${ticker.toLowerCase()}`,
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

export default async function EarningsSurprisePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/earnings-surprise/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const surpriseFaqs = [
    {
      question: `What is ${symbol} earnings surprise?`,
      answer: `${symbol} earnings surprise measures the difference between ${companyName}'s actual reported earnings and the analyst consensus estimate. A positive surprise (beat) occurs when actual EPS exceeds estimates, while a negative surprise (miss) occurs when results fall short.`
    },
    {
      question: `Does ${symbol} usually beat earnings estimates?`,
      answer: `Historical earnings surprise data for ${symbol} shows the company's track record of beating, meeting, or missing analyst expectations. Consistent beats may indicate conservative analyst estimates or strong execution by ${companyName}.`
    },
    {
      question: `How much does ${symbol} stock move on earnings surprises?`,
      answer: `${symbol} stock price reaction to earnings surprises varies based on the magnitude of the beat/miss, guidance provided, and overall market conditions. Large positive surprises typically drive significant upward moves.`
    },
    {
      question: `When is the next ${symbol} earnings report?`,
      answer: `${symbol} reports quarterly earnings following a regular schedule. Check the earnings calendar for the next confirmed earnings date and analyst expectations for ${companyName}.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Earnings Surprise`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Earnings Surprise - Beat or Miss History`,
      description: `Track earnings surprise history for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} earnings surprise`, `${symbol} earnings beat`, `${symbol} earnings miss`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(surpriseFaqs),
    getTableSchema({
      name: `${symbol} Earnings Surprise History`,
      description: `Historical Earnings Surprise data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Earnings Surprise', 'Change'],
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
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            {' / '}
            <span>{symbol} Earnings Surprise</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Earnings Surprise</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Beat or miss history</p>

          {/* Current Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
              {snapshot.marketCap && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">${(snapshot.marketCap / 1e9).toFixed(2)}B</p>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Surprise Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Earnings Surprise Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Earnings surprise data for {companyName} compares actual quarterly earnings results to Wall Street analyst
                consensus estimates. Tracking surprise history helps identify execution trends and analyst forecast accuracy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-bold text-sm text-green-400 mb-1">Earnings Beats</p>
                  <p className="text-lg">Quarters exceeding expectations</p>
                </div>
                <div className="bg-red-600/20 p-4 rounded-lg border border-red-500/30">
                  <p className="font-bold text-sm text-red-400 mb-1">Earnings Misses</p>
                  <p className="text-lg">Quarters falling short of estimates</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Surprise %</p>
                  <p className="text-lg">Magnitude of beat or miss</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Revenue Surprise</p>
                  <p className="text-lg">Top-line performance vs estimates</p>
                </div>
              </div>
            </div>
          </section>

          {/* Surprise Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Surprise Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'EPS Surprise', desc: 'Difference between actual and expected earnings per share' },
                { title: 'Revenue Surprise', desc: 'Actual revenue compared to analyst consensus forecasts' },
                { title: 'Surprise Percentage', desc: 'Magnitude of beat or miss as a percentage of estimate' },
                { title: 'Beat Rate', desc: 'Historical percentage of quarters beating estimates' },
                { title: 'Surprise Trend', desc: 'Consistency of beats or misses over recent quarters' },
                { title: 'Price Reaction', desc: 'Stock price movement following earnings announcements' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full {symbol} Earnings Analysis</h2>
            <p className="text-muted-foreground mb-6">View detailed earnings history and upcoming estimates</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {surpriseFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="earnings-surprise" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
