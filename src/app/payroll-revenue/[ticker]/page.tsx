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
    title: `${symbol} Payroll Revenue - Payroll Processing Revenue & Growth`,
    description: `${symbol} payroll revenue analysis. View payroll processing revenue trends, transaction volumes, recurring revenue, and payroll software earnings.`,
    keywords: [
      `${symbol} payroll revenue`,
      `${symbol} payroll processing revenue`,
      `${symbol} payroll software`,
      `${symbol} payroll growth`,
      `${symbol} payroll services`,
      `${symbol} HCM payroll`,
    ],
    openGraph: {
      title: `${symbol} Payroll Revenue | Payroll Processing Earnings`,
      description: `Complete ${symbol} payroll revenue data including processing volumes, growth trends, and payroll software earnings analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/payroll-revenue/${ticker.toLowerCase()}`,
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

export default async function PayrollRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/payroll-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedPayrollRevenue = revenue * 0.25 // Estimate 25% from payroll

  const payrollFaqs = [
    {
      question: `What is ${symbol}'s payroll revenue?`,
      answer: `${companyName}'s payroll revenue includes earnings from payroll processing services, tax filing, compliance management, and related payroll software solutions. We estimate payroll revenue at approximately $${(estimatedPayrollRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How does ${symbol} generate payroll revenue?`,
      answer: `${companyName} generates payroll revenue through per-employee-per-month (PEPM) subscription fees, transaction-based processing fees, tax filing services, compliance management, and premium payroll features. Payroll is often a core module in their HCM platform.`
    },
    {
      question: `What is the growth rate of ${symbol}'s payroll business?`,
      answer: `With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${companyName}'s payroll segment typically grows through new customer acquisition, employee count expansion at existing clients, and cross-selling of additional payroll services.`
    },
    {
      question: `Why is payroll revenue important for ${symbol}?`,
      answer: `Payroll revenue is crucial for ${companyName} because it's highly recurring, mission-critical for customers, and creates strong switching costs. Payroll processing generates predictable cash flows and serves as an anchor product for cross-selling other HR modules.`
    },
    {
      question: `How does ${symbol}'s payroll revenue compare to competitors?`,
      answer: `${companyName}'s payroll revenue can be benchmarked against competitors like ADP, Paychex, Paycom, and Paylocity. Key metrics include market share, pricing power, processing volumes, and attachment rates for additional payroll services.`
    },
    {
      question: `What drives ${symbol}'s payroll revenue growth?`,
      answer: `Payroll revenue growth is driven by: new business wins, organic employee growth at existing clients, price increases, adoption of premium payroll features, international expansion, and consolidation of multiple payroll providers.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Payroll Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Payroll Revenue - Payroll Processing Revenue & Growth`,
    description: `Complete payroll revenue analysis for ${symbol} (${companyName}) including processing volumes, growth trends, and recurring revenue metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} payroll revenue`,
      `${symbol} payroll processing`,
      `${symbol} payroll services`,
      `${symbol} HCM payroll`,
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

  const faqSchema = getFAQSchema(payrollFaqs)

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
            <span>{symbol} Payroll Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Payroll Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Payroll processing revenue and growth trends for {companyName}
          </p>

          {/* Current Price Card */}
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

          {/* Payroll Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Payroll Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Payroll Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedPayrollRevenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ${(revenue / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Understanding Payroll Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Payroll Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Payroll revenue represents {companyName}'s earnings from processing employee paychecks, tax withholdings, and compliance services. Key revenue streams include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Processing Fees:</strong> Per-employee fees for running payroll cycles (weekly, bi-weekly, monthly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Tax Services:</strong> Federal, state, and local tax filing and compliance management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Premium Features:</strong> Off-cycle payroll, garnishment processing, and advanced reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Integration Fees:</strong> Connections to time tracking, benefits, and accounting systems</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Revenue Model */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Payroll Revenue Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Subscription-Based</h3>
                <p className="text-sm text-muted-foreground">Monthly or annual fees based on employee count, providing predictable recurring revenue</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Transaction-Based</h3>
                <p className="text-sm text-muted-foreground">Fees per payroll run, tax filing, or employee payment, scaling with usage</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Tiered Pricing</h3>
                <p className="text-sm text-muted-foreground">Basic, professional, and enterprise tiers with increasing features and pricing</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Add-On Services</h3>
                <p className="text-sm text-muted-foreground">Additional revenue from same-day payments, HR support, and custom integrations</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live payroll revenue data, HCM metrics, and detailed financial analysis
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

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {payrollFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue metrics are estimates based on publicly available data and should not be considered financial advice. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="payroll-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
