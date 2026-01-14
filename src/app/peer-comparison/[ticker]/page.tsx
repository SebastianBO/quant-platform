import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Peer Comparison - Compare Against Competitors`,
    description: `${symbol} peer comparison and competitor analysis. Compare valuation, growth, profitability, and performance metrics against industry peers and competitors.`,
    keywords: [
      `${symbol} peer comparison`,
      `${symbol} competitors`,
      `${symbol} vs peers`,
      `${symbol} competitor analysis`,
      `${symbol} peer analysis`,
      `${symbol} industry comparison`,
    ],
    openGraph: {
      title: `${symbol} Peer Comparison | Compare Against Competitors`,
      description: `Comprehensive peer comparison for ${symbol} analyzing valuation, growth, and profitability vs competitors.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/peer-comparison/${ticker.toLowerCase()}`,
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

export default async function PeerComparisonPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/peer-comparison/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const industry = companyFacts?.industry || 'its industry'

  const peerFaqs = [
    {
      question: `Who are ${symbol} main competitors?`,
      answer: `${symbol} main competitors include other companies operating in ${industry}. Peer comparison helps identify direct competitors based on business model, market focus, and customer segments served by ${companyName}.`
    },
    {
      question: `How does ${symbol} compare to peers?`,
      answer: `${symbol} can be compared to peers across multiple dimensions including valuation multiples, growth rates, profitability metrics, market share, and financial health. Comprehensive peer analysis provides context for ${companyName} performance.`
    },
    {
      question: `Is ${symbol} better than its competitors?`,
      answer: `Whether ${symbol} is superior to competitors depends on your investment criteria. ${companyName} may excel in some areas (growth, margins, innovation) while peers outperform in others (valuation, dividends, stability).`
    },
    {
      question: `What metrics matter for ${symbol} peer comparison?`,
      answer: `Key metrics for comparing ${symbol} to peers include P/E ratio, revenue growth, profit margins, ROE, debt levels, market cap, analyst ratings, and industry-specific KPIs relevant to ${industry}.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Peer Comparison`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Peer Comparison - Compare Against Competitors`,
      description: `Comprehensive peer comparison analysis for ${symbol} (${companyName}).`,
      url: pageUrl,
      keywords: [`${symbol} peer comparison`, `${symbol} competitors`, `${symbol} vs peers`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(peerFaqs),
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
            <span>{symbol} Peer Comparison</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Peer Comparison</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Compare against competitors</p>

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

          {/* Peer Comparison Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Peer Comparison Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Comparing {companyName} against industry peers provides critical context for valuation, growth potential,
                and competitive positioning. Side-by-side analysis reveals strengths, weaknesses, and relative opportunities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Valuation Comparison</p>
                  <p className="text-lg">P/E, P/S, EV/EBITDA vs peers</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Growth Comparison</p>
                  <p className="text-lg">Revenue and earnings growth rates</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Profitability Comparison</p>
                  <p className="text-lg">Margins and returns on capital</p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-bold text-sm text-muted-foreground mb-1">Financial Health</p>
                  <p className="text-lg">Balance sheet and debt metrics</p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Comparison Metrics</h2>
            <div className="space-y-3">
              {[
                { title: 'Valuation Multiples', desc: 'P/E ratio, Price-to-Sales, EV/EBITDA, and other valuation metrics' },
                { title: 'Growth Rates', desc: 'Revenue growth, earnings growth, and expansion trajectory' },
                { title: 'Profitability', desc: 'Gross margin, operating margin, net margin, and ROE' },
                { title: 'Market Position', desc: 'Market cap, market share, and competitive positioning' },
                { title: 'Financial Strength', desc: 'Debt-to-equity, current ratio, and balance sheet quality' },
                { title: 'Shareholder Returns', desc: 'Dividend yield, buybacks, and total shareholder return' },
              ].map((item, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Competitor Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Competitive Landscape</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Understanding the competitive landscape in {industry} helps contextualize {symbol} performance.
                Each competitor has unique strengths, strategies, and market positions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">🎯</p>
                  <p className="font-bold text-sm">Market Leaders</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">⚡</p>
                  <p className="font-bold text-sm">Fast Growers</p>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-3xl font-bold mb-1">💰</p>
                  <p className="font-bold text-sm">Value Plays</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Detailed {symbol} Peer Analysis</h2>
            <p className="text-muted-foreground mb-6">Get comprehensive side-by-side comparison data</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {peerFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="peer-comparison" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
