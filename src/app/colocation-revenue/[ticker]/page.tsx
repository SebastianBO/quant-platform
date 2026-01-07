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

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Colocation Revenue - Data Center Revenue Analysis`,
    description: `Analyze ${symbol}'s colocation revenue streams and data center monetization. View retail colocation vs wholesale revenue, pricing trends, customer mix, and revenue growth metrics.`,
    keywords: [
      `${symbol} colocation revenue`,
      `${symbol} data center revenue`,
      `${symbol} colo revenue`,
      `${symbol} retail colocation`,
      `${symbol} wholesale revenue`,
      `${symbol} data center pricing`,
      `${symbol} revenue growth`,
      `${symbol} ARPU`,
    ],
    openGraph: {
      title: `${symbol} Colocation Revenue | Data Center Revenue Analysis`,
      description: `Comprehensive analysis of ${symbol}'s colocation revenue streams, pricing, and growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/colocation-revenue/${ticker.toLowerCase()}`,
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

export default async function ColocationRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/colocation-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate colocation revenue FAQs
  const colocationFaqs = [
    {
      question: `What is ${symbol}'s colocation revenue model?`,
      answer: `${companyName} generates revenue by leasing data center space, power, and connectivity to customers. Colocation revenue includes monthly recurring charges for cabinet space, power consumption (typically measured in kilowatts), cross-connects, bandwidth, and value-added services. Revenue is highly recurring with multi-year contracts.`
    },
    {
      question: `How does ${symbol}'s retail vs wholesale revenue mix compare?`,
      answer: `Retail colocation targets enterprise customers with smaller deployments (cabinets to cages), commanding higher prices per kW but requiring more operational overhead. Wholesale colocation serves hyperscalers with multi-megawatt deployments at lower per-kW pricing but with longer contract terms and lower churn. The revenue mix impacts margins and growth dynamics.`
    },
    {
      question: `What is ${symbol}'s average revenue per unit (ARPU)?`,
      answer: `ARPU measures revenue generated per customer, cabinet, or megawatt. For ${companyName}, ARPU trends indicate pricing power and revenue density. Retail colocation typically generates $8,000-$15,000 per cabinet annually, while wholesale generates $1.5-$3.5 million per MW annually depending on market and power density.`
    },
    {
      question: `How fast is ${symbol}'s colocation revenue growing?`,
      answer: `Revenue growth for ${companyName} is driven by new customer bookings, pricing escalations (typically 2-3% annually), and cross-sell of additional services. Leading data center operators grow revenue 8-15% annually. Same-store revenue growth and bookings backlog provide visibility into future revenue.`
    },
    {
      question: `What drives ${symbol}'s colocation pricing?`,
      answer: `Colocation pricing varies by market (supply/demand dynamics), power costs, network connectivity quality, and customer type. Premium markets (Northern Virginia, Silicon Valley) command higher pricing. Retail colocation pricing is driven by competitive positioning, while wholesale pricing reflects power costs plus target returns on capital.`
    },
    {
      question: `What is ${symbol}'s revenue backlog?`,
      answer: `Revenue backlog represents signed customer contracts not yet deployed or generating revenue. For ${companyName}, a strong backlog provides revenue visibility and validates demand. Backlog conversion typically takes 6-18 months as customers complete their deployments.`
    },
    {
      question: `How does ${symbol}'s customer mix affect revenue?`,
      answer: `${companyName}'s revenue mix between enterprise, cloud/IT, and hyperscale customers impacts growth, margins, and stability. Enterprise customers provide diversification but slower growth. Hyperscale customers drive volume but may pressure margins. A balanced mix optimizes risk-adjusted returns.`
    },
    {
      question: `What is the margin profile of ${symbol}'s colocation revenue?`,
      answer: `Colocation gross margins typically range from 40-60%, with retail colocation commanding higher margins than wholesale due to value-added services and higher pricing density. ${companyName}'s margin profile depends on asset efficiency, power costs, and operating leverage as revenue scales.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Colocation Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Colocation Revenue - Data Center Revenue Analysis`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) colocation revenue streams, pricing dynamics, and growth trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} colocation revenue`,
      `${symbol} data center revenue`,
      `${symbol} revenue growth`,
      `${symbol} pricing`,
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

  const faqSchema = getFAQSchema(colocationFaqs)

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
            <span>{symbol} Colocation Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Colocation Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Data center revenue streams and monetization metrics for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 p-8 rounded-xl border border-green-500/20">
              <h2 className="text-2xl font-bold mb-4">Colocation Revenue Overview</h2>
              <p className="text-muted-foreground mb-6">
                Colocation revenue represents the primary monetization stream for {companyName}'s data center
                infrastructure. Revenue is generated through long-term contracts with enterprise and hyperscale
                customers, providing high visibility and recurring cash flows.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Quarterly Revenue</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Last Quarter</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Year-over-Year</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue per MW</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual Run-Rate</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Streams */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Composition</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Retail Colocation</h3>
                  <p className="text-muted-foreground">
                    Enterprise customers leasing cabinet or cage space with bundled power, cooling, and connectivity.
                    Higher pricing per kW ($1,500-$3,000/kW annually) with strong margins but more operational complexity.
                    Typical contract terms of 3-5 years.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Wholesale Colocation</h3>
                  <p className="text-muted-foreground">
                    Large deployments (multi-MW) for hyperscale cloud providers and large enterprises. Lower pricing
                    per kW ($1,000-$2,000/kW annually) with longer contract terms (7-15 years) and lower churn.
                    Drives volume growth and capacity utilization.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Interconnection & Services</h3>
                  <p className="text-muted-foreground">
                    Additional revenue from cross-connects, network connectivity, managed services, and cloud on-ramps.
                    High-margin incremental revenue that increases customer stickiness and ARPU.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revenue Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Data center operators track several key metrics to measure revenue performance and growth:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Growth Drivers</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• New customer bookings</li>
                    <li>• Contract price escalations (2-3% annually)</li>
                    <li>• Cross-sell and upsell to existing customers</li>
                    <li>• Capacity expansions in high-demand markets</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Performance Indicators</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Same-store revenue growth</li>
                    <li>• Customer retention rate (churn)</li>
                    <li>• Contracted backlog conversion</li>
                    <li>• Revenue per square foot/MW</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Benchmarks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Benchmarks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Retail Colocation ARPU</span>
                  <span className="text-muted-foreground">$8,000-$15,000 per cabinet/year</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Wholesale Pricing</span>
                  <span className="text-muted-foreground">$1.5M-$3.5M per MW/year</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Revenue Growth Target</span>
                  <span className="text-muted-foreground">8-15% annually</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Gross Margins</span>
                  <span className="text-muted-foreground">40-60% (varies by segment)</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access comprehensive revenue analysis, financial metrics, and growth projections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Revenue Details
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {colocationFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue metrics and industry benchmarks are estimates based on publicly available information and industry research. Actual figures should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="colocation-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
