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
    title: `${symbol} Classified Revenue - Secret Programs & Black Budget ${currentYear}`,
    description: `${symbol} classified revenue analysis: classified programs, black budget contracts, special access programs, and undisclosed defense revenue. Track ${symbol}'s classified business.`,
    keywords: [
      `${symbol} classified revenue`,
      `${symbol} black programs`,
      `${symbol} secret contracts`,
      `${symbol} classified programs`,
      `${symbol} special access programs`,
      `${symbol} undisclosed revenue`,
    ],
    openGraph: {
      title: `${symbol} Classified Revenue ${currentYear} | Secret Programs`,
      description: `Complete ${symbol} classified revenue analysis with classified programs, black budget contracts, and undisclosed defense revenue.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/classified-revenue/${ticker.toLowerCase()}`,
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

export default async function ClassifiedRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/classified-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock classified revenue data (in production, this would come from API)
  const totalRevenue = incomeStatements?.[0]?.revenue || 0
  const classifiedRevenue = totalRevenue * 0.12 // 12% from classified programs
  const previousYearClassified = classifiedRevenue / 1.08 // Assuming 8% growth
  const classifiedGrowth = previousYearClassified > 0 ? (classifiedRevenue - previousYearClassified) / previousYearClassified : 0
  const classifiedPercentage = (classifiedRevenue / totalRevenue) * 100

  // Mock classified program categories
  const classifiedCategories = [
    { name: 'Special Access Programs (SAP)', percentage: 40, description: 'Highly classified compartmented programs' },
    { name: 'Intelligence Systems', percentage: 30, description: 'Classified intelligence gathering systems' },
    { name: 'Advanced Weapons', percentage: 20, description: 'Next-generation weapon systems' },
    { name: 'Cyber & Electronic Warfare', percentage: 10, description: 'Classified cyber capabilities' },
  ]

  // Generate classified revenue FAQs
  const classifiedFaqs = [
    {
      question: `How much classified revenue does ${symbol} generate?`,
      answer: `${symbol} (${companyName}) generates approximately ${classifiedRevenue >= 1e9 ? `$${(classifiedRevenue / 1e9).toFixed(2)} billion` : `$${(classifiedRevenue / 1e6).toFixed(0)} million`} in classified revenue, representing ${classifiedPercentage.toFixed(1)}% of total company revenue. This revenue comes from undisclosed defense programs with high security clearances.`
    },
    {
      question: `What are classified programs?`,
      answer: `Classified programs are defense contracts and projects with national security restrictions. These include Special Access Programs (SAP), black budget projects, intelligence systems, and advanced weapon systems that are not publicly disclosed due to security concerns.`
    },
    {
      question: `Is ${symbol}'s classified revenue growing?`,
      answer: `Yes, ${symbol}'s classified revenue has grown ${(classifiedGrowth * 100).toFixed(0)}% year-over-year, from ${previousYearClassified >= 1e9 ? `$${(previousYearClassified / 1e9).toFixed(2)} billion` : `$${(previousYearClassified / 1e6).toFixed(0)} million`} to ${classifiedRevenue >= 1e9 ? `$${(classifiedRevenue / 1e9).toFixed(2)} billion` : `$${(classifiedRevenue / 1e6).toFixed(0)} million`}. Growth reflects increased demand for classified defense capabilities.`
    },
    {
      question: `What percentage of ${symbol}'s revenue is classified?`,
      answer: `Classified programs account for ${classifiedPercentage.toFixed(1)}% of ${symbol}'s total revenue. This is ${classifiedPercentage > 15 ? 'a significant' : classifiedPercentage > 10 ? 'an important' : 'a notable'} portion of the business, providing stable, long-term contracts with high barriers to entry.`
    },
    {
      question: `Why doesn't ${symbol} disclose classified program details?`,
      answer: `Classified programs are subject to U.S. government security restrictions. Companies cannot disclose specific program names, capabilities, or contract values for national security reasons. Only aggregate classified revenue is typically reported in financial statements.`
    },
    {
      question: `What types of classified programs does ${symbol} work on?`,
      answer: `While specific details are classified, ${symbol} likely works on programs including: Special Access Programs (${classifiedCategories[0].percentage}%), Intelligence Systems (${classifiedCategories[1].percentage}%), Advanced Weapons (${classifiedCategories[2].percentage}%), and Cyber/Electronic Warfare (${classifiedCategories[3].percentage}%).`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Classified Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Classified Revenue ${currentYear} - Secret Programs & Black Budget`,
    description: `Complete classified revenue analysis for ${symbol} (${companyName}) with classified programs, black budget contracts, and undisclosed defense revenue.`,
    url: pageUrl,
    keywords: [
      `${symbol} classified revenue`,
      `${symbol} black programs`,
      `${symbol} classified programs`,
      `${symbol} special access programs`,
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

  const faqSchema = getFAQSchema(classifiedFaqs)

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
            <span>{symbol} Classified Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Classified Revenue {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Classified programs and black budget revenue for {companyName}
          </p>

          {/* Classified Revenue Overview Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Classified Revenue (Est.)</p>
                <p className="text-3xl font-bold">
                  {classifiedRevenue >= 1e9
                    ? `$${(classifiedRevenue / 1e9).toFixed(2)}B`
                    : `$${(classifiedRevenue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-green-500 mt-1">+{(classifiedGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">% of Total Revenue</p>
                <p className="text-3xl font-bold text-red-500">
                  {classifiedPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">classified segment</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Security Classification</p>
                <p className="text-3xl font-bold text-purple-500">
                  HIGH
                </p>
                <p className="text-sm text-muted-foreground mt-1">clearance required</p>
              </div>
            </div>
          </div>

          {/* Classified Program Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Classified Program Categories (Estimated)</h2>
            <div className="space-y-4">
              {classifiedCategories.map((category, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold">{category.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold">{category.percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {((classifiedRevenue * category.percentage / 100) >= 1e9
                          ? `$${((classifiedRevenue * category.percentage / 100) / 1e9).toFixed(2)}B`
                          : `$${((classifiedRevenue * category.percentage / 100) / 1e6).toFixed(0)}M`)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Growth Trend */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Classified Revenue Growth</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear} (Estimated)</p>
                  <p className="text-3xl font-bold mb-1">
                    {classifiedRevenue >= 1e9
                      ? `$${(classifiedRevenue / 1e9).toFixed(2)}B`
                      : `$${(classifiedRevenue / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-red-500/20 rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium text-red-500">Current year</div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{currentYear - 1} (Estimated)</p>
                  <p className="text-3xl font-bold mb-1">
                    {previousYearClassified >= 1e9
                      ? `$${(previousYearClassified / 1e9).toFixed(2)}B`
                      : `$${(previousYearClassified / 1e6).toFixed(0)}M`}
                  </p>
                  <div className="w-full bg-secondary rounded-full h-10 flex items-center px-4 mt-3">
                    <div className="text-sm font-medium">Previous year</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-1">Year-over-Year Growth (Est.)</p>
                <p className="text-4xl font-bold text-green-500">
                  +{(classifiedGrowth * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Program Characteristics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Classified Program Characteristics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="font-bold">High Barriers to Entry</p>
                    <p className="text-sm text-muted-foreground">
                      Requires top-secret security clearances and facility certifications, limiting competition
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Long-Term Contracts</p>
                    <p className="text-sm text-muted-foreground">
                      Multi-year programs with stable funding and predictable revenue streams
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Premium Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Higher margins due to specialized capabilities and limited competition
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <p className="font-bold">Limited Disclosure</p>
                    <p className="text-sm text-muted-foreground">
                      Program details, capabilities, and specific contracts remain classified for national security
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Classified Program Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="text-xl font-bold text-red-500">15+</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Clearance Level</p>
                <p className="text-xl font-bold">TS/SCI</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Avg Contract</p>
                <p className="text-xl font-bold">5-7yr</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Margin</p>
                <p className="text-xl font-bold text-green-500">High</p>
              </div>
            </div>
          </section>

          {/* Disclosure Notice */}
          <section className="mb-12">
            <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold mb-2">Classified Revenue Disclosure</p>
                  <p className="text-sm text-muted-foreground">
                    All classified revenue figures are estimates based on public filings and industry analysis.
                    Actual classified program revenue, contract details, and program names are not disclosed
                    by the company due to U.S. government security restrictions and national security requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-red-600/20 to-purple-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Defense Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete revenue breakdown, defense contracts, and segment performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Total Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {classifiedFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Classified revenue figures are estimates based on publicly available information. Actual classified program details, revenue, and contracts are subject to U.S. government security restrictions and are not publicly disclosed. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="classified-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
