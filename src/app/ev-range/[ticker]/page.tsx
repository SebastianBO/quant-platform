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
    title: `${symbol} EV Range - Electric Vehicle Range & Efficiency ${currentYear}`,
    description: `${symbol} EV range analysis: miles per charge, EPA range ratings, real-world range, battery efficiency, and range comparison across models.`,
    keywords: [
      `${symbol} EV range`,
      `${symbol} electric vehicle range`,
      `${symbol} miles per charge`,
      `${symbol} EPA range`,
      `${symbol} battery range`,
      `${symbol} efficiency`,
    ],
    openGraph: {
      title: `${symbol} EV Range ${currentYear} | Electric Vehicle Efficiency`,
      description: `Complete ${symbol} EV range analysis with efficiency metrics and model comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ev-range/${ticker.toLowerCase()}`,
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

export default async function EVRangePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ev-range/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate EV range FAQs
  const evRangeFaqs = [
    {
      question: `What is ${symbol}'s EV range?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'produces electric vehicles with varying range capabilities' : 'is involved in EV technology'}. Range varies by model, battery size, and configuration, typically measured in EPA-estimated miles per full charge.`
    },
    {
      question: `How far can ${symbol}'s EVs travel on a single charge?`,
      answer: `${companyName}'s electric vehicles offer different range options depending on the model and battery pack. EPA range ratings provide standardized estimates, though real-world range can vary based on driving conditions, temperature, and usage patterns.`
    },
    {
      question: `Is ${symbol} improving EV range?`,
      answer: `EV range improvements come from advances in battery technology, energy efficiency, and aerodynamics. ${symbol} typically announces range upgrades and new battery options during product launches and technology updates.`
    },
    {
      question: `What affects ${symbol}'s EV range?`,
      answer: `Range is influenced by battery capacity (kWh), vehicle efficiency (miles/kWh), temperature, driving speed, terrain, and accessory usage like heating or air conditioning. ${companyName}'s EVs may offer different range estimates for various driving conditions.`
    },
    {
      question: `How does ${symbol}'s EV range compare to competitors?`,
      answer: `Compare ${symbol} to other EV manufacturers to assess range competitiveness. Range leadership can be a key differentiator in the electric vehicle market, influencing customer purchase decisions.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} EV Range`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EV Range ${currentYear} - Electric Vehicle Efficiency Analysis`,
    description: `Complete EV range analysis for ${symbol} (${companyName}) with efficiency and performance metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} EV range`,
      `${symbol} electric vehicle range`,
      `${symbol} efficiency`,
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

  const faqSchema = getFAQSchema(evRangeFaqs)

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
            <span>{symbol} EV Range</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EV Range {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Electric vehicle range and efficiency data for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">EV Range</p>
                <p className="text-sm text-muted-foreground mt-1">Miles Per Charge</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EV Range Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                EV range represents the distance an electric vehicle can travel on a single battery charge,
                typically measured using EPA testing standards. This metric is critical for customer adoption
                and competitiveness in the electric vehicle market.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, range capabilities influence product positioning, pricing strategy, and
                market appeal. Longer range reduces range anxiety and expands the addressable customer base.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why EV Range Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Customer Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Longer range reduces range anxiety and increases EV adoption rates.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Product Differentiation</h3>
                <p className="text-sm text-muted-foreground">
                  Superior range can command premium pricing and attract customers.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Technology Leadership</h3>
                <p className="text-sm text-muted-foreground">
                  Range improvements demonstrate battery and efficiency innovation.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Market Expansion</h3>
                <p className="text-sm text-muted-foreground">
                  Greater range enables usage for longer trips and more customer segments.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, production data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evRangeFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Range data is based on EPA estimates and company specifications. Real-world range varies. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ev-range" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
