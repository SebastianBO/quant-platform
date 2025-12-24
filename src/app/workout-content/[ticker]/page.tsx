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
    title: `${symbol} Workout Content - Content Library & Production ${currentYear}`,
    description: `${symbol} workout content analysis: content library size, new content production, instructor roster, and engagement. Analyze ${symbol}'s fitness content strategy.`,
    keywords: [
      `${symbol} workout content`,
      `${symbol} fitness classes`,
      `${symbol} workout library`,
      `${symbol} fitness content`,
      `${symbol} exercise classes`,
      `${symbol} instructors`,
    ],
    openGraph: {
      title: `${symbol} Workout Content ${currentYear} | Content Library & Production`,
      description: `Complete ${symbol} workout content analysis with library size, production rate, and engagement metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/workout-content/${ticker.toLowerCase()}`,
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

export default async function WorkoutContentPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/workout-content/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate workout content FAQs
  const workoutContentFaqs = [
    {
      question: `How much workout content does ${symbol} have?`,
      answer: `${companyName}'s content library includes thousands of on-demand workouts, live classes, and training programs across various fitness disciplines. The size of the content library is a key differentiator in the digital fitness market.`
    },
    {
      question: `How often does ${symbol} release new workout content?`,
      answer: `Content production rate affects subscriber engagement and retention. Companies typically release new classes daily or weekly. ${symbol}'s content calendar may include live sessions and pre-recorded workouts added regularly.`
    },
    {
      question: `What types of workout content does ${symbol} offer?`,
      answer: `Fitness platforms typically offer diverse content including cycling, running, strength training, yoga, meditation, stretching, and more. ${symbol}'s content mix caters to different fitness levels and preferences.`
    },
    {
      question: `Who are the instructors for ${symbol}'s workout content?`,
      answer: `Instructors are key to subscriber engagement and brand loyalty. ${symbol} recruits talented fitness professionals who become recognized personalities within the platform's community.`
    },
    {
      question: `How does ${symbol} measure workout content engagement?`,
      answer: `Content engagement metrics include completion rates, repeat viewership, instructor popularity, and workout ratings. High engagement indicates content quality and drives subscriber retention.`
    },
    {
      question: `How does ${symbol}'s content compare to competitors?`,
      answer: `Compare ${symbol} to platforms like Peloton, Apple Fitness+, or Beachbody to evaluate content variety, production quality, instructor appeal, and overall library depth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Workout Content`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Workout Content ${currentYear} - Content Library & Production Analysis`,
    description: `Complete workout content analysis for ${symbol} (${companyName}) with library size, production rate, and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} workout content`,
      `${symbol} fitness classes`,
      `${symbol} workout library`,
      `${symbol} fitness content`,
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

  const faqSchema = getFAQSchema(workoutContentFaqs)

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
            <span>{symbol} Workout Content</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Workout Content {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Content library and production analysis for {companyName}
          </p>

          {/* Workout Content Overview */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Workout Content Library Overview</h2>
            <p className="text-muted-foreground">
              {companyName}'s workout content library is the core of its digital fitness offering,
              providing subscribers with diverse workouts, live classes, and training programs.
              Content depth, variety, and production quality drive subscriber acquisition, engagement,
              and retention. Check investor presentations for content metrics.
            </p>
          </div>

          {/* Key Content Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Content Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Total Content Library</h3>
                <p className="text-muted-foreground">
                  Number of on-demand workouts and classes available to subscribers across all fitness categories.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">New Content Production</h3>
                <p className="text-muted-foreground">
                  Rate of new class releases and live sessions, keeping the platform fresh and engaging.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Content Categories</h3>
                <p className="text-muted-foreground">
                  Variety of workout types offered (cycling, strength, yoga, meditation, etc.), catering to different preferences.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Instructor Roster</h3>
                <p className="text-muted-foreground">
                  Number and quality of fitness instructors who create content and build community engagement.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Content Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, content trends, and AI-powered insights
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
              {workoutContentFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Content data is based on publicly available information. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="workout-content" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
