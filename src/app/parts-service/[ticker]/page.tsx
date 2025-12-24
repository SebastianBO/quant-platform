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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Parts & Service Revenue ${currentYear} - Aftermarket Metrics`,
    description: `${symbol} parts and service revenue analysis: service department performance, parts sales, customer pay vs warranty, and aftermarket profitability for ${currentYear}.`,
    keywords: [
      `${symbol} parts service revenue`,
      `${symbol} service department`,
      `${symbol} aftermarket revenue`,
      `${symbol} parts sales`,
      `${symbol} service margins`,
      `${symbol} customer pay`,
    ],
    openGraph: {
      title: `${symbol} Parts & Service Revenue ${currentYear} | Aftermarket Metrics`,
      description: `Complete ${symbol} parts and service revenue analysis with profitability insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/parts-service/${ticker.toLowerCase()}`,
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

export default async function PartsServicePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/parts-service/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} parts and service revenue?`,
      answer: `${symbol} parts and service revenue represents income generated from the service departments and parts sales at ${companyName} dealerships. This includes customer pay repairs, warranty work, maintenance services, parts sales, collision repair, and accessories. It's one of the highest-margin revenue streams for automotive retailers.`
    },
    {
      question: `Why is parts and service revenue important for ${symbol}?`,
      answer: `Parts and service is critical because it generates consistent, high-margin recurring revenue that is less cyclical than vehicle sales. Service departments create customer retention, drive parts sales, and maintain profitability even when vehicle sales slow. For many dealership groups, parts and service can account for 40-50% of gross profit despite being a smaller portion of total revenue.`
    },
    {
      question: `What is customer pay vs warranty revenue?`,
      answer: `Customer pay revenue comes from work paid for directly by vehicle owners, typically at higher margins. Warranty revenue is reimbursed by manufacturers for covered repairs, usually at lower rates but providing steady volume. ${companyName}'s mix between customer pay and warranty work impacts overall service profitability.`
    },
    {
      question: `How profitable is the parts and service business?`,
      answer: `Parts and service typically generates gross profit margins of 50-60% or higher, significantly exceeding vehicle sales margins. The recurring nature, lower inventory requirements, and strong customer retention make this one of the most valuable profit centers for ${symbol}.`
    },
    {
      question: `What drives growth in parts and service revenue?`,
      answer: `Growth drivers include expanding the vehicle parc (total vehicles on the road), effective service retention programs, digital scheduling capabilities, extending service intervals beyond warranty periods, competitive pricing versus independent shops, and value-added services like express maintenance.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Parts & Service`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Parts & Service Revenue ${currentYear} - Aftermarket Metrics`,
    description: `Complete parts and service revenue analysis for ${symbol} (${companyName}) with profitability insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} parts service`,
      `${symbol} aftermarket revenue`,
      `${symbol} service department`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Parts & Service</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Parts & Service Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Aftermarket revenue and service department metrics for {companyName}
          </p>

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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Parts & Service Revenue</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Parts and service represents the highest-margin, most recurring revenue stream for automotive dealership groups like {companyName}. Unlike vehicle sales which are transactional, service departments generate predictable income from maintenance, repairs, and parts sales.
              </p>
              <p className="text-muted-foreground">
                Strong service departments create competitive advantages through customer retention, brand loyalty, and consistent cash flow. With typical gross profit margins of 50-60%, parts and service often contributes 40-50% of total dealership gross profit despite being a smaller percentage of revenue.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Parts & Service Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Gross Profit %</h3>
                <p className="text-muted-foreground text-sm">
                  Typically 50-60%, representing the profitability of labor and parts sales after direct costs.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Pay Revenue</h3>
                <p className="text-muted-foreground text-sm">
                  Higher-margin work paid directly by customers versus manufacturer warranty reimbursements.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Absorption Rate</h3>
                <p className="text-muted-foreground text-sm">
                  Percentage of dealership fixed costs covered by parts and service gross profit alone.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Technician Productivity</h3>
                <p className="text-muted-foreground text-sm">
                  Efficiency of service technicians measured in billed hours vs available hours.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access complete automotive metrics, financial analysis, and AI-powered insights
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Parts and service performance varies by brand, location, and market conditions. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
