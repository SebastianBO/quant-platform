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
    title: `${symbol} Seasonality - Monthly & Quarterly Patterns`,
    description: `${symbol} stock seasonality patterns. Analyze historical monthly returns, quarterly trends, best and worst months, and seasonal trading strategies.`,
    keywords: [
      `${symbol} seasonality`,
      `${symbol} seasonal patterns`,
      `${symbol} monthly returns`,
      `${symbol} best month`,
      `${symbol} worst month`,
      `${symbol} quarterly trends`,
    ],
    openGraph: {
      title: `${symbol} Seasonality | Monthly & Quarterly Patterns`,
      description: `Discover ${symbol} seasonal patterns and monthly return trends for better timing strategies.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/seasonality/${ticker.toLowerCase()}`,
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

export default async function SeasonalityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/seasonality/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const seasonalityFaqs = [
    {
      question: `What is ${symbol} stock seasonality?`,
      answer: `${symbol} stock seasonality refers to recurring patterns in price performance across different months, quarters, or seasons. Historical analysis of ${companyName} can reveal periods of consistently stronger or weaker performance.`
    },
    {
      question: `What is the best month to buy ${symbol}?`,
      answer: `Historical seasonality data for ${symbol} can identify months with statistically better average returns. However, past patterns don't guarantee future results, and seasonality should be one of many factors in investment timing decisions for ${companyName}.`
    },
    {
      question: `Does ${symbol} have strong seasonal patterns?`,
      answer: `The strength of seasonal patterns in ${symbol} varies by stock. Some companies show consistent seasonal trends due to business cycles, product launches, or industry dynamics affecting ${companyName}, while others show minimal seasonality.`
    },
    {
      question: `How reliable is ${symbol} seasonality?`,
      answer: `${symbol} seasonal patterns are based on historical averages and may not repeat. Company-specific events, market conditions, and economic factors can override seasonal tendencies for ${companyName}. Use seasonality as one input, not the sole driver of decisions.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Seasonality`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Seasonality - Monthly & Quarterly Patterns`,
      description: `Seasonal pattern analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} seasonality`, `${symbol} seasonal patterns`, `${symbol} monthly returns`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(seasonalityFaqs),
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
            <span>{symbol} Seasonality</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Seasonality</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Monthly & quarterly patterns</p>

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

          {/* Seasonality Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Seasonality Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Seasonality analysis for {companyName} examines historical patterns to identify months or quarters with
                consistently stronger or weaker performance. These patterns can inform timing strategies and risk management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Monthly Patterns</p>
                  <p className="text-lg">Average returns by month</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Quarterly Trends</p>
                  <p className="text-lg">Seasonal strength by quarter</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Best Months</p>
                  <p className="text-lg">Historically strongest periods</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Worst Months</p>
                  <p className="text-lg">Historically weakest periods</p>
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Monthly Seasonality Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border text-center">
                  <p className="font-bold mb-1">{month}</p>
                  <p className="text-sm text-muted-foreground">Avg Return</p>
                </div>
              ))}
            </div>
          </section>

          {/* Seasonal Patterns */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Seasonal Patterns</h2>
            <div className="space-y-3">
              {[
                { title: 'January Effect', desc: 'Historical performance in the first month of the year' },
                { title: 'Summer Doldrums', desc: 'Traditional market weakness during summer months' },
                { title: 'Year-End Rally', desc: 'Fourth quarter and December seasonality patterns' },
                { title: 'Earnings Season', desc: 'Performance around quarterly earnings announcements' },
                { title: 'Holiday Periods', desc: 'Trading patterns around major holidays' },
                { title: 'Day of Week', desc: 'Intraweek performance patterns and trends' },
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
            <h2 className="text-2xl font-bold mb-4">Full {symbol} Historical Analysis</h2>
            <p className="text-muted-foreground mb-6">View detailed seasonality charts and historical data</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {seasonalityFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="seasonality" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
