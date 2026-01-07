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
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Prestige vs Mass Market ${currentYear} - Beauty Segment Strategy`,
    description: `${symbol} prestige vs mass market analysis for ${currentYear}. Strategic positioning across luxury and mass beauty segments with revenue breakdown.`,
    keywords: [
      `${symbol} prestige beauty`,
      `${symbol} mass market`,
      `${symbol} luxury beauty`,
      `${symbol} masstige`,
      `${symbol} beauty segments`,
      `${symbol} pricing strategy`,
    ],
    openGraph: {
      title: `${symbol} Prestige vs Mass Market ${currentYear} | Beauty Segment Analysis`,
      description: `Analysis of ${symbol}'s strategic positioning across prestige luxury and mass market beauty segments.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/prestige-vs-mass/${ticker.toLowerCase()}`,
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

export default async function PrestigeVsMassPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/prestige-vs-mass/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Prestige vs Mass FAQs
  const prestigeMassFaqs = [
    {
      question: `What is ${symbol}'s prestige vs mass market strategy?`,
      answer: `${companyName} (${symbol}) operates across both prestige and mass market beauty segments with differentiated brand portfolios. Prestige brands are sold through department stores, Sephora, and Ulta, while mass brands are available in drugstores and mass retailers like Target and Walmart.`
    },
    {
      question: `How does ${symbol} balance prestige and mass market revenue?`,
      answer: `${companyName} strategically manages both segments to maximize market coverage. Prestige brands typically offer higher margins but lower volumes, while mass market brands drive volume with broader distribution. The company often leverages masstige positioning to bridge both segments.`
    },
    {
      question: `Which ${symbol} brands are prestige vs mass market?`,
      answer: `${companyName}'s prestige brands typically include luxury skincare, high-end makeup, and designer fragrances sold at premium price points. Mass market brands focus on accessible pricing and wide distribution through drugstores and mass retailers.`
    },
    {
      question: `What is masstige and how does ${symbol} use it?`,
      answer: `Masstige (mass prestige) is a hybrid category offering prestige-quality products at accessible price points, often sold in stores like Ulta and Target. ${symbol} uses masstige positioning to capture consumers trading up from drugstore brands or seeking affordable luxury.`
    },
    {
      question: `How do margins differ between ${symbol}'s prestige and mass segments?`,
      answer: `Prestige beauty typically delivers higher gross margins (60-80%) due to premium pricing, luxury positioning, and smaller production runs. Mass market products have lower margins (40-50%) but benefit from economies of scale, higher volumes, and efficient distribution.`
    },
    {
      question: `What trends are affecting ${symbol}'s prestige vs mass strategy?`,
      answer: `Key trends include: masstige blurring traditional boundaries, direct-to-consumer brands disrupting both segments, Gen Z seeking accessible luxury, sustainability becoming table stakes across all price points, and social media democratizing beauty discovery regardless of price.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Prestige vs Mass`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Prestige vs Mass Market ${currentYear} - Beauty Segment Strategy`,
    description: `Comprehensive analysis of ${companyName}'s strategic positioning across prestige luxury and mass market beauty segments.`,
    url: pageUrl,
    keywords: [
      `${symbol} prestige beauty`,
      `${symbol} mass market`,
      `${symbol} beauty strategy`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} prestige vs mass analysis`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(prestigeMassFaqs)

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
            <span>{symbol} Prestige vs Mass</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Prestige vs Mass Market Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} strategic positioning across luxury and mass beauty segments
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Stock Price</p>
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

          {/* Segment Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Prestige vs Mass Market Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prestige */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-lg border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4 text-purple-400">Prestige Beauty</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Price Point</p>
                    <p className="font-bold">$30-$200+</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distribution</p>
                    <p className="font-bold">Sephora, Ulta, Department Stores</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margins</p>
                    <p className="font-bold text-green-500">60-80%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positioning</p>
                    <p className="font-bold">Luxury, Innovation, Exclusivity</p>
                  </div>
                </div>
              </div>

              {/* Mass Market */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-lg border border-blue-500/30">
                <h3 className="text-xl font-bold mb-4 text-blue-400">Mass Market</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Price Point</p>
                    <p className="font-bold">$5-$25</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distribution</p>
                    <p className="font-bold">Drugstores, Target, Walmart</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margins</p>
                    <p className="font-bold text-amber-500">40-50%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positioning</p>
                    <p className="font-bold">Accessibility, Value, Volume</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Strategic Insights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Strategic Segment Management</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">1. Portfolio Diversification</h3>
                <p className="text-muted-foreground">Operating across both segments allows {companyName} to capture different consumer demographics, price points, and purchase occasions while mitigating market volatility.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">2. Masstige Opportunity</h3>
                <p className="text-muted-foreground">The hybrid masstige category offers prestige-quality products at accessible prices through retailers like Ulta, Target, and Kohl's, capturing consumers seeking affordable luxury.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">3. Channel Strategy</h3>
                <p className="text-muted-foreground">Prestige brands leverage specialty beauty retail and e-commerce for experiential shopping, while mass brands maximize shelf space and impulse purchases in high-traffic stores.</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">4. Innovation Flow</h3>
                <p className="text-muted-foreground">Technology and ingredients often launch in prestige before cascading to mass market, allowing {companyName} to maximize innovation investment across price points.</p>
              </div>
            </div>
          </section>

          {/* Market Dynamics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Market Dynamics & Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-6 rounded-lg border border-violet-500/30">
                <h3 className="font-bold mb-2">Trading Up Trend</h3>
                <p className="text-sm text-muted-foreground">Mass market consumers increasingly trading up to masstige and prestige for key products like foundation and skincare.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6 rounded-lg border border-emerald-500/30">
                <h3 className="font-bold mb-2">DTC Disruption</h3>
                <p className="text-sm text-muted-foreground">Direct-to-consumer brands offering prestige quality at accessible prices challenging traditional segment boundaries.</p>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-6 rounded-lg border border-rose-500/30">
                <h3 className="font-bold mb-2">Clean at All Prices</h3>
                <p className="text-sm text-muted-foreground">Clean beauty formulations becoming standard across mass and prestige, eliminating ingredient differentiation.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 rounded-lg border border-amber-500/30">
                <h3 className="font-bold mb-2">Social Democracy</h3>
                <p className="text-sm text-muted-foreground">TikTok and Instagram making viral hits from both mass and prestige, democratizing beauty discovery.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Beauty Strategy</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis of brand positioning and segment performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {prestigeMassFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Segment data is based on publicly available information and industry research. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="prestige-vs-mass" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
