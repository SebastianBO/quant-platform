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
    title: `${symbol} New Vehicle Sales ${currentYear} - Auto Dealership Metrics`,
    description: `${symbol} new vehicle sales analysis: retail unit sales, revenue trends, market share, and automotive industry performance metrics for ${currentYear}.`,
    keywords: [
      `${symbol} new vehicle sales`,
      `${symbol} auto sales`,
      `${symbol} new car sales`,
      `${symbol} retail units`,
      `${symbol} automotive metrics`,
      `${symbol} vehicle revenue`,
    ],
    openGraph: {
      title: `${symbol} New Vehicle Sales ${currentYear} | Auto Dealership Metrics`,
      description: `Complete ${symbol} new vehicle sales analysis with unit trends and revenue insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/new-vehicle-sales/${ticker.toLowerCase()}`,
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

export default async function NewVehicleSalesPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/new-vehicle-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} new vehicle sales?`,
      answer: `${symbol} new vehicle sales represent the total number of new cars, trucks, and SUVs sold by ${companyName} dealerships. This metric is crucial for automotive retailers as new vehicle sales drive revenue, customer acquisition, and aftermarket opportunities including service, parts, and financing.`
    },
    {
      question: `How do new vehicle sales impact ${symbol} stock?`,
      answer: `New vehicle sales directly impact ${symbol}'s revenue and profitability. Higher unit sales typically indicate strong market demand, effective inventory management, and competitive pricing. However, margins on new vehicles are often lower than used vehicles, so volume must be balanced with profitability.`
    },
    {
      question: `What affects new vehicle sales for auto dealers?`,
      answer: `New vehicle sales are influenced by manufacturer incentives, inventory availability, consumer financing rates, economic conditions, seasonal trends, and competitive dynamics. Supply chain disruptions and semiconductor shortages have significantly impacted new vehicle availability in recent years.`
    },
    {
      question: `Are new vehicle sales more profitable than used?`,
      answer: `Generally, used vehicle sales have higher gross profit margins per unit than new vehicles. However, new vehicle sales are essential for driving dealership traffic, building manufacturer relationships, and creating opportunities for high-margin F&I products and service contracts.`
    },
    {
      question: `How can I track ${symbol} new vehicle sales trends?`,
      answer: `Monitor ${symbol}'s quarterly earnings reports for same-store sales growth, average selling prices, unit volumes, and gross profit per vehicle. Industry data from manufacturers and automotive retail associations provide context for ${symbol}'s market performance.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} New Vehicle Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} New Vehicle Sales ${currentYear} - Auto Dealership Metrics`,
    description: `Complete new vehicle sales analysis for ${symbol} (${companyName}) with retail unit trends and revenue insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} new vehicle sales`,
      `${symbol} auto sales`,
      `${symbol} automotive metrics`,
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
            <span>{symbol} New Vehicle Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} New Vehicle Sales {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automotive dealership new vehicle sales metrics for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Understanding New Vehicle Sales</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                New vehicle sales are a critical metric for automotive dealership groups like {companyName}. This metric represents the total number of new cars, trucks, and SUVs sold through the company's dealership network.
              </p>
              <p className="text-muted-foreground">
                Key factors driving new vehicle sales include manufacturer incentives, inventory availability, consumer credit conditions, and overall economic health. The automotive retail industry has experienced significant volatility due to supply chain disruptions and changing consumer preferences.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Metrics to Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Unit Sales Volume</h3>
                <p className="text-muted-foreground text-sm">
                  Total number of new vehicles sold per quarter or year, indicating market demand and dealership performance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average Selling Price</h3>
                <p className="text-muted-foreground text-sm">
                  Revenue per new vehicle sold, reflecting product mix, market conditions, and pricing power.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Gross Profit Per Unit</h3>
                <p className="text-muted-foreground text-sm">
                  Profitability per new vehicle, typically lower than used vehicles but essential for overall revenue.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Same-Store Sales Growth</h3>
                <p className="text-muted-foreground text-sm">
                  Year-over-year comparison of new vehicle sales at stores open for at least one year.
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
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Automotive sales metrics are subject to seasonal variations and economic conditions. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
