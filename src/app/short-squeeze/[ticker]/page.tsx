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
    title: `${symbol} Short Squeeze - Short Squeeze Potential & Analysis`,
    description: `${symbol} short squeeze analysis with short interest data. Evaluate ${symbol} squeeze potential based on short ratio, days to cover, borrow rates, and float metrics.`,
    keywords: [
      `${symbol} short squeeze`,
      `${symbol} squeeze potential`,
      `${symbol} short interest`,
      `${symbol} squeeze`,
      `${symbol} short ratio`,
      `${symbol} gamma squeeze`,
    ],
    openGraph: {
      title: `${symbol} Short Squeeze | Squeeze Potential Analysis`,
      description: `Comprehensive ${symbol} short squeeze analysis with key metrics for squeeze potential.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/short-squeeze/${ticker.toLowerCase()}`,
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

export default async function ShortSqueezePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/short-squeeze/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const faqs = [
    {
      question: `What is a short squeeze for ${symbol}?`,
      answer: `A ${symbol} short squeeze occurs when heavy short sellers are forced to buy shares to cover positions as the price rises. This buying pressure accelerates price increases, potentially creating a feedback loop where rising prices force more short covering.`
    },
    {
      question: `What causes a short squeeze in ${symbol}?`,
      answer: `${symbol} short squeezes require: high short interest (many shares sold short), a catalyst that drives price higher (earnings beat, news, social momentum), and limited float making shares hard to borrow. As shorts cover, buying pressure compounds.`
    },
    {
      question: `How can I tell if ${symbol} will short squeeze?`,
      answer: `Monitor these ${symbol} metrics: short interest above 20% of float, days to cover above 5 days, high borrow rates indicating tight supply, increasing stock price with rising volume, and social media momentum among retail traders.`
    },
    {
      question: `What are the risks of trading ${symbol} short squeeze?`,
      answer: `Short squeeze trades are extremely risky. Timing is unpredictable, volatility can cause rapid losses, and post-squeeze crashes are common. Most traders lose money chasing squeezes. For ${symbol}, use strict stop losses and only risk capital you can afford to lose.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Short Squeeze`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Short Squeeze - Squeeze Potential Analysis`,
      description: `Comprehensive short squeeze analysis for ${symbol} (${companyName}) with key metrics.`,
      url: pageUrl,
      keywords: [`${symbol} short squeeze`, `${symbol} squeeze potential`, `${symbol} short interest`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(faqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stock Analysis</Link>
            {' / '}
            <span>{symbol} Short Squeeze</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Short Squeeze Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Short squeeze potential & risk assessment</p>

          {/* Alert Box */}
          <div className="bg-red-600/20 border border-red-500/30 p-6 rounded-xl mb-8">
            <div className="flex gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-bold text-red-400 mb-2">High Risk Trading Activity</p>
                <p className="text-sm text-muted-foreground">
                  Short squeeze trading is extremely risky and speculative. Most traders lose money. Only trade with capital
                  you can afford to lose completely. This is not financial advice.
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Volume</p>
                <p className="text-3xl font-bold">{(snapshot.volume / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </div>

          {/* Squeeze Indicators */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Squeeze Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  metric: 'Short Interest Ratio',
                  target: '>20% of float',
                  desc: 'High short interest indicates heavy short positions',
                  status: 'Check Data'
                },
                {
                  metric: 'Days to Cover',
                  target: '>5 days',
                  desc: 'Time needed for shorts to cover at average volume',
                  status: 'Check Data'
                },
                {
                  metric: 'Borrow Rate',
                  target: '>10% annual',
                  desc: 'High rates signal tight share availability',
                  status: 'Check Data'
                },
                {
                  metric: 'Float Size',
                  target: '<50M shares',
                  desc: 'Lower float amplifies squeeze potential',
                  status: 'Check Data'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.metric}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-green-400 text-sm mb-2">Target: {item.target}</p>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Squeeze Mechanics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How Short Squeezes Work</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-bold mb-1">Heavy Short Positions</p>
                    <p className="text-sm text-muted-foreground">Traders bet against {symbol} by borrowing and selling shares</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-bold mb-1">Price Catalyst</p>
                    <p className="text-sm text-muted-foreground">Positive news, earnings beat, or social momentum drives price higher</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-bold mb-1">Short Covering Begins</p>
                    <p className="text-sm text-muted-foreground">Shorts buy shares to close positions as losses mount</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="font-bold mb-1">Feedback Loop</p>
                    <p className="text-sm text-muted-foreground">Covering creates buying pressure, pushing price higher, forcing more covering</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <p className="font-bold mb-1">Peak and Crash</p>
                    <p className="text-sm text-muted-foreground">After shorts cover, buying pressure evaporates and price crashes</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Historical Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Famous Short Squeeze Examples</h2>
            <div className="space-y-4">
              {[
                { ticker: 'GME', date: 'January 2021', detail: 'GameStop surged from $20 to $483 in weeks, 2,400% gain' },
                { ticker: 'TSLA', date: '2020', detail: 'Tesla climbed from $430 to $2,000+ as shorts capitulated' },
                { ticker: 'VW', date: 'October 2008', detail: 'Volkswagen briefly became world\'s most valuable company' },
                { ticker: 'AMC', date: 'June 2021', detail: 'AMC jumped from $12 to $72 in two weeks' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.ticker}</h3>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Warning */}
          <section className="bg-red-600/10 border border-red-500/30 p-6 rounded-xl mb-12">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Critical Risks</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Timing squeezes is nearly impossible - most enter too late</li>
              <li>• Extreme volatility can trigger stop losses before the move</li>
              <li>• Post-squeeze crashes often erase all gains within days</li>
              <li>• Broker restrictions may prevent trading at critical moments</li>
              <li>• Market manipulation and pump-and-dump schemes are common</li>
              <li>• Options can expire worthless despite underlying stock movement</li>
            </ul>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Check Short Interest Data</h2>
            <p className="text-muted-foreground mb-6">View current short interest and days to cover metrics</p>
            <Link href={`/short-interest/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Short Interest
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="short-squeeze" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
