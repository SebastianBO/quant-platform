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
    title: `${symbol} Float - Public Float & Available Shares for Trading`,
    description: `${symbol} float data showing shares available for trading. Understand ${symbol} public float, locked shares, insider holdings, and liquidity impact on stock price volatility.`,
    keywords: [
      `${symbol} float`,
      `${symbol} public float`,
      `${symbol} available shares`,
      `${symbol} float shares`,
      `${symbol} trading float`,
      `${symbol} liquidity`,
    ],
    openGraph: {
      title: `${symbol} Float | Public Float & Trading Liquidity`,
      description: `Comprehensive ${symbol} float analysis with public share availability and liquidity metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/float/${ticker.toLowerCase()}`,
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

export default async function FloatPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/float/${ticker.toLowerCase()}`
  const sharesOutstanding = snapshot.shares_outstanding || 0
  const volume = snapshot.volume || 0

  const faqs = [
    {
      question: `What is ${symbol} float?`,
      answer: `${symbol} float represents shares available for public trading, excluding restricted shares held by insiders, employees, and institutional investors with lock-up agreements. Float is always less than total shares outstanding.`
    },
    {
      question: `Why is low float important for ${symbol}?`,
      answer: `Low float stocks like ${symbol} can experience higher volatility and larger price swings. With fewer shares available to trade, increased buying or selling pressure has a magnified impact on the stock price, creating both opportunities and risks.`
    },
    {
      question: `How is ${symbol} float calculated?`,
      answer: `${symbol} float = Total Shares Outstanding - Restricted Shares - Insider Holdings - Large Institutional Blocks. Companies report share restrictions and insider ownership in SEC filings, particularly in 10-K and proxy statements.`
    },
    {
      question: `Does ${symbol} have a low or high float?`,
      answer: `Float is relative to company size. For ${symbol}, compare the float to average daily volume to assess liquidity. A float representing less than 30 days of trading volume typically indicates lower liquidity and potentially higher volatility.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Float`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Float - Public Float & Trading Liquidity`,
      description: `Comprehensive float analysis for ${symbol} (${companyName}) with liquidity metrics.`,
      url: pageUrl,
      keywords: [`${symbol} float`, `${symbol} public float`, `${symbol} liquidity`],
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
            <span>{symbol} Float</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Public Float</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Available shares & trading liquidity</p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Shares Outstanding</p>
                <p className="text-3xl font-bold">{(sharesOutstanding / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Daily Volume</p>
                <p className="text-3xl font-bold">{(volume / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-3xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Float Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Public Float</h2>
            <div className="bg-card p-6 rounded-lg border border-border mb-6">
              <p className="text-muted-foreground mb-4">
                Public float represents the portion of {symbol} shares available for trading by the general public. It excludes
                shares held by insiders, restricted stock, and large institutional blocks that rarely trade. Float is crucial
                for understanding liquidity and potential price volatility.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Total Shares', value: `${(sharesOutstanding / 1000000).toFixed(2)}M`, desc: 'All issued shares' },
                { title: 'Public Float', value: 'Check SEC', desc: 'Available for trading' },
                { title: 'Insider Holdings', value: 'See Form 4', desc: 'Executive & director shares' },
                { title: 'Institutional', value: 'See 13F', desc: 'Large fund holdings' },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                  <p className="text-2xl font-bold mb-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Float Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How Float Affects Trading</h2>
            <div className="space-y-4">
              {[
                {
                  aspect: 'Volatility',
                  desc: 'Lower float typically means higher volatility. With fewer shares available, large orders can significantly move the price.',
                  impact: 'High'
                },
                {
                  aspect: 'Liquidity Risk',
                  desc: 'Low float stocks may have wider bid-ask spreads and difficulty executing large orders without price impact.',
                  impact: 'High'
                },
                {
                  aspect: 'Short Squeeze Potential',
                  desc: 'Limited float amplifies short squeeze potential when short sellers rush to cover positions with few shares available.',
                  impact: 'High'
                },
                {
                  aspect: 'Price Discovery',
                  desc: 'More float improves price discovery as more participants can trade, leading to more efficient pricing.',
                  impact: 'Medium'
                },
              ].map((item, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.aspect}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.impact} Impact
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Float Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Float Size Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { category: 'Low Float', range: '<20M shares', characteristics: 'High volatility, squeeze potential, wider spreads' },
                { category: 'Medium Float', range: '20M-100M', characteristics: 'Moderate liquidity, balanced trading' },
                { category: 'High Float', range: '>100M shares', characteristics: 'High liquidity, stable pricing, tight spreads' },
              ].map((item, i) => (
                <div key={i} className="bg-secondary p-5 rounded-lg">
                  <p className="font-bold text-lg mb-1">{item.category}</p>
                  <p className="text-sm text-green-400 mb-3">{item.range}</p>
                  <p className="text-sm text-muted-foreground">{item.characteristics}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze Short Interest</h2>
            <p className="text-muted-foreground mb-6">Low float combined with high short interest can signal squeeze potential</p>
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

          <RelatedLinks ticker={symbol} currentPage="float" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
