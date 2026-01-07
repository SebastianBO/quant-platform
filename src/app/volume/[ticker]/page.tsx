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
    title: `${symbol} Trading Volume - Daily & Average Volume Data`,
    description: `${symbol} stock trading volume data. View today's volume, average volume, volume trends, and what high or low volume indicates for ${symbol} stock.`,
    keywords: [
      `${symbol} volume`,
      `${symbol} trading volume`,
      `${symbol} average volume`,
      `${symbol} daily volume`,
      `${symbol} volume analysis`,
      `${symbol} volume chart`,
    ],
    openGraph: {
      title: `${symbol} Trading Volume | Daily & Average Volume Data`,
      description: `Real-time ${symbol} trading volume with average volume comparison and volume analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/volume/${ticker.toLowerCase()}`,
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

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`
  }
  return volume.toLocaleString()
}

export default async function VolumePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/volume/${ticker.toLowerCase()}`

  const currentVolume = snapshot.volume || 0
  const avgVolume = snapshot.avg_volume_30d || snapshot.avg_volume_10d || 0
  const volumeRatio = avgVolume > 0 ? (currentVolume / avgVolume) : 0
  const isAboveAverage = volumeRatio > 1
  const volumePercentDiff = ((volumeRatio - 1) * 100).toFixed(1)

  const volumeFaqs = [
    {
      question: `What is ${symbol} current trading volume?`,
      answer: `${symbol} current trading volume is ${formatVolume(currentVolume)} shares. The average daily volume is ${formatVolume(avgVolume)} shares. Today's volume is ${isAboveAverage ? 'above' : 'below'} average by ${Math.abs(parseFloat(volumePercentDiff))}%.`
    },
    {
      question: `What does high volume mean for ${symbol}?`,
      answer: `High trading volume for ${symbol} indicates strong investor interest and liquidity. It typically signals significant news, earnings releases, or major price movements. High volume confirms trend strength and makes entering/exiting positions easier with less slippage.`
    },
    {
      question: `What does low volume mean for ${symbol}?`,
      answer: `Low trading volume for ${symbol} suggests reduced investor interest and lower liquidity. This can lead to wider bid-ask spreads and potential price volatility. Low volume trends may be less reliable, and it can be harder to execute large trades without affecting the price.`
    },
    {
      question: `How is average volume calculated for ${symbol}?`,
      answer: `Average volume for ${symbol} is typically calculated as the mean trading volume over a specific period, such as 10 days or 30 days. This provides a baseline to compare current trading activity and identify unusual volume spikes or drops.`
    },
    {
      question: `When does ${symbol} have the highest volume?`,
      answer: `${symbol} typically experiences highest trading volume during market open (9:30-10:30 AM ET), market close (3:00-4:00 PM ET), and around major events like earnings releases, product announcements, or significant news. Volume patterns can indicate institutional trading activity.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Volume', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Volume`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Trading Volume - Daily & Average Volume Data`,
      description: `Complete trading volume analysis for ${symbol} (${companyName}) including current volume, average volume, and volume trends.`,
      url: pageUrl,
      keywords: [`${symbol} volume`, `${symbol} trading volume`, `${symbol} average volume`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(volumeFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Volume</Link>
            {' / '}
            <span>{symbol} Volume</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Trading Volume</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Daily volume & average volume analysis</p>

          {/* Volume Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Volume</p>
                <p className="text-4xl font-bold">{formatVolume(currentVolume)}</p>
                <p className="text-sm text-muted-foreground mt-1">{currentVolume.toLocaleString()} shares</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Average Volume</p>
                <p className="text-3xl font-bold">{formatVolume(avgVolume)}</p>
                <p className="text-sm text-muted-foreground mt-1">30-day average</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Relative Volume</p>
                <p className={`text-3xl font-bold ${isAboveAverage ? 'text-green-500' : 'text-orange-500'}`}>
                  {volumeRatio.toFixed(2)}x
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAboveAverage ? '+' : ''}{volumePercentDiff}% vs average
                </p>
              </div>
            </div>
          </div>

          {/* Volume Status */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Volume Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {volumeRatio >= 2 ? '🔥' : volumeRatio >= 1.5 ? '📈' : volumeRatio >= 1 ? '✅' : volumeRatio >= 0.5 ? '📉' : '💤'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {volumeRatio >= 2
                      ? 'Extremely High Volume'
                      : volumeRatio >= 1.5
                      ? 'High Volume'
                      : volumeRatio >= 1
                      ? 'Above Average Volume'
                      : volumeRatio >= 0.5
                      ? 'Below Average Volume'
                      : 'Low Volume'}
                  </h3>
                  <p className="text-muted-foreground">
                    {volumeRatio >= 2
                      ? `${symbol} is experiencing exceptionally high trading volume at ${volumeRatio.toFixed(1)}x the average. This typically indicates major news, significant price action, or institutional activity.`
                      : volumeRatio >= 1.5
                      ? `${symbol} is trading with elevated volume at ${volumeRatio.toFixed(1)}x the average. This suggests increased investor interest and confirms trend strength.`
                      : volumeRatio >= 1
                      ? `${symbol} is trading slightly above average volume at ${volumeRatio.toFixed(1)}x. Normal market activity with good liquidity.`
                      : volumeRatio >= 0.5
                      ? `${symbol} is trading below average volume at ${volumeRatio.toFixed(1)}x. This may indicate reduced investor interest or quiet market conditions.`
                      : `${symbol} is experiencing low trading volume at ${volumeRatio.toFixed(1)}x the average. This can lead to wider spreads and less reliable price action.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What Volume Indicates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Trading Volume Tells You</h2>
            <div className="grid gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">High Volume Signals</h3>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Strong confirmation of price trends</li>
                      <li>Increased liquidity and easier trade execution</li>
                      <li>Often accompanies breakouts or breakdowns</li>
                      <li>May indicate institutional buying or selling</li>
                      <li>Typically follows major news or earnings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💤</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Low Volume Signals</h3>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Weaker trend confirmation and reliability</li>
                      <li>Wider bid-ask spreads</li>
                      <li>Higher price volatility risk</li>
                      <li>Difficult to execute large trades</li>
                      <li>May indicate market indecision</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Volume in Technical Analysis</h3>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Volume confirms trend strength and reversals</li>
                      <li>Breakouts on high volume are more reliable</li>
                      <li>Declining volume in trends may signal exhaustion</li>
                      <li>Volume spikes often precede major moves</li>
                      <li>Compare current volume to 30-day average</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Volume Metrics Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Volume Metrics</h2>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4 font-bold">Metric</th>
                    <th className="text-right p-4 font-bold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4">Current Volume</td>
                    <td className="p-4 text-right font-mono">{currentVolume.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4">30-Day Average Volume</td>
                    <td className="p-4 text-right font-mono">{avgVolume.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-4">Relative Volume (RVOL)</td>
                    <td className="p-4 text-right font-mono">{volumeRatio.toFixed(2)}x</td>
                  </tr>
                  <tr>
                    <td className="p-4">Volume vs Average</td>
                    <td className={`p-4 text-right font-mono ${isAboveAverage ? 'text-green-500' : 'text-orange-500'}`}>
                      {isAboveAverage ? '+' : ''}{volumePercentDiff}%
                    </td>
                  </tr>
                  {snapshot.marketCap && (
                    <tr>
                      <td className="p-4">Market Cap</td>
                      <td className="p-4 text-right font-mono">${formatVolume(snapshot.marketCap)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Volume Data</h2>
            <p className="text-muted-foreground mb-6">Track {symbol} volume in real-time with advanced charts and alerts</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Live Data
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {volumeFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
