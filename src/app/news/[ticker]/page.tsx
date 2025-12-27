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
    title: `${symbol} Stock News Today - Latest Headlines & Market Updates`,
    description: `Latest ${symbol} stock news, headlines, and market updates. Stay informed with real-time news coverage, analyst commentary, and breaking developments.`,
    keywords: [
      `${symbol} news`,
      `${symbol} stock news`,
      `${symbol} news today`,
      `${symbol} latest news`,
      `${symbol} headlines`,
      `${symbol} breaking news`,
    ],
    openGraph: {
      title: `${symbol} Stock News Today | Latest Headlines`,
      description: `Latest news and headlines for ${symbol}. Real-time market updates and analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/news/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 900 } } // 15 min cache for news
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getNews(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/market-news?ticker=${ticker}&limit=20`,
      { next: { revalidate: 900 } }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.news || data || []
  } catch {
    return []
  }
}

export default async function NewsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, news] = await Promise.all([
    getStockData(symbol),
    getNews(symbol)
  ])

  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/news/${ticker.toLowerCase()}`

  const newsFaqs = [
    {
      question: `Where can I find ${symbol} stock news?`,
      answer: `This page provides the latest ${symbol} (${companyName}) news, including market updates, analyst commentary, earnings reports, and breaking developments. News is updated throughout the trading day.`
    },
    {
      question: `What moves ${symbol} stock price?`,
      answer: `${symbol} stock price can be affected by earnings reports, analyst upgrades/downgrades, industry news, macroeconomic factors, company announcements, and overall market sentiment. Stay informed with the latest news.`
    },
    {
      question: `How do I stay updated on ${symbol} news?`,
      answer: `Bookmark this page for the latest ${symbol} news. You can also set up alerts, follow the company's investor relations page, and monitor financial news sources for real-time updates.`
    },
    {
      question: `Is ${symbol} in the news today?`,
      answer: news.length > 0
        ? `Yes, there are ${news.length} recent news articles about ${symbol}. See the latest headlines above.`
        : `Check back regularly for the latest ${symbol} news and market updates.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'News', url: `${SITE_URL}/news` },
      { name: `${symbol} News`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock News Today - Latest Headlines & Updates`,
      description: `Latest news and market updates for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} news`, `${symbol} stock news`, `${symbol} today`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(newsFaqs),
    getTableSchema({
      name: `${symbol} News History`,
      description: `Historical News data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'News', 'Change'],
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
            <Link href="/news" className="hover:text-foreground">News</Link>
            {' / '}
            <span>{symbol} News</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Stock News Today</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Latest headlines & market updates</p>

          {/* Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8 flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Current Price</p>
              <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Today's Change</p>
              <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* News List */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Latest News</h2>
            {news.length > 0 ? (
              <div className="space-y-4">
                {news.map((article: any, i: number) => (
                  <a
                    key={i}
                    href={article.url || article.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-2 hover:text-green-500">{article.title || article.headline}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{article.summary || article.description}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{article.source || article.publisher}</span>
                      <span>{article.published_at || article.date || article.publishedDate}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">No recent news available for {symbol}.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for updates.</p>
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">More {symbol} Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 text-center">
                <p className="font-bold text-green-500">Overview</p>
                <p className="text-xs text-muted-foreground">Full Analysis</p>
              </Link>
              <Link href={`/earnings/${symbol.toLowerCase()}`} className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 text-center">
                <p className="font-bold text-blue-500">Earnings</p>
                <p className="text-xs text-muted-foreground">Earnings Date</p>
              </Link>
              <Link href={`/analyst/${symbol.toLowerCase()}`} className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 text-center">
                <p className="font-bold text-purple-500">Analysts</p>
                <p className="text-xs text-muted-foreground">Ratings</p>
              </Link>
              <Link href={`/insider/${symbol.toLowerCase()}`} className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 text-center">
                <p className="font-bold text-orange-500">Insiders</p>
                <p className="text-xs text-muted-foreground">Trades</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get {symbol} Alerts</h2>
            <p className="text-muted-foreground mb-6">AI-powered analysis and real-time insights</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {newsFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related News */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Stock News</h2>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM']
                .filter(s => s !== symbol)
                .map(stock => (
                  <Link key={stock} href={`/news/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} News
                  </Link>
                ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
