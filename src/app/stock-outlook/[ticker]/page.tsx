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
    title: `${symbol} Stock Outlook ${currentYear} - Future Prospects & Analysis`,
    description: `${symbol} stock outlook for ${currentYear} and beyond. Comprehensive analysis of future prospects, industry trends, growth catalysts, risks, and long-term investment potential.`,
    keywords: [
      `${symbol} stock outlook`,
      `${symbol} outlook ${currentYear}`,
      `${symbol} future prospects`,
      `${symbol} long-term outlook`,
      `${symbol} stock future`,
      `${symbol} prospects`,
    ],
    openGraph: {
      title: `${symbol} Stock Outlook ${currentYear} | Future Prospects`,
      description: `Comprehensive outlook for ${symbol} covering growth catalysts, industry trends, and long-term investment potential.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/stock-outlook/${ticker.toLowerCase()}`,
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

export default async function StockOutlookPage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/stock-outlook/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Outlook indicators
  const revenueGrowth = metrics?.revenue_growth || 0
  const pe = metrics?.price_to_earnings_ratio || 0
  const yearChange = snapshot.week_52_change_percent || 0

  // Outlook rating
  const growthOutlook = revenueGrowth > 0.15 ? 'Strong' : revenueGrowth > 0.05 ? 'Moderate' : revenueGrowth > 0 ? 'Weak' : 'Negative'
  const valuationOutlook = pe > 0 && pe < 20 ? 'Attractive' : pe >= 20 && pe < 35 ? 'Fair' : pe >= 35 ? 'Stretched' : 'N/A'
  const momentumOutlook = yearChange > 20 ? 'Positive' : yearChange > 0 ? 'Neutral' : 'Negative'

  const overallOutlook =
    (growthOutlook === 'Strong' && valuationOutlook !== 'Stretched') ? 'Very Positive' :
    (growthOutlook === 'Moderate' || revenueGrowth > 0) ? 'Positive' :
    revenueGrowth > -0.05 ? 'Neutral' : 'Cautious'

  // Generate FAQs
  const faqs = [
    {
      question: `What is the outlook for ${symbol} stock?`,
      answer: `The outlook for ${symbol} is ${overallOutlook.toLowerCase()}. The company shows ${growthOutlook.toLowerCase()} growth (${(revenueGrowth * 100).toFixed(1)}% revenue growth), ${valuationOutlook.toLowerCase()} valuation${pe > 0 ? ` (P/E: ${pe.toFixed(1)})` : ''}, and ${momentumOutlook.toLowerCase()} momentum. ${sector ? `As a ${sector} company, ` : ''}${symbol} is positioned to ${revenueGrowth > 0.1 ? 'capitalize on industry tailwinds' : 'navigate current market conditions'}.`
    },
    {
      question: `Is ${symbol} stock going up or down?`,
      answer: `${symbol} has ${yearChange >= 0 ? `gained ${yearChange.toFixed(1)}%` : `declined ${Math.abs(yearChange).toFixed(1)}%`} over the past year. Future direction depends on ${revenueGrowth > 0 ? 'sustained growth execution, ' : 'business turnaround efforts, '}market sentiment, and macroeconomic conditions. The ${overallOutlook.toLowerCase()} outlook suggests ${overallOutlook === 'Very Positive' || overallOutlook === 'Positive' ? 'potential for appreciation' : 'mixed near-term prospects'}.`
    },
    {
      question: `What are ${symbol}'s growth prospects?`,
      answer: `${symbol} is growing revenue at ${(revenueGrowth * 100).toFixed(1)}% annually, which is ${growthOutlook === 'Strong' ? 'well above market averages and indicates strong expansion' : growthOutlook === 'Moderate' ? 'in line with steady business growth' : 'below expectations'}. ${sector ? `The ${sector} sector ` : 'Industry '}trends, competitive positioning, and innovation capabilities will drive future growth.`
    },
    {
      question: `What challenges does ${symbol} face?`,
      answer: `Key challenges for ${symbol} include: ${pe > 40 ? 'maintaining growth at current valuations, ' : ''}${revenueGrowth < 0 ? 'reversing revenue declines, ' : ''}competitive pressure${sector ? ` in the ${sector} sector` : ''}, regulatory changes, macroeconomic headwinds, and market volatility. Success depends on effective management execution and strategic adaptation.`
    },
    {
      question: `What are the catalysts for ${symbol} stock?`,
      answer: `Potential catalysts for ${symbol} include: product launches, market share gains, earnings beats, strategic partnerships, ${sector === 'Technology' ? 'technological innovation, ' : ''}operational improvements, and favorable industry trends. ${revenueGrowth > 0.1 ? 'Strong growth momentum could attract more investor interest.' : 'Turning around growth could be a major catalyst.'}`
    },
    {
      question: `Should I hold ${symbol} for the long term?`,
      answer: `Long-term holders should consider ${symbol}'s ${revenueGrowth > 0.1 ? 'strong growth trajectory, ' : ''}competitive position, ${sector ? `${sector} sector outlook, ` : ''}and financial health. ${overallOutlook === 'Very Positive' || overallOutlook === 'Positive' ? 'The positive outlook supports a long-term hold strategy for patient investors.' : 'Monitor fundamentals closely and reassess if conditions deteriorate significantly.'}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Outlook`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Outlook ${currentYear} - Future Prospects & Analysis`,
    description: `Comprehensive outlook for ${symbol} (${companyName}) covering growth prospects, industry trends, and long-term potential.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock outlook`,
      `${symbol} future prospects`,
      `${symbol} long-term outlook`,
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
            <span>{symbol} Outlook</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Outlook {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Future prospects and analysis for {companyName}
          </p>

          {/* Overall Outlook Card */}
          <div className={`${
            overallOutlook === 'Very Positive' ? 'bg-green-500/10 border-green-500/30' :
            overallOutlook === 'Positive' ? 'bg-blue-500/10 border-blue-500/30' :
            overallOutlook === 'Neutral' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Overall Outlook</p>
                <p className={`text-5xl font-bold ${
                  overallOutlook === 'Very Positive' ? 'text-green-500' :
                  overallOutlook === 'Positive' ? 'text-blue-500' :
                  overallOutlook === 'Neutral' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{overallOutlook}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Outlook Components */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Outlook Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-muted-foreground">Growth Outlook</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    growthOutlook === 'Strong' ? 'bg-green-500/20 text-green-500' :
                    growthOutlook === 'Moderate' ? 'bg-blue-500/20 text-blue-500' :
                    growthOutlook === 'Weak' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {growthOutlook}
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1">{(revenueGrowth * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Revenue Growth</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-muted-foreground">Valuation Outlook</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    valuationOutlook === 'Attractive' ? 'bg-green-500/20 text-green-500' :
                    valuationOutlook === 'Fair' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {valuationOutlook}
                  </span>
                </div>
                <p className="text-3xl font-bold mb-1">{pe > 0 ? pe.toFixed(1) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">P/E Ratio</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-muted-foreground">Momentum Outlook</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    momentumOutlook === 'Positive' ? 'bg-green-500/20 text-green-500' :
                    momentumOutlook === 'Neutral' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {momentumOutlook}
                  </span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${yearChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {yearChange >= 0 ? '+' : ''}{yearChange.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">52-Week Change</p>
              </div>
            </div>
          </section>

          {/* Future Prospects */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Future Prospects</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Growth Drivers</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {revenueGrowth > 0.1 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">+</span>
                      <span>Strong {(revenueGrowth * 100).toFixed(1)}% revenue growth demonstrates business momentum</span>
                    </li>
                  )}
                  {sector && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">+</span>
                      <span>{sector} sector positioned for long-term secular growth</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">+</span>
                    <span>Product innovation and market expansion opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">+</span>
                    <span>Potential for margin improvement and operational leverage</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Headwinds & Risks</h3>
                <ul className="space-y-2 text-muted-foreground">
                  {pe > 40 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span>High valuation multiples leave little room for disappointment</span>
                    </li>
                  )}
                  {revenueGrowth < 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span>Revenue headwinds require successful turnaround execution</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">-</span>
                    <span>Competitive pressure and potential market share erosion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">-</span>
                    <span>Macroeconomic uncertainty and potential recession risks</span>
                  </li>
                  {sector && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">-</span>
                      <span>Regulatory changes affecting the {sector} sector</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Time Horizon Outlook */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Outlook by Time Horizon</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Short-Term (0-6 months)</h3>
                <p className={`text-xl font-bold mb-2 ${
                  momentumOutlook === 'Positive' ? 'text-green-500' :
                  momentumOutlook === 'Neutral' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {momentumOutlook}
                </p>
                <p className="text-sm text-muted-foreground">
                  Near-term performance driven by earnings, market sentiment, and technical factors
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Medium-Term (6-18 months)</h3>
                <p className={`text-xl font-bold mb-2 ${
                  growthOutlook === 'Strong' ? 'text-green-500' :
                  growthOutlook === 'Moderate' ? 'text-blue-500' : 'text-yellow-500'
                }`}>
                  {growthOutlook === 'Strong' ? 'Positive' : growthOutlook === 'Moderate' ? 'Neutral' : 'Mixed'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Growth execution and competitive positioning will be key
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Long-Term (18+ months)</h3>
                <p className={`text-xl font-bold mb-2 ${
                  overallOutlook === 'Very Positive' || overallOutlook === 'Positive' ? 'text-green-500' :
                  overallOutlook === 'Neutral' ? 'text-blue-500' : 'text-yellow-500'
                }`}>
                  {overallOutlook === 'Very Positive' || overallOutlook === 'Positive' ? 'Constructive' :
                   overallOutlook === 'Neutral' ? 'Neutral' : 'Uncertain'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Secular trends and strategic positioning determine long-term value
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol}'s Performance</h2>
            <p className="text-muted-foreground mb-6">
              Get real-time updates, earnings alerts, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/forecast/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Price Forecast
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
            <p><strong>Disclaimer:</strong> This outlook is based on current information and should not be considered financial advice. Market conditions, company performance, and external factors can change rapidly. Future results may differ materially from current expectations. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock-outlook" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
