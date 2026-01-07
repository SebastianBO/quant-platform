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
    title: `${symbol} EV Market Share - Electric Vehicle Market Position ${currentYear}`,
    description: `${symbol} EV market share analysis: percentage of electric vehicle sales, market position, competitive landscape, regional market share, and growth trends.`,
    keywords: [
      `${symbol} market share`,
      `${symbol} EV market share`,
      `${symbol} electric vehicle sales`,
      `${symbol} market position`,
      `${symbol} competitive analysis`,
      `${symbol} EV sales percentage`,
    ],
    openGraph: {
      title: `${symbol} EV Market Share ${currentYear} | Market Position`,
      description: `Complete ${symbol} EV market share analysis with competitive positioning and trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ev-market-share/${ticker.toLowerCase()}`,
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

export default async function EVMarketSharePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ev-market-share/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate EV market share FAQs
  const evMarketShareFaqs = [
    {
      question: `What is ${symbol}'s EV market share?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'competes in the electric vehicle market' : 'is involved in the EV industry'}. Market share is calculated as the percentage of total EV sales captured by the company in specific regions or globally.`
    },
    {
      question: `Is ${symbol}'s EV market share growing?`,
      answer: `${companyName}'s market share trends depend on delivery growth relative to overall EV market expansion. Growing market share indicates competitive strength, while declining share may signal increased competition or market challenges.`
    },
    {
      question: `How does ${symbol} compare to EV competitors?`,
      answer: `${symbol} competes with other automotive manufacturers and EV-focused companies. Market share comparisons help assess competitive positioning, brand strength, and growth trajectory relative to industry leaders.`
    },
    {
      question: `What regions does ${symbol} have the strongest EV market share?`,
      answer: `Market share varies by geography. ${companyName} may have stronger presence in certain regions like North America, Europe, or China based on factory locations, brand recognition, and regulatory support.`
    },
    {
      question: `Why does ${symbol}'s EV market share matter?`,
      answer: `Market share indicates competitive position, brand strength, and revenue potential. High market share provides pricing power, economies of scale, and demonstrates product-market fit. Growing share suggests successful execution and market acceptance.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} EV Market Share`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EV Market Share ${currentYear} - Competitive Position Analysis`,
    description: `Complete EV market share analysis for ${symbol} (${companyName}) with competitive positioning.`,
    url: pageUrl,
    keywords: [
      `${symbol} market share`,
      `${symbol} EV market share`,
      `${symbol} competitive analysis`,
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

  const faqSchema = getFAQSchema(evMarketShareFaqs)

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
            <span>{symbol} EV Market Share</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EV Market Share {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Electric vehicle market position and competitive analysis for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 p-8 rounded-xl border border-teal-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">EV Market Share</p>
                <p className="text-sm text-muted-foreground mt-1">Competitive Position</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EV Market Share Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                EV market share represents the percentage of total electric vehicle sales captured by a company
                in a given market or time period. This metric measures competitive strength, brand appeal, and
                execution effectiveness in the rapidly growing electric vehicle industry.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, market share trends indicate whether the company is gaining or losing ground
                to competitors, winning customer preference, and successfully scaling production to meet demand.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why EV Market Share Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Position</h3>
                <p className="text-sm text-muted-foreground">
                  Market share reflects competitive strength and market acceptance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Revenue Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Higher market share in a growing market drives revenue expansion.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Economies of Scale</h3>
                <p className="text-sm text-muted-foreground">
                  Market leadership enables cost advantages through production scale.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Brand Strength</h3>
                <p className="text-sm text-muted-foreground">
                  Market share demonstrates brand recognition and customer loyalty.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 p-8 rounded-xl border border-teal-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, market position, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evMarketShareFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Market share data is based on industry reports and company disclosures. Market conditions change rapidly. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ev-market-share" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
