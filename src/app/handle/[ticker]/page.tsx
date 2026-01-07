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
    title: `${symbol} Sports Betting Handle - Quarterly & Annual Handle Data ${currentYear}`,
    description: `${symbol} sports betting handle analysis: total handle, handle growth, quarterly trends, market share. Track ${symbol}'s betting volume and market performance.`,
    keywords: [
      `${symbol} handle`,
      `${symbol} sports betting handle`,
      `${symbol} betting volume`,
      `${symbol} handle growth`,
      `${symbol} quarterly handle`,
      `${symbol} sports betting market share`,
    ],
    openGraph: {
      title: `${symbol} Sports Betting Handle ${currentYear} | Quarterly & Annual Data`,
      description: `Complete ${symbol} sports betting handle analysis with quarterly trends, growth rates, and market share.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/handle/${ticker.toLowerCase()}`,
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

export default async function HandlePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, quarterlyMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/handle/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock handle data - in production, this would come from your API
  const latestHandle = metrics?.handle || 0
  const handleGrowth = metrics?.handle_growth || 0
  const marketShare = metrics?.market_share || 0
  const latestPeriod = 'Q4 2024'

  // Generate handle FAQs
  const handleFaqs = [
    {
      question: `What is ${symbol}'s sports betting handle?`,
      answer: latestHandle
        ? `${symbol} (${companyName}) reported ${latestHandle >= 1e9 ? `$${(latestHandle / 1e9).toFixed(2)} billion` : `$${(latestHandle / 1e6).toFixed(0)} million`} in sports betting handle for ${latestPeriod}. ${handleGrowth > 0 ? `This represents a ${(handleGrowth * 100).toFixed(1)}% increase compared to the previous period.` : ''}`
        : `Handle data for ${symbol} is currently being updated.`
    },
    {
      question: `What is sports betting handle?`,
      answer: `Sports betting handle is the total amount of money wagered by customers on a sportsbook platform. It represents the gross betting volume before any winnings are paid out. Handle is a key metric for understanding the scale of a sports betting operator's business.`
    },
    {
      question: `Is ${symbol} handle growing?`,
      answer: handleGrowth > 0
        ? `Yes, ${symbol}'s sports betting handle is growing. The company achieved ${(handleGrowth * 100).toFixed(1)}% handle growth quarter-over-quarter, indicating strong customer engagement and market expansion.`
        : handleGrowth < 0
        ? `${symbol}'s handle declined ${Math.abs(handleGrowth * 100).toFixed(1)}% quarter-over-quarter. This could be due to seasonality, increased competition, or regulatory changes in key markets.`
        : `${symbol}'s handle has remained relatively flat quarter-over-quarter.`
    },
    {
      question: `How does ${symbol} handle compare to competitors?`,
      answer: marketShare > 0
        ? `${symbol} holds approximately ${(marketShare * 100).toFixed(1)}% market share in sports betting handle. Compare ${symbol} to competitors like DraftKings (DKNG) and Flutter (FLUT) to see relative market positioning.`
        : `${symbol} operates in the ${sector || 'sports betting'} sector. Use our comparison tool to analyze handle metrics against industry competitors.`
    },
    {
      question: `What drives ${symbol}'s handle growth?`,
      answer: `Handle growth for ${symbol} is driven by several factors: expansion into new states, customer acquisition, increased marketing spend, major sporting events, product improvements, and overall sports betting market growth. State-by-state legalization continues to be a key driver of handle expansion.`
    },
    {
      question: `Why is handle important for sports betting stocks?`,
      answer: `Handle is a critical metric because it directly correlates with revenue potential. While handle doesn't equal revenue (which depends on hold rate), higher handle indicates more customer engagement and market presence. Investors track handle growth as a leading indicator of revenue and market share trends.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Handle`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Sports Betting Handle ${currentYear} - Quarterly & Annual Analysis`,
    description: `Complete handle analysis for ${symbol} (${companyName}) with quarterly trends, growth rates, and market share data.`,
    url: pageUrl,
    keywords: [
      `${symbol} handle`,
      `${symbol} sports betting`,
      `${symbol} betting volume`,
      `${symbol} handle growth`,
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

  const faqSchema = getFAQSchema(handleFaqs)

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
            <span>{symbol} Handle</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Sports Betting Handle {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Quarterly and annual handle data for {companyName}
          </p>

          {/* Latest Handle Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Latest Handle</p>
                <p className="text-3xl font-bold">
                  {latestHandle >= 1e9
                    ? `$${(latestHandle / 1e9).toFixed(2)}B`
                    : `$${(latestHandle / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{latestPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">QoQ Growth</p>
                <p className={`text-3xl font-bold ${handleGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {handleGrowth >= 0 ? '+' : ''}{(handleGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">vs. previous quarter</p>
              </div>
              {marketShare > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Market Share</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {(marketShare * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">of US market</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Handle Performance Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-6">
                Handle represents the total amount wagered on {companyName}'s sportsbook platform.
                This is a key indicator of market penetration and customer engagement.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Handle</p>
                  <p className="text-2xl font-bold">
                    {latestHandle >= 1e9
                      ? `$${(latestHandle / 1e9).toFixed(2)}B`
                      : `$${(latestHandle / 1e6).toFixed(0)}M`}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                  <p className={`text-2xl font-bold ${handleGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {handleGrowth >= 0 ? '+' : ''}{(handleGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Sports Betting Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete sports betting metrics, hold rates, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Full Financials
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {handleFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Sports betting handle data is based on publicly reported metrics and regulatory filings. Handle figures may vary by reporting period and jurisdiction. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="handle" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
