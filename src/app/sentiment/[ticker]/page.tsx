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
    title: `${symbol} Market Sentiment - Investor Sentiment Analysis & Ratings`,
    description: `${symbol} market sentiment analysis with analyst ratings, social media sentiment, news sentiment, and investor mood indicators. Track ${symbol} sentiment signals.`,
    keywords: [
      `${symbol} sentiment`,
      `${symbol} market sentiment`,
      `${symbol} investor sentiment`,
      `${symbol} sentiment analysis`,
      `${symbol} analyst ratings`,
      `${symbol} social sentiment`,
    ],
    openGraph: {
      title: `${symbol} Market Sentiment | Investor Sentiment Analysis`,
      description: `Comprehensive ${symbol} sentiment analysis with analyst ratings and market mood indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sentiment/${ticker.toLowerCase()}`,
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

export default async function SentimentPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/sentiment/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const changePercent = snapshot.day_change_percent || 0
  const isPositive = changePercent >= 0

  const sentimentFaqs = [
    {
      question: `What is ${symbol} market sentiment?`,
      answer: `${symbol} market sentiment reflects the overall attitude of investors toward the stock. It combines analyst ratings, news sentiment, social media discussions, and trading activity. Current sentiment is ${isPositive ? 'positive' : 'negative'} based on a ${Math.abs(changePercent).toFixed(2)}% price change.`
    },
    {
      question: `How do you measure ${symbol} sentiment?`,
      answer: `${symbol} sentiment is measured using multiple data sources: analyst recommendations (buy/sell/hold), news article tone analysis, social media mentions and sentiment scores, put/call ratios, short interest levels, and institutional investor positioning.`
    },
    {
      question: `Is ${symbol} sentiment bullish or bearish?`,
      answer: `${symbol} is currently showing ${isPositive ? 'bullish' : 'bearish'} sentiment based on recent price action. For detailed sentiment analysis including analyst ratings, social sentiment, and institutional positioning, view the full analysis below.`
    },
    {
      question: `What affects ${symbol} investor sentiment?`,
      answer: `${symbol} sentiment is influenced by earnings reports, analyst upgrades/downgrades, news coverage, social media trends, insider trading activity, institutional investor positioning, broader market conditions, and sector-specific developments.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Market Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Sentiment`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Market Sentiment - Investor Sentiment Analysis`,
      description: `Comprehensive sentiment analysis for ${symbol} (${companyName}) with analyst ratings and market mood indicators.`,
      url: pageUrl,
      keywords: [`${symbol} sentiment`, `${symbol} market sentiment`, `${symbol} investor sentiment`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(sentimentFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Market Analysis</Link>
            {' / '}
            <span>{symbol} Sentiment</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Market Sentiment</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Investor sentiment & market mood analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Market Mood</p>
                <p className={`text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? 'Bullish' : 'Bearish'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Change</p>
                <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </p>
              </div>
              {snapshot.volume && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Volume</p>
                  <p className="text-2xl font-bold">{(snapshot.volume / 1000000).toFixed(1)}M</p>
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Sources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Sentiment Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Analyst Ratings', desc: 'Buy/Sell recommendations', icon: '📊' },
                { name: 'News Sentiment', desc: 'Media coverage tone', icon: '📰' },
                { name: 'Social Media', desc: 'Twitter, Reddit, forums', icon: '💬' },
                { name: 'Insider Trading', desc: 'Executive buy/sell activity', icon: '🔒' },
                { name: 'Institutional Flow', desc: 'Big money positioning', icon: '🏦' },
                { name: 'Options Activity', desc: 'Put/Call ratio', icon: '📈' },
              ].map((ind, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{ind.icon}</div>
                    <div>
                      <p className="font-bold text-lg">{ind.name}</p>
                      <p className="text-sm text-muted-foreground">{ind.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sentiment Signals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Sentiment Signals</h2>
            <div className="space-y-4">
              <div className="bg-green-600/10 p-5 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-2 text-green-500">Bullish Sentiment Indicators</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Analyst upgrades and increased price targets</li>
                  <li>• Positive news coverage and media mentions</li>
                  <li>• Insider buying activity from executives</li>
                  <li>• Institutional investors increasing positions</li>
                  <li>• Positive social media sentiment and discussions</li>
                  <li>• Low put/call ratio (more calls than puts)</li>
                </ul>
              </div>
              <div className="bg-red-600/10 p-5 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-2 text-red-500">Bearish Sentiment Indicators</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Analyst downgrades and reduced price targets</li>
                  <li>• Negative news coverage and concerns</li>
                  <li>• Insider selling activity from executives</li>
                  <li>• Institutional investors reducing positions</li>
                  <li>• Negative social media sentiment and warnings</li>
                  <li>• High put/call ratio (more puts than calls)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time Sentiment Analysis</h2>
            <p className="text-muted-foreground mb-6">AI-powered sentiment tracking with live analyst ratings</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=analyst`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Analyst Ratings
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {sentimentFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="sentiment" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
