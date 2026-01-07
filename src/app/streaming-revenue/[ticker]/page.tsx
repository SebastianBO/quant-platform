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
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Streaming Revenue ${currentYear} - Growth Analysis & Forecasts`,
    description: `${symbol} streaming revenue analysis including revenue growth, monetization trends, and ${currentYear} forecasts.`,
    keywords: [
      `${symbol} streaming revenue`,
      `${symbol} streaming income`,
      `${symbol} subscription revenue`,
      `${symbol} streaming growth`,
      `${symbol} revenue ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Streaming Revenue ${currentYear} | Revenue Growth`,
      description: `Complete ${symbol} streaming revenue analysis with growth trends and monetization insights.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/streaming-revenue/${ticker.toLowerCase()}`,
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

export default async function StreamingRevenuePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/streaming-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Streaming Revenue FAQs
  const revenueFaqs = [
    {
      question: `How much streaming revenue does ${symbol} generate?`,
      answer: `${symbol} (${companyName}) streaming revenue includes subscription fees, advertising revenue (for ad-supported tiers), and other ancillary income. Total streaming revenue and growth rates are disclosed in quarterly earnings reports and investor presentations. Revenue trends indicate business momentum and monetization effectiveness.`
    },
    {
      question: `Is ${symbol}'s streaming revenue growing?`,
      answer: `Streaming revenue growth for ${symbol} depends on subscriber additions, ARPU trends, pricing changes, and advertising revenue. Strong revenue growth indicates successful subscriber acquisition and monetization. Decelerating growth may signal market saturation, competitive pressure, or pricing challenges.`
    },
    {
      question: `How does ${symbol} monetize streaming subscribers?`,
      answer: `${symbol} monetizes streaming through subscription fees (premium and ad-supported tiers), advertising revenue, add-on services, and potential bundling partnerships. Effective monetization balances subscriber growth with ARPU optimization. The best platforms grow both subscriber counts and revenue per user.`
    },
    {
      question: `What drives ${symbol} streaming revenue growth?`,
      answer: `Revenue growth for ${symbol} comes from subscriber additions (volume), ARPU increases (pricing power), and advertising revenue growth (for ad-supported models). Sustainable growth requires balancing these drivers while managing content costs and maintaining healthy unit economics.`
    },
    {
      question: `How does ${symbol} streaming revenue compare to competitors?`,
      answer: `${symbol}'s streaming revenue should be evaluated relative to subscriber base, ARPU, and growth rates compared to peers in ${industry || 'streaming media'}. Revenue per subscriber and revenue growth rates provide meaningful competitive context. Market leaders typically show strong revenue growth with expanding margins.`
    },
    {
      question: `What is ${symbol}'s streaming revenue forecast for ${currentYear}?`,
      answer: `Streaming revenue forecasts for ${symbol} depend on subscriber growth projections, ARPU trends, advertising revenue expansion, and pricing strategy. Analyst estimates and company guidance provide insight into expected revenue trajectories. Review earnings guidance for the latest revenue outlook.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Streaming Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Streaming Revenue ${currentYear} - Growth Analysis & Forecasts`,
    description: `Comprehensive streaming revenue analysis for ${symbol} (${companyName}) with growth trends and monetization insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} streaming revenue`,
      `${symbol} streaming income`,
      `${symbol} subscription revenue`,
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

  const faqSchema = getFAQSchema(revenueFaqs)

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
            <span>{symbol} Streaming Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Streaming Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revenue growth and monetization analysis for {companyName}
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

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Growth Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Positive Revenue Drivers</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Subscriber base growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>ARPU expansion through pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Advertising revenue growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>International market expansion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Premium tier adoption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Add-on services and bundles</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Revenue Headwinds</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Subscriber churn and cancellations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Pricing resistance from consumers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Ad-tier cannibalization of premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Currency headwinds internationally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Economic pressures on discretionary spending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Market saturation in developed regions</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Revenue Analysis Framework</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Revenue Quality Matters</h3>
                <p className="text-muted-foreground">
                  Not all streaming revenue is created equal. Subscription revenue provides high-margin, recurring
                  income with predictable cash flows. Advertising revenue can be more volatile, depending on economic
                  cycles and advertiser demand. For {symbol}, the mix between subscription and advertising revenue
                  impacts revenue quality, margins, and valuation multiples.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Unit Economics Progression</h3>
                <p className="text-muted-foreground">
                  Streaming businesses aim for improving unit economics over time. Early-stage platforms prioritize
                  subscriber growth over profitability, accepting negative margins to scale. As platforms mature,
                  focus shifts to ARPU optimization, churn reduction, and operating leverage. {symbol}'s progression
                  from growth to profitability determines long-term shareholder value.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Content Spend as Revenue Percentage</h3>
                <p className="text-muted-foreground">
                  A key metric for streaming platforms is content spend as a percentage of revenue. High ratios
                  (80%+) indicate heavy content investment at the expense of margins. As platforms scale, this ratio
                  should decline as revenue grows faster than content costs, demonstrating operating leverage.
                  {symbol}'s content efficiency trajectory reveals path to profitability.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, revenue metrics, and detailed valuations
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
              {revenueFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Revenue metrics are subject to change and may vary by reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="streaming-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
