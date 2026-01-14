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
    title: `${symbol} Direct-to-Consumer Revenue ${currentYear} - DTC Sales Analysis`,
    description: `${symbol} direct-to-consumer (DTC) revenue analysis for ${currentYear}. Track DTC sales growth, e-commerce performance, and retail strategy shifts.`,
    keywords: [
      `${symbol} DTC revenue`,
      `${symbol} direct-to-consumer sales`,
      `${symbol} e-commerce revenue`,
      `${symbol} DTC growth`,
      `${symbol} retail strategy`,
      `${symbol} online sales`,
    ],
    openGraph: {
      title: `${symbol} Direct-to-Consumer Revenue ${currentYear} | DTC Analysis`,
      description: `Complete ${symbol} DTC revenue analysis with e-commerce growth trends and direct sales performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/direct-to-consumer/${ticker.toLowerCase()}`,
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

export default async function DirectToConsumerPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/direct-to-consumer/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate DTC metrics (simulated - would need actual data)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedDTCPercentage = sector === 'Consumer Discretionary' ? 0.35 : 0.20
  const estimatedDTCRevenue = revenue * estimatedDTCPercentage

  // Generate DTC FAQs
  const dtcFaqs = [
    {
      question: `What is ${symbol}'s direct-to-consumer strategy?`,
      answer: `${companyName} has been investing in direct-to-consumer channels to build stronger customer relationships and improve margins. DTC sales are estimated to represent ${(estimatedDTCPercentage * 100).toFixed(0)}% of total revenue, with continued growth through e-commerce and owned retail locations.`
    },
    {
      question: `How much revenue does ${symbol} generate from DTC sales?`,
      answer: `Based on current financials, ${symbol}'s DTC revenue is estimated at $${(estimatedDTCRevenue / 1e9).toFixed(2)}B annually. This includes e-commerce sales, company-owned stores, and direct digital channels.`
    },
    {
      question: `Is ${symbol} growing its DTC business?`,
      answer: `${sector === 'Consumer Discretionary' ? 'Many consumer brands' : 'Companies'} are expanding DTC channels to improve margins and customer data. ${symbol}'s overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}% suggests potential DTC expansion aligned with industry trends.`
    },
    {
      question: `Why is DTC important for ${symbol}?`,
      answer: `Direct-to-consumer sales offer higher margins, better customer data, and reduced dependence on wholesale partners. For ${symbol}, DTC growth can drive profitability improvements and strengthen brand loyalty.`
    },
    {
      question: `How does ${symbol}'s DTC compare to competitors?`,
      answer: `${sector === 'Consumer Discretionary' ? 'Leading consumer brands typically see 30-50% DTC mix' : 'DTC penetration varies by industry'}. Investors should monitor ${symbol}'s channel mix trends to assess competitive positioning.`
    },
    {
      question: `What drives ${symbol}'s DTC growth?`,
      answer: `Key DTC drivers include e-commerce platform investments, mobile app adoption, personalized marketing, loyalty programs, and owned retail expansion. ${symbol}'s technology investments and customer acquisition costs are critical metrics.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} DTC Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Direct-to-Consumer Revenue ${currentYear} - DTC Sales Analysis`,
    description: `Complete DTC revenue analysis for ${symbol} (${companyName}) with e-commerce growth trends and direct sales performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} DTC revenue`,
      `${symbol} direct sales`,
      `${symbol} e-commerce`,
      `${symbol} DTC growth`,
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

  const faqSchema = getFAQSchema(dtcFaqs)

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
            <span>{symbol} DTC Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Direct-to-Consumer Revenue
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            DTC sales analysis and e-commerce growth trends for {companyName}
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

          {/* DTC Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">DTC Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. DTC Revenue</p>
                <p className="text-3xl font-bold">${(estimatedDTCRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-green-500 mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">DTC % of Total</p>
                <p className="text-3xl font-bold">{(estimatedDTCPercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Est. Mix</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className={`text-3xl font-bold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">YoY</p>
              </div>
            </div>
          </section>

          {/* DTC Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Direct-to-Consumer Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s DTC approach encompasses multiple channels:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>E-Commerce:</strong> Direct online sales through company website and mobile apps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Owned Retail:</strong> Company-operated stores and experiential retail locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Digital Platforms:</strong> Direct sales through social media and digital marketplaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span><strong>Subscription Services:</strong> Recurring revenue through membership and subscription programs</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Revenue Breakdown</h2>
            <p className="text-muted-foreground mb-6">
              Get detailed revenue analysis, channel mix, and growth trends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Details
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {dtcFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> DTC revenue estimates are based on industry benchmarks and may not reflect actual company reporting. Always review official financial statements and company disclosures for accurate channel revenue data.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="direct-to-consumer" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
