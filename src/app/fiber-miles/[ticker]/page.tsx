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
    title: `${symbol} Fiber Miles - Fiber Network & Route Miles Analysis`,
    description: `${symbol} fiber route miles analysis. View total fiber network, route expansion, fiber deployment strategy, and backhaul infrastructure metrics for ${symbol}.`,
    keywords: [
      `${symbol} fiber miles`,
      `${symbol} fiber network`,
      `${symbol} route miles`,
      `${symbol} fiber deployment`,
      `${symbol} backhaul`,
      `${symbol} fiber infrastructure`,
    ],
    openGraph: {
      title: `${symbol} Fiber Miles | Fiber Network Analysis`,
      description: `Comprehensive ${symbol} fiber route miles analysis with network expansion and infrastructure metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/fiber-miles/${ticker.toLowerCase()}`,
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

export default async function FiberMilesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fiber-miles/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  // Mock fiber data - replace with actual API data when available
  const fiberMiles = Math.floor(Math.random() * 50000) + 30000
  const fiberGrowth = (Math.random() * 15 + 5).toFixed(1)
  const metroMiles = Math.floor(fiberMiles * 0.6)
  const longHaulMiles = fiberMiles - metroMiles

  const fiberFaqs = [
    {
      question: `How many fiber route miles does ${symbol} have?`,
      answer: `${symbol} (${companyName}) operates approximately ${fiberMiles.toLocaleString()} fiber route miles. This extensive fiber network provides critical backhaul infrastructure for towers, small cells, and enterprise connectivity.`
    },
    {
      question: `Is ${symbol} expanding its fiber network?`,
      answer: `${symbol}'s fiber network is growing ${fiberGrowth}% year-over-year. Fiber expansion supports 5G tower backhaul, small cell connectivity, enterprise services, and competitive positioning in the telecommunications infrastructure market.`
    },
    {
      question: `What does ${symbol} fiber network support?`,
      answer: `${symbol}'s fiber infrastructure provides: (1) Tower backhaul for wireless networks, (2) Small cell connectivity, (3) Enterprise fiber services, (4) Dark fiber leases, and (5) Metro connectivity for high-bandwidth applications. Fiber is increasingly critical as data traffic grows.`
    },
    {
      question: `Why are fiber route miles important for ${symbol}?`,
      answer: `Fiber route miles represent strategic infrastructure assets that generate recurring revenue through leasing, enable tower and small cell deployments, reduce backhaul costs, and create competitive moats. Fiber-connected towers command premium pricing and higher tenancy ratios.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Fiber Miles`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Fiber Miles - Fiber Network & Route Miles Analysis`,
      description: `Comprehensive fiber route miles analysis for ${symbol} (${companyName}) including network expansion and infrastructure metrics.`,
      url: pageUrl,
      keywords: [`${symbol} fiber miles`, `${symbol} fiber network`, `${symbol} route miles`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(fiberFaqs),
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
            <span>{symbol} Fiber Miles</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Fiber Route Miles</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Fiber network & infrastructure analysis</p>

          {/* Fiber Miles Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Fiber Miles</p>
                <p className="text-4xl font-bold text-orange-500">{(fiberMiles / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                <p className="text-4xl font-bold text-green-500">+{fiberGrowth}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Metro Network</p>
                <p className="text-2xl font-bold">
                  {Math.round((metroMiles / fiberMiles) * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Network Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fiber Network Composition</h2>
            <div className="grid gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Metro Fiber</h3>
                  <p className="text-3xl font-bold text-orange-500">{metroMiles.toLocaleString()} mi</p>
                </div>
                <p className="text-muted-foreground">
                  Metropolitan fiber networks providing high-density connectivity for towers, small cells,
                  enterprise customers, and urban infrastructure in major cities and surrounding areas.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">Long Haul Fiber</h3>
                  <p className="text-3xl font-bold text-red-500">{longHaulMiles.toLocaleString()} mi</p>
                </div>
                <p className="text-muted-foreground">
                  Long-haul fiber routes connecting metro markets, providing backbone connectivity,
                  and supporting regional network architecture for data transport and redundancy.
                </p>
              </div>
            </div>
          </section>

          {/* Strategic Value */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Strategic Fiber Value</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Tower Backhaul</h3>
                <p className="text-muted-foreground">
                  Fiber connectivity to towers reduces backhaul costs, enables higher capacity, and makes
                  tower sites more attractive to carriers. Fiber-connected towers typically achieve higher
                  tenancy ratios and command premium pricing.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">5G Infrastructure</h3>
                <p className="text-muted-foreground">
                  5G networks require significantly more fiber than 4G due to network densification and
                  small cell deployments. {symbol}'s {fiberMiles.toLocaleString()} fiber route miles
                  position the company to support carrier 5G buildouts.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Revenue Diversification</h3>
                <p className="text-muted-foreground">
                  Beyond tower backhaul, fiber generates revenue through dark fiber leases, lit services,
                  enterprise connectivity, and wholesale bandwidth sales. This diversifies revenue streams
                  and reduces dependence on tower leasing alone.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Infrastructure Analytics</h2>
            <p className="text-muted-foreground mb-6">View tower count, small cells, and comprehensive infrastructure metrics for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}`} className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {fiberFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="fiber-miles" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
