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
    title: `${symbol} Personal Training - PT Revenue & Attachment Rate ${currentYear}`,
    description: `${symbol} personal training analysis: PT revenue, attachment rate, trainer count, and pricing. Analyze ${symbol}'s high-margin personal training business.`,
    keywords: [
      `${symbol} personal training`,
      `${symbol} PT revenue`,
      `${symbol} personal trainers`,
      `${symbol} training sessions`,
      `${symbol} PT attachment`,
      `${symbol} trainer count`,
    ],
    openGraph: {
      title: `${symbol} Personal Training ${currentYear} | PT Revenue & Attachment Rate`,
      description: `Complete ${symbol} personal training analysis with PT revenue, attachment rate, and trainer metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/personal-training/${ticker.toLowerCase()}`,
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

export default async function PersonalTrainingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/personal-training/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate personal training FAQs
  const personalTrainingFaqs = [
    {
      question: `How much revenue does ${symbol} generate from personal training?`,
      answer: `Personal training (PT) is a high-margin revenue stream for ${companyName}. PT revenue is often disclosed in earnings reports as ancillary or service revenue. This includes one-on-one sessions, small group training, and specialized coaching programs.`
    },
    {
      question: `What is ${symbol}'s personal training attachment rate?`,
      answer: `PT attachment rate is the percentage of gym members who purchase personal training services. Higher attachment rates indicate effective sales, quality trainers, and strong member engagement. Typical rates range from 5-15%.`
    },
    {
      question: `How many personal trainers does ${symbol} employ?`,
      answer: `Trainer count affects PT capacity and service quality. ${symbol} may employ trainers as full-time staff or independent contractors. Trainer-to-member ratios impact service availability and revenue potential.`
    },
    {
      question: `What is the average price of personal training at ${symbol}?`,
      answer: `PT pricing varies by market, session format (individual vs. small group), and trainer experience. Premium gyms command higher rates. ${symbol}'s pricing strategy affects both PT revenue and accessibility.`
    },
    {
      question: `Why is personal training important for ${symbol}?`,
      answer: `PT generates high-margin revenue, increases member retention, and differentiates the gym from budget competitors. Members with trainers are significantly less likely to cancel memberships, boosting lifetime value.`
    },
    {
      question: `How does ${symbol}'s PT business compare to competitors?`,
      answer: `Compare ${symbol} to other gyms on PT attachment rate, pricing, trainer quality, and total PT revenue. Successful PT programs can represent 20-30% or more of total revenue for premium fitness facilities.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Personal Training`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Personal Training ${currentYear} - PT Revenue & Attachment Analysis`,
    description: `Complete personal training analysis for ${symbol} (${companyName}) with PT revenue, attachment rate, and trainer metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} personal training`,
      `${symbol} PT revenue`,
      `${symbol} personal trainers`,
      `${symbol} PT attachment`,
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

  const faqSchema = getFAQSchema(personalTrainingFaqs)

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
            <span>{symbol} Personal Training</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Personal Training {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            PT revenue and attachment rate analysis for {companyName}
          </p>

          {/* Personal Training Overview */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 p-8 rounded-xl border border-yellow-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Personal Training Business Overview</h2>
            <p className="text-muted-foreground">
              Personal training is a critical high-margin revenue stream for {companyName}.
              PT services command premium pricing, improve member retention, and enhance the overall
              gym experience. PT attachment rates, trainer count, and session pricing are key metrics
              for evaluating this segment. Review earnings calls for PT performance updates.
            </p>
          </div>

          {/* Key PT Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Personal Training Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">PT Revenue</h3>
                <p className="text-muted-foreground">
                  Total revenue from personal training sessions, packages, and small group training programs.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">PT Attachment Rate</h3>
                <p className="text-muted-foreground">
                  Percentage of members who purchase personal training, indicating sales effectiveness and member engagement.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Trainer Count</h3>
                <p className="text-muted-foreground">
                  Number of certified personal trainers on staff, affecting PT capacity and service quality.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average PT Price</h3>
                <p className="text-muted-foreground">
                  Average price per training session, reflecting pricing power and market positioning.
                </p>
              </div>
            </div>
          </section>

          {/* PT Impact on Business */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Personal Training Matters</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">High Profit Margins</h3>
                <p className="text-muted-foreground">
                  PT services typically have 50-70% gross margins, significantly higher than basic membership dues.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Increased Retention</h3>
                <p className="text-muted-foreground">
                  Members with trainers are 2-3x less likely to cancel, improving lifetime value and revenue stability.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Differentiation</h3>
                <p className="text-muted-foreground">
                  Quality PT programs differentiate gyms from budget competitors and justify premium pricing.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} PT Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, PT trends, and AI-powered insights
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
              {personalTrainingFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> PT data is based on publicly available information and company disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="personal-training" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
