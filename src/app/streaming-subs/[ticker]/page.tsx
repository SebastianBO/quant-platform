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
    title: `${symbol} Streaming Subscribers ${currentYear} - Growth Analysis & Forecasts`,
    description: `${symbol} streaming subscriber count and growth analysis. Track subscriber additions, regional breakdown, and ${currentYear} subscriber forecasts.`,
    keywords: [
      `${symbol} streaming subscribers`,
      `${symbol} subscriber count`,
      `${symbol} subscriber growth`,
      `${symbol} streaming growth`,
      `${symbol} total subscribers ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Streaming Subscribers ${currentYear} | Growth Analysis`,
      description: `Complete ${symbol} streaming subscriber analysis with growth trends and regional breakdowns.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/streaming-subs/${ticker.toLowerCase()}`,
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

export default async function StreamingSubsPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/streaming-subs/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Streaming subscriber FAQs
  const streamingFaqs = [
    {
      question: `How many streaming subscribers does ${symbol} have?`,
      answer: `${symbol} (${companyName}) is a ${industry || 'media and entertainment'} company. For current subscriber counts, check the latest quarterly earnings reports and investor presentations. Subscriber metrics are typically reported in quarterly earnings calls.`
    },
    {
      question: `Is ${symbol} adding or losing streaming subscribers?`,
      answer: `Streaming subscriber growth varies by quarter and region. ${symbol}'s subscriber trends depend on content releases, pricing changes, competitive dynamics, and market conditions. Review recent quarterly results for the latest subscriber addition or churn data.`
    },
    {
      question: `How does ${symbol} streaming growth compare to competitors?`,
      answer: `${symbol}'s streaming performance should be evaluated against peers in the ${industry || 'streaming media'} industry. Key metrics include net subscriber additions, churn rate, ARPU, and regional penetration. Compare with industry leaders for context.`
    },
    {
      question: `What drives ${symbol} streaming subscriber growth?`,
      answer: `Subscriber growth for ${symbol} is driven by content quality and variety, original programming investments, pricing strategy, international expansion, platform improvements, and marketing effectiveness. Competitive positioning and market saturation also play key roles.`
    },
    {
      question: `What is ${symbol}'s streaming subscriber forecast for ${currentYear}?`,
      answer: `Streaming subscriber forecasts for ${symbol} depend on content pipeline, pricing decisions, international expansion plans, and competitive dynamics. Analyst estimates and company guidance provide insight into expected subscriber growth trajectories.`
    },
    {
      question: `Which regions show the strongest subscriber growth for ${symbol}?`,
      answer: `Streaming growth varies by region based on market maturity, content localization, pricing strategies, and competitive intensity. Emerging markets often show higher growth rates while mature markets focus on ARPU optimization and churn reduction.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Streaming Subscribers`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Streaming Subscribers ${currentYear} - Growth Analysis & Forecasts`,
    description: `Comprehensive streaming subscriber analysis for ${symbol} (${companyName}) with growth trends and regional insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} streaming subscribers`,
      `${symbol} subscriber count`,
      `${symbol} subscriber growth`,
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

  const faqSchema = getFAQSchema(streamingFaqs)

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
            <span>{symbol} Streaming Subscribers</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Streaming Subscribers {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Subscriber growth analysis and forecasts for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Key Streaming Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Subscriber Growth Drivers</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Original content investments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>International market expansion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Platform improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Pricing optimization</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Growth Headwinds</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Market saturation in developed regions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Increased competition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Password sharing crackdowns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Economic pressures on consumers</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Streaming Subscriber Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Regional Growth Dynamics</h3>
                <p className="text-muted-foreground">
                  Streaming platforms typically show varying growth rates across regions. Mature markets like
                  North America often see slower subscriber growth but higher ARPU, while emerging markets
                  show stronger subscriber additions at lower ARPU. Understanding regional dynamics is crucial
                  for evaluating {symbol}'s streaming potential.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Content Strategy Impact</h3>
                <p className="text-muted-foreground">
                  Original content investments directly impact subscriber acquisition and retention. Hit shows
                  and exclusive content drive subscriber spikes, while consistent quality programming reduces
                  churn. {symbol}'s content pipeline and strategy significantly influence subscriber trends.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, streaming metrics, and detailed valuations
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
              {streamingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Streaming subscriber metrics are subject to change and may vary by reporting period. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="streaming-subs" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
