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
    title: `${symbol} Labor Hours - Workforce Efficiency Data ${currentYear}`,
    description: `${symbol} labor hours analysis: workforce productivity, labor efficiency, and staffing optimization metrics for ${symbol}.`,
    keywords: [
      `${symbol} labor hours`,
      `${symbol} workforce productivity`,
      `${symbol} labor efficiency`,
      `${symbol} staffing levels`,
      `${symbol} employee productivity`,
      `${symbol} labor costs`,
    ],
    openGraph: {
      title: `${symbol} Labor Hours ${currentYear} | Workforce Efficiency Analysis`,
      description: `Complete ${symbol} labor hours analysis with productivity trends and workforce efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/labor-hours/${ticker.toLowerCase()}`,
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

export default async function LaborHoursPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/labor-hours/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate labor hours FAQs
  const laborFaqs = [
    {
      question: `What are ${symbol}'s labor hours?`,
      answer: `${symbol} (${companyName}) labor hours measure total employee work hours across its operations, typically analyzed per store or as sales per labor hour. This metric reveals workforce productivity, staffing efficiency, and how effectively ${symbol} converts employee time into revenue.`
    },
    {
      question: `How does ${symbol} measure labor productivity?`,
      answer: `Labor productivity for ${companyName} is commonly measured as sales per labor hour or revenue per employee. This calculation divides total sales by total labor hours worked, showing how much revenue ${symbol} generates from each hour of employee effort${sector ? ` in the ${sector} sector` : ''}.`
    },
    {
      question: `Is ${symbol}'s labor efficiency improving?`,
      answer: `${symbol}'s labor efficiency trends indicate operational optimization, technology adoption, and workforce management effectiveness${industry ? ` in the ${industry} industry` : ''}. Improving sales per labor hour suggests better scheduling, training, automation, or higher-value employee activities.`
    },
    {
      question: `Why are labor hours important for ${symbol}?`,
      answer: `For ${companyName}, labor hours are critical because labor represents one of the largest operating expenses in retail. Efficient labor management directly impacts profitability by controlling costs while maintaining customer service quality and operational standards.`
    },
    {
      question: `What drives ${symbol}'s labor requirements?`,
      answer: `${symbol}'s labor needs are influenced by store traffic patterns, transaction complexity, store size, service model, seasonal demand, technology automation${sector ? ` in ${sector}` : ''}, and strategic choices between service levels and labor costs.`
    },
    {
      question: `How can ${symbol} optimize labor hours?`,
      answer: `${companyName} can optimize labor through demand forecasting, flexible scheduling, employee cross-training, self-checkout systems, inventory automation${industry ? ` tailored to ${industry}` : ''}, and analytics-driven staffing models that match employee hours to customer traffic patterns.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Labor Hours`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Labor Hours ${currentYear} - Workforce Efficiency Analysis`,
    description: `Complete labor hours analysis for ${symbol} (${companyName}) with productivity trends and workforce efficiency metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} labor hours`,
      `${symbol} workforce productivity`,
      `${symbol} labor efficiency`,
      `${symbol} staffing levels`,
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

  const faqSchema = getFAQSchema(laborFaqs)

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
            <span>{symbol} Labor Hours</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Labor Hours {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Workforce productivity and labor efficiency analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-8 rounded-xl border border-indigo-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Labor Hours</h2>
            <p className="text-muted-foreground leading-relaxed">
              Labor hours for {companyName} represent total employee work time, often measured as sales per labor hour to gauge productivity. This metric reveals how efficiently {symbol} deploys its workforce to generate revenue while managing one of retail's largest expense categories.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Labor Hours Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Cost Management</h3>
                <p className="text-muted-foreground text-sm">
                  Labor is typically one of {symbol}'s largest operating expenses. Optimizing labor hours directly improves profitability{sector ? ` in the ${sector} sector` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Productivity Measurement</h3>
                <p className="text-muted-foreground text-sm">
                  Sales per labor hour reveals how effectively {companyName} converts employee time into revenue, indicating operational efficiency and technology adoption.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Service Quality Balance</h3>
                <p className="text-muted-foreground text-sm">
                  {symbol} must balance labor optimization with maintaining customer service standards{industry ? ` in ${industry}` : ''}, ensuring staffing supports brand experience.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Advantage</h3>
                <p className="text-muted-foreground text-sm">
                  Higher productivity per labor hour compared to competitors gives {companyName} cost advantages and pricing flexibility in the market.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-indigo-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete labor metrics, operating expenses, and AI-powered efficiency insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/income-statement/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Income Statement
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {laborFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Labor data is derived from company disclosures and industry analysis. Reporting standards may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
