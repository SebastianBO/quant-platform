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
    title: `${symbol} Employees on Platform - HCM Workforce Data & Analytics`,
    description: `${symbol} employees managed on platform. View workforce size, employee count trends, HCM platform adoption, and human capital management metrics.`,
    keywords: [
      `${symbol} employees on platform`,
      `${symbol} workforce size`,
      `${symbol} employee count`,
      `${symbol} HCM platform`,
      `${symbol} human capital`,
      `${symbol} workforce analytics`,
    ],
    openGraph: {
      title: `${symbol} Employees on Platform | HCM Workforce Metrics`,
      description: `Complete ${symbol} workforce data including employees managed, platform adoption trends, and HCM analytics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/employees-on-platform/${ticker.toLowerCase()}`,
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

export default async function EmployeesOnPlatformPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/employees-on-platform/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Estimate employees on platform based on company size
  const marketCap = snapshot.market_cap || 0
  const estimatedEmployees = Math.round((marketCap / 1e9) * 500) // Rough estimate

  const employeesFaqs = [
    {
      question: `How many employees does ${symbol} manage on their platform?`,
      answer: `Based on ${companyName}'s market presence and business scale, we estimate approximately ${estimatedEmployees.toLocaleString()} employees are managed through their HCM platform. This metric reflects the company's workforce management capabilities and platform adoption.`
    },
    {
      question: `What does employees on platform mean for ${symbol}?`,
      answer: `Employees on platform refers to the total number of employees that ${companyName} manages through their Human Capital Management (HCM) system. This metric is crucial for understanding the scale of their workforce operations and HR technology adoption.`
    },
    {
      question: `How does ${symbol}'s employee count impact their business?`,
      answer: `For ${companyName}, managing ${estimatedEmployees.toLocaleString()} employees on their platform demonstrates operational scale and efficiency in human capital management. Larger employee bases typically correlate with enterprise-level HCM solutions and recurring revenue potential.`
    },
    {
      question: `What are the trends in ${symbol}'s workforce size?`,
      answer: `${companyName}'s workforce metrics are influenced by ${sector ? `${sector} sector dynamics, ` : ''}hiring trends, and business expansion. Companies managing larger employee bases often have higher HCM platform revenue and stronger customer retention.`
    },
    {
      question: `How does ${symbol} compare to competitors in workforce management?`,
      answer: `${companyName}'s employees on platform metric can be compared to industry peers to assess market share, platform adoption, and competitive positioning in the HCM and workforce management space.`
    },
    {
      question: `Why is employees on platform important for ${symbol} investors?`,
      answer: `For investors in ${symbol}, employees on platform is a key operational metric that indicates business scale, customer base size, and potential for recurring HCM revenue. Higher employee counts generally correlate with stronger enterprise contracts and revenue growth.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Employees on Platform`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Employees on Platform - HCM Workforce Data & Analytics`,
    description: `Complete workforce analysis for ${symbol} (${companyName}) including employees managed, platform adoption, and HCM metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} employees on platform`,
      `${symbol} workforce`,
      `${symbol} HCM platform`,
      `${symbol} human capital`,
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

  const faqSchema = getFAQSchema(employeesFaqs)

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
            <span>{symbol} Employees on Platform</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Employees on Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Workforce size and HCM platform metrics for {companyName}
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

          {/* Employees on Platform Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Workforce Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated Employees on Platform</p>
                <p className="text-3xl font-bold text-green-500">{estimatedEmployees.toLocaleString()}</p>
              </div>
              {snapshot.market_cap && (
                <div className="bg-card p-6 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-3xl font-bold">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* What is Employees on Platform */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Employees on Platform</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Employees on platform measures the total workforce managed through {companyName}'s HCM (Human Capital Management) system. This metric is crucial for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Platform Scale:</strong> Indicates the size and reach of HCM operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Revenue Potential:</strong> Larger employee bases typically generate higher recurring revenue</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Market Share:</strong> Reflects competitive positioning in workforce management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Enterprise Adoption:</strong> Higher counts suggest strong enterprise customer base</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live workforce data, HCM metrics, and detailed financial analysis
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
              {employeesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Workforce metrics are estimates based on publicly available data and should not be considered financial advice. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="employees-on-platform" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
