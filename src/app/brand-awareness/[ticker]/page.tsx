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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Brand Awareness ${currentYear} - Marketing & Brand Strength`,
    description: `${symbol} brand awareness analysis for ${currentYear}. Track brand strength, marketing effectiveness, and consumer recognition metrics.`,
    keywords: [
      `${symbol} brand awareness`,
      `${symbol} brand strength`,
      `${symbol} marketing`,
      `${symbol} brand value`,
      `${symbol} consumer recognition`,
      `${symbol} brand equity`,
    ],
    openGraph: {
      title: `${symbol} Brand Awareness ${currentYear} | Brand Analysis`,
      description: `Complete ${symbol} brand awareness analysis with marketing metrics and brand strength indicators.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/brand-awareness/${ticker.toLowerCase()}`,
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

export default async function BrandAwarenessPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/brand-awareness/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate brand metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const marketCap = snapshot.market_cap || 0
  const estimatedMarketingSpend = revenue * 0.10 // Typical 10% of revenue

  // Generate brand awareness FAQs
  const brandFaqs = [
    {
      question: `How strong is ${symbol}'s brand?`,
      answer: `${companyName} has built brand equity through ${sector ? `leadership in the ${sector} sector, ` : ''}consistent quality, marketing investments, and customer experience. With a market cap of $${(marketCap / 1e9).toFixed(1)}B, the market values the brand's ability to drive future revenue and pricing power.`
    },
    {
      question: `How much does ${symbol} spend on marketing?`,
      answer: `Companies typically invest 5-15% of revenue in marketing depending on industry and growth stage. With revenue of $${(revenue / 1e9).toFixed(2)}B, ${symbol}'s estimated annual marketing investment is approximately $${(estimatedMarketingSpend / 1e9).toFixed(2)}B to maintain and grow brand awareness.`
    },
    {
      question: `Is ${symbol}'s brand awareness growing?`,
      answer: `Brand awareness typically correlates with revenue growth, market share gains, and marketing effectiveness. ${symbol}'s revenue growth of ${(revenueGrowth * 100).toFixed(1)}% suggests the brand resonates with consumers${sector ? ` in the ${sector} market` : ''}.`
    },
    {
      question: `What drives ${symbol}'s brand strength?`,
      answer: `Key brand drivers include product quality, customer service, innovation, marketing campaigns, social media presence, influencer partnerships, and word-of-mouth. ${companyName}'s brand investment creates competitive moats and pricing power.`
    },
    {
      question: `How does ${symbol} measure brand awareness?`,
      answer: `Companies track brand metrics including aided/unaided awareness, brand recall, net promoter score (NPS), social media engagement, search volume, and brand valuation studies. Review ${symbol}'s investor presentations for brand performance indicators.`
    },
    {
      question: `Why is brand awareness important for ${symbol}?`,
      answer: `Strong brands command premium pricing, reduce customer acquisition costs, improve retention, and create barriers to competition. For ${symbol}, brand equity is a critical intangible asset that drives long-term shareholder value.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Brand Awareness`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Brand Awareness ${currentYear} - Marketing & Brand Strength`,
    description: `Complete brand awareness analysis for ${symbol} (${companyName}) with marketing metrics and brand strength.`,
    url: pageUrl,
    keywords: [
      `${symbol} brand awareness`,
      `${symbol} brand strength`,
      `${symbol} marketing`,
      `${symbol} brand equity`,
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

  const faqSchema = getFAQSchema(brandFaqs)

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
            <span>{symbol} Brand Awareness</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Brand Awareness
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Brand strength and marketing effectiveness analysis for {companyName}
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

          {/* Brand Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brand Value Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Capitalization</p>
                <p className="text-3xl font-bold">${(marketCap / 1e9).toFixed(1)}B</p>
                <p className="text-sm text-green-500 mt-1">Brand Value Proxy</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. Marketing Spend</p>
                <p className="text-3xl font-bold">${(estimatedMarketingSpend / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-muted-foreground mt-1">Annual Investment</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Brand Performance</p>
              </div>
            </div>
          </section>

          {/* Brand Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Brand Building Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName} builds brand awareness through multiple channels:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong>Advertising Campaigns:</strong> TV, digital, print, and outdoor advertising to reach target audiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong>Social Media Marketing:</strong> Engagement through Instagram, TikTok, YouTube, and other platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong>Influencer Partnerships:</strong> Celebrity endorsements and influencer collaborations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong>Content Marketing:</strong> Brand storytelling, educational content, and thought leadership</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong>Sponsorships & Events:</strong> Sports, entertainment, and community partnerships</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 p-8 rounded-xl border border-pink-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Brand Performance</h2>
            <p className="text-muted-foreground mb-6">
              Track brand metrics, marketing ROI, and competitive positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/competitors/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Compare to Peers
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {brandFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Brand awareness metrics are estimates based on financial data and industry benchmarks. Actual brand performance may vary. Consult third-party brand valuation studies for comprehensive brand strength analysis.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="brand-awareness" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
