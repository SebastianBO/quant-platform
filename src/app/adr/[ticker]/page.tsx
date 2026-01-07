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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} ADR ${currentYear} - Average Daily Rate Analysis`,
    description: `${symbol} ADR (Average Daily Rate) analysis: pricing trends, rate growth, competitive positioning, and hotel pricing power for investors.`,
    keywords: [
      `${symbol} ADR`,
      `${symbol} average daily rate`,
      `${symbol} hotel pricing`,
      `${symbol} room rates`,
      `${symbol} pricing power`,
      `${symbol} ADR growth`,
      `${symbol} hotel rates`,
    ],
    openGraph: {
      title: `${symbol} ADR - Average Daily Rate Analysis`,
      description: `Complete ${symbol} ADR analysis with pricing trends and competitive comparison.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/adr/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function ADRPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/adr/${ticker.toLowerCase()}`

  const currentPrice = snapshot.price
  const sector = companyFacts?.sector || 'Market'

  // ADR metrics would come from API - using placeholders
  const adr = metrics?.adr || null
  const adrGrowth = metrics?.adr_growth || null
  const industryAvgADR = 135 // Industry average placeholder

  const hasADR = adr && adr > 0

  const adrFaqs = [
    {
      question: `What is ${symbol} ADR?`,
      answer: hasADR
        ? `${symbol} (${companyName}) has an Average Daily Rate (ADR) of $${adr.toFixed(2)}. ADR measures the average rental revenue earned per occupied room per day. It's a key indicator of pricing power and revenue management effectiveness in the hospitality industry.`
        : `${symbol} (${companyName}) ADR data is currently unavailable. ADR is a crucial metric for hotel and resort companies that measures average room pricing.`
    },
    {
      question: `What is a good ADR for hotels?`,
      answer: `ADR varies by hotel segment: luxury hotels typically achieve $250-500+ ADR, upscale hotels $150-250, midscale $80-150, and economy hotels $50-80. Location, brand positioning, and amenities significantly impact ADR. ${hasADR ? `${symbol}'s ADR of $${adr.toFixed(2)} reflects its market positioning.` : `Compare ADR to similar hotel segments.`}`
    },
    {
      question: `How is ADR calculated?`,
      answer: `ADR is calculated as: Total Room Revenue ÷ Number of Rooms Sold. For example, if a hotel generates $50,000 in room revenue from 400 rooms sold, ADR = $50,000 ÷ 400 = $125. ADR only considers occupied rooms, unlike RevPAR which includes all available rooms.`
    },
    {
      question: `Is ${symbol} ADR growth strong?`,
      answer: adrGrowth
        ? `${symbol} ADR is ${adrGrowth > 0 ? 'growing' : 'declining'} at ${Math.abs(adrGrowth).toFixed(1)}% year-over-year. Strong ADR growth (3-5%+) indicates pricing power and brand strength. Industry-wide ADR typically grows 2-3% annually with inflation.`
        : `ADR growth data for ${symbol} will be updated from quarterly earnings. ADR growth above inflation signals strong demand and pricing power.`
    },
    {
      question: `What drives ADR performance?`,
      answer: `ADR is influenced by: (1) Brand reputation and loyalty programs, (2) Location and market demand, (3) Property amenities and quality, (4) Competitive set and supply dynamics, (5) Revenue management sophistication, (6) Seasonal and event-driven demand. ${symbol}'s ADR reflects these combined factors.`
    },
    {
      question: `Why is ADR important for investors?`,
      answer: `ADR measures pricing power and revenue quality. Rising ADR indicates strong demand, brand value, and competitive positioning. Unlike occupancy (which can be increased by lowering prices), ADR directly impacts profitability margins. ${symbol} investors should monitor ADR trends alongside occupancy for complete revenue picture.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Learn', url: `${SITE_URL}/learn` },
      { name: 'ADR', url: `${SITE_URL}/learn/adr` },
      { name: `${symbol} ADR`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} ADR ${currentYear} - Average Daily Rate Analysis`,
      description: `Complete ADR analysis for ${symbol} including pricing trends and competitive comparison.`,
      url: pageUrl,
      keywords: [`${symbol} ADR`, `${symbol} average daily rate`, `${symbol} hotel pricing`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(adrFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>{symbol} ADR</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} ADR {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Average Daily Rate Analysis</p>

          {/* ADR Overview */}
          <div className="p-8 rounded-xl border mb-8 bg-green-500/10 border-green-500/30">
            {hasADR ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Current ADR</p>
                  <p className="text-4xl font-bold">${adr.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                  <p className="text-3xl font-bold">${currentPrice.toFixed(2)}</p>
                </div>
                {adrGrowth && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">YoY Growth</p>
                    <p className={`text-3xl font-bold ${adrGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {adrGrowth > 0 ? '+' : ''}{adrGrowth.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Industry Avg</p>
                  <p className="text-3xl font-bold">${industryAvgADR.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">{symbol} ADR Data Not Available</p>
                <p className="text-muted-foreground">ADR metrics will be displayed when available from earnings reports.</p>
              </div>
            )}
          </div>

          {/* What is ADR */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Average Daily Rate?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                ADR (Average Daily Rate) measures the average price guests pay per occupied room. It's a direct indicator of pricing power and brand strength in the hospitality sector.
              </p>
              <p className="text-muted-foreground">
                For {symbol} investors, ADR reveals:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Pricing power and brand value</li>
                <li>Revenue management effectiveness</li>
                <li>Market positioning and competitiveness</li>
                <li>Quality of revenue (not just volume)</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Hotel Metrics</h2>
            <p className="text-muted-foreground mb-6">RevPAR, occupancy, room count, and full hospitality analysis</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                Full Stock Analysis
              </Link>
              <Link href={`/revpar/${symbol.toLowerCase()}`} className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium">
                RevPAR Analysis
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {adrFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Hotel Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['MAR', 'HLT', 'H', 'IHG', 'WYNN', 'LVS', 'MGM', 'HST']
                .filter(s => s !== symbol)
                .slice(0, 8)
                .map(stock => (
                  <Link key={stock} href={`/adr/${stock.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                    {stock} ADR
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
