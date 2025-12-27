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
    title: `${symbol} Conversion Rate - Sales Efficiency Data ${currentYear}`,
    description: `${symbol} conversion rate analysis: customer conversion metrics, sales efficiency, and retail performance optimization for ${symbol}.`,
    keywords: [
      `${symbol} conversion rate`,
      `${symbol} sales conversion`,
      `${symbol} customer conversion`,
      `${symbol} retail efficiency`,
      `${symbol} conversion metrics`,
      `${symbol} sales performance`,
    ],
    openGraph: {
      title: `${symbol} Conversion Rate ${currentYear} | Sales Efficiency Analysis`,
      description: `Complete ${symbol} conversion rate analysis with sales efficiency trends and customer conversion metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/conversion-rate/${ticker.toLowerCase()}`,
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

export default async function ConversionRatePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts, metrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/conversion-rate/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Generate conversion rate FAQs
  const conversionFaqs = [
    {
      question: `What is ${symbol}'s conversion rate?`,
      answer: `${symbol} (${companyName}) conversion rate measures the percentage of store visitors or website browsers who complete a purchase. This critical metric is calculated by dividing total transactions by total traffic (foot traffic or website visits), revealing how effectively ${symbol} converts interest into sales.`
    },
    {
      question: `How does ${symbol} calculate conversion rate?`,
      answer: `Conversion rate for ${companyName} is determined by dividing the number of completed transactions by the total number of visitors or sessions, then multiplying by 100 for a percentage. For example, if ${symbol} has 1,000 store visitors and 200 make purchases, the conversion rate is 20%.`
    },
    {
      question: `Is ${symbol}'s conversion rate improving?`,
      answer: `${symbol}'s conversion rate trends indicate sales effectiveness, customer experience quality, and competitive positioning${sector ? ` in the ${sector} sector` : ''}. Improving conversion rates suggest better merchandising, staff training, pricing strategies, or enhanced digital experiences.`
    },
    {
      question: `Why is conversion rate important for ${symbol}?`,
      answer: `For ${companyName}, conversion rate is crucial because it measures revenue efficiency from existing traffic. Higher conversion means ${symbol} generates more sales from the same number of visitors, improving profitability and reducing customer acquisition costs.`
    },
    {
      question: `What drives ${symbol}'s conversion rate?`,
      answer: `${symbol}'s conversion rate is influenced by product availability, pricing competitiveness, store layout, staff expertise, checkout experience, website usability, and promotional strategies${industry ? ` within the ${industry} industry` : ''}. Customer reviews and brand reputation also impact conversion.`
    },
    {
      question: `How can ${symbol} improve conversion rate?`,
      answer: `${companyName} can enhance conversion through optimized product displays, personalized recommendations, streamlined checkout processes, competitive pricing, staff training, improved website UX${sector ? ` tailored to ${sector} customers` : ''}, and targeted promotions that reduce purchase friction.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Conversion Rate`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Conversion Rate ${currentYear} - Sales Efficiency Analysis`,
    description: `Complete conversion rate analysis for ${symbol} (${companyName}) with sales efficiency trends and customer conversion metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} conversion rate`,
      `${symbol} sales conversion`,
      `${symbol} customer conversion`,
      `${symbol} retail efficiency`,
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

  const faqSchema = getFAQSchema(conversionFaqs)

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
            <span>{symbol} Conversion Rate</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Conversion Rate {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sales conversion and customer efficiency analysis for {companyName}
          </p>

          {/* Overview Card */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 rounded-xl border border-orange-500/30 mb-8">
            <h2 className="text-2xl font-bold mb-4">About Conversion Rate</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conversion rate for {companyName} measures the percentage of visitors who make a purchase, calculated as transactions divided by total traffic. This key efficiency metric reveals how effectively {symbol} transforms browsing into buying, both in physical stores and digital channels.
            </p>
          </div>

          {/* Key Metrics Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Conversion Rate Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Sales Efficiency</h3>
                <p className="text-muted-foreground text-sm">
                  Higher conversion rates mean {symbol} generates more revenue from existing traffic, maximizing return on marketing and real estate investments.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Customer Experience</h3>
                <p className="text-muted-foreground text-sm">
                  Strong conversion indicates {companyName} delivers compelling product selection, competitive pricing, and seamless shopping experiences{sector ? ` in the ${sector} sector` : ''}.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Marketing Effectiveness</h3>
                <p className="text-muted-foreground text-sm">
                  Conversion rate validates {symbol}'s marketing efforts by showing how well attracted traffic translates into actual sales and revenue.
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-2">Competitive Position</h3>
                <p className="text-muted-foreground text-sm">
                  Above-average conversion rates suggest {companyName} outperforms competitors{industry ? ` in the ${industry} industry` : ''} in converting interest to purchases.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-orange-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Retail Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete conversion metrics, customer data, and AI-powered retail insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Analysis
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {conversionFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Conversion rate data is derived from company disclosures and industry estimates. Measurement methodologies may vary. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
