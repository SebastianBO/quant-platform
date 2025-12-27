import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Streaming ARPU ${currentYear} - Average Revenue Per User Analysis`,
    description: `${symbol} streaming ARPU (Average Revenue Per User) trends and analysis. Track pricing power, regional ARPU variations, and ${currentYear} forecasts.`,
    keywords: [
      `${symbol} ARPU`,
      `${symbol} streaming ARPU`,
      `${symbol} average revenue per user`,
      `${symbol} pricing strategy`,
      `${symbol} ARPU ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Streaming ARPU ${currentYear} | Revenue Per User Analysis`,
      description: `Complete ${symbol} streaming ARPU analysis with regional breakdowns and pricing trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/arpu-streaming/${ticker.toLowerCase()}`,
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

export default async function ArpuStreamingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/arpu-streaming/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // ARPU FAQs
  const arpuFaqs = [
    {
      question: `What is ${symbol}'s streaming ARPU?`,
      answer: `${symbol} (${companyName}) ARPU (Average Revenue Per User) represents the average monthly or quarterly revenue generated per streaming subscriber. ARPU is calculated by dividing total streaming revenue by the number of subscribers. Check recent earnings reports for the latest ARPU figures.`
    },
    {
      question: `Is ${symbol}'s ARPU increasing or decreasing?`,
      answer: `ARPU trends for ${symbol} depend on pricing changes, tier mix (ad-supported vs premium), regional subscriber composition, and password sharing enforcement. Growing ARPU typically indicates successful pricing power and premium tier adoption.`
    },
    {
      question: `How does ${symbol} ARPU compare to competitors?`,
      answer: `${symbol}'s ARPU should be compared to industry peers like other ${industry || 'streaming'} platforms. ARPU varies significantly by region, content quality, brand positioning, and pricing strategy. Higher ARPU can indicate stronger pricing power and content value perception.`
    },
    {
      question: `What factors drive ${symbol} ARPU growth?`,
      answer: `ARPU growth for ${symbol} is driven by price increases, premium tier adoption, reduction in discounted plans, password sharing crackdowns, add-on services, and shifts toward higher ARPU regions. Successful ARPU expansion indicates monetization effectiveness.`
    },
    {
      question: `Why is ARPU important for ${symbol} investors?`,
      answer: `ARPU is a critical metric for evaluating ${symbol}'s revenue quality and pricing power. While subscriber count drives headline growth, ARPU determines revenue per user. Companies can grow revenue through subscriber additions (volume) or ARPU increases (pricing power).`
    },
    {
      question: `What is ${symbol}'s ARPU forecast for ${currentYear}?`,
      answer: `ARPU forecasts for ${symbol} depend on planned price increases, tier mix evolution, ad-tier penetration, international expansion impact, and competitive dynamics. Analyst estimates and company guidance provide insight into expected ARPU trajectories.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Streaming ARPU`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Streaming ARPU ${currentYear} - Average Revenue Per User Analysis`,
    description: `Comprehensive ARPU analysis for ${symbol} (${companyName}) with pricing trends and regional comparisons.`,
    url: pageUrl,
    keywords: [
      `${symbol} ARPU`,
      `${symbol} streaming ARPU`,
      `${symbol} average revenue per user`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(arpuFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Streaming ARPU</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Streaming ARPU {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Average Revenue Per User analysis for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ARPU Growth Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Positive ARPU Drivers</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Price increases across tiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Premium tier adoption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Password sharing enforcement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Add-on services and bundles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Shift to higher ARPU regions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">ARPU Headwinds</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Ad-tier plan adoption (lower pricing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Emerging market expansion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Competitive pricing pressure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Promotional discounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Currency headwinds in international markets</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ARPU Analysis Framework</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Why ARPU Matters</h3>
                <p className="text-muted-foreground">
                  ARPU is a critical metric for streaming platforms because it measures revenue quality. A company
                  can grow revenue two ways: adding more subscribers (volume growth) or increasing revenue per
                  subscriber (ARPU growth). The best streaming businesses achieve both. {symbol}'s ARPU trends
                  reveal pricing power, customer value perception, and monetization effectiveness.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Regional ARPU Variations</h3>
                <p className="text-muted-foreground">
                  ARPU varies significantly by region. North American subscribers typically generate the highest
                  ARPU due to higher pricing and purchasing power. Emerging markets show lower ARPU but higher
                  growth potential. Understanding {symbol}'s regional subscriber mix is essential for evaluating
                  overall ARPU trajectory and revenue quality.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Tier Mix Impact</h3>
                <p className="text-muted-foreground">
                  The introduction of ad-supported tiers creates ARPU complexity. While ad tiers have lower
                  subscription revenue, total ARPU includes advertising revenue. Successful platforms optimize
                  tier mix to balance subscriber acquisition (ad tiers attract price-sensitive users) with
                  revenue maximization (premium tiers generate higher ARPU).
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, streaming metrics, and detailed valuations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=quant`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Quant Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {arpuFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. ARPU metrics are subject to change and may vary by reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="arpu-streaming" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
