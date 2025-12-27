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
    title: `${symbol} Industry Ranking - Sector Position & Peer Rank`,
    description: `${symbol} industry ranking and sector position. Compare ${symbol} against industry peers by market cap, growth, valuation, profitability, and analyst ratings.`,
    keywords: [
      `${symbol} industry rank`,
      `${symbol} sector rank`,
      `${symbol} industry position`,
      `${symbol} peer ranking`,
      `${symbol} industry comparison`,
      `${symbol} sector position`,
    ],
    openGraph: {
      title: `${symbol} Industry Ranking | Sector Position & Peer Rank`,
      description: `See where ${symbol} ranks within its industry across key financial and performance metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/industry-rank/${ticker.toLowerCase()}`,
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

export default async function IndustryRankPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/industry-rank/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const sector = companyFacts?.sector || 'its sector'
  const industry = companyFacts?.industry || 'its industry'

  const rankFaqs = [
    {
      question: `Where does ${symbol} rank in its industry?`,
      answer: `${symbol} ranking within ${industry} is determined by comparing ${companyName} against industry peers across metrics like market cap, revenue growth, profitability, valuation multiples, and analyst ratings.`
    },
    {
      question: `How is ${symbol} industry rank calculated?`,
      answer: `${symbol} industry rank is calculated by analyzing multiple financial and operational metrics relative to peer companies in ${industry}, including size, growth rates, margins, returns, and market sentiment.`
    },
    {
      question: `Is ${symbol} a leader in its industry?`,
      answer: `${symbol} industry position in ${industry} can be assessed by its market share, competitive advantages, financial performance, and innovation leadership relative to other companies in ${industry}.`
    },
    {
      question: `Who are ${symbol} top industry competitors?`,
      answer: `${symbol} competes with other companies in ${industry} and the broader ${sector} sector. Industry ranking helps identify direct competitors and market leaders.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Industry Rank`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Industry Ranking - Sector Position & Peer Rank`,
      description: `Industry ranking analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} industry rank`, `${symbol} sector rank`, `${symbol} peer ranking`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(rankFaqs),
    getTableSchema({
      name: `${symbol} Industry Rank History`,
      description: `Historical Industry Rank data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Industry Rank', 'Change'],
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
            <span>{symbol} Industry Rank</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Industry Ranking</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Sector position & peer rank</p>

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

          {/* Industry Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Context</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName} operates in {industry}, part of the broader {sector} sector.
                Understanding {symbol} position relative to industry peers provides valuable context for investment decisions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Sector</p>
                  <p className="text-lg">{sector}</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Industry</p>
                  <p className="text-lg">{industry}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Ranking Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ranking Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'Market Cap Rank', desc: 'Company size compared to industry peers' },
                { title: 'Revenue Growth Rank', desc: 'Top-line growth rate vs competitors' },
                { title: 'Profitability Rank', desc: 'Profit margins and returns on capital' },
                { title: 'Valuation Rank', desc: 'P/E, P/S, and other multiples vs peers' },
                { title: 'Analyst Rating Rank', desc: 'Wall Street sentiment compared to industry' },
                { title: 'Dividend Yield Rank', desc: 'Income generation vs peer group' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Competitive Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Competitive Position</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Understanding {symbol} competitive position requires analyzing both quantitative metrics and qualitative factors
                like market share, brand strength, innovation leadership, and strategic positioning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">📊</p>
                  <p className="font-bold text-sm">Market Position</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">💹</p>
                  <p className="font-bold text-sm">Financial Strength</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">🎯</p>
                  <p className="font-bold text-sm">Growth Trajectory</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full {symbol} Peer Comparison</h2>
            <p className="text-muted-foreground mb-6">Compare {symbol} against industry competitors</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {rankFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="industry-rank" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
