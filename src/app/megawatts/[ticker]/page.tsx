import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  getFinancialProductSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Megawatt Capacity - Data Center MW Analysis`,
    description: `Analyze ${symbol}'s data center megawatt (MW) capacity and power infrastructure. View total MW capacity, capacity utilization, expansion plans, and power infrastructure metrics.`,
    keywords: [
      `${symbol} megawatt capacity`,
      `${symbol} MW capacity`,
      `${symbol} data center capacity`,
      `${symbol} power capacity`,
      `${symbol} MW`,
      `${symbol} data center power`,
      `${symbol} capacity expansion`,
      `${symbol} infrastructure`,
    ],
    openGraph: {
      title: `${symbol} Megawatt Capacity | Data Center Power Analysis`,
      description: `Comprehensive analysis of ${symbol}'s data center megawatt capacity, utilization, and expansion plans.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/megawatts/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 60 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function MegawattsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/megawatts/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate megawatt capacity FAQs
  const megawattFaqs = [
    {
      question: `What is ${symbol}'s total megawatt capacity?`,
      answer: `${companyName} operates data centers with significant megawatt (MW) capacity to support their infrastructure needs. Total MW capacity includes both operational facilities and development pipeline projects. Data center REITs typically report capacity in terms of critical IT load capacity measured in megawatts.`
    },
    {
      question: `How does ${symbol}'s MW capacity compare to competitors?`,
      answer: `${companyName}'s data center capacity is measured against industry peers in the ${sector || 'data center'} sector. Leading data center operators typically manage between 500 MW to over 2,000 MW of critical IT capacity globally. Capacity growth is a key indicator of market share and revenue potential.`
    },
    {
      question: `What is ${symbol}'s capacity utilization rate?`,
      answer: `Capacity utilization rate measures the percentage of total MW capacity that is leased and generating revenue. High utilization rates (85-95%) indicate strong demand and efficient capital deployment. ${companyName} reports occupancy and utilization metrics in quarterly earnings calls.`
    },
    {
      question: `What is ${symbol}'s capacity expansion pipeline?`,
      answer: `${companyName}'s development pipeline includes both new data center construction and expansion of existing facilities. Pipeline capacity is typically reported in MW and represents future revenue potential. Strong pipeline growth indicates confidence in long-term demand from hyperscale and enterprise customers.`
    },
    {
      question: `How much MW capacity does ${symbol} add annually?`,
      answer: `Annual capacity additions vary based on market demand and development timelines. Leading data center operators typically add 100-300 MW of new capacity annually through both organic development and acquisitions. Capacity additions drive revenue growth and market share expansion.`
    },
    {
      question: `What markets does ${symbol} operate data centers in?`,
      answer: `${companyName} operates data centers in key markets with strong demand for digital infrastructure. Primary markets include major metropolitan areas, technology hubs, and locations with favorable power costs and network connectivity. Geographic diversification reduces concentration risk.`
    },
    {
      question: `How does MW capacity affect ${symbol}'s valuation?`,
      answer: `Megawatt capacity directly impacts ${companyName}'s revenue potential and asset value. Data center REITs are often valued on a per-MW basis, with enterprise value to MW ratios ranging from $2-5 million per MW depending on market, customer type, and contract duration. Growing capacity at attractive returns drives shareholder value.`
    },
    {
      question: `What is critical IT load vs. total power capacity?`,
      answer: `Critical IT load refers to the power available for customer servers and IT equipment, while total power capacity includes cooling, lighting, and facility systems. Data center operators report capacity in MW of critical IT load. Power usage effectiveness (PUE) ratios indicate how efficiently total power is converted to IT load.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Megawatts`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Megawatt Capacity - Data Center Power Infrastructure Analysis`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) data center megawatt capacity, utilization, and expansion plans.`,
    url: pageUrl,
    keywords: [
      `${symbol} megawatt capacity`,
      `${symbol} MW capacity`,
      `${symbol} data center`,
      `${symbol} power infrastructure`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    url: pageUrl,
    price: snapshot.price,
  })

  const faqSchema = getFAQSchema(megawattFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, financialProductSchema, faqSchema]

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
            <span>{symbol} Megawatts</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Megawatt Capacity Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Data center power infrastructure and capacity metrics for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-8 rounded-xl border border-blue-500/20">
              <h2 className="text-2xl font-bold mb-4">Megawatt Capacity Overview</h2>
              <p className="text-muted-foreground mb-6">
                Megawatt (MW) capacity is a critical metric for data center operators like {companyName}.
                It represents the total power infrastructure available to support customer IT equipment and
                directly correlates with revenue potential and asset value.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Critical IT Load</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Megawatts</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Utilization Rate</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Leased Capacity</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pipeline Capacity</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Development MW</p>
                </div>
              </div>
            </div>
          </section>

          {/* Capacity Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Capacity Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Operational Capacity</h3>
                  <p className="text-muted-foreground">
                    Operational MW capacity represents data centers that are built, commissioned, and available
                    for customer leasing. This includes both leased and available capacity across all markets.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Leased Capacity</h3>
                  <p className="text-muted-foreground">
                    The portion of operational capacity under customer contracts. Higher lease rates indicate
                    strong demand and efficient capital deployment. Leading operators maintain 85-95% utilization.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Development Pipeline</h3>
                  <p className="text-muted-foreground">
                    Future capacity under construction or in planning stages. A robust pipeline indicates confidence
                    in long-term demand and provides visibility into future revenue growth potential.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Context */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Context</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The data center industry measures capacity in megawatts of critical IT load. Key capacity metrics include:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Capacity Drivers</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Cloud computing growth</li>
                    <li>• AI and machine learning workloads</li>
                    <li>• 5G network deployment</li>
                    <li>• Edge computing expansion</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Valuation Metrics</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Enterprise Value per MW</li>
                    <li>• Development yield per MW</li>
                    <li>• Capacity utilization rate</li>
                    <li>• Geographic market premiums</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access comprehensive data center metrics, financial analysis, and valuation insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {megawattFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Data center capacity metrics are estimates based on publicly available information. Actual capacity, utilization, and development pipeline figures should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="megawatts" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
