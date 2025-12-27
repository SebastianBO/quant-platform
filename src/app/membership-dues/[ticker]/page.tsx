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
    title: `${symbol} Membership Dues - Average Price & Revenue Per Member ${currentYear}`,
    description: `${symbol} membership dues analysis: average membership price, ARPM (revenue per member), pricing tiers, and dues growth. Analyze ${symbol}'s pricing strategy.`,
    keywords: [
      `${symbol} membership dues`,
      `${symbol} membership price`,
      `${symbol} ARPM`,
      `${symbol} average membership`,
      `${symbol} pricing`,
      `${symbol} membership cost`,
    ],
    openGraph: {
      title: `${symbol} Membership Dues ${currentYear} | Average Price & Revenue Per Member`,
      description: `Complete ${symbol} membership dues analysis with average pricing, ARPM trends, and tier breakdown.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/membership-dues/${ticker.toLowerCase()}`,
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

export default async function MembershipDuesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/membership-dues/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate membership dues FAQs
  const membershipDuesFaqs = [
    {
      question: `What is the average membership price at ${symbol}?`,
      answer: `${companyName}'s average membership dues (ARPM - Average Revenue Per Member) reflects pricing across all membership tiers. This metric is calculated by dividing total membership revenue by member count and provides insight into pricing strategy and value positioning.`
    },
    {
      question: `How much does a ${symbol} membership cost?`,
      answer: `${symbol} typically offers multiple membership tiers at different price points (basic, premium, family, etc.). Specific pricing varies by location, membership type, and included amenities. Check the company's website for current pricing in your area.`
    },
    {
      question: `Is ${symbol} increasing membership prices?`,
      answer: `Price increases help offset inflation and improve margins. ${symbol} may implement annual or periodic price increases for new and existing members. Track ARPM trends in quarterly reports to see pricing momentum.`
    },
    {
      question: `What membership tiers does ${symbol} offer?`,
      answer: `Most gym companies offer tiered memberships with varying access levels, amenities, and pricing. ${symbol} may provide basic access, premium tiers with additional locations or classes, and family plans. Mix shifts affect overall ARPM.`
    },
    {
      question: `What is ${symbol}'s ARPM (Average Revenue Per Member)?`,
      answer: `ARPM is total membership revenue divided by member count, showing average monthly or annual revenue per member. Rising ARPM indicates successful price increases, tier upgrades, or improved pricing power.`
    },
    {
      question: `How does ${symbol}'s pricing compare to competitors?`,
      answer: `Compare ${symbol} to budget gyms (often $10-20/month), mid-tier chains ($30-60/month), and premium facilities ($100+/month). ${symbol}'s pricing reflects its value proposition, facilities, and target market.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Membership Dues`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Membership Dues ${currentYear} - Average Price & Revenue Per Member`,
    description: `Complete membership dues analysis for ${symbol} (${companyName}) with average pricing, ARPM trends, and tier breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} membership dues`,
      `${symbol} membership price`,
      `${symbol} ARPM`,
      `${symbol} average membership`,
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

  const faqSchema = getFAQSchema(membershipDuesFaqs)

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
            <span>{symbol} Membership Dues</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Membership Dues {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Average membership price and ARPM analysis for {companyName}
          </p>

          {/* Membership Dues Overview */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">Membership Dues Overview</h2>
            <p className="text-muted-foreground">
              Membership dues are the primary revenue driver for {companyName}.
              Average revenue per member (ARPM), pricing tiers, and price increase trends indicate
              pricing power, value perception, and revenue sustainability. Rising ARPM suggests
              successful price management and potential margin expansion. Review quarterly reports
              for ARPM trends and pricing strategy updates.
            </p>
          </div>

          {/* Key Pricing Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Membership Pricing Metrics</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Average Revenue Per Member (ARPM)</h3>
                <p className="text-muted-foreground">
                  Total membership revenue divided by member count, showing average monthly or annual dues per member.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Membership Tier Mix</h3>
                <p className="text-muted-foreground">
                  Distribution of members across basic, premium, and family tiers, affecting overall ARPM.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Price Increase Rate</h3>
                <p className="text-muted-foreground">
                  Annual or periodic membership price increases, helping offset inflation and improve margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Membership Dues Revenue</h3>
                <p className="text-muted-foreground">
                  Total recurring revenue from membership fees, the foundation of the gym's business model.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Strategy Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Factors Affecting Membership Pricing</h2>
            <div className="space-y-3">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Market Positioning</h3>
                <p className="text-muted-foreground">
                  Budget, mid-tier, or premium positioning determines base pricing levels and target demographics.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Amenities & Services</h3>
                <p className="text-muted-foreground">
                  Included features like pools, saunas, classes, and childcare justify higher membership fees.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Geographic Location</h3>
                <p className="text-muted-foreground">
                  Urban markets and affluent areas typically support higher pricing than suburban or rural locations.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Environment</h3>
                <p className="text-muted-foreground">
                  Local competition and market saturation influence pricing flexibility and member acquisition costs.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Pricing Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial statements, pricing trends, and AI-powered insights
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
              {membershipDuesFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Pricing data is based on publicly available information. Historical performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="membership-dues" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
