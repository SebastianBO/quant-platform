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
    title: `${symbol} Home Improvement Trends - Market Analysis ${currentYear}`,
    description: `${symbol} home improvement market trends: project types, spending patterns, seasonal trends, market growth. Analyze ${symbol}'s position in home improvement market.`,
    keywords: [
      `${symbol} home improvement`,
      `${symbol} market trends`,
      `${symbol} home services`,
      `${symbol} renovation market`,
      `${symbol} remodeling trends`,
    ],
    openGraph: {
      title: `${symbol} Home Improvement Trends ${currentYear} | Market Analysis`,
      description: `Complete ${symbol} home improvement market analysis with trends, spending patterns, and growth opportunities.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/home-improvement/${ticker.toLowerCase()}`,
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

export default async function HomeImprovementPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/home-improvement/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How does ${symbol} benefit from home improvement trends?`,
      answer: `${companyName} operates in the home improvement marketplace, connecting homeowners with service professionals. Growth in home improvement spending, remodeling activity, and home values directly drives demand for ${symbol}'s services.`
    },
    {
      question: `What home improvement categories does ${symbol} serve?`,
      answer: `${symbol} typically serves multiple home improvement categories including interior remodeling, exterior work, landscaping, HVAC, plumbing, electrical, roofing, and various other home maintenance and improvement services.`
    },
    {
      question: `Is the home improvement market growing?`,
      answer: `The home improvement market has shown resilient growth driven by aging housing stock, rising home values, remote work trends, and homeowner investment in property improvements. ${symbol} is positioned to benefit from this secular growth trend.`
    },
    {
      question: `How do economic conditions affect ${symbol}'s home improvement business?`,
      answer: `${symbol}'s business is influenced by factors including home values, consumer confidence, interest rates, employment levels, and discretionary spending. Strong housing markets and economic conditions generally support higher home improvement activity.`
    },
    {
      question: `What are the seasonal trends in home improvement?`,
      answer: `Home improvement activity typically shows seasonal patterns with peak demand in spring and summer for exterior projects and landscaping. ${symbol}'s business may reflect these seasonal trends in lead volume and project types.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Home Improvement`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Home Improvement Trends ${currentYear} - Market Analysis`,
    description: `Complete home improvement market analysis for ${symbol} (${companyName}) with trends and growth opportunities.`,
    url: pageUrl,
    keywords: [
      `${symbol} home improvement`,
      `${symbol} market trends`,
      `${symbol} home services`,
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

  const faqSchema = getFAQSchema(faqs)

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
            <span>{symbol} Home Improvement</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Home Improvement Trends {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Home improvement market trends and analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-teal-600/20 to-green-600/20 p-8 rounded-xl border border-teal-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Sector</p>
                <p className="text-2xl font-bold">Home Improvement</p>
                <p className="text-sm text-muted-foreground mt-1">Residential services marketplace</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Opportunity</p>
                <p className="text-2xl font-bold">Secular Growth</p>
                <p className="text-sm text-muted-foreground mt-1">Long-term tailwinds</p>
              </div>
            </div>
          </div>

          {/* Market Trends */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Home Improvement Market Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Aging Housing Stock</h3>
                <p className="text-muted-foreground">Older homes require more maintenance and renovation, driving sustained demand</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Home Value Appreciation</h3>
                <p className="text-muted-foreground">Rising home values encourage homeowners to invest in improvements</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Remote Work Impact</h3>
                <p className="text-muted-foreground">Work-from-home trends drive home office and living space improvements</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Energy Efficiency</h3>
                <p className="text-muted-foreground">Growing focus on energy-efficient upgrades and sustainable improvements</p>
              </div>
            </div>
          </section>

          {/* Project Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Popular Home Improvement Categories</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>Interior Remodeling:</strong> Kitchen, bathroom, and basement renovations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>Exterior Work:</strong> Roofing, siding, windows, and door replacements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>Landscaping:</strong> Yard design, hardscaping, and outdoor living spaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>HVAC Systems:</strong> Heating, cooling, and ventilation upgrades</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>Plumbing & Electrical:</strong> System repairs, upgrades, and installations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span><strong>Flooring:</strong> Hardwood, tile, carpet, and other flooring installations</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Market Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Growth Drivers for Home Improvement</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Demographic Trends</h3>
                  <p className="text-muted-foreground">Millennials entering homeownership and baby boomers aging in place drive different project types</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Economic Factors</h3>
                  <p className="text-muted-foreground">Consumer confidence, home equity, and disposable income influence spending levels</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Technology Adoption</h3>
                  <p className="text-muted-foreground">Smart home technology and modern amenities drive upgrade cycles</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Maintenance Needs</h3>
                  <p className="text-muted-foreground">Regular maintenance and unexpected repairs provide steady baseline demand</p>
                </div>
              </div>
            </div>
          </section>

          {/* Seasonal Patterns */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Seasonal Activity Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Spring/Summer Peak</h3>
                <p className="text-muted-foreground">Exterior projects, landscaping, and outdoor work dominate warmer months</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Fall/Winter Activity</h3>
                <p className="text-muted-foreground">Interior renovations, HVAC upgrades, and weatherization projects increase</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, growth trends, and AI-powered insights
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
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Home improvement market trends are based on industry data and analysis. Company-specific impacts may vary. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="home-improvement" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
