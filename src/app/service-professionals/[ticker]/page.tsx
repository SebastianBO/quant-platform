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
    title: `${symbol} Service Professionals - Network Growth & Metrics ${currentYear}`,
    description: `${symbol} service professionals data: total professionals, network growth, professional categories, geographic distribution. Analyze ${symbol}'s service professional network.`,
    keywords: [
      `${symbol} service professionals`,
      `${symbol} professional network`,
      `${symbol} service provider growth`,
      `${symbol} professional metrics`,
      `${symbol} network size`,
    ],
    openGraph: {
      title: `${symbol} Service Professionals ${currentYear} | Network Growth Analysis`,
      description: `Complete ${symbol} service professionals analysis with network growth trends and professional distribution.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/service-professionals/${ticker.toLowerCase()}`,
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

export default async function ServiceProfessionalsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/service-professionals/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate FAQs
  const faqs = [
    {
      question: `How many service professionals does ${symbol} have?`,
      answer: `${companyName} connects homeowners with a network of service professionals across various home improvement categories. The platform continues to expand its professional network to meet growing demand.`
    },
    {
      question: `Is ${symbol}'s service professional network growing?`,
      answer: `${companyName} focuses on growing its service professional network to ensure quality matches and coverage across key markets. Network growth is a key driver of the company's marketplace model.`
    },
    {
      question: `What types of service professionals are on ${symbol}?`,
      answer: `${symbol}'s platform includes professionals across multiple categories including contractors, landscapers, plumbers, electricians, HVAC specialists, and other home service providers.`
    },
    {
      question: `How does ${symbol} vet service professionals?`,
      answer: `${companyName} typically implements screening and verification processes to ensure quality service providers join their network, including background checks, license verification, and review systems.`
    },
    {
      question: `What is ${symbol}'s professional retention rate?`,
      answer: `Service professional retention is important for ${symbol}'s marketplace quality. Active and satisfied professionals are more likely to respond to leads and complete projects successfully.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Service Professionals`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Service Professionals ${currentYear} - Network Growth Analysis`,
    description: `Complete service professional network analysis for ${symbol} (${companyName}) with growth trends and distribution metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} service professionals`,
      `${symbol} professional network`,
      `${symbol} service provider growth`,
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
            <span>{symbol} Service Professionals</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Service Professionals {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Service professional network growth and metrics for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Model</p>
                <p className="text-2xl font-bold">Marketplace Platform</p>
                <p className="text-sm text-muted-foreground mt-1">Connecting homeowners with professionals</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Key Metric</p>
                <p className="text-2xl font-bold">Service Professional Network</p>
                <p className="text-sm text-muted-foreground mt-1">Network effects drive value</p>
              </div>
            </div>
          </div>

          {/* Network Quality Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Network Quality Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Professional Categories</h3>
                <p className="text-muted-foreground">Multiple service categories ensure broad coverage and matching capabilities</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Geographic Distribution</h3>
                <p className="text-muted-foreground">Nationwide coverage with density in key metropolitan markets</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Active Engagement</h3>
                <p className="text-muted-foreground">Professional activity levels impact lead response and conversion rates</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Quality Standards</h3>
                <p className="text-muted-foreground">Screening and review systems maintain marketplace quality</p>
              </div>
            </div>
          </section>

          {/* Growth Drivers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Network Growth Drivers</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Market Expansion:</strong> Entry into new geographic markets increases network size</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Category Growth:</strong> Adding new service categories attracts diverse professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Lead Quality:</strong> High-quality leads and good conversion rates attract professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span><strong>Platform Tools:</strong> Professional tools and services improve retention</span>
                </li>
              </ul>
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
            <p><strong>Disclaimer:</strong> Service professional metrics may not be publicly disclosed by all companies. Analysis is based on available company disclosures and industry estimates. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="service-professionals" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
