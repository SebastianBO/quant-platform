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
    title: `${symbol} Same Store Sales ${currentYear} - Automotive Comp Sales`,
    description: `${symbol} same store sales analysis: comparable dealership sales growth, organic performance, revenue trends excluding acquisitions for ${currentYear}.`,
    keywords: [
      `${symbol} same store sales`,
      `${symbol} comp sales`,
      `${symbol} comparable sales`,
      `${symbol} organic growth`,
      `${symbol} SSS automotive`,
      `${symbol} dealership comps`,
    ],
    openGraph: {
      title: `${symbol} Same Store Sales ${currentYear} | Automotive Comp Growth`,
      description: `Complete ${symbol} same store sales analysis with organic growth insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/same-store-sales-auto/${ticker.toLowerCase()}`,
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

export default async function SameStoreSalesAutoPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/same-store-sales-auto/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} same store sales?`,
      answer: `Same store sales (SSS) or comparable store sales measure revenue growth at ${companyName} dealerships open for at least one year, excluding the impact of acquisitions, divestitures, and new openings. This metric reveals organic growth driven by market share gains, pricing power, and operational improvements rather than expansion through acquisitions.`
    },
    {
      question: `Why are same store sales important for ${symbol}?`,
      answer: `Same store sales demonstrate ${companyName}'s ability to grow organically within existing markets, indicating management effectiveness, brand strength, market share trends, and operational excellence. Strong SSS growth suggests ${symbol} is taking market share from competitors and executing well at existing locations, creating sustainable value beyond acquisition-driven expansion.`
    },
    {
      question: `What drives same store sales growth in automotive retail?`,
      answer: `Same store sales growth comes from increased unit volumes (market share gains), higher average selling prices (product mix or pricing power), improved GPU margins, enhanced F&I penetration, growing parts and service revenue, and overall market growth in the dealership's operating regions. ${companyName}'s SSS reflects competitive positioning and execution quality.`
    },
    {
      question: `How do same store sales differ from total revenue growth?`,
      answer: `Total revenue growth includes contributions from acquisitions and new locations, while same store sales isolate performance at existing dealerships. ${symbol} could show strong total revenue growth through acquisitions while SSS declines, indicating organic weakness masked by expansion. Conversely, strong SSS with modest total growth suggests effective management of existing assets.`
    },
    {
      question: `What is a good same store sales growth rate for automotive retailers?`,
      answer: `Same store sales growth of 3-5% in normal markets indicates solid performance for automotive retailers. During industry growth periods, 5-10%+ SSS is achievable. Negative SSS suggests losing market share or facing market headwinds. ${companyName}'s SSS should be compared to industry trends and regional market conditions for proper context.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Same Store Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Same Store Sales ${currentYear} - Automotive Comp Sales`,
    description: `Complete same store sales analysis for ${symbol} (${companyName}) with organic growth insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} same store sales`,
      `${symbol} comp sales`,
      `${symbol} organic growth`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Same Store Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Same Store Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comparable dealership sales and organic growth analysis for {companyName}
          </p>

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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Same Store Sales</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Same store sales (also called comparable store sales or "comps") measure revenue growth at {companyName} dealerships that have been operating for at least 12 months. This metric excludes the impact of newly acquired or opened dealerships, isolating organic growth performance.
              </p>
              <p className="text-muted-foreground">
                For automotive retailers, strong same store sales growth demonstrates market share gains, effective inventory management, strong customer satisfaction driving retention, and operational excellence. Unlike total revenue which can be inflated by acquisitions, SSS reveals the true health and competitive positioning of the existing dealership network.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Components of Same Store Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">New Vehicle Revenue</h3>
                <p className="text-muted-foreground text-sm">
                  Unit volume changes and average selling price movements at comparable dealerships.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Used Vehicle Revenue</h3>
                <p className="text-muted-foreground text-sm">
                  Pre-owned sales growth reflecting sourcing effectiveness and market demand capture.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">F&I Revenue Growth</h3>
                <p className="text-muted-foreground text-sm">
                  Increasing PVR or penetration rates boosting finance and insurance income per unit.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Parts & Service</h3>
                <p className="text-muted-foreground text-sm">
                  Aftermarket revenue growth from service retention and customer pay increases.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">SSS Growth Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-3">
              <div>
                <h3 className="font-bold mb-1">Market Share Gains</h3>
                <p className="text-sm text-muted-foreground">
                  Outperforming competitors in local markets to capture greater wallet share from vehicle buyers.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Pricing Power</h3>
                <p className="text-sm text-muted-foreground">
                  Ability to maintain or increase margins through effective pricing rather than heavy discounting.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Service Retention</h3>
                <p className="text-sm text-muted-foreground">
                  Growing parts and service revenue by retaining customers beyond warranty periods.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Operational Excellence</h3>
                <p className="text-sm text-muted-foreground">
                  Process improvements, training, technology adoption, and customer experience enhancements.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-1">Product Mix Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Shifting sales toward higher-margin vehicles, F&I products, and service offerings.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access complete automotive metrics, financial analysis, and AI-powered insights
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Same store sales metrics should be evaluated in context with overall industry trends and regional market conditions. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
