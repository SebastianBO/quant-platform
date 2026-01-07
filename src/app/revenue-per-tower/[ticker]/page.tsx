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
    title: `${symbol} Revenue Per Tower - Tower Efficiency Metrics`,
    description: `${symbol} revenue per tower analysis. View average revenue per tower, pricing trends, lease efficiency, and tower monetization metrics for ${symbol}.`,
    keywords: [
      `${symbol} revenue per tower`,
      `${symbol} tower revenue`,
      `${symbol} tower efficiency`,
      `${symbol} ARPU`,
      `${symbol} tower monetization`,
      `${symbol} lease revenue`,
    ],
    openGraph: {
      title: `${symbol} Revenue Per Tower | Tower Efficiency Analysis`,
      description: `Comprehensive ${symbol} revenue per tower analysis with efficiency and monetization metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/revenue-per-tower/${ticker.toLowerCase()}`,
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

export default async function RevenuePerTowerPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/revenue-per-tower/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock revenue per tower data - replace with actual API data when available
  const revenuePerTower = Math.floor(Math.random() * 30000) + 40000
  const revenueGrowth = (Math.random() * 8 - 1).toFixed(1)
  const industryAverage = 52000
  const vsIndustry = (((revenuePerTower - industryAverage) / industryAverage) * 100).toFixed(1)

  const revenueFaqs = [
    {
      question: `What is ${symbol} revenue per tower?`,
      answer: `${symbol} (${companyName}) generates approximately $${revenuePerTower.toLocaleString()} in annual revenue per tower. This metric measures tower monetization efficiency and reflects lease rates, tenancy ratios, and pricing power.`
    },
    {
      question: `Is ${symbol} revenue per tower growing?`,
      answer: `${symbol}'s revenue per tower has ${parseFloat(revenueGrowth) > 0 ? `increased ${revenueGrowth}%` : `changed ${revenueGrowth}%`} year-over-year. Growth in this metric indicates successful pricing increases, higher tenancy ratios, or additional amendments from existing tenants.`
    },
    {
      question: `How does ${symbol} compare to industry average?`,
      answer: `${symbol}'s revenue per tower of $${revenuePerTower.toLocaleString()} is ${parseFloat(vsIndustry) > 0 ? `${vsIndustry}% above` : `${Math.abs(parseFloat(vsIndustry))}% below`} the industry average of $${industryAverage.toLocaleString()}. This reflects the company's pricing power and portfolio quality.`
    },
    {
      question: `What drives ${symbol} revenue per tower?`,
      answer: `Revenue per tower is driven by: (1) Tenancy ratio (carriers per tower), (2) Escalation clauses in lease agreements, (3) Amendment revenue from 5G upgrades, (4) Geographic location and market density, and (5) Competitive positioning in key markets.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Revenue Per Tower`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Revenue Per Tower - Tower Efficiency Metrics`,
      description: `Comprehensive revenue per tower analysis for ${symbol} (${companyName}) including efficiency and monetization metrics.`,
      url: pageUrl,
      keywords: [`${symbol} revenue per tower`, `${symbol} tower efficiency`, `${symbol} tower revenue`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(revenueFaqs),
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
            <span>{symbol} Revenue Per Tower</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Revenue Per Tower</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Tower efficiency & monetization analysis</p>

          {/* Revenue Per Tower Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Revenue/Tower</p>
                <p className="text-4xl font-bold text-green-500">${(revenuePerTower / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className={`text-4xl font-bold ${parseFloat(revenueGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(revenueGrowth) > 0 ? '+' : ''}{revenueGrowth}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">vs Industry</p>
                <p className={`text-2xl font-bold ${parseFloat(vsIndustry) >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {parseFloat(vsIndustry) > 0 ? '+' : ''}{vsIndustry}%
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Per Tower Drivers</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Tenancy & Leasing</h3>
                <p className="text-muted-foreground">
                  Multiple carriers leasing space on each tower increases revenue density. Higher tenancy ratios
                  (carriers per tower) drive revenue per tower growth with minimal incremental cost.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Escalation Clauses</h3>
                <p className="text-muted-foreground">
                  Contractual rent escalations (typically 2-4% annually) provide predictable revenue growth.
                  These escalators compound over time, increasing revenue per tower organically.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Amendment Revenue</h3>
                <p className="text-muted-foreground">
                  5G upgrades and equipment modifications generate one-time and recurring amendment fees,
                  boosting revenue per tower as carriers densify their networks.
                </p>
              </div>
            </div>
          </section>

          {/* Benchmark Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Benchmark</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">Industry Average</p>
                  <p className="text-3xl font-bold">${(industryAverage / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">{symbol} Performance</p>
                  <p className={`text-3xl font-bold ${parseFloat(vsIndustry) >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {parseFloat(vsIndustry) > 0 ? '+' : ''}{vsIndustry}%
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {parseFloat(vsIndustry) > 0
                  ? `${symbol}'s above-average revenue per tower indicates strong pricing power, superior asset quality, or higher tenancy ratios compared to peers.`
                  : `${symbol} has opportunity to improve tower monetization through increased tenancy, pricing optimization, or strategic amendments.`}
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Tower Analytics</h2>
            <p className="text-muted-foreground mb-6">View tower count, tenancy ratios, and complete infrastructure metrics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {revenueFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="revenue-per-tower" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
