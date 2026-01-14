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
    title: `${symbol} EV Regulatory Credits - Emissions Credits Revenue ${currentYear}`,
    description: `${symbol} regulatory credits analysis: EV credits revenue, ZEV credits, carbon credits, emissions trading, and regulatory credit sales impact on profitability.`,
    keywords: [
      `${symbol} regulatory credits`,
      `${symbol} EV credits`,
      `${symbol} ZEV credits`,
      `${symbol} carbon credits`,
      `${symbol} emissions credits`,
      `${symbol} credit revenue`,
    ],
    openGraph: {
      title: `${symbol} EV Regulatory Credits ${currentYear} | Emissions Revenue`,
      description: `Complete ${symbol} regulatory credits analysis with revenue impact and sustainability metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/ev-credits/${ticker.toLowerCase()}`,
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

export default async function EVCreditsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/ev-credits/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate EV credits FAQs
  const evCreditsFaqs = [
    {
      question: `What are ${symbol}'s regulatory credits?`,
      answer: `${symbol} (${companyName}) ${sector === 'Consumer Cyclical' ? 'earns regulatory credits from EV sales' : 'may participate in emissions trading programs'}. These credits include ZEV (Zero Emission Vehicle) credits, carbon credits, and other environmental compliance instruments that can be sold to other manufacturers.`
    },
    {
      question: `How much revenue does ${symbol} make from regulatory credits?`,
      answer: `${companyName} reports regulatory credit revenue in quarterly and annual financial statements, typically disclosed separately in automotive revenue breakdown. This revenue can significantly impact profitability, especially for pure EV manufacturers.`
    },
    {
      question: `Why do regulatory credits matter for ${symbol}?`,
      answer: `Regulatory credits provide additional revenue that can improve margins and profitability. For EV-focused companies, credit sales to traditional automakers help subsidize vehicle production costs and support growth investments.`
    },
    {
      question: `Are ${symbol}'s regulatory credits sustainable?`,
      answer: `The sustainability of regulatory credit revenue depends on government policies and industry EV adoption rates. As more manufacturers produce EVs, the demand for purchasing credits may decline, potentially reducing this revenue stream over time.`
    },
    {
      question: `How does ${symbol} earn regulatory credits?`,
      answer: `${companyName} earns credits by producing zero-emission vehicles that exceed regulatory requirements. These credits can then be sold to other manufacturers who need them to comply with emissions standards.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} EV Credits`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} EV Regulatory Credits ${currentYear} - Emissions Revenue Analysis`,
    description: `Complete regulatory credits analysis for ${symbol} (${companyName}) with revenue impact and trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} regulatory credits`,
      `${symbol} EV credits`,
      `${symbol} emissions revenue`,
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

  const faqSchema = getFAQSchema(evCreditsFaqs)

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
            <span>{symbol} EV Credits</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} EV Regulatory Credits {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Regulatory credits and emissions revenue for {companyName}
          </p>

          {/* Key Metrics Card */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company</p>
                <p className="text-2xl font-bold">{companyName}</p>
                <p className="text-sm text-muted-foreground mt-1">{industry || sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metric Focus</p>
                <p className="text-2xl font-bold">EV Credits</p>
                <p className="text-sm text-muted-foreground mt-1">Regulatory Revenue</p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">EV Regulatory Credits Overview</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <p className="text-muted-foreground">
                Regulatory credits are generated when automakers exceed government-mandated emissions and fuel
                economy standards. EV manufacturers can sell these credits to other companies that fall short
                of requirements, creating an additional revenue stream.
              </p>
              <p className="text-muted-foreground">
                For {companyName}, regulatory credits can significantly impact profitability and cash flow,
                especially during growth phases when high capital expenditures are required for production scaling.
              </p>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why EV Credits Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Revenue Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Credit sales provide high-margin revenue that improves overall profitability.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Cash Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Regulatory credit income strengthens cash position and funds growth initiatives.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Policy Dependency</h3>
                <p className="text-sm text-muted-foreground">
                  Credit value fluctuates with regulatory changes and industry EV adoption rates.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Competitive Dynamics</h3>
                <p className="text-sm text-muted-foreground">
                  Credit sales demonstrate regulatory compliance and environmental leadership.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-8 rounded-xl border border-emerald-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financial metrics, revenue breakdown, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/financials/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Financial Statements
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {evCreditsFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Regulatory credit data is based on financial filings and company disclosures. Policy changes may impact future credit values. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="ev-credits" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
