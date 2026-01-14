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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Battery Cost - Cost Per kWh & EV Economics ${currentYear}`,
    description: `${symbol} battery cost analysis: cost per kWh, battery pack pricing trends, manufacturing cost reduction, and impact on EV profitability and pricing strategy.`,
    keywords: [
      `${symbol} battery cost`,
      `${symbol} cost per kWh`,
      `${symbol} battery pricing`,
      `${symbol} battery economics`,
      `${symbol} EV costs`,
      `${symbol} battery pack cost`,
    ],
    openGraph: {
      title: `${symbol} Battery Cost ${currentYear} | Battery Economics`,
      description: `Complete ${symbol} battery cost analysis with per-kWh pricing and cost reduction trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/battery-cost/${ticker.toLowerCase()}`,
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

export default async function BatteryCostPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/battery-cost/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate battery cost FAQs
  const batteryCostFaqs = [
    {
      question: `What is ${symbol}'s battery cost per kWh?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'manufactures or sources batteries for electric vehicles' : 'is involved in battery technology'}. Battery cost per kilowatt-hour ($/kWh) is a key metric for EV economics, though specific costs are often proprietary.`
    },
    {
      question: `How much do ${symbol}'s battery packs cost?`,
      answer: `${companyName}'s battery pack costs depend on capacity, chemistry, and manufacturing scale. Industry leaders target costs below $100/kWh to achieve price parity with internal combustion vehicles. Total pack cost equals cost per kWh multiplied by battery capacity.`
    },
    {
      question: `Is ${symbol} reducing battery costs?`,
      answer: `Battery cost reduction is critical for EV profitability and market growth. ${symbol} pursues cost reductions through manufacturing scale, vertical integration, improved chemistry, and production efficiency improvements announced in earnings calls and Battery Day presentations.`
    },
    {
      question: `Why do battery costs matter for ${symbol}?`,
      answer: `Battery packs represent 30-40% of total EV manufacturing cost. Lower battery costs improve vehicle margins, enable competitive pricing, and accelerate EV adoption. For ${companyName}, battery economics directly impact profitability and market share.`
    },
    {
      question: `What drives ${symbol}'s battery cost reduction?`,
      answer: `Cost reductions come from manufacturing scale, supply chain optimization, new battery chemistry (LFP, 4680 cells), vertical integration of raw materials, and improved production efficiency. ${symbol} may disclose cost reduction targets during investor presentations.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Battery Cost`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Battery Cost ${currentYear} - Economics & Pricing Analysis`,
    description: `Complete battery cost analysis for ${symbol} (${companyName}) with per-kWh pricing and trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} battery cost`,
      `${symbol} cost per kWh`,
      `${symbol} battery economics`,
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

  const faqSchema = getFAQSchema(batteryCostFaqs)

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
            <span>{symbol} Battery Cost</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Battery Cost {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Battery economics and cost per kWh analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">Battery Cost</p>
                <p className="text-sm text-muted-foreground mt-1">$/kWh Economics</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Battery Cost Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Battery cost per kilowatt-hour ($/kWh) is the fundamental economic metric for electric vehicles.
                As the most expensive component of an EV, battery costs directly impact vehicle pricing,
                profitability, and competitive positioning.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, reducing battery costs is essential for achieving mass-market pricing,
                improving gross margins, and accelerating the transition to electric vehicles. Industry targets
                aim for costs below $100/kWh to reach price parity with traditional vehicles.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Battery Costs Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Profitability</h3>
                <p className="text-sm text-muted-foreground">
                  Lower battery costs directly improve vehicle gross margins and profitability.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Cost reductions enable competitive vehicle pricing and market expansion.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Market Adoption</h3>
                <p className="text-sm text-muted-foreground">
                  Affordable batteries accelerate EV adoption by reducing total ownership costs.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Technology Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Cost reduction drives innovation in chemistry, manufacturing, and design.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 rounded-xl border border-amber-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, cost structure, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {batteryCostFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Battery cost estimates are based on industry reports and company disclosures. Actual costs may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="battery-cost" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
