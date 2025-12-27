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
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Interconnection Revenue - Cross-Connect Revenue Analysis`,
    description: `Analyze ${symbol}'s interconnection revenue from cross-connects and network services. View interconnection pricing, cross-connect density, peering ecosystem value, and high-margin service revenue.`,
    keywords: [
      `${symbol} interconnection revenue`,
      `${symbol} cross-connect revenue`,
      `${symbol} network revenue`,
      `${symbol} peering`,
      `${symbol} interconnection pricing`,
      `${symbol} cross-connects`,
      `${symbol} network services`,
      `${symbol} IX revenue`,
    ],
    openGraph: {
      title: `${symbol} Interconnection Revenue | Cross-Connect Analysis`,
      description: `Comprehensive analysis of ${symbol}'s interconnection revenue streams and network monetization.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/interconnection-revenue/${ticker.toLowerCase()}`,
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

export default async function InterconnectionRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/interconnection-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate interconnection revenue FAQs
  const interconnectionFaqs = [
    {
      question: `What is ${symbol}'s interconnection revenue?`,
      answer: `Interconnection revenue for ${companyName} comes from cross-connects between customer equipment, network carriers, cloud providers, and internet exchanges. These are physical fiber connections that enable direct, low-latency data transfer. Interconnection is a high-margin, recurring revenue stream that increases customer stickiness.`
    },
    {
      question: `How does ${symbol} price cross-connects?`,
      answer: `Cross-connect pricing varies by type and bandwidth. Physical cross-connects (fiber pairs) typically range from $50-$500 per month per connection. Virtual cross-connects and cloud on-ramps command premium pricing ($200-$2,000+ monthly). ${companyName}'s pricing reflects network density and ecosystem value.`
    },
    {
      question: `What is ${symbol}'s cross-connect density?`,
      answer: `Cross-connect density measures the average number of interconnections per customer or per cabinet. Higher density indicates a rich network ecosystem and strong customer interconnection needs. Leading data center operators achieve 3-8 cross-connects per customer, generating significant incremental revenue.`
    },
    {
      question: `How fast is ${symbol}'s interconnection revenue growing?`,
      answer: `Interconnection revenue typically grows faster than colocation revenue (15-25% annually vs. 8-15%) as customers add connections over time. For ${companyName}, interconnection growth is driven by cloud adoption, hybrid IT architectures, and expansion of peering ecosystems. This high-margin revenue improves overall profitability.`
    },
    {
      question: `What is the margin profile of ${symbol}'s interconnection services?`,
      answer: `Interconnection services generate gross margins of 70-90%, significantly higher than colocation (40-60%). The high margins reflect minimal incremental cost - primarily installation labor and fiber costs. For ${companyName}, growing interconnection as a percentage of total revenue drives margin expansion.`
    },
    {
      question: `How does network effect benefit ${symbol}'s interconnection business?`,
      answer: `Network effects create increasing value as more networks, cloud providers, and enterprises locate in ${companyName}'s facilities. Each new participant increases potential interconnection opportunities exponentially. This creates competitive moats and pricing power for operators with dense ecosystems.`
    },
    {
      question: `What is ${symbol}'s internet exchange (IX) strategy?`,
      answer: `Internet exchanges facilitate peering between networks and content providers. ${companyName} may operate or host IXs, generating revenue from port fees and attracting network-intensive customers. IX presence enhances facility value and drives higher interconnection revenue per customer.`
    },
    {
      question: `How does cloud connectivity impact ${symbol}'s interconnection revenue?`,
      answer: `Cloud on-ramps (direct connections to AWS, Azure, Google Cloud) represent high-value interconnection services. ${companyName} generates revenue from both the physical cross-connect and potentially bandwidth charges. Cloud connectivity is a key driver of enterprise colocation demand and interconnection growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Interconnection Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Interconnection Revenue - Cross-Connect and Network Services Analysis`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) interconnection revenue, cross-connect density, and network ecosystem value.`,
    url: pageUrl,
    keywords: [
      `${symbol} interconnection revenue`,
      `${symbol} cross-connects`,
      `${symbol} network revenue`,
      `${symbol} peering`,
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

  const faqSchema = getFAQSchema(interconnectionFaqs)

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
            <span>{symbol} Interconnection Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Interconnection Revenue Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cross-connect and network services revenue for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-4">Interconnection Revenue Overview</h2>
              <p className="text-muted-foreground mb-6">
                Interconnection revenue represents high-margin, recurring income from cross-connects and network
                services. For {companyName}, this revenue stream benefits from network effects and typically
                grows faster than base colocation revenue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Interconnection Revenue</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Quarterly</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cross-Connect Density</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Per Customer</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Growth</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Year-over-Year</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Interconnection Revenue Components</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Physical Cross-Connects</h3>
                  <p className="text-muted-foreground">
                    Direct fiber connections between customer equipment racks, typically priced $50-$500 per month.
                    One-time installation fees of $200-$1,000 plus monthly recurring charges. Essential for
                    customer-to-customer and customer-to-network interconnection.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Virtual Cross-Connects & Cloud On-Ramps</h3>
                  <p className="text-muted-foreground">
                    Software-defined connections to cloud providers (AWS Direct Connect, Azure ExpressRoute, Google
                    Cloud Interconnect). Premium pricing of $200-$2,000+ monthly based on bandwidth and service level.
                    High-margin revenue with minimal infrastructure cost.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Internet Exchange & Peering Services</h3>
                  <p className="text-muted-foreground">
                    Port fees for participation in internet exchanges, typically $100-$5,000 monthly depending on
                    port speed. IX presence attracts network-dense customers and creates ecosystem value that
                    supports premium colocation pricing.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Network Effects */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Network Effects & Ecosystem Value</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Interconnection revenue benefits from powerful network effects that create competitive moats:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2">Value Drivers</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Rich ecosystem of networks and clouds</li>
                    <li>• High cross-connect density per customer</li>
                    <li>• Strategic internet exchange presence</li>
                    <li>• Hybrid cloud architecture adoption</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Competitive Advantages</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Customer stickiness (high switching costs)</li>
                    <li>• Margin expansion from high-margin services</li>
                    <li>• Pricing power from ecosystem density</li>
                    <li>• Land-and-expand customer model</li>
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
                  <span className="font-medium">Physical Cross-Connect Pricing</span>
                  <span className="text-muted-foreground">$50-$500/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Cloud On-Ramp Pricing</span>
                  <span className="text-muted-foreground">$200-$2,000+/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Cross-Connect Density Target</span>
                  <span className="text-muted-foreground">3-8 per customer</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Gross Margins</span>
                  <span className="text-muted-foreground">70-90%</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed revenue breakdowns, network ecosystem analysis, and competitive positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {interconnectionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Interconnection revenue metrics and industry benchmarks are estimates based on publicly available information. Actual figures should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="interconnection-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
