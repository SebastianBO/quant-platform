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
    title: `${symbol} Gym Memberships - Member Count & Growth ${currentYear}`,
    description: `${symbol} gym memberships analysis: total members, membership growth, member retention, and trends. Analyze ${symbol}'s membership base and expansion.`,
    keywords: [
      `${symbol} gym memberships`,
      `${symbol} members`,
      `${symbol} membership count`,
      `${symbol} member growth`,
      `${symbol} fitness members`,
      `${symbol} gym subscribers`,
    ],
    openGraph: {
      title: `${symbol} Gym Memberships ${currentYear} | Member Count & Growth`,
      description: `Complete ${symbol} gym membership analysis with member count, growth trends, and retention metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/gym-memberships/${ticker.toLowerCase()}`,
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

export default async function GymMembershipsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/gym-memberships/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate gym membership FAQs
  const gymMembershipFaqs = [
    {
      question: `How many gym memberships does ${symbol} have?`,
      answer: `${companyName} operates fitness facilities with members across multiple locations. For the most current membership count, check the latest earnings reports and investor presentations.`
    },
    {
      question: `Is ${symbol}'s gym membership growing?`,
      answer: `Gym membership growth is a key metric for fitness companies. ${symbol}'s membership trends can be tracked through quarterly earnings reports, which detail member additions, cancellations, and net growth.`
    },
    {
      question: `What types of gym memberships does ${symbol} offer?`,
      answer: `${companyName} typically offers various membership tiers including basic gym access, premium memberships with additional amenities, and family plans. Specific offerings vary by location and market.`
    },
    {
      question: `How does ${symbol} retain gym members?`,
      answer: `Member retention is crucial for gym profitability. ${symbol} employs various strategies including quality facilities, engaging classes, personal training services, and community-building initiatives to maintain high retention rates.`
    },
    {
      question: `What is ${symbol}'s membership churn rate?`,
      answer: `Membership churn (attrition) rates indicate how many members cancel their memberships. Lower churn rates suggest better member satisfaction and stronger business performance. Check investor disclosures for specific churn metrics.`
    },
    {
      question: `How does ${symbol} compare to competitors in membership?`,
      answer: `${symbol} competes with other fitness chains, boutique studios, and digital fitness platforms. Compare membership counts, growth rates, and retention metrics to evaluate ${symbol}'s competitive position in the fitness industry.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Gym Memberships`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Gym Memberships ${currentYear} - Member Count & Growth Analysis`,
    description: `Complete gym membership analysis for ${symbol} (${companyName}) with member count, growth trends, and retention metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} gym memberships`,
      `${symbol} members`,
      `${symbol} membership growth`,
      `${symbol} fitness subscribers`,
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

  const faqSchema = getFAQSchema(gymMembershipFaqs)

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
            <span>{symbol} Gym Memberships</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Gym Memberships {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Member count and growth analysis for {companyName}
          </p>

          {/* Gym Membership Metrics */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Membership Overview</h2>
            <p className="text-muted-foreground">
              Gym membership data is a critical metric for fitness companies like {companyName}.
              Member count, growth rates, and retention metrics provide insights into business health
              and customer satisfaction. Check the latest earnings reports for detailed membership statistics.
            </p>
          </div>

          {/* Key Membership Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Membership Metrics to Track</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Total Memberships</h3>
                <p className="text-muted-foreground">
                  The total number of active gym members across all locations, indicating overall business scale.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Net Member Growth</h3>
                <p className="text-muted-foreground">
                  New memberships minus cancellations, showing whether the member base is expanding or contracting.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Member Retention Rate</h3>
                <p className="text-muted-foreground">
                  Percentage of members who renew their memberships, indicating customer satisfaction and loyalty.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Membership Mix</h3>
                <p className="text-muted-foreground">
                  Distribution across membership tiers (basic, premium, family), affecting average revenue per member.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Membership Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, membership trends, and AI-powered insights
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
              {gymMembershipFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Membership data is based on publicly filed reports and company disclosures. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="gym-memberships" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
