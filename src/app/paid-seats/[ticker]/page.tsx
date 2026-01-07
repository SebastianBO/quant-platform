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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Paid Seats - Customer Growth & SaaS Metrics`,
    description: `${symbol} paid seat count analysis. Track subscription growth, customer acquisition, seat expansion, and revenue per seat metrics.`,
    keywords: [
      `${symbol} paid seats`,
      `${symbol} customer growth`,
      `${symbol} subscribers`,
      `${symbol} seat count`,
      `${symbol} SaaS metrics`,
      `${symbol} user growth`,
    ],
    openGraph: {
      title: `${symbol} Paid Seats | Customer Growth Analysis`,
      description: `Comprehensive analysis of ${symbol} paid seat growth, customer metrics, and subscription trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/paid-seats/${ticker.toLowerCase()}`,
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

export default async function PaidSeatsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/paid-seats/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many paid seats does ${symbol} have?`,
      answer: `${symbol} (${companyName}) reports paid seat metrics as a key indicator of subscription growth and customer adoption. Paid seats represent active paying users or licenses across the platform.`
    },
    {
      question: `What is ${symbol}'s paid seat growth rate?`,
      answer: `Paid seat growth is a critical metric for SaaS companies like ${companyName}. Strong seat growth indicates successful customer acquisition and product-market fit, driving revenue expansion.`
    },
    {
      question: `How do paid seats affect ${symbol} stock?`,
      answer: `Paid seat metrics directly impact ${symbol}'s revenue and growth trajectory. Investors monitor seat count trends to assess customer momentum and future revenue potential.`
    },
    {
      question: `What is revenue per paid seat for ${symbol}?`,
      answer: `Revenue per seat (ARPU) is calculated by dividing total revenue by paid seat count. This metric shows ${symbol}'s pricing power and upsell effectiveness.`
    },
    {
      question: `How does ${symbol} compare to competitors in paid seats?`,
      answer: `${industry ? `In the ${industry} industry, ` : ''}paid seat metrics are benchmarked against competitors to evaluate market share and growth rates. Check the competitors page for comparative analysis.`
    },
    {
      question: `What drives paid seat expansion for ${symbol}?`,
      answer: `Paid seat growth for ${companyName} is driven by new customer acquisition, seat expansion within existing accounts, and product adoption across teams and departments.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Paid Seats`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Paid Seats - Customer Growth & SaaS Metrics`,
    description: `Comprehensive analysis of ${symbol} (${companyName}) paid seat growth and subscription metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} paid seats`,
      `${symbol} customer growth`,
      `${symbol} subscribers`,
      `${symbol} SaaS metrics`,
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
            <span>{symbol} Paid Seats</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Paid Seats
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Customer growth and subscription metrics for {companyName}
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

          {/* Paid Seats Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Paid Seats Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Paid seats represent the number of active paying users or licenses on {companyName}'s platform.
                This metric is a key indicator of customer adoption and revenue growth potential for SaaS companies.
              </p>
              <p className="text-muted-foreground">
                Tracking paid seat growth helps investors understand customer momentum, market penetration,
                and the effectiveness of sales and marketing efforts.
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key SaaS Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  ${(snapshot.market_cap / 1e9).toFixed(1)}B
                </p>
              </div>
              {metrics?.revenue_growth && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-xl font-bold ${metrics.revenue_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(metrics.revenue_growth * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {metrics?.price_to_sales_ratio && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">P/S Ratio</p>
                  <p className="text-xl font-bold">{metrics.price_to_sales_ratio.toFixed(1)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Why Paid Seats Matter */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Paid Seats Matter</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">1.</span>
                  <span><strong>Revenue Visibility:</strong> Paid seats provide a leading indicator of future revenue growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">2.</span>
                  <span><strong>Customer Health:</strong> Seat expansion within accounts signals product value and customer satisfaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">3.</span>
                  <span><strong>Market Share:</strong> Seat count growth relative to competitors shows market position</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">4.</span>
                  <span><strong>Pricing Power:</strong> Revenue per seat trends indicate pricing effectiveness and upsell success</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Growth Metrics</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed SaaS metrics, customer analytics, and revenue projections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
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

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="paid-seats" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
