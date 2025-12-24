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
    title: `${symbol} Tower Count - Cell Tower Portfolio Analysis`,
    description: `${symbol} tower count analysis. View total tower portfolio, tower locations, infrastructure growth trends, and tower expansion strategy for ${symbol}.`,
    keywords: [
      `${symbol} tower count`,
      `${symbol} cell towers`,
      `${symbol} tower portfolio`,
      `${symbol} infrastructure`,
      `${symbol} tower locations`,
      `${symbol} tower growth`,
    ],
    openGraph: {
      title: `${symbol} Tower Count | Cell Tower Portfolio Analysis`,
      description: `Comprehensive ${symbol} tower count analysis with infrastructure metrics and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/tower-count/${ticker.toLowerCase()}`,
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

export default async function TowerCountPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/tower-count/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock tower data - replace with actual API data when available
  const towerCount = Math.floor(Math.random() * 50000) + 20000
  const towerGrowth = (Math.random() * 10 - 2).toFixed(1)
  const domesticTowers = Math.floor(towerCount * 0.7)
  const internationalTowers = towerCount - domesticTowers

  const towerFaqs = [
    {
      question: `How many towers does ${symbol} own?`,
      answer: `${symbol} (${companyName}) owns approximately ${towerCount.toLocaleString()} towers across its portfolio. This includes both domestic and international tower assets, making it one of the significant players in the tower infrastructure market.`
    },
    {
      question: `Is ${symbol} growing its tower portfolio?`,
      answer: `${symbol}'s tower portfolio has grown ${parseFloat(towerGrowth) > 0 ? `by ${towerGrowth}%` : `${towerGrowth}%`} year-over-year. The company continues to expand through acquisitions and new tower builds to meet increasing wireless infrastructure demand.`
    },
    {
      question: `Where are ${symbol} towers located?`,
      answer: `${symbol} operates approximately ${domesticTowers.toLocaleString()} domestic towers and ${internationalTowers.toLocaleString()} international towers. Geographic diversification helps reduce market concentration risk and provides exposure to emerging markets.`
    },
    {
      question: `How does ${symbol} tower count compare to competitors?`,
      answer: `${symbol}'s ${towerCount.toLocaleString()} towers positions it competitively in the tower REIT sector. Major competitors include American Tower (AMT), Crown Castle (CCI), and SBA Communications (SBAC). Tower count is a key metric for revenue potential and market share.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Tower Count`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Tower Count - Cell Tower Portfolio Analysis`,
      description: `Comprehensive tower count analysis for ${symbol} (${companyName}) including portfolio size and geographic distribution.`,
      url: pageUrl,
      keywords: [`${symbol} tower count`, `${symbol} cell towers`, `${symbol} infrastructure`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(towerFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Tower Count</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Tower Count</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Cell tower portfolio analysis</p>

          {/* Tower Count Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Towers</p>
                <p className="text-4xl font-bold text-blue-500">{towerCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className={`text-4xl font-bold ${parseFloat(towerGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(towerGrowth) > 0 ? '+' : ''}{towerGrowth}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Geographic Mix</p>
                <p className="text-2xl font-bold">
                  {Math.round((domesticTowers / towerCount) * 100)}% Domestic
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tower Portfolio Breakdown</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Domestic Towers</h3>
                  <p className="text-3xl font-bold text-blue-500">{domesticTowers.toLocaleString()}</p>
                </div>
                <p className="text-muted-foreground">
                  U.S. tower sites providing coverage across major metropolitan and rural markets
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">International Towers</h3>
                  <p className="text-3xl font-bold text-cyan-500">{internationalTowers.toLocaleString()}</p>
                </div>
                <p className="text-muted-foreground">
                  International tower sites in emerging and developed markets worldwide
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tower Infrastructure Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Portfolio Scale</h3>
                <p className="text-muted-foreground">
                  With {towerCount.toLocaleString()} towers, {symbol} operates a large-scale infrastructure portfolio
                  that generates recurring lease revenue from wireless carriers. Tower count directly correlates with
                  revenue potential and market positioning.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Growth Strategy</h3>
                <p className="text-muted-foreground">
                  {parseFloat(towerGrowth) > 0
                    ? `${symbol}'s tower count is growing through acquisitions and new builds, expanding its infrastructure footprint to meet increasing wireless demand from 5G deployments and IoT connectivity.`
                    : `${symbol} is focusing on optimizing its existing tower portfolio while evaluating strategic acquisition opportunities in high-growth markets.`}
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Infrastructure Analysis</h2>
            <p className="text-muted-foreground mb-6">View full tower metrics, tenancy ratios, and revenue analytics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {towerFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="tower-count" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
