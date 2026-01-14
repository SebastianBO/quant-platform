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
import { Building2, Globe, Users, MapPin, Calendar, User } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Company Profile - About ${symbol} Stock`,
    description: `Complete ${symbol} company profile. Learn about the company's business, sector, industry, headquarters, employees, website, key executives, and corporate information.`,
    keywords: [
      `${symbol} company profile`,
      `${symbol} about`,
      `what does ${symbol} do`,
      `${symbol} company information`,
      `${symbol} business overview`,
      `${symbol} headquarters`,
      `${symbol} industry`,
      `${symbol} sector`,
      `${symbol} executives`,
      `about ${symbol} stock`,
    ],
    openGraph: {
      title: `${symbol} Company Profile | About the Company`,
      description: `Comprehensive company profile for ${symbol} including business overview, industry information, headquarters, and key executives.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/profile/${ticker.toLowerCase()}`,
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

export default async function ProfilePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/profile/${ticker.toLowerCase()}`

  // Company information
  const description = companyFacts?.description || 'Company profile information not available.'
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const website = companyFacts?.website
  const employees = companyFacts?.employees
  const headquarters = companyFacts?.headquarters
  const founded = companyFacts?.founded
  const ceo = companyFacts?.ceo
  const exchange = companyFacts?.exchange || 'NASDAQ'
  const country = companyFacts?.country

  // Format employees number
  const formatEmployees = (num: number | null | undefined) => {
    if (!num) return null
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  // Generate company FAQs
  const companyFaqs = [
    {
      question: `What does ${symbol} do?`,
      answer: description.length > 200 ? `${description.slice(0, 200)}...` : description
    },
    {
      question: `What industry is ${symbol} in?`,
      answer: industry
        ? `${companyName} operates in the ${industry} industry${sector ? ` within the ${sector} sector` : ''}.`
        : `${companyName} company information is available on our platform.`
    },
    {
      question: `Where is ${symbol} headquartered?`,
      answer: headquarters
        ? `${companyName} is headquartered in ${headquarters}.`
        : `Company headquarters information for ${symbol} is available through our platform.`
    },
    {
      question: `How many employees does ${symbol} have?`,
      answer: employees
        ? `${companyName} has approximately ${formatEmployees(employees)} employees.`
        : `Employee count information for ${symbol} will be updated when available.`
    },
    {
      question: `Who is the CEO of ${symbol}?`,
      answer: ceo
        ? `${ceo} is the CEO of ${companyName}.`
        : `Executive leadership information for ${symbol} is available through company filings and our platform.`
    },
    {
      question: `When was ${symbol} founded?`,
      answer: founded
        ? `${companyName} was founded in ${new Date(founded).getFullYear()}.`
        : `Company founding date information for ${symbol} is available through our platform.`
    },
    {
      question: `What is ${symbol}'s business model?`,
      answer: `${companyName} ${industry ? `operates in the ${industry} industry ` : ''}generating revenue through its core business operations${sector ? ` in the ${sector} sector` : ''}. View our detailed financial analysis for revenue breakdown and business segments.`
    },
    {
      question: `Is ${symbol} publicly traded?`,
      answer: `Yes, ${symbol} (${companyName}) is a publicly traded company listed on ${exchange}. You can view real-time stock quotes, financial statements, and analysis on our platform.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Profile`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Company Profile - About ${companyName}`,
    description: `Complete company profile for ${symbol} including business overview, industry, headquarters, and corporate information.`,
    url: pageUrl,
    keywords: [
      `${symbol} company profile`,
      `${symbol} about`,
      `what does ${symbol} do`,
      `${symbol} business overview`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
    foundingDate: founded,
    numberOfEmployees: employees,
  })

  const faqSchema = getFAQSchema(companyFaqs)

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
            <span>{symbol} Profile</span>
          </nav>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {companyName}
              </h1>
              <p className="text-xl text-muted-foreground">
                {symbol} Company Profile
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-3xl font-bold">${price.toFixed(2)}</p>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {sector && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Sector</span>
                </div>
                <p className="text-lg font-semibold">{sector}</p>
              </div>
            )}
            {industry && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Industry</span>
                </div>
                <p className="text-lg font-semibold">{industry}</p>
              </div>
            )}
            {headquarters && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Headquarters</span>
                </div>
                <p className="text-lg font-semibold">{headquarters}</p>
              </div>
            )}
            {employees && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Employees</span>
                </div>
                <p className="text-lg font-semibold">{formatEmployees(employees)}</p>
              </div>
            )}
            {website && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Website</span>
                </div>
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-500 hover:text-blue-400 break-all"
                >
                  {website.replace(/^https?:\/\//i, '')}
                </a>
              </div>
            )}
            {founded && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Founded</span>
                </div>
                <p className="text-lg font-semibold">{new Date(founded).getFullYear()}</p>
              </div>
            )}
          </div>

          {/* Business Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Business Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </section>

          {/* Key Executives */}
          {ceo && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Key Executives</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                    <p className="text-lg font-semibold">{ceo}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Additional executive information is available through SEC filings and company investor relations.
                </p>
              </div>
            </section>
          )}

          {/* Company Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Company Information</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Stock Symbol</span>
                <span className="font-semibold">{symbol}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Exchange</span>
                <span className="font-semibold">{exchange}</span>
              </div>
              {sector && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Sector</span>
                  <span className="font-semibold">{sector}</span>
                </div>
              )}
              {industry && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-semibold">{industry}</span>
                </div>
              )}
              {country && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-semibold">{country}</span>
                </div>
              )}
              {snapshot.market_cap && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">
                    ${(snapshot.market_cap / 1e9).toFixed(2)}B
                  </span>
                </div>
              )}
              {metrics?.price_to_earnings_ratio && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">P/E Ratio</span>
                  <span className="font-semibold">
                    {metrics.price_to_earnings_ratio.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Stock</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive financial analysis, real-time data, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Stock Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Open Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {companyFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Company information is sourced from public filings and data providers. Information may change as companies update their corporate structure, operations, and disclosures. Always verify current information through official company sources and SEC filings.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="profile" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
