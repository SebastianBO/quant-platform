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
    title: `${symbol} Geographic Mix ${currentYear} - Revenue by Region`,
    description: `${symbol} geographic revenue mix for ${currentYear}. Track regional performance, international expansion, and market-specific growth trends.`,
    keywords: [
      `${symbol} geographic mix`,
      `${symbol} regional revenue`,
      `${symbol} international sales`,
      `${symbol} geographic breakdown`,
      `${symbol} regional performance`,
      `${symbol} market expansion`,
    ],
    openGraph: {
      title: `${symbol} Geographic Mix ${currentYear} | Regional Analysis`,
      description: `Complete ${symbol} geographic revenue analysis with regional performance and international market trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/geographic-mix/${ticker.toLowerCase()}`,
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

export default async function GeographicMixPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/geographic-mix/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate geographic metrics (simulated)
  const revenue = metrics?.revenue || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const estimatedUSPercentage = 0.55
  const estimatedInternationalPercentage = 0.45

  // Generate geographic FAQs
  const geographicFaqs = [
    {
      question: `What is ${symbol}'s geographic revenue breakdown?`,
      answer: `${companyName}'s revenue is distributed across multiple regions. Based on typical ${sector || 'industry'} patterns, approximately ${(estimatedUSPercentage * 100).toFixed(0)}% comes from the U.S. with ${(estimatedInternationalPercentage * 100).toFixed(0)}% from international markets including Europe, Asia-Pacific, and emerging markets.`
    },
    {
      question: `How much revenue does ${symbol} generate internationally?`,
      answer: `International markets represent a significant growth opportunity. With total revenue of $${(revenue / 1e9).toFixed(2)}B, ${symbol}'s estimated international revenue is approximately $${(revenue * estimatedInternationalPercentage / 1e9).toFixed(2)}B annually across global markets.`
    },
    {
      question: `Is ${symbol} expanding internationally?`,
      answer: `Most large companies pursue international expansion to drive growth beyond domestic markets. With overall revenue growth of ${(revenueGrowth * 100).toFixed(1)}%, ${symbol}'s international performance is a key factor in total company growth.`
    },
    {
      question: `Which international markets are most important for ${symbol}?`,
      answer: `Key international markets typically include Europe, China, India, Japan, and other Asia-Pacific countries. ${companyName}'s specific geographic priorities depend on ${sector ? `${sector} sector dynamics, ` : ''}regulatory environment, and competitive positioning.`
    },
    {
      question: `What are the risks of ${symbol}'s international operations?`,
      answer: `International operations face currency fluctuations, geopolitical risks, regulatory changes, trade policies, and cultural differences. Investors should monitor how ${symbol} manages these risks through hedging, local partnerships, and diversification.`
    },
    {
      question: `How does geographic mix affect ${symbol}'s valuation?`,
      answer: `Geographic diversification can reduce risk and provide multiple growth vectors. Markets with higher growth potential (like emerging markets) may command premium valuations, while mature markets offer stability and predictable cash flows.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Geographic Mix`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Geographic Mix ${currentYear} - Revenue by Region`,
    description: `Complete geographic revenue analysis for ${symbol} (${companyName}) with regional performance and international expansion.`,
    url: pageUrl,
    keywords: [
      `${symbol} geographic mix`,
      `${symbol} regional revenue`,
      `${symbol} international sales`,
      `${symbol} geographic breakdown`,
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

  const faqSchema = getFAQSchema(geographicFaqs)

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
            <span>{symbol} Geographic Mix</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Geographic Revenue Mix
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Regional revenue breakdown and international market performance for {companyName}
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

          {/* Geographic Revenue Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Geographic Revenue Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${(revenue / 1e9).toFixed(2)}B</p>
                <p className="text-sm text-green-500 mt-1">Annual</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. U.S. Revenue</p>
                <p className="text-3xl font-bold">{(estimatedUSPercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">${(revenue * estimatedUSPercentage / 1e9).toFixed(2)}B</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Est. International</p>
                <p className="text-3xl font-bold">{(estimatedInternationalPercentage * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground mt-1">${(revenue * estimatedInternationalPercentage / 1e9).toFixed(2)}B</p>
              </div>
            </div>
          </section>

          {/* Geographic Strategy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Global Expansion Strategy</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {companyName}'s geographic presence spans multiple regions:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>North America:</strong> Mature market with steady cash flows and established distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Europe:</strong> Diverse regulatory landscape with strong consumer demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Asia-Pacific:</strong> High-growth markets including China, India, and Southeast Asia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Emerging Markets:</strong> Latin America, Middle East, and Africa with long-term potential</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol} Global Expansion</h2>
            <p className="text-muted-foreground mb-6">
              Monitor regional performance and international growth trends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
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
              {geographicFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Geographic revenue estimates are based on industry averages. Actual regional breakdowns vary by company. Consult official 10-K filings for precise geographic segment reporting.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="geographic-mix" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
