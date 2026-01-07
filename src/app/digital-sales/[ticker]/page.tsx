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
    title: `${symbol} Digital Sales ${currentYear} - E-Commerce & Online Revenue`,
    description: `${symbol} digital sales analysis for ${currentYear}. Track e-commerce growth, online revenue trends, and digital transformation progress.`,
    keywords: [
      `${symbol} digital sales`,
      `${symbol} e-commerce revenue`,
      `${symbol} online sales`,
      `${symbol} digital revenue`,
      `${symbol} e-commerce growth`,
      `${symbol} online strategy`,
    ],
    openGraph: {
      title: `${symbol} Digital Sales ${currentYear} | E-Commerce Analysis`,
      description: `Complete ${symbol} digital sales analysis with e-commerce growth trends and online revenue performance.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/digital-sales/${ticker.toLowerCase()}`,
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

export default async function DigitalSalesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/digital-sales/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate digital sales metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedDigitalPercentage = sector === 'Consumer Discretionary' ? 0.45 : sector === 'Technology' ? 0.95 : 0.30
  const estimatedDigitalRevenue = revenue * estimatedDigitalPercentage
  const estimatedDigitalGrowth = revenueGrowth * 1.5 // Digital typically grows faster

  // Generate digital sales FAQs
  const digitalFaqs = [
    {
      question: `What percentage of ${symbol}'s sales are digital?`,
      answer: `Based on industry trends and sector analysis, ${symbol}'s digital sales are estimated at ${(estimatedDigitalPercentage * 100).toFixed(0)}% of total revenue, representing approximately $${(estimatedDigitalRevenue / 1e9).toFixed(2)}B annually. This includes e-commerce, mobile apps, and digital platforms.`
    },
    {
      question: `How fast are ${symbol}'s digital sales growing?`,
      answer: `Digital sales typically grow faster than traditional channels. With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${symbol}'s digital segment is estimated to grow at ${(estimatedDigitalGrowth * 100).toFixed(1)}% annually as consumers shift online.`
    },
    {
      question: `What drives ${symbol}'s digital sales growth?`,
      answer: `Key digital growth drivers include: mobile commerce adoption, personalized online experiences, social media integration, faster delivery options, and seamless omnichannel capabilities. ${companyName}'s technology investments are critical for sustaining digital momentum.`
    },
    {
      question: `How does ${symbol} compare to competitors in digital?`,
      answer: `${sector === 'Technology' ? 'Technology companies typically see 80-100% digital revenue' : sector === 'Consumer Discretionary' ? 'Leading retailers average 30-60% digital penetration' : 'Digital adoption varies significantly by industry'}. Monitor ${symbol}'s digital metrics relative to peers for competitive positioning.`
    },
    {
      question: `What is ${symbol}'s digital strategy?`,
      answer: `${companyName}'s digital strategy likely includes website and mobile app optimization, marketplace partnerships, social commerce, subscription models, and data-driven personalization. Check recent earnings calls for specific digital initiatives.`
    },
    {
      question: `Will ${symbol} continue growing digital sales?`,
      answer: `Digital commerce continues expanding across industries. ${symbol}'s ability to grow digital sales depends on technology investments, customer experience, logistics capabilities, and competitive differentiation in online channels.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Digital Sales`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Digital Sales ${currentYear} - E-Commerce & Online Revenue`,
    description: `Complete digital sales analysis for ${symbol} (${companyName}) with e-commerce growth trends and online revenue performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} digital sales`,
      `${symbol} e-commerce`,
      `${symbol} online revenue`,
      `${symbol} digital growth`,
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

  const faqSchema = getFAQSchema(digitalFaqs)

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
            <span>{symbol} Digital Sales</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Digital Sales
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            E-commerce growth and online revenue trends for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Digital Sales Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Digital Sales Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. Digital Revenue</p>
                <p className="text-3xl font-bold">${(estimatedDigitalRevenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-green-500 mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Digital % of Total</p>
                <p className="text-3xl font-bold">{(estimatedDigitalPercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">Est. Mix</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Digital Growth</p>
                <p className={`text-3xl font-bold ${estimatedDigitalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(estimatedDigitalGrowth * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Est. YoY</p>
              </div>
            </div>
          </section>

          {/* Digital Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Digital Commerce Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s digital sales strategy includes:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>E-Commerce Platform:</strong> Optimized website and mobile apps for seamless shopping experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Mobile Commerce:</strong> App-first strategies and mobile-optimized checkout flows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Marketplace Integration:</strong> Sales through Amazon, eBay, and other digital marketplaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong>Social Commerce:</strong> Shoppable posts, influencer partnerships, and social media storefronts</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol} Digital Transformation</h2>
            <p className="text-muted-foreground mb-6">
              Get real-time updates on e-commerce growth and digital initiatives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Breakdown
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {digitalFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Digital sales estimates are based on industry trends and sector benchmarks. Actual digital revenue may vary. Always consult official company disclosures for accurate channel performance data.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="digital-sales" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
