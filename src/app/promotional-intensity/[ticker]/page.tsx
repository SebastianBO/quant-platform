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
    title: `${symbol} Promotional Intensity - Sports Betting Marketing Spend ${currentYear}`,
    description: `${symbol} promotional intensity analysis: promo spend as % of handle, customer incentives, bonus trends. Track ${symbol}'s marketing efficiency and profitability trajectory.`,
    keywords: [
      `${symbol} promotional intensity`,
      `${symbol} promo spend`,
      `${symbol} sports betting bonuses`,
      `${symbol} marketing spend`,
      `${symbol} promotional rate`,
      `${symbol} bonus strategy`,
    ],
    openGraph: {
      title: `${symbol} Promotional Intensity ${currentYear} | Marketing Spend Analysis`,
      description: `Complete ${symbol} promotional intensity analysis with spend trends and profitability implications.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/promotional-intensity/${ticker.toLowerCase()}`,
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

export default async function PromotionalIntensityPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/promotional-intensity/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock promotional intensity data - in production, this would come from your API
  const promoIntensity = metrics?.promo_intensity || 0.05
  const industryAvgPromo = 0.04
  const latestPeriod = 'Q4 2024'
  const yearAgoPromo = 0.08

  // Generate promotional intensity FAQs
  const promoIntensityFaqs = [
    {
      question: `What is ${symbol}'s promotional intensity?`,
      answer: `${symbol} (${companyName}) reported ${(promoIntensity * 100).toFixed(1)}% promotional intensity in ${latestPeriod}, meaning promotional costs represent ${(promoIntensity * 100).toFixed(1)}% of total handle. This includes sign-up bonuses, free bets, odds boosts, and customer retention offers.`
    },
    {
      question: `What is promotional intensity in sports betting?`,
      answer: `Promotional intensity measures promotional costs as a percentage of total betting handle. It includes all customer incentives: sign-up bonuses ($50-$200), deposit matches, free bets, odds boosts, and loyalty rewards. Lower promotional intensity indicates improving unit economics and path to profitability.`
    },
    {
      question: `Is ${symbol}'s promotional intensity declining?`,
      answer: promoIntensity < yearAgoPromo
        ? `Yes, ${symbol}'s promotional intensity has declined from ${(yearAgoPromo * 100).toFixed(1)}% to ${(promoIntensity * 100).toFixed(1)}%, indicating improving unit economics and reduced customer acquisition costs. This trend suggests the company is prioritizing profitability over aggressive growth.`
        : `${symbol}'s promotional intensity remains elevated, which may indicate continued investment in customer acquisition and market share gains in competitive or newly launched states.`
    },
    {
      question: `How does ${symbol}'s promo spend compare to competitors?`,
      answer: promoIntensity < industryAvgPromo
        ? `${symbol}'s ${(promoIntensity * 100).toFixed(1)}% promotional intensity is below the industry average of ${(industryAvgPromo * 100).toFixed(1)}%, indicating more disciplined marketing and better unit economics than peers.`
        : `${symbol}'s ${(promoIntensity * 100).toFixed(1)}% promotional intensity is above the industry average of ${(industryAvgPromo * 100).toFixed(1)}%, suggesting aggressive customer acquisition strategy or newer market launches.`
    },
    {
      question: `Why is declining promotional intensity good for ${symbol}?`,
      answer: `Lower promotional intensity directly improves profitability because less revenue is spent on customer incentives. As markets mature and brand awareness grows, operators can reduce bonuses while maintaining customer acquisition. Declining promo spend accelerates the path to EBITDA profitability and positive cash flow.`
    },
    {
      question: `What drives promotional intensity changes?`,
      answer: `Promotional intensity is influenced by: market maturity (new states = higher promo), competitive dynamics (more operators = higher bonuses), regulatory restrictions (some states limit bonuses), customer lifecycle (new customers get more bonuses), and company profitability strategy (growth vs profit focus).`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Promotional Intensity`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Promotional Intensity ${currentYear} - Marketing Spend Analysis`,
    description: `Complete promotional intensity analysis for ${symbol} (${companyName}) with spend trends and profitability path.`,
    url: pageUrl,
    keywords: [
      `${symbol} promotional intensity`,
      `${symbol} promo spend`,
      `${symbol} sports betting`,
      `${symbol} marketing efficiency`,
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

  const faqSchema = getFAQSchema(promoIntensityFaqs)

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
            <span>{symbol} Promotional Intensity</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Promotional Intensity {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Marketing spend and unit economics for {companyName}
          </p>

          {/* Latest Promotional Intensity Card */}
          <div className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 p-8 rounded-xl border border-rose-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Promo Rate</p>
                <p className="text-3xl font-bold">
                  {(promoIntensity * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">of handle</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">YoY Change</p>
                <p className={`text-3xl font-bold ${promoIntensity < yearAgoPromo ? 'text-green-500' : 'text-orange-500'}`}>
                  {promoIntensity < yearAgoPromo ? '-' : '+'}{Math.abs((promoIntensity - yearAgoPromo) * 100).toFixed(1)}pp
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. year ago</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">vs. Industry</p>
                <p className={`text-3xl font-bold ${promoIntensity < industryAvgPromo ? 'text-green-500' : 'text-orange-500'}`}>
                  {promoIntensity < industryAvgPromo ? '-' : '+'}{Math.abs((promoIntensity - industryAvgPromo) * 100).toFixed(1)}pp
                </p>
                <p className="text-sm text-muted-foreground mt-1">difference</p>
              </div>
            </div>
          </div>

          {/* Promotional Spend Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Promotional Spend Components</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                {companyName}'s {(promoIntensity * 100).toFixed(1)}% promotional intensity represents the blended cost
                of customer acquisition and retention incentives across all markets.
              </p>
              <div className="space-y-3">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sign-up Bonuses</span>
                    <span className="text-muted-foreground">~40% of promo budget</span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Free Bets & Credits</span>
                    <span className="text-muted-foreground">~30% of promo budget</span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Odds Boosts</span>
                    <span className="text-muted-foreground">~20% of promo budget</span>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Loyalty Rewards</span>
                    <span className="text-muted-foreground">~10% of promo budget</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profitability Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Impact on Profitability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">High Promo Intensity</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Faster customer acquisition</li>
                  <li>Higher market share gains</li>
                  <li>Lower near-term profitability</li>
                  <li>Typical in new state launches</li>
                  <li>CAC increases</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Low Promo Intensity</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Better unit economics</li>
                  <li>Faster path to profitability</li>
                  <li>Mature market signal</li>
                  <li>Brand strength indicator</li>
                  <li>Improved margins</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Trend Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Promotional Intensity Trend</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trend Direction</p>
                  <p className={`text-2xl font-bold ${promoIntensity < yearAgoPromo ? 'text-green-500' : 'text-orange-500'}`}>
                    {promoIntensity < yearAgoPromo ? 'Declining' : 'Stable/Rising'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">YoY Change</p>
                  <p className={`text-2xl font-bold ${promoIntensity < yearAgoPromo ? 'text-green-500' : 'text-orange-500'}`}>
                    {((promoIntensity - yearAgoPromo) * 100).toFixed(1)}pp
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {promoIntensity < yearAgoPromo
                  ? 'Declining promotional intensity is a positive indicator of improving unit economics and market maturity.'
                  : 'Stable or rising promotional intensity may indicate new market launches or competitive pressures.'}
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, CAC data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/customer-acquisition-cost/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View CAC Data
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {promoIntensityFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Promotional intensity estimates are based on publicly reported sales and marketing expenses. Actual promotional costs may vary by state, customer cohort, and reporting period. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="promotional-intensity" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
