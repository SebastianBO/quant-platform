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
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Development Pipeline - Data Center Expansion Plans`,
    description: `Analyze ${symbol}'s data center development pipeline and expansion strategy. View pipeline capacity in MW, construction timeline, capital deployment, and future revenue visibility.`,
    keywords: [
      `${symbol} development pipeline`,
      `${symbol} data center expansion`,
      `${symbol} pipeline capacity`,
      `${symbol} construction`,
      `${symbol} capex`,
      `${symbol} future capacity`,
      `${symbol} growth projects`,
      `${symbol} development strategy`,
    ],
    openGraph: {
      title: `${symbol} Development Pipeline | Data Center Expansion Analysis`,
      description: `Comprehensive analysis of ${symbol}'s development pipeline, expansion projects, and growth strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/development-pipeline/${ticker.toLowerCase()}`,
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

export default async function DevelopmentPipelinePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/development-pipeline/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate development pipeline FAQs
  const pipelineFaqs = [
    {
      question: `What is ${symbol}'s development pipeline?`,
      answer: `${companyName}'s development pipeline represents future data center capacity under construction or in planning stages. Pipeline is measured in megawatts (MW) of critical IT capacity and represents significant future revenue potential. A robust pipeline indicates confidence in long-term demand from hyperscale and enterprise customers.`
    },
    {
      question: `How large is ${symbol}'s current development pipeline?`,
      answer: `Leading data center operators maintain development pipelines representing 20-50% of existing operational capacity. For ${companyName}, pipeline size is disclosed in earnings reports and investor presentations. Large pipelines (500+ MW) provide multi-year revenue visibility and growth trajectory.`
    },
    {
      question: `What is ${symbol}'s development timeline?`,
      answer: `Data center development typically takes 18-36 months from land acquisition to customer delivery. ${companyName}'s pipeline is staged across different phases: land acquisition, design, construction, commissioning, and lease-up. Faster development cycles create competitive advantages in capturing market demand.`
    },
    {
      question: `How much capital does ${symbol} invest in development?`,
      answer: `Development capital expenditure (capex) varies by project scale and market. Retail data centers cost $8-12 million per MW to build, while hyperscale facilities cost $6-8 million per MW. ${companyName}'s development capex is reported quarterly and indicates growth commitment. Most operators target development yields of 8-12%.`
    },
    {
      question: `What markets is ${symbol} expanding into?`,
      answer: `${companyName} focuses development on markets with strong demand fundamentals: network connectivity, power availability, and customer presence. Primary markets (Northern Virginia, Silicon Valley, Phoenix) offer scale but face capacity constraints. Secondary markets provide expansion opportunities with favorable economics.`
    },
    {
      question: `How does ${symbol} fund its development pipeline?`,
      answer: `Data center development is funded through a combination of operating cash flow, debt financing, joint ventures, and equity raises. ${companyName}'s funding strategy balances growth objectives with maintaining investment-grade credit ratings and target leverage ratios (typically 5-7x Net Debt/EBITDA for REITs).`
    },
    {
      question: `What is ${symbol}'s pre-leasing strategy?`,
      answer: `Pre-leasing involves securing customer commitments before or during construction, reducing lease-up risk. ${companyName} may develop on a speculative basis (no pre-lease) for retail colocation or require significant pre-leasing (50-100%) for large wholesale projects. Pre-leasing percentages indicate market demand strength.`
    },
    {
      question: `How does pipeline quality affect ${symbol}'s valuation?`,
      answer: `High-quality pipelines in strategic markets with strong pre-leasing command premium valuations. For ${companyName}, investors evaluate pipeline size relative to operational capacity, development yields, capital efficiency, and lease-up speed. Strong pipelines support higher price-to-FFO multiples and demonstrate long-term growth potential.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Development Pipeline`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Development Pipeline - Data Center Expansion and Growth Strategy`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) development pipeline, expansion projects, and capital deployment strategy.`,
    url: pageUrl,
    keywords: [
      `${symbol} development pipeline`,
      `${symbol} expansion`,
      `${symbol} construction`,
      `${symbol} capex`,
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

  const faqSchema = getFAQSchema(pipelineFaqs)

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
            <span>{symbol} Development Pipeline</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Development Pipeline Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Data center expansion projects and growth strategy for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 p-8 rounded-xl border border-orange-500/20">
              <h2 className="text-2xl font-bold mb-4">Development Pipeline Overview</h2>
              <p className="text-muted-foreground mb-6">
                {companyName}'s development pipeline represents future growth capacity and revenue potential.
                A robust pipeline provides visibility into multi-year revenue growth and demonstrates management's
                confidence in sustained market demand for data center capacity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pipeline Capacity</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Megawatts</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Development Capex</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual Investment</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pre-Leasing Rate</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Committed Capacity</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pipeline Stages */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Development Pipeline Stages</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Stage 1: Land & Planning (0-6 months)</h3>
                  <p className="text-muted-foreground">
                    Site selection, land acquisition, zoning approvals, and permitting. Critical factors include power
                    availability, fiber connectivity, natural disaster risk, and tax incentives. Strategic land banking
                    provides future expansion optionality.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Stage 2: Design & Engineering (3-9 months)</h3>
                  <p className="text-muted-foreground">
                    Detailed facility design, electrical and mechanical engineering, and customer requirement integration.
                    Modular designs enable faster construction and phased capacity delivery. Pre-sold projects may be
                    customized to specific customer specifications.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Stage 3: Construction (12-24 months)</h3>
                  <p className="text-muted-foreground">
                    Physical build-out of shell, power infrastructure, cooling systems, and IT infrastructure. Construction
                    timeline varies by project size and market conditions. Delays can impact revenue recognition and
                    customer satisfaction.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Stage 4: Commissioning & Lease-Up (3-12 months)</h3>
                  <p className="text-muted-foreground">
                    Testing, certification, and customer fit-out. Lease-up speed depends on pre-leasing levels and market
                    demand. Faster lease-up improves development returns and validates market selection. Target stabilization
                    at 85-95% occupancy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Capital Deployment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Capital Deployment Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Effective capital deployment balances growth objectives with financial discipline:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Development Economics</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Target development yields: 8-12%</li>
                    <li>• Cost per MW: $6-12 million</li>
                    <li>• Lease-up period: 6-18 months</li>
                    <li>• Stabilized returns on invested capital</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Funding Sources</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Operating cash flow reinvestment</li>
                    <li>• Debt financing (term loans, bonds)</li>
                    <li>• Joint venture partnerships</li>
                    <li>• Asset recycling and equity raises</li>
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
                  <span className="font-medium">Development Timeline</span>
                  <span className="text-muted-foreground">18-36 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Cost per MW (Retail)</span>
                  <span className="text-muted-foreground">$8-12 million</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Cost per MW (Wholesale)</span>
                  <span className="text-muted-foreground">$6-8 million</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Development Yield Target</span>
                  <span className="text-muted-foreground">8-12%</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed growth analysis, capital allocation strategy, and competitive positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {pipelineFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Development pipeline metrics are estimates based on publicly available information. Actual development timelines, costs, and yields should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="development-pipeline" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
