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
    title: `${symbol} Cloud Margin - Cloud Computing Profitability ${currentYear}`,
    description: `${symbol} cloud margin analysis: cloud operating margin, cloud profitability, EBITDA margin, cloud unit economics. Analyze ${symbol}'s cloud business profitability.`,
    keywords: [
      `${symbol} cloud margin`,
      `${symbol} cloud profitability`,
      `${symbol} cloud operating margin`,
      `${symbol} cloud EBITDA`,
      `${symbol} cloud unit economics`,
      `${symbol} AWS margin`,
    ],
    openGraph: {
      title: `${symbol} Cloud Margin ${currentYear} | Cloud Profitability Analysis`,
      description: `Complete ${symbol} cloud margin analysis with profitability trends and operating metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/cloud-margin/${ticker.toLowerCase()}`,
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

export default async function CloudMarginPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/cloud-margin/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest financial data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''
  const operatingIncome = latestAnnual?.operating_income || 0
  const grossProfit = latestAnnual?.gross_profit || 0

  // Calculate margins
  const operatingMargin = latestRevenue > 0 ? (operatingIncome / latestRevenue) : metrics?.operating_margin || 0
  const grossMargin = latestRevenue > 0 ? (grossProfit / latestRevenue) : metrics?.gross_margin || 0
  const netMargin = metrics?.profit_margin || 0

  // Previous year for comparison
  const previousAnnual = incomeStatements?.[1]
  const previousOperatingMargin = previousAnnual?.revenue > 0
    ? (previousAnnual.operating_income / previousAnnual.revenue)
    : 0
  const marginImprovement = operatingMargin - previousOperatingMargin

  // Generate cloud margin FAQs
  const marginFaqs = [
    {
      question: `What is ${symbol}'s cloud margin?`,
      answer: operatingMargin > 0
        ? `${symbol} (${companyName}) reported an operating margin of ${(operatingMargin * 100).toFixed(1)}% for ${latestPeriod}. Cloud operating margins vary by provider and maturity - AWS operates at ~30% margins, while Azure and Google Cloud are scaling toward profitability. Cloud margins typically improve over time as scale increases and infrastructure costs are amortized.`
        : `${symbol} does not currently disclose cloud segment margins separately. Check quarterly earnings for management commentary on cloud profitability trends.`
    },
    {
      question: `How profitable is ${symbol}'s cloud business?`,
      answer: operatingMargin > 0
        ? `${companyName} has an operating margin of ${(operatingMargin * 100).toFixed(1)}%${marginImprovement > 0 ? `, up ${(marginImprovement * 100).toFixed(1)} percentage points from last year` : ''}. Cloud profitability is driven by scale economics - higher utilization of data centers, better pricing power with large customers, and efficiency improvements in operations.`
        : `Cloud profitability data will be available in future earnings reports. Cloud businesses typically operate at lower margins initially due to heavy infrastructure investments, then expand margins as scale increases.`
    },
    {
      question: `What drives cloud margin expansion?`,
      answer: `Cloud margin expansion is driven by: (1) Higher data center utilization and server density, (2) Reserved instance and long-term contracts with enterprise customers, (3) Economies of scale in hardware procurement, (4) Software optimization reducing compute costs, (5) Pricing power from competitive moats and customer lock-in. Leading cloud providers target 30-40% operating margins at scale.`
    },
    {
      question: `How does ${symbol}'s cloud margin compare to competitors?`,
      answer: `AWS (Amazon) operates at ~30% operating margins, Azure (Microsoft) is approaching profitability at scale, and Google Cloud has improved margins significantly but still invests heavily for growth. ${companyName}'s overall operating margin of ${(operatingMargin * 100).toFixed(1)}% reflects its business mix. Cloud margins are a key metric for evaluating competitive positioning.`
    },
    {
      question: `What are cloud unit economics?`,
      answer: `Cloud unit economics measure profitability per customer, per server, or per dollar of revenue. Key metrics include: customer acquisition cost (CAC), lifetime value (LTV), revenue per server, and gross margin per workload. Strong unit economics with LTV/CAC > 3x indicate a scalable, profitable cloud business model.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Cloud Margin`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Cloud Margin ${currentYear} - Cloud Profitability Analysis`,
    description: `Complete cloud margin analysis for ${symbol} (${companyName}) with profitability trends and operating metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} cloud margin`,
      `${symbol} cloud profitability`,
      `${symbol} operating margin`,
      `${symbol} cloud economics`,
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

  const faqSchema = getFAQSchema(marginFaqs)

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
            <span>{symbol} Cloud Margin</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Cloud Margin {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cloud computing profitability and margin analysis for {companyName}
          </p>

          {/* Latest Margin Metrics */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating Margin</p>
                <p className="text-3xl font-bold text-emerald-500">
                  {(operatingMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                <p className="text-3xl font-bold text-teal-500">
                  {(grossMargin * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">profitability</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Margin Change YoY</p>
                <p className={`text-3xl font-bold ${marginImprovement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marginImprovement >= 0 ? '+' : ''}{(marginImprovement * 100).toFixed(1)}pp
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous year</p>
              </div>
            </div>
          </div>

          {/* Margin Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Cloud Margin Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3 text-green-500">Positive Factors</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    <span>Economies of scale - higher utilization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    <span>Enterprise contracts with better pricing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    <span>Software optimization reducing costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    <span>Higher-margin PaaS and SaaS revenue</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3 text-red-500">Margin Pressures</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    <span>Heavy data center CapEx investments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    <span>Price competition from cloud rivals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    <span>Rising energy and cooling costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    <span>Low-margin IaaS commodity services</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Margin Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Industry Margin Benchmarks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">AWS (Amazon)</span>
                    <span className="text-muted-foreground">~30% operating margin</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Microsoft Azure</span>
                    <span className="text-muted-foreground">~20-25% operating margin</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Google Cloud</span>
                    <span className="text-muted-foreground">~5-10% operating margin</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '7%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{symbol}</span>
                    <span className="text-muted-foreground">{(operatingMargin * 100).toFixed(1)}% operating margin</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(operatingMargin * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Margin Expansion Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Path to Margin Expansion</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-emerald-500 font-bold mr-2">1.</span>
                  <span><strong>Scale Data Centers:</strong> Increase utilization rates and server density to spread fixed costs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 font-bold mr-2">2.</span>
                  <span><strong>Enterprise Focus:</strong> Target large enterprise contracts with better pricing and longer commitments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 font-bold mr-2">3.</span>
                  <span><strong>Higher-Value Services:</strong> Shift mix toward higher-margin PaaS, SaaS, and AI services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 font-bold mr-2">4.</span>
                  <span><strong>Operational Efficiency:</strong> Automate operations and optimize software to reduce costs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 font-bold mr-2">5.</span>
                  <span><strong>Pricing Power:</strong> Build moats through proprietary services and customer lock-in</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete profitability metrics and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                All Margins
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marginFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Cloud margin data is based on publicly filed financial statements. Cloud segment margins may not be disclosed separately. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="cloud-margin" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
