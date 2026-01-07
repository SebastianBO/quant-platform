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
    title: `${symbol} Original Content ${currentYear} - Production Spend & Strategy`,
    description: `${symbol} original content investment analysis including production budgets, content slate, and ${currentYear} originals strategy.`,
    keywords: [
      `${symbol} original content`,
      `${symbol} content spend`,
      `${symbol} original programming`,
      `${symbol} production budget`,
      `${symbol} content investment ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Original Content ${currentYear} | Production Investment`,
      description: `Complete ${symbol} original content analysis with production budgets and programming strategy.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/original-content/${ticker.toLowerCase()}`,
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

export default async function OriginalContentPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/original-content/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Original Content FAQs
  const originalContentFaqs = [
    {
      question: `How much does ${symbol} spend on original content?`,
      answer: `${symbol} (${companyName}) content budget includes production costs for original programming, talent fees, marketing expenses, and post-production costs. Total content spend is disclosed in financial statements and earnings calls. Content budgets typically range from billions annually for major streaming platforms.`
    },
    {
      question: `Why does ${symbol} invest in original content?`,
      answer: `Original content provides ${symbol} with platform exclusivity, reduced licensing dependency, full ownership rights, merchandising opportunities, and brand differentiation. Successful originals drive subscriber acquisition, reduce churn, and create long-term library value. Originals also enable international distribution without licensing restrictions.`
    },
    {
      question: `How does ${symbol}'s content spend compare to competitors?`,
      answer: `${symbol}'s content budget should be evaluated relative to subscriber base and revenue. Content spend per subscriber and content spend as percentage of revenue provide meaningful comparisons. Leading ${industry || 'streaming'} platforms invest heavily in originals to drive differentiation and reduce third-party content dependency.`
    },
    {
      question: `Is ${symbol}'s original content strategy working?`,
      answer: `Original content success for ${symbol} is measured by viewing hours, critical acclaim, awards, subscriber impact, and content ROI. Hit shows drive subscriber growth and retention, while flops represent sunk costs. The most successful platforms achieve high content efficiency, generating strong engagement per dollar invested.`
    },
    {
      question: `What types of original content does ${symbol} produce?`,
      answer: `${symbol}'s original content slate typically includes scripted series, films, documentaries, stand-up specials, reality programming, and international productions. Genre diversity across drama, comedy, thriller, sci-fi, kids content, and more aims to appeal to broad subscriber demographics and global markets.`
    },
    {
      question: `What is ${symbol}'s original content forecast for ${currentYear}?`,
      answer: `${symbol}'s ${currentYear} content plans depend on production budgets, content slate announcements, and strategic priorities. Look for earnings guidance, investor presentations, and content showcases for upcoming original programming. Content investment trends indicate platform strategy and growth ambitions.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Original Content`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Original Content ${currentYear} - Production Spend & Strategy`,
    description: `Comprehensive original content analysis for ${symbol} (${companyName}) with production budgets and programming insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} original content`,
      `${symbol} content spend`,
      `${symbol} original programming`,
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

  const faqSchema = getFAQSchema(originalContentFaqs)

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
            <span>{symbol} Original Content</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Original Content {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production investment and content strategy for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Original Content Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Benefits of Original Content</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Platform exclusivity and differentiation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Full ownership and perpetual rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>No licensing expiration risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Merchandising and IP opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>International distribution flexibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Long-term library value creation</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Original Content Risks</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>High upfront production costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Uncertain audience reception</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Development and production time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Talent and production cost inflation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Hit-driven business model volatility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Content saturation across platforms</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Content Investment Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Content Spend Economics</h3>
                <p className="text-muted-foreground">
                  Streaming platforms like {symbol} face a critical challenge: content costs are front-loaded while
                  returns accrue over time through subscriber retention and acquisition. Unlike traditional studios
                  that monetize content through theatrical, home video, and licensing windows, streaming platforms
                  must generate ROI primarily through subscriber value. This requires careful content portfolio
                  management and data-driven greenlight decisions.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">The Originals Arms Race</h3>
                <p className="text-muted-foreground">
                  Competition among streaming platforms has driven an originals arms race, with major players
                  collectively spending tens of billions annually on content production. This inflation benefits
                  talent and production companies but pressures streaming platforms to achieve efficiency. For
                  {symbol}, balancing content quality and quantity with sustainable unit economics determines
                  long-term profitability.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Measuring Content ROI</h3>
                <p className="text-muted-foreground">
                  Content ROI extends beyond viewing hours to include subscriber acquisition impact, churn reduction,
                  brand perception, awards and critical acclaim, and long-term library value. A hit show might cost
                  $200 million but drive millions in subscriber additions and retention value. {symbol}'s ability to
                  consistently greenlight high-ROI content separates winners from losers in streaming economics.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, content investment metrics, and detailed valuations
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
              {originalContentFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Content investment metrics are subject to change and may vary by reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="original-content" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
