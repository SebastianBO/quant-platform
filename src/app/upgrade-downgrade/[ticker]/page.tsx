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
    title: `${symbol} Upgrades & Downgrades - Analyst Rating Changes`,
    description: `${symbol} analyst upgrades and downgrades. Track rating changes from Wall Street firms, upgrade/downgrade history, and analyst sentiment shifts.`,
    keywords: [
      `${symbol} upgrades`,
      `${symbol} downgrades`,
      `${symbol} rating changes`,
      `${symbol} analyst upgrades`,
      `${symbol} upgrade downgrade`,
      `${symbol} rating history`,
    ],
    openGraph: {
      title: `${symbol} Upgrades & Downgrades | Analyst Rating Changes`,
      description: `Track ${symbol} analyst rating changes including upgrades, downgrades, and sentiment shifts.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/upgrade-downgrade/${ticker.toLowerCase()}`,
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

export default async function UpgradeDowngradePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/upgrade-downgrade/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const ratingFaqs = [
    {
      question: `What are ${symbol} analyst upgrades and downgrades?`,
      answer: `${symbol} upgrades and downgrades occur when analysts change their rating recommendations for ${companyName} stock, such as from Hold to Buy (upgrade) or from Buy to Hold (downgrade).`
    },
    {
      question: `How do upgrades affect ${symbol} stock price?`,
      answer: `${symbol} upgrades typically cause positive price movement as they signal increased analyst optimism. However, the impact depends on the firm's reputation, timing, and whether the upgrade was expected.`
    },
    {
      question: `Who upgrades or downgrades ${symbol}?`,
      answer: `${symbol} ratings are issued by equity research analysts at investment banks, brokerage firms, and independent research firms that cover ${companyName}.`
    },
    {
      question: `How often is ${symbol} upgraded or downgraded?`,
      answer: `Rating changes for ${symbol} occur based on new information, earnings results, company developments, or changing market conditions. Some stocks see frequent rating changes while others remain stable for extended periods.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Upgrades & Downgrades`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Upgrades & Downgrades - Analyst Rating Changes`,
      description: `Track analyst rating changes for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} upgrades`, `${symbol} downgrades`, `${symbol} rating changes`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(ratingFaqs),
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
            <span>{symbol} Upgrades & Downgrades</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Upgrades & Downgrades</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Analyst rating changes</p>

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

          {/* Rating Changes Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Rating Changes Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Track all analyst rating changes for {companyName}. Upgrades and downgrades from major Wall Street firms
                can significantly impact investor sentiment and stock price movement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                  <p className="font-bold text-sm text-green-400 mb-1">Upgrades</p>
                  <p className="text-lg">Rating improvements to Buy/Outperform</p>
                </div>
                <div className="bg-red-600/20 p-4 rounded-lg border border-red-500/30">
                  <p className="font-bold text-sm text-red-400 mb-1">Downgrades</p>
                  <p className="text-lg">Rating reductions to Hold/Sell</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Price Target Changes</p>
                  <p className="text-lg">Analyst target price revisions</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Initiations</p>
                  <p className="text-lg">New analyst coverage starts</p>
                </div>
              </div>
            </div>
          </section>

          {/* Rating Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyst Rating Categories</h2>
            <div className="space-y-3">
              {[
                { title: 'Strong Buy / Outperform', desc: 'Highest conviction bullish rating from analysts', color: 'bg-green-600/10 border-green-500/30' },
                { title: 'Buy / Overweight', desc: 'Positive rating expecting above-market returns', color: 'bg-green-600/10 border-green-500/30' },
                { title: 'Hold / Neutral', desc: 'Neutral stance expecting market-level performance', color: 'bg-yellow-600/10 border-yellow-500/30' },
                { title: 'Underperform / Reduce', desc: 'Negative rating expecting below-market returns', color: 'bg-red-600/10 border-red-500/30' },
                { title: 'Sell / Strong Sell', desc: 'Most bearish rating recommending to exit position', color: 'bg-red-600/10 border-red-500/30' },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-lg border ${item.color}`}>
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full {symbol} Analyst Ratings</h2>
            <p className="text-muted-foreground mb-6">View complete rating history and analyst details</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ratingFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="upgrade-downgrade" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
