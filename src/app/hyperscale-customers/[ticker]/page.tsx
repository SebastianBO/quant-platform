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
    title: `${symbol} Hyperscale Customers - Cloud Provider Revenue Mix`,
    description: `Analyze ${symbol}'s hyperscale customer concentration and cloud provider revenue. View customer diversification, hyperscale vs enterprise mix, and major cloud partnerships.`,
    keywords: [
      `${symbol} hyperscale customers`,
      `${symbol} cloud customers`,
      `${symbol} customer mix`,
      `${symbol} AWS revenue`,
      `${symbol} Microsoft Azure`,
      `${symbol} Google Cloud`,
      `${symbol} customer concentration`,
      `${symbol} hyperscale exposure`,
    ],
    openGraph: {
      title: `${symbol} Hyperscale Customers | Cloud Provider Revenue Analysis`,
      description: `Comprehensive analysis of ${symbol}'s hyperscale customer relationships and revenue concentration.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/hyperscale-customers/${ticker.toLowerCase()}`,
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

export default async function HyperscaleCustomersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/hyperscale-customers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} common stock`

  // Generate hyperscale customer FAQs
  const hyperscaleFaqs = [
    {
      question: `What percentage of ${symbol}'s revenue comes from hyperscale customers?`,
      answer: `Hyperscale revenue concentration varies across data center operators. ${companyName} may generate 20-70% of revenue from hyperscale cloud providers (AWS, Microsoft, Google, Oracle, etc.). Higher concentration drives volume growth but may pressure margins and increase customer concentration risk. Leading operators balance hyperscale relationships with enterprise diversification.`
    },
    {
      question: `Who are ${symbol}'s major hyperscale customers?`,
      answer: `Major hyperscale customers include AWS (Amazon), Microsoft Azure, Google Cloud Platform, Oracle Cloud, Meta (Facebook), and Alibaba Cloud. ${companyName} typically does not disclose specific customer names for competitive reasons, but reports aggregate hyperscale revenue percentages. Large hyperscale deployments often exceed 10-50 MW per customer across multiple facilities.`
    },
    {
      question: `What is the difference between hyperscale and enterprise customers for ${symbol}?`,
      answer: `Hyperscale customers (AWS, Microsoft, Google) deploy multi-megawatt workloads with lower per-MW pricing but longer contract terms (7-15 years) and massive scale. Enterprise customers (financial services, healthcare, SaaS companies) deploy smaller footprints (cabinets to multi-MW) with higher pricing density and more value-added services. ${companyName}'s customer mix impacts growth rate, margins, and risk profile.`
    },
    {
      question: `How does hyperscale customer concentration affect ${symbol}'s risk profile?`,
      answer: `High hyperscale concentration (>50% of revenue) creates counterparty risk if relationships deteriorate or customers insource capacity. For ${companyName}, benefits include faster growth and larger deployment sizes, but risks include pricing pressure, customer churn impact, and reduced negotiating leverage. Diversified customer bases provide more stable revenue streams.`
    },
    {
      question: `What contract terms does ${symbol} have with hyperscale customers?`,
      answer: `Hyperscale contracts typically span 7-15 years with fixed pricing plus 2-3% annual escalators. Contracts may include capacity commitments, take-or-pay provisions, and renewal options. For ${companyName}, long-term contracts provide revenue visibility and support debt financing, but limit pricing flexibility in high-demand markets.`
    },
    {
      question: `How does ${symbol}'s hyperscale strategy compare to competitors?`,
      answer: `Some operators (Digital Realty, CyrusOne) pursue aggressive hyperscale growth, while others (Equinix) focus on retail/enterprise customers with better margins. ${companyName}'s strategy reflects market opportunities, competitive positioning, and capital availability. Hyperscale-focused strategies require significant capital but offer rapid growth.`
    },
    {
      question: `What is ${symbol}'s largest customer revenue percentage?`,
      answer: `Data center operators typically disclose if any single customer exceeds 10% of total revenue. For ${companyName}, lower concentration (<10% per customer) indicates healthy diversification. Higher concentration (>20% from one customer) creates significant risk if that relationship is lost. Best-in-class operators maintain balanced customer portfolios.`
    },
    {
      question: `How are hyperscale relationships evolving for ${symbol}?`,
      answer: `Hyperscale cloud providers continue expanding third-party data center capacity to supplement owned facilities. For ${companyName}, this creates sustained demand but also competition as hyperscalers build their own infrastructure. Strategic partnerships, flexible capacity options, and hybrid deployment models help operators capture long-term hyperscale growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Hyperscale Customers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Hyperscale Customers - Cloud Provider Revenue and Customer Mix`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) hyperscale customer relationships, revenue concentration, and diversification strategy.`,
    url: pageUrl,
    keywords: [
      `${symbol} hyperscale customers`,
      `${symbol} cloud revenue`,
      `${symbol} customer concentration`,
      `${symbol} AWS`,
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

  const faqSchema = getFAQSchema(hyperscaleFaqs)

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
            <span>{symbol} Hyperscale Customers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Hyperscale Customer Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Cloud provider relationships and customer diversification for {companyName}
          </p>

          {/* Overview Section */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-indigo-600/10 to-violet-600/10 p-8 rounded-xl border border-indigo-500/20">
              <h2 className="text-2xl font-bold mb-4">Hyperscale Customer Overview</h2>
              <p className="text-muted-foreground mb-6">
                Hyperscale customer relationships represent a significant strategic focus for {companyName}.
                These large cloud providers drive volume growth but require careful portfolio management to
                balance revenue concentration risk with growth opportunities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Hyperscale Revenue %</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Of Total Revenue</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Largest Customer %</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Revenue Concentration</p>
                </div>
                <div className="bg-card/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Customer Count</p>
                  <p className="text-2xl font-bold">N/A</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Segmentation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Customer Segmentation</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Hyperscale Cloud Providers</h3>
                  <p className="text-muted-foreground">
                    AWS, Microsoft Azure, Google Cloud, Oracle Cloud, and Alibaba Cloud represent the largest
                    hyperscale customers. These relationships involve multi-megawatt deployments (10-100+ MW per customer)
                    with 7-15 year contracts. Pricing is typically lower per MW ($1,000-$2,000/MW annually) but
                    volume-driven. Hyperscale customers value network density, power reliability, and expansion flexibility.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Enterprise & Financial Services</h3>
                  <p className="text-muted-foreground">
                    Fortune 500 companies, financial institutions, healthcare providers, and SaaS companies represent
                    higher-margin enterprise business. Deployments range from single cabinets to multi-MW, with higher
                    pricing density ($1,500-$3,000/MW annually) and value-added services (managed services, compliance,
                    cross-connects). Enterprise customers provide revenue stability and diversification.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Network & Content Providers</h3>
                  <p className="text-muted-foreground">
                    Network carriers, content delivery networks (CDNs), and internet service providers require strategic
                    data center locations with rich network ecosystems. These customers drive interconnection revenue and
                    enhance facility value for other tenants. Deployments are typically moderate scale with focus on
                    connectivity and peering.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Strategic Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Hyperscale Strategy: Benefits & Risks</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Hyperscale customer relationships offer significant opportunities but require careful risk management:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2 text-green-500">Benefits</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Massive scale drives rapid revenue growth</li>
                    <li>• Long-term contracts (7-15 years) provide visibility</li>
                    <li>• High capacity utilization and absorption</li>
                    <li>• Validates market demand and infrastructure</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-red-500">Risks</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Customer concentration creates counterparty risk</li>
                    <li>• Lower margins vs. enterprise customers</li>
                    <li>• Risk of hyperscale insourcing capacity</li>
                    <li>• Limited pricing flexibility during contract</li>
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
                  <span className="font-medium">Hyperscale Revenue Mix</span>
                  <span className="text-muted-foreground">20-70% of total revenue</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Hyperscale Contract Terms</span>
                  <span className="text-muted-foreground">7-15 years</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Hyperscale Pricing (Wholesale)</span>
                  <span className="text-muted-foreground">$1,000-$2,000/MW annually</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded">
                  <span className="font-medium">Customer Concentration Risk Threshold</span>
                  <span className="text-muted-foreground">&gt;20% from one customer</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 p-8 rounded-xl border border-indigo-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed customer analysis, revenue breakdowns, and competitive positioning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {hyperscaleFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Customer concentration and revenue mix metrics are estimates based on publicly available information. Actual customer relationships should be verified through company SEC filings and earnings reports. This information is for educational purposes only and should not be considered as investment advice.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="hyperscale-customers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
