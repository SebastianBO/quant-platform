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
    title: `${symbol} International Streaming ${currentYear} - Global Expansion Analysis`,
    description: `${symbol} international streaming analysis including global subscriber growth, regional expansion, and ${currentYear} forecasts.`,
    keywords: [
      `${symbol} international streaming`,
      `${symbol} global subscribers`,
      `${symbol} international expansion`,
      `${symbol} global growth`,
      `${symbol} international ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} International Streaming ${currentYear} | Global Expansion`,
      description: `Complete ${symbol} international streaming analysis with regional growth and global expansion insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/international-streaming/${ticker.toLowerCase()}`,
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

export default async function InternationalStreamingPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/international-streaming/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // International Streaming FAQs
  const internationalFaqs = [
    {
      question: `How many international streaming subscribers does ${symbol} have?`,
      answer: `${symbol} (${companyName}) typically reports subscriber counts by region in quarterly earnings. International subscriber breakdowns include regions like Europe, Asia-Pacific, Latin America, and Middle East/Africa. International markets represent the primary growth opportunity as North American markets mature. Check latest earnings reports for regional subscriber data.`
    },
    {
      question: `Is ${symbol}'s international streaming business growing?`,
      answer: `International subscriber growth for ${symbol} typically exceeds domestic growth as global markets offer larger addressable populations. Growth rates vary by region based on market maturity, content localization, pricing, competitive intensity, and infrastructure. Emerging markets show higher subscriber growth but lower ARPU than developed markets.`
    },
    {
      question: `How does ${symbol} localize content for international markets?`,
      answer: `Content localization for ${symbol} includes dubbing and subtitling in local languages, producing regional original content, acquiring local licenses, and cultural adaptation. Successful international expansion requires significant local content investment to compete with domestic streaming services and traditional broadcasters.`
    },
    {
      question: `What challenges does ${symbol} face in international streaming?`,
      answer: `International expansion challenges for ${symbol} include content licensing restrictions, local regulatory requirements, payment infrastructure limitations, currency fluctuations, lower ARPU in emerging markets, intense local competition, cultural content preferences, and piracy. Each region presents unique operational and strategic challenges.`
    },
    {
      question: `Which international markets are strongest for ${symbol}?`,
      answer: `International market strength varies by region. Developed markets (Western Europe, Australia, Japan) show higher ARPU but slower growth. Emerging markets (Southeast Asia, Latin America, India) demonstrate strong subscriber growth but lower revenue per user. ${symbol}'s international strategy must balance subscriber volume in emerging markets with revenue quality in developed regions.`
    },
    {
      question: `What is ${symbol}'s international streaming forecast for ${currentYear}?`,
      answer: `International streaming forecasts for ${symbol} depend on regional expansion plans, content investment, pricing strategies, and competitive dynamics. Most major streaming platforms expect international markets to drive majority of future subscriber growth. Review earnings guidance and investor presentations for the latest international expansion outlook.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} International Streaming`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} International Streaming ${currentYear} - Global Expansion Analysis`,
    description: `Comprehensive international streaming analysis for ${symbol} (${companyName}) with global growth and regional insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} international streaming`,
      `${symbol} global subscribers`,
      `${symbol} international expansion`,
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

  const faqSchema = getFAQSchema(internationalFaqs)

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
            <span>{symbol} International Streaming</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} International Streaming {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Global expansion and regional growth analysis for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">International Expansion Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">International Opportunities</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Massive addressable market (billions globally)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Higher growth rates than mature markets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Growing middle class in emerging markets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Improving internet infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Mobile-first consumption trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Untapped markets with low penetration</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">International Challenges</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Lower ARPU in emerging markets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Content licensing restrictions by territory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Local content investment requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Strong local competitors in each market</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Currency fluctuations and FX headwinds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Regulatory and censorship challenges</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Regional Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Regional Market Dynamics</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Developed International Markets</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Western Europe, UK, Australia, Japan, South Korea
                </p>
                <p className="text-muted-foreground">
                  These markets offer high ARPU similar to North America but slower subscriber growth due to market
                  maturity. Competitive intensity is high with strong local players. Content strategies focus on
                  quality over quantity, with significant local language original production. Pricing power exists
                  but growth comes primarily from market share gains rather than market expansion.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Emerging Markets</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  India, Southeast Asia, Latin America, Middle East, Africa
                </p>
                <p className="text-muted-foreground">
                  Emerging markets provide the highest subscriber growth rates but lowest ARPU. Price sensitivity
                  is extreme, requiring ultra-low pricing tiers and mobile-optimized plans. Local content is critical
                  for market acceptance. Infrastructure challenges, payment system limitations, and piracy are
                  significant obstacles. Long-term value depends on ARPU expansion as middle class grows.
                </p>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Growth Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">The Global TAM Opportunity</h3>
                <p className="text-muted-foreground">
                  With North American streaming penetration approaching saturation, international markets represent
                  the primary growth runway for platforms like {symbol}. Global broadband households number in the
                  billions, while leading streaming platforms have hundreds of millions of subscribers. The
                  addressable market is massive, but monetization varies dramatically by region.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Content Localization Investment</h3>
                <p className="text-muted-foreground">
                  Successful international expansion requires significant local content investment. Simply dubbing
                  American content is insufficient to compete with local broadcasters and streaming services.
                  {symbol}'s international content budget determines competitive positioning in each market.
                  Local hits can drive subscriber growth while improving content efficiency through global distribution.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">ARPU vs Subscriber Volume Trade-offs</h3>
                <p className="text-muted-foreground">
                  International strategy involves trade-offs between subscriber volume and ARPU. Aggressive pricing
                  in India might add tens of millions of subscribers at $2-3 monthly ARPU, while Western European
                  growth adds millions at $12-15 ARPU. For {symbol}, the optimal mix balances subscriber headline
                  growth with revenue quality and path to profitability.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, international metrics, and detailed valuations
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
              {internationalFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. International streaming metrics are subject to change and may vary by region and reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="international-streaming" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
