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
    title: `${symbol} Shrinkage Rate - Inventory Loss Data ${currentYear}`,
    description: `${symbol} shrinkage rate analysis: inventory loss, theft prevention, and loss prevention metrics for ${symbol}.`,
    keywords: [
      `${symbol} shrinkage`,
      `${symbol} inventory loss`,
      `${symbol} theft prevention`,
      `${symbol} loss prevention`,
      `${symbol} shrinkage rate`,
      `${symbol} retail losses`,
    ],
    openGraph: {
      title: `${symbol} Shrinkage Rate ${currentYear} | Inventory Loss Analysis`,
      description: `Complete ${symbol} shrinkage rate analysis with inventory loss trends and loss prevention metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/shrinkage/${ticker.toLowerCase()}`,
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

export default async function ShrinkagePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/shrinkage/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate shrinkage FAQs
  const shrinkageFaqs = [
    {
      question: `What is ${symbol}'s shrinkage rate?`,
      answer: `${symbol} (${companyName}) shrinkage rate measures inventory loss as a percentage of sales or inventory value. Shrinkage includes theft (both external shoplifting and internal employee theft), administrative errors, vendor fraud, and damaged goods. This metric directly impacts ${symbol}'s profitability and operational efficiency.`
    },
    {
      question: `How does ${symbol} calculate shrinkage?`,
      answer: `Shrinkage for ${companyName} is calculated by comparing book inventory (what records show) to actual physical inventory counts. The difference, expressed as a percentage of sales or inventory value, represents shrinkage. Industry benchmarks${sector ? ` in the ${sector} sector` : ''} help assess if ${symbol}'s shrinkage is within acceptable ranges.`
    },
    {
      question: `What causes ${symbol}'s shrinkage?`,
      answer: `${symbol}'s shrinkage stems from multiple sources: external theft (shoplifting), internal theft (employee dishonesty), administrative errors (pricing mistakes, incorrect counts), vendor fraud, and damaged/expired products${industry ? ` in ${industry}` : ''}. Each source requires different prevention strategies.`
    },
    {
      question: `Why is shrinkage important for ${symbol}?`,
      answer: `For ${companyName}, shrinkage directly reduces gross margins and profitability. A 1% shrinkage rate can translate to millions in lost profits annually. Effective shrinkage control is essential for ${symbol} to maintain competitive pricing while protecting profitability${sector ? ` in the ${sector} market` : ''}.`
    },
    {
      question: `How does ${symbol} prevent shrinkage?`,
      answer: `${symbol} combats shrinkage through multiple strategies: security systems (cameras, electronic article surveillance), employee training and screening, inventory controls, vendor audits${industry ? ` tailored to ${industry}` : ''}, and data analytics to identify unusual patterns indicating theft or fraud.`
    },
    {
      question: `How does ${symbol}'s shrinkage compare to industry standards?`,
      answer: `Comparing ${symbol}'s shrinkage rate to industry benchmarks reveals operational effectiveness in loss prevention. Lower shrinkage than competitors indicates superior security measures, employee integrity programs${sector ? ` in ${sector}` : ''}, and inventory management systems at ${companyName}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Shrinkage`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Shrinkage Rate ${currentYear} - Inventory Loss Analysis`,
    description: `Complete shrinkage rate analysis for ${symbol} (${companyName}) with inventory loss trends and loss prevention metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} shrinkage`,
      `${symbol} inventory loss`,
      `${symbol} theft prevention`,
      `${symbol} loss prevention`,
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

  const faqSchema = getFAQSchema(shrinkageFaqs)

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
            <span>{symbol} Shrinkage</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Shrinkage Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Inventory loss and loss prevention analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Shrinkage Rate</h2>
            <p className="text-muted-foreground leading-relaxed">
              Shrinkage for {companyName} represents inventory loss from theft, errors, fraud, and damage, measured as a percentage of sales or inventory. This critical metric directly impacts gross margins and reveals the effectiveness of {symbol}'s loss prevention programs and operational controls.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Shrinkage Rate Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Profitability Protection</h3>
                <p className="text-muted-foreground text-sm">
                  Shrinkage directly reduces {symbol}'s gross profit. Lower shrinkage rates mean more inventory converts to sales{sector ? ` in the ${sector} sector` : ''}, protecting margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Operational Excellence</h3>
                <p className="text-muted-foreground text-sm">
                  Low shrinkage indicates {companyName} has effective inventory controls, security systems, and employee training programs{industry ? ` for ${industry}` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Positioning</h3>
                <p className="text-muted-foreground text-sm">
                  Better shrinkage control than competitors gives {symbol} cost advantages, enabling more competitive pricing or higher margins.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Investor Confidence</h3>
                <p className="text-muted-foreground text-sm">
                  Improving shrinkage trends demonstrate {companyName}'s management effectiveness in protecting assets and controlling losses${sector ? ` across ${sector}` : ''}.
                </p>
              </div>
            </div>
          </section>

          {/* Shrinkage Sources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Common Sources of Shrinkage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">External Theft</h3>
                <p className="text-muted-foreground text-sm">
                  Shoplifting and organized retail crime represent significant shrinkage for {symbol}, requiring robust security measures and surveillance.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Internal Theft</h3>
                <p className="text-muted-foreground text-sm">
                  Employee dishonesty contributes to shrinkage at {companyName}, necessitating background checks, audits, and ethical culture programs.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Administrative Errors</h3>
                <p className="text-muted-foreground text-sm">
                  Pricing mistakes, incorrect inventory counts, and record-keeping errors create shrinkage for {symbol}, requiring process improvements.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Vendor Fraud & Damage</h3>
                <p className="text-muted-foreground text-sm">
                  Vendor billing errors, damaged goods, and expired products contribute to {companyName}'s shrinkage, demanding vendor audits and quality controls.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-red-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete shrinkage data, margin analysis, and AI-powered operational insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/margins/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Margin Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {shrinkageFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Shrinkage data is derived from company disclosures when available. Many retailers do not publicly report detailed shrinkage metrics. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
