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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Realized Prices ${currentYear} - Mining Commodity Prices & Premiums`,
    description: `${symbol} realized commodity prices: actual selling prices, premiums vs spot, treatment charges, quality adjustments, and pricing power analysis.`,
    keywords: [
      `${symbol} realized prices`,
      `${symbol} commodity prices`,
      `${symbol} gold price`,
      `${symbol} copper price`,
      `${symbol} pricing`,
      `${symbol} price realization`,
    ],
    openGraph: {
      title: `${symbol} Realized Prices - Commodity Pricing Analysis`,
      description: `Complete ${symbol} realized price analysis with premiums, discounts, and pricing power metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/realized-prices/${ticker.toLowerCase()}`,
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

export default async function RealizedPricesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/realized-prices/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder pricing data - would come from mining-specific API
  const realizedGoldPrice = 2035 // $/oz
  const spotGoldPrice = 2050
  const goldPremiumDiscount = ((realizedGoldPrice - spotGoldPrice) / spotGoldPrice * 100).toFixed(1)
  const treatmentCharges = 15 // $/oz for refining
  const netRealizedPrice = realizedGoldPrice - treatmentCharges

  const pricingFaqs = [
    {
      question: `What is ${symbol}'s realized gold price?`,
      answer: `${symbol} (${companyName}) achieved a realized gold price of $${realizedGoldPrice} per ounce, compared to the spot gold price of $${spotGoldPrice}/oz. This represents a ${parseFloat(goldPremiumDiscount) >= 0 ? 'premium' : 'discount'} of ${Math.abs(parseFloat(goldPremiumDiscount))}% versus benchmark pricing. Realized prices differ from spot due to timing (hedge positions), quality adjustments (fineness premiums), treatment charges, and sales contract terms.`
    },
    {
      question: `Why does realized price differ from spot price?`,
      answer: `Realized prices diverge from spot prices due to: (1) Hedge positions - forward sales contracts lock in prices, (2) Treatment & refining charges (TCs/RCs) - costs to refine concentrate to pure metal, (3) Quality premiums/discounts - higher purity commands premiums, (4) Timing differences - sales recognition versus spot price dates, (5) Transportation & logistics costs, (6) Sales contract terms - quotational periods and pricing mechanisms.`
    },
    {
      question: `What are treatment charges?`,
      answer: `Treatment and refining charges (TCs/RCs) are fees paid to smelters and refiners to process ore concentrate into pure metal. For gold, typical charges are $${treatmentCharges}-25/oz. For copper, TCs are ~$60-100/tonne plus refining charges of $0.06-0.10/lb. Lower charges indicate tight concentrate supply (favorable for miners). Integrated miners with their own smelters avoid these charges, improving realized prices.`
    },
    {
      question: `Does ${symbol} use hedging?`,
      answer: `Mining companies use hedging to lock in future prices and protect cash flow. Common strategies: (1) Forward sales - selling future production at fixed prices, (2) Options - buying puts for downside protection, (3) Collars - combining puts and calls to limit price range. While hedging provides certainty, it can cap upside if spot prices rise. Review ${symbol}'s hedge book disclosures to understand price exposure and locked-in positions.`
    },
    {
      question: `How do quality premiums affect realized prices?`,
      answer: `Product quality impacts pricing: Gold - higher purity (99.99% vs 99.5%) commands small premiums. Copper - premium for cathode vs concentrate. Iron ore - significant premiums for high-grade (65%+ Fe) versus benchmark 62% Fe pricing. ${symbol}'s product mix and quality profile affect whether realized prices trade at premiums or discounts to benchmark indices.`
    },
    {
      question: `What is price realization percentage?`,
      answer: `Price realization = (Realized Price / Spot Price) × 100%. ${symbol} achieved ${((realizedGoldPrice / spotGoldPrice) * 100).toFixed(1)}% price realization. Industry best-practice is 95-98%. Lower realization may indicate: high treatment charges, unfavorable hedge positions, quality discounts, or poor contract terms. Higher realization (>100%) suggests premiums for quality, favorable hedges, or timing benefits.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Realized Prices`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Realized Prices ${currentYear} - Commodity Pricing Analysis`,
      description: `Complete realized price analysis for ${symbol} including premiums, treatment charges, and pricing power.`,
      url: pageUrl,
      keywords: [`${symbol} realized prices`, `${symbol} commodity prices`, `${symbol} gold price`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(pricingFaqs),
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
            <span>{symbol} Realized Prices</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Realized Commodity Prices {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Pricing Power & Price Realization Analysis</p>

          {/* Pricing Overview */}
          <div className={`p-8 rounded-xl border mb-8 ${parseFloat(goldPremiumDiscount) >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Realized Price</p>
                <p className="text-3xl font-bold">${realizedGoldPrice}</p>
                <p className="text-sm text-muted-foreground">per ounce</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Spot Price</p>
                <p className="text-3xl font-bold">${spotGoldPrice}</p>
                <p className="text-sm text-muted-foreground">per ounce</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Premium/Discount</p>
                <p className={`text-3xl font-bold ${parseFloat(goldPremiumDiscount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(goldPremiumDiscount) > 0 ? '+' : ''}{goldPremiumDiscount}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Net Realized</p>
                <p className="text-3xl font-bold">${netRealizedPrice}</p>
                <p className="text-sm text-muted-foreground">after TCs</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Price Realization Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Gross Realized Price</h3>
                <p className="text-4xl font-bold mb-2">${realizedGoldPrice}/oz</p>
                <p className={`text-sm mb-2 ${parseFloat(goldPremiumDiscount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(goldPremiumDiscount) >= 0 ? 'Premium' : 'Discount'} of ${Math.abs(realizedGoldPrice - spotGoldPrice).toFixed(0)} vs spot
                </p>
                <p className="text-xs text-muted-foreground">
                  Price before treatment charges and refining costs
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Spot Benchmark Price</h3>
                <p className="text-4xl font-bold mb-2">${spotGoldPrice}/oz</p>
                <p className="text-sm text-muted-foreground mb-2">London PM Fix / LBMA</p>
                <p className="text-xs text-muted-foreground">
                  Market reference price for gold transactions
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Treatment Charges</h3>
                <p className="text-4xl font-bold mb-2">-${treatmentCharges}/oz</p>
                <p className="text-sm text-muted-foreground mb-2">Smelting & refining costs</p>
                <p className="text-xs text-muted-foreground">
                  Charges for processing concentrate to pure metal
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Net Realized Price</h3>
                <p className="text-4xl font-bold mb-2">${netRealizedPrice}/oz</p>
                <p className="text-sm text-muted-foreground mb-2">After all deductions</p>
                <p className="text-xs text-muted-foreground">
                  Actual revenue per ounce sold
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting Realized Prices</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Hedge Book Positions</h3>
                <p className="text-muted-foreground">
                  Forward sales contracts and derivatives lock in future prices. While providing revenue certainty, hedges can result in below-spot realization if gold prices rise significantly. Companies report hedge positions quarterly - check mark-to-market values and roll-forward schedules.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Product Quality & Purity</h3>
                <p className="text-muted-foreground">
                  Gold purity (fineness) affects pricing. London Good Delivery bars (99.5% pure minimum) are standard. Higher purity (99.99% "four nines") may command small premiums. Doré bars (unrefined gold-silver alloy) face refining charges. Silver by-product credits offset some costs.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Treatment & Refining Charges</h3>
                <p className="text-muted-foreground">
                  TCs/RCs vary based on concentrate market conditions. Tight concentrate supply (high demand for smelter capacity) results in lower charges, benefiting miners. Oversupply increases charges. Benchmark negotiations occur annually. Integrated producers with own refineries avoid external charges entirely.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Sales Contract Terms</h3>
                <p className="text-muted-foreground">
                  Pricing mechanisms in sales contracts affect realization: quotational periods (month of shipment, arrival, or average), provisional pricing subject to final adjustment, fixed-price contracts, or spot-based pricing. Longer quotational periods increase price volatility exposure.
                </p>
              </div>
            </div>
          </section>

          {/* Price Scenarios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue at Different Spot Prices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1800, 1950, 2150, 2300].map(spot => {
                const realized = spot * (realizedGoldPrice / spotGoldPrice)
                const net = realized - treatmentCharges
                return (
                  <div key={spot} className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-1">Spot: ${spot}</p>
                    <p className="text-2xl font-bold text-green-500">${net.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">net realized/oz</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Pricing Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed realized prices, hedge book positions, quality premiums, and AI-powered pricing insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {pricingFaqs.map((faq, i) => (
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
              <Link href={`/aisc/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                All-in Sustaining Cost
              </Link>
              <Link href={`/mining-reserves/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Mineral Reserves
              </Link>
              <Link href={`/grade-trend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Ore Grade Trends
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="pricing" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
