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
    title: `${symbol} Price/Mix Analysis - Pricing Power & Product Mix Impact`,
    description: `${symbol} price/mix analysis with pricing trends, product mix optimization, and revenue quality metrics. Understand how ${symbol} drives growth through pricing and mix improvements.`,
    keywords: [
      `${symbol} price mix`,
      `${symbol} pricing power`,
      `${symbol} product mix`,
      `${symbol} pricing analysis`,
      `${symbol} mix impact`,
      `${symbol} revenue quality`,
    ],
    openGraph: {
      title: `${symbol} Price/Mix Analysis | Pricing Power & Product Mix`,
      description: `Comprehensive price/mix analysis for ${symbol} with pricing trends and product mix metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/price-mix/${ticker.toLowerCase()}`,
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

export default async function PriceMixPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/price-mix/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const priceMixFaqs = [
    {
      question: `What is ${symbol} price/mix contribution?`,
      answer: `${symbol} price/mix contribution measures revenue growth from pricing changes and product mix shifts at ${companyName}. Price reflects list price increases or promotional changes, while mix shows revenue from selling more higher-margin or premium products.`
    },
    {
      question: `How is price/mix calculated for ${symbol}?`,
      answer: `Price/mix for ${symbol} is calculated by separating organic revenue growth into volume (units sold) and price/mix components. Companies report this by comparing same-product pricing year-over-year and analyzing shifts in product portfolio toward higher or lower value items.`
    },
    {
      question: `Why is price/mix important for ${symbol}?`,
      answer: `Price/mix is crucial for ${symbol} because it demonstrates pricing power, brand strength, and portfolio optimization. Strong price/mix indicates the company can raise prices without losing customers and successfully shift mix toward premium offerings, improving margins.`
    },
    {
      question: `What drives ${symbol} price/mix improvement?`,
      answer: `${companyName}'s price/mix is driven by brand strength, innovation, premium product launches, strategic pricing, reduced promotions, favorable channel mix, geographic mix toward higher-value markets, and successful premiumization strategies.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Price/Mix`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Price/Mix Analysis - Pricing Power & Product Mix Impact`,
      description: `Comprehensive price/mix analysis for ${symbol} (${companyName}) with pricing trends and mix optimization.`,
      url: pageUrl,
      keywords: [`${symbol} price mix`, `${symbol} pricing power`, `${symbol} product mix`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(priceMixFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} Price/Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Price/Mix Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Pricing power & product mix optimization</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price/Mix Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold mb-2">Price/Mix Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed pricing power, product mix trends, and revenue quality analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Financial Analysis
              </Link>
            </div>
          </section>

          {/* Price/Mix Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Price/Mix Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Price/Mix %', desc: 'Growth from pricing & mix' },
                { name: 'Net Price Realization', desc: 'Effective pricing power' },
                { name: 'Product Mix Shift', desc: 'Portfolio optimization' },
                { name: 'Premium Mix %', desc: 'High-value product share' },
                { name: 'Pricing Momentum', desc: 'Pricing trend direction' },
                { name: 'Mix Quality', desc: 'Margin impact from mix' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Price/Mix Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Price/Mix Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Positive price/mix demonstrates strong brand equity and pricing power in the market',
                'Improving mix indicates successful portfolio premiumization and innovation',
                'Consistent price/mix contribution suggests sustainable competitive advantages',
                'Price/mix trends reveal the company\'s ability to offset cost inflation and improve margins',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-green-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Price/Mix Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} pricing power and product mix trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Pricing
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {priceMixFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="price-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
