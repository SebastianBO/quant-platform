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
    title: `${symbol} Enterprise Customers - Major Cloud Clients & Contracts ${currentYear}`,
    description: `${symbol} enterprise customers: major cloud clients, customer count, customer concentration, enterprise contracts, Fortune 500 customers. Analyze ${symbol}'s customer base.`,
    keywords: [
      `${symbol} enterprise customers`,
      `${symbol} customer count`,
      `${symbol} major clients`,
      `${symbol} Fortune 500 customers`,
      `${symbol} customer concentration`,
      `${symbol} enterprise contracts`,
    ],
    openGraph: {
      title: `${symbol} Enterprise Customers ${currentYear} | Cloud Client Base`,
      description: `Complete ${symbol} enterprise customer analysis with client metrics and contract data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/enterprise-customers/${ticker.toLowerCase()}`,
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

export default async function EnterpriseCustomersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, incomeStatements, quarterlyIncome, metrics, companyFacts, productSegments } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/enterprise-customers/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Get latest revenue data
  const latestAnnual = incomeStatements?.[0]
  const latestRevenue = latestAnnual?.revenue || 0
  const latestPeriod = latestAnnual?.report_period || ''

  // Calculate revenue growth
  const previousAnnual = incomeStatements?.[1]
  const revenueGrowth = previousAnnual?.revenue
    ? ((latestRevenue - previousAnnual.revenue) / previousAnnual.revenue)
    : metrics?.revenue_growth || 0

  // Generate enterprise customer FAQs
  const customerFaqs = [
    {
      question: `How many enterprise customers does ${symbol} have?`,
      answer: `${companyName} serves enterprise customers ranging from small businesses to Fortune 500 companies. Major cloud providers typically report metrics like: total customer count (millions), enterprise accounts ($100K+ annual spend), and large enterprise deals ($1M+ contracts). Check earnings calls and investor presentations for customer count disclosures.`
    },
    {
      question: `Who are ${symbol}'s major enterprise customers?`,
      answer: `${companyName} serves enterprises across all industries including technology, financial services, healthcare, retail, manufacturing, and government. Due to confidentiality agreements, cloud providers rarely disclose specific customer names unless publicly announced. Major customers often sign multi-year, multi-million dollar cloud contracts.`
    },
    {
      question: `What is ${symbol}'s customer concentration risk?`,
      answer: `Customer concentration measures revenue dependency on top customers. Cloud providers with diversified customer bases have lower risk. ${companyName} reports customer concentration in 10-K filings if any single customer exceeds 10% of revenue. Broad enterprise adoption across industries reduces concentration risk and improves revenue stability.`
    },
    {
      question: `How does ${symbol} acquire enterprise customers?`,
      answer: `Enterprise customer acquisition involves: (1) Direct sales teams targeting Fortune 500, (2) Partner ecosystem (system integrators, consultants), (3) Free trials and proof-of-concept projects, (4) Migration programs from on-premise to cloud, (5) Strategic partnerships and co-innovation. Sales cycles for large enterprises can take 6-18 months.`
    },
    {
      question: `What is ${symbol}'s enterprise customer retention rate?`,
      answer: `Cloud providers track net revenue retention (NRR) - existing customers spending more over time through expansion. Best-in-class SaaS companies achieve 120%+ NRR, meaning existing customers increase spending 20% annually through seat expansion, upsells, and cross-sells. High retention indicates strong product-market fit and customer satisfaction.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Enterprise Customers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Enterprise Customers ${currentYear} - Cloud Client Analysis`,
    description: `Complete enterprise customer analysis for ${symbol} (${companyName}) with client metrics and contract data.`,
    url: pageUrl,
    keywords: [
      `${symbol} enterprise customers`,
      `${symbol} customer count`,
      `${symbol} major clients`,
      `${symbol} enterprise contracts`,
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

  const faqSchema = getFAQSchema(customerFaqs)

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
            <span>{symbol} Enterprise Customers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Enterprise Customers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Enterprise customer base and major cloud clients for {companyName}
          </p>

          {/* Enterprise Customer Overview */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 p-8 rounded-xl border border-violet-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Enterprise Cloud Adoption</h2>
            <p className="text-muted-foreground">
              {companyName} serves enterprise customers across all industries and company sizes. Enterprise cloud adoption continues to accelerate as companies migrate workloads from on-premise data centers to the cloud for scalability, cost savings, and innovation.
            </p>
          </div>

          {/* Customer Segments */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Customer Segments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Small & Medium Business</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Companies with less than 1,000 employees using cloud for website hosting, email, CRM, and productivity tools.
                </p>
                <p className="text-xs text-muted-foreground">Typically $100-$10K monthly spend</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Mid-Market Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Companies with 1,000-10,000 employees migrating core business applications to the cloud.
                </p>
                <p className="text-xs text-muted-foreground">Typically $10K-$100K monthly spend</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Large Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Fortune 500 companies and government with massive cloud deployments and multi-year contracts.
                </p>
                <p className="text-xs text-muted-foreground">$100K+ monthly spend, $1M+ annual contracts</p>
              </div>
            </div>
          </section>

          {/* Industry Verticals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Enterprise Customer Verticals</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Financial Services</h3>
                  <p className="text-xs text-muted-foreground">Banks, insurance, fintech</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Healthcare</h3>
                  <p className="text-xs text-muted-foreground">Hospitals, biotech, pharma</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Retail & E-commerce</h3>
                  <p className="text-xs text-muted-foreground">Online stores, marketplaces</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Technology</h3>
                  <p className="text-xs text-muted-foreground">SaaS, gaming, startups</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Manufacturing</h3>
                  <p className="text-xs text-muted-foreground">IoT, supply chain, ERP</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-bold mb-1">Government</h3>
                  <p className="text-xs text-muted-foreground">Federal, state, local agencies</p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Acquisition */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Enterprise Sales Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-violet-500 font-bold mr-2">1.</span>
                  <span><strong>Direct Sales:</strong> Dedicated account executives for Fortune 500 and enterprise accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-500 font-bold mr-2">2.</span>
                  <span><strong>Partner Ecosystem:</strong> System integrators like Accenture, Deloitte help with cloud migrations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-500 font-bold mr-2">3.</span>
                  <span><strong>Free Trials:</strong> $300-$500 credits to test cloud services before committing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-500 font-bold mr-2">4.</span>
                  <span><strong>Migration Programs:</strong> Tools and incentives to move from AWS, Azure, or on-premise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-500 font-bold mr-2">5.</span>
                  <span><strong>Strategic Partnerships:</strong> Co-innovation and joint go-to-market with large enterprises</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Customer Retention Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Customer Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Customer Lifetime Value (LTV)</h3>
                <p className="text-sm text-muted-foreground">
                  Total revenue expected from a customer over their entire relationship. Enterprise customers often have 5-10 year+ lifespans with expanding cloud spend over time.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Customer Acquisition Cost (CAC)</h3>
                <p className="text-sm text-muted-foreground">
                  Sales and marketing expenses to acquire a new customer. Enterprise CAC is high ($50K-$500K) but justified by large contract values and long retention.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Net Revenue Retention (NRR)</h3>
                <p className="text-sm text-muted-foreground">
                  Existing customer revenue growth year-over-year. Best-in-class cloud companies achieve 120-130% NRR through expansion and upsells.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-3">Customer Concentration</h3>
                <p className="text-sm text-muted-foreground">
                  Revenue from top 10 customers as % of total. Lower concentration (less than 20%) indicates a diversified, lower-risk customer base.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete business metrics and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/cloud-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Cloud Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {customerFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Enterprise customer data is based on publicly available information and company disclosures. Specific customer names and contract values are rarely disclosed. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="enterprise-customers" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
