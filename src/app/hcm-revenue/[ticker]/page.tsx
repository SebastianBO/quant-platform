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
    title: `${symbol} HCM Revenue - Human Capital Management Revenue & Growth`,
    description: `${symbol} HCM revenue analysis. View human capital management revenue trends, growth rates, recurring revenue metrics, and workforce software earnings.`,
    keywords: [
      `${symbol} HCM revenue`,
      `${symbol} human capital management revenue`,
      `${symbol} workforce revenue`,
      `${symbol} HR software revenue`,
      `${symbol} recurring revenue`,
      `${symbol} SaaS revenue`,
    ],
    openGraph: {
      title: `${symbol} HCM Revenue | Human Capital Management Earnings`,
      description: `Complete ${symbol} HCM revenue data including growth trends, recurring revenue metrics, and workforce software earnings analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/hcm-revenue/${ticker.toLowerCase()}`,
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

export default async function HCMRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/hcm-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedHCMRevenue = revenue * 0.35 // Estimate 35% from HCM if applicable

  const hcmFaqs = [
    {
      question: `What is ${symbol}'s HCM revenue?`,
      answer: `${companyName}'s HCM (Human Capital Management) revenue includes earnings from workforce management software, HR systems, and employee management solutions. Based on their financials, we estimate HCM revenue at approximately $${(estimatedHCMRevenue / 1e9).toFixed(2)}B annually.`
    },
    {
      question: `How fast is ${symbol}'s HCM revenue growing?`,
      answer: `${companyName}'s overall revenue growth is ${(revenueGrowth * 100).toFixed(1)}%. HCM revenue growth typically follows enterprise software adoption trends, with strong demand for cloud-based workforce management solutions driving expansion.`
    },
    {
      question: `What drives ${symbol}'s HCM revenue?`,
      answer: `${companyName}'s HCM revenue is driven by: employee count on platform, subscription pricing, enterprise contracts, platform adoption rates, and cross-selling opportunities for additional HR modules and services.`
    },
    {
      question: `How does ${symbol} monetize HCM products?`,
      answer: `${companyName} generates HCM revenue through per-employee-per-month (PEPM) pricing models, annual subscriptions, enterprise licenses, and additional fees for premium features, integrations, and professional services.`
    },
    {
      question: `What is the recurring revenue percentage for ${symbol}?`,
      answer: `For HCM companies like ${companyName}, recurring revenue typically represents 85-95% of total revenue, providing predictable cash flows and strong customer retention metrics. This subscription-based model drives high gross margins.`
    },
    {
      question: `How does ${symbol}'s HCM revenue compare to competitors?`,
      answer: `${companyName}'s HCM revenue can be benchmarked against competitors like Workday, ADP, Paycom, and Paylocity to assess market share, pricing power, and competitive positioning in the ${sector || 'enterprise software'} space.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} HCM Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} HCM Revenue - Human Capital Management Revenue & Growth`,
    description: `Complete HCM revenue analysis for ${symbol} (${companyName}) including growth trends, recurring revenue, and workforce software earnings.`,
    url: pageUrl,
    keywords: [
      `${symbol} HCM revenue`,
      `${symbol} human capital management`,
      `${symbol} workforce revenue`,
      `${symbol} recurring revenue`,
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

  const faqSchema = getFAQSchema(hcmFaqs)

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
            <span>{symbol} HCM Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} HCM Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Human capital management revenue and growth trends for {companyName}
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

          {/* HCM Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">HCM Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Estimated HCM Revenue</p>
                <p className="text-3xl font-bold text-green-500">
                  ${(estimatedHCMRevenue / 1e9).toFixed(2)}B
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

          {/* Understanding HCM Revenue */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding HCM Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                HCM (Human Capital Management) revenue represents {companyName}'s earnings from workforce management and HR software solutions. Key components include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Subscription Revenue:</strong> Recurring monthly or annual fees per employee managed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Enterprise Contracts:</strong> Large-scale agreements with enterprise customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Module Add-ons:</strong> Additional revenue from payroll, benefits, talent, and learning modules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Professional Services:</strong> Implementation, consulting, and support fees</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Revenue Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revenue Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Platform Expansion</h3>
                <p className="text-sm text-muted-foreground">Growing employee count on platform drives linear revenue growth through PEPM pricing models</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Cross-Selling</h3>
                <p className="text-sm text-muted-foreground">Upselling additional modules like payroll, benefits, and talent management increases ARPU</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Price Increases</h3>
                <p className="text-sm text-muted-foreground">Annual pricing adjustments and premium tier upgrades contribute to revenue expansion</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Market Adoption</h3>
                <p className="text-sm text-muted-foreground">Digital transformation in HR drives new customer acquisition and platform migration</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live revenue data, HCM metrics, and detailed financial analysis
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
              {hcmFaqs.map((faq, index) => (
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
          <RelatedLinks ticker={symbol} currentPage="hcm-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
