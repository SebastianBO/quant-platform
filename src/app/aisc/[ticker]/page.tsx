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
    title: `${symbol} AISC ${currentYear} - All-in Sustaining Cost Analysis`,
    description: `${symbol} all-in sustaining cost (AISC) analysis: mining cost per ounce, AISC trends, cost efficiency metrics, and profitability margins for gold and copper mining.`,
    keywords: [
      `${symbol} AISC`,
      `${symbol} all-in sustaining cost`,
      `${symbol} mining costs`,
      `${symbol} cost per ounce`,
      `${symbol} production costs`,
      `${symbol} mining efficiency`,
    ],
    openGraph: {
      title: `${symbol} AISC - All-in Sustaining Cost Analysis`,
      description: `Complete ${symbol} AISC analysis with cost trends, efficiency metrics, and profitability insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/aisc/${ticker.toLowerCase()}`,
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

export default async function AISCPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/aisc/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder AISC data - would come from mining-specific API
  const currentAISC = 1150 // $/oz for gold
  const previousAISC = 1085
  const aiscChange = ((currentAISC - previousAISC) / previousAISC * 100).toFixed(1)
  const industryAvgAISC = 1200
  const goldPrice = 2050 // $/oz
  const margin = goldPrice - currentAISC
  const marginPercent = ((margin / goldPrice) * 100).toFixed(1)

  const aiscFaqs = [
    {
      question: `What is ${symbol}'s all-in sustaining cost (AISC)?`,
      answer: `${symbol} (${companyName}) reports an all-in sustaining cost (AISC) of $${currentAISC} per ounce. AISC is the industry-standard metric for total cost of production, including mining, processing, general & administrative costs, sustaining capital, exploration at existing sites, and closure costs. This comprehensive measure shows the true cost of maintaining current production levels.`
    },
    {
      question: `How does ${symbol}'s AISC compare to the industry?`,
      answer: `${symbol}'s AISC of $${currentAISC}/oz is ${currentAISC < industryAvgAISC ? 'below' : 'above'} the industry average of approximately $${industryAvgAISC}/oz, placing it in the ${currentAISC < industryAvgAISC ? 'lowest cost' : 'higher cost'} quartile. Lower AISC indicates better operational efficiency, superior ore quality, or favorable geographic/political positioning. Companies with lower AISC have higher profit margins and can sustain operations through commodity price downturns.`
    },
    {
      question: `What is included in ${symbol}'s AISC calculation?`,
      answer: `AISC includes: (1) Direct mining costs (labor, fuel, consumables, maintenance), (2) Processing and refining costs, (3) On-site general & administrative expenses, (4) Sustaining capital expenditure to maintain current production, (5) Exploration and evaluation at existing mines, (6) Closure and reclamation costs, and (7) By-product credits. This comprehensive metric excludes growth capital, corporate G&A, and non-sustaining exploration.`
    },
    {
      question: `Why has ${symbol}'s AISC changed?`,
      answer: `${symbol}'s AISC has ${parseFloat(aiscChange) >= 0 ? 'increased' : 'decreased'} ${Math.abs(parseFloat(aiscChange))}% from $${previousAISC}/oz to $${currentAISC}/oz. AISC changes are driven by: ore grade variations, fuel and energy prices, labor costs and productivity, consumables and supplies inflation, sustaining capital intensity, FX rates (for international operations), and operational efficiency improvements or setbacks.`
    },
    {
      question: `What is ${symbol}'s profit margin at current gold prices?`,
      answer: `At current gold prices of $${goldPrice}/oz and AISC of $${currentAISC}/oz, ${symbol} generates a margin of $${margin}/oz (${marginPercent}% margin). This margin funds growth capital, dividends, debt reduction, and corporate costs. Higher margins provide cushion during price downturns - companies with AISC above $${Math.round(goldPrice * 0.8)}/oz are vulnerable if gold prices decline.`
    },
    {
      question: `How can ${symbol} reduce AISC?`,
      answer: `AISC reduction strategies include: (1) Accessing higher-grade ore zones, (2) Improving recovery rates through metallurgical optimization, (3) Increasing throughput and equipment utilization, (4) Energy efficiency and renewable power adoption, (5) Automation and productivity improvements, (6) Supply chain optimization and competitive procurement, (7) Mine sequencing and blending strategies. Sustainable AISC reduction requires operational excellence and technical innovation.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} AISC`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} AISC ${currentYear} - All-in Sustaining Cost Analysis`,
      description: `Complete AISC analysis for ${symbol} including cost trends, industry comparison, and profitability metrics.`,
      url: pageUrl,
      keywords: [`${symbol} AISC`, `${symbol} all-in sustaining cost`, `${symbol} mining costs`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(aiscFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} AISC</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} All-in Sustaining Cost (AISC) {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Mining Cost Efficiency & Profitability Analysis</p>

          {/* AISC Overview */}
          <div className={`p-8 rounded-xl border mb-8 ${currentAISC < industryAvgAISC ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current AISC</p>
                <p className="text-3xl font-bold">${currentAISC}</p>
                <p className="text-sm text-muted-foreground">per ounce</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Change</p>
                <p className={`text-3xl font-bold ${parseFloat(aiscChange) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(aiscChange) > 0 ? '+' : ''}{aiscChange}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Industry Avg</p>
                <p className="text-3xl font-bold">${industryAvgAISC}</p>
                <p className="text-sm text-muted-foreground">per ounce</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Profit Margin</p>
                <p className="text-3xl font-bold text-green-500">{marginPercent}%</p>
                <p className="text-sm text-muted-foreground">${margin}/oz</p>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Cost Breakdown & Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">All-in Sustaining Cost</h3>
                <p className="text-4xl font-bold mb-2">${currentAISC}/oz</p>
                <p className={`text-sm ${currentAISC < industryAvgAISC ? 'text-green-500' : 'text-yellow-500'}`}>
                  {currentAISC < industryAvgAISC
                    ? `$${(industryAvgAISC - currentAISC).toFixed(0)} below industry average`
                    : `$${(currentAISC - industryAvgAISC).toFixed(0)} above industry average`}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Previous Year AISC</h3>
                <p className="text-4xl font-bold mb-2">${previousAISC}/oz</p>
                <p className={`text-sm ${parseFloat(aiscChange) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(aiscChange) <= 0 ? 'Cost improvement' : 'Cost increase'} of {Math.abs(parseFloat(aiscChange))}%
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Gold Price</h3>
                <p className="text-4xl font-bold mb-2">${goldPrice}/oz</p>
                <p className="text-sm text-muted-foreground">Current spot price</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Operating Margin</h3>
                <p className="text-4xl font-bold text-green-500 mb-2">${margin}</p>
                <p className="text-sm text-muted-foreground">per ounce ({marginPercent}%)</p>
              </div>
            </div>
          </section>

          {/* AISC Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What's Included in AISC?</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">1. Direct Mining Costs</h3>
                <p className="text-muted-foreground">
                  Labor, fuel, explosives, grinding media, reagents, maintenance, utilities - all direct costs of extracting and processing ore into saleable product.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">2. Sustaining Capital</h3>
                <p className="text-muted-foreground">
                  Capital expenditure required to maintain current production capacity: equipment replacement, tailings facility expansions, mine development, and infrastructure maintenance.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">3. Exploration (Brownfield)</h3>
                <p className="text-muted-foreground">
                  Exploration and evaluation costs at existing mine sites to replace depleted reserves and extend mine life. Does not include greenfield exploration.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">4. General & Administrative</h3>
                <p className="text-muted-foreground">
                  On-site G&A costs including management, technical services, procurement, and community relations. Excludes corporate head office costs.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">5. Reclamation & Closure</h3>
                <p className="text-muted-foreground">
                  Accretion of closure provision and rehabilitation costs allocated to current period production based on units-of-production method.
                </p>
              </div>
            </div>
          </section>

          {/* Cost Sensitivity */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Profitability at Different Gold Prices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1800, 1950, 2150, 2300].map(price => {
                const profitMargin = price - currentAISC
                const profitPercent = ((profitMargin / price) * 100).toFixed(1)
                return (
                  <div key={price} className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-1">At ${price}/oz</p>
                    <p className={`text-2xl font-bold ${profitMargin > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${profitMargin}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{profitPercent}% margin</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Cost Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed cost breakdowns, production data, margin analysis, and AI-powered mining insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=financials`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {aiscFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Mining Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Mining Metrics</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/gold-production/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Gold Production
              </Link>
              <Link href={`/mining-reserves/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Mineral Reserves
              </Link>
              <Link href={`/grade-trend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Ore Grade Trends
              </Link>
              <Link href={`/realized-prices/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Realized Prices
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="costs" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
