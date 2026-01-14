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
    title: `${symbol} Content Library ${currentYear} - Size, Quality & Strategy Analysis`,
    description: `${symbol} content library analysis including catalog size, content mix, genre diversity, and ${currentYear} content strategy.`,
    keywords: [
      `${symbol} content library`,
      `${symbol} content catalog`,
      `${symbol} streaming content`,
      `${symbol} content size`,
      `${symbol} content library ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Content Library ${currentYear} | Catalog Analysis`,
      description: `Complete ${symbol} content library analysis with catalog size, diversity, and quality metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/content-library/${ticker.toLowerCase()}`,
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

export default async function ContentLibraryPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/content-library/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Content Library FAQs
  const contentFaqs = [
    {
      question: `How large is ${symbol}'s content library?`,
      answer: `${symbol} (${companyName}) content library size includes total hours of viewing content, number of titles, and content diversity across genres and formats. Library size is typically disclosed in earnings presentations and investor materials. Catalog size influences subscriber retention and engagement.`
    },
    {
      question: `What types of content does ${symbol} offer?`,
      answer: `${symbol}'s content mix typically includes movies, TV series, documentaries, stand-up specials, and original programming. Genre diversity spans drama, comedy, action, thriller, documentary, kids & family, international content, and more. Content variety drives broad subscriber appeal across demographics.`
    },
    {
      question: `How does ${symbol}'s content library compare to competitors?`,
      answer: `${symbol}'s content catalog should be evaluated against competitors in the ${industry || 'streaming'} space based on total hours, title count, original content ratio, exclusive content, and content freshness. Larger libraries provide more viewing options but quality matters more than pure quantity.`
    },
    {
      question: `Is ${symbol} growing its content library?`,
      answer: `Content library growth for ${symbol} depends on content acquisition budgets, original production investments, licensing agreements, and content removal rates. Growing libraries indicate ongoing investment in subscriber value, though profitability requires balancing content spending with subscriber and revenue growth.`
    },
    {
      question: `How much does ${symbol} spend on content?`,
      answer: `${symbol}'s content spending includes production budgets for originals, licensing fees for third-party content, and marketing costs. Content budgets are disclosed in financial statements and investor presentations. Higher content spending aims to drive subscriber growth and retention but must deliver ROI.`
    },
    {
      question: `What is ${symbol}'s content strategy for ${currentYear}?`,
      answer: `${symbol}'s content strategy typically focuses on original programming investments, genre diversification, international content expansion, franchise development, and content localization. Strategic priorities aim to differentiate the platform, reduce dependency on licensed content, and improve content ROI.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Content Library`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Content Library ${currentYear} - Size, Quality & Strategy Analysis`,
    description: `Comprehensive content library analysis for ${symbol} (${companyName}) with catalog metrics and content strategy insights.`,
    url: pageUrl,
    keywords: [
      `${symbol} content library`,
      `${symbol} content catalog`,
      `${symbol} streaming content`,
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

  const faqSchema = getFAQSchema(contentFaqs)

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
            <span>{symbol} Content Library</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Content Library {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Content catalog size and strategy analysis for {companyName}
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
            <h2 className="text-2xl font-bold mb-4">Content Library Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Library Strengths</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Diverse genre coverage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Exclusive original content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>International content offerings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Regular new releases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Popular franchises and IP</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Content Challenges</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Rising content production costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Licensing cost inflation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Content removal/expiration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Hit-or-miss original content ROI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Regional licensing restrictions</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Content Library Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2">Quality vs Quantity</h3>
                <p className="text-muted-foreground">
                  Content library size matters, but quality and engagement drive subscriber retention. A smaller
                  library of highly engaging content can outperform a massive catalog of low-quality titles.
                  Successful streaming platforms like {symbol} balance catalog breadth with content quality,
                  focusing on titles that drive viewing hours and subscriber satisfaction.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Original vs Licensed Content</h3>
                <p className="text-muted-foreground">
                  The shift toward original content reduces licensing dependency and creates platform exclusivity.
                  Originals provide differentiation, full ownership rights, and long-term value. However, original
                  production requires significant upfront investment with uncertain returns. {symbol}'s content
                  strategy must balance original investments with licensed content acquisition for catalog breadth.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Content ROI Measurement</h3>
                <p className="text-muted-foreground">
                  Content ROI is measured by viewing hours, subscriber acquisition impact, retention improvement,
                  and cost per hour of engagement. Hit shows justify high production budgets through subscriber
                  growth and retention, while underperforming content drags down content efficiency. For {symbol},
                  content analytics and data-driven greenlight decisions improve overall content ROI.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Real-Time {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access live financial data, content metrics, and detailed valuations
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
              {contentFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> This analysis is based on publicly available data and should not be considered financial advice. Content library metrics are subject to change and may vary by region and reporting methodology. Always conduct your own research and consult a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="content-library" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
