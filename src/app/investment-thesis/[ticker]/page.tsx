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

  return {
    title: `${symbol} Investment Thesis - Why Invest in ${symbol} Stock`,
    description: `Complete investment thesis for ${symbol}. Detailed analysis of competitive advantages, growth drivers, financial strength, valuation, and key risks to help build your investment case.`,
    keywords: [
      `${symbol} investment thesis`,
      `${symbol} investment case`,
      `why invest in ${symbol}`,
      `${symbol} competitive advantage`,
      `${symbol} moat`,
      `${symbol} investment rationale`,
    ],
    openGraph: {
      title: `${symbol} Investment Thesis | Why Invest in ${symbol}`,
      description: `Comprehensive investment thesis for ${symbol} covering competitive advantages, growth drivers, and key risks.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/investment-thesis/${ticker.toLowerCase()}`,
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

export default async function InvestmentThesisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/investment-thesis/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const description = companyFacts?.description || ''

  // Key metrics
  const revenueGrowth = metrics?.revenue_growth || 0
  const pe = metrics?.price_to_earnings_ratio || 0
  const marketCap = snapshot.market_cap || 0
  const yearChange = snapshot.week_52_change_percent || 0

  // Thesis strength
  const hasStrongGrowth = revenueGrowth > 0.15
  const hasReasonableValuation = pe > 0 && pe < 30
  const isLargeCap = marketCap > 10e9
  const hasPositiveMomentum = yearChange > 0

  const thesisStrength =
    [hasStrongGrowth, hasReasonableValuation, isLargeCap, hasPositiveMomentum].filter(Boolean).length

  const thesisRating = thesisStrength >= 3 ? 'Compelling' :
                       thesisStrength >= 2 ? 'Solid' : 'Developing'

  // Generate FAQs
  const faqs = [
    {
      question: `What is the investment thesis for ${symbol}?`,
      answer: `The investment thesis for ${symbol} centers on ${hasStrongGrowth ? `strong ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}${isLargeCap ? 'market leadership, ' : ''}${sector ? `positioning in the ${sector} sector, ` : ''}and ${hasReasonableValuation ? 'attractive valuation relative to growth prospects' : 'future potential'}. ${description ? description.slice(0, 150) + '...' : `${companyName} aims to capitalize on industry trends and competitive advantages.`}`
    },
    {
      question: `Why should I invest in ${symbol}?`,
      answer: `Key reasons to invest in ${symbol}: ${hasStrongGrowth ? `(1) Impressive ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}(2) ${sector ? `Strong ${sector} sector fundamentals` : 'Solid business model'}, (3) ${isLargeCap ? 'Established market position' : 'Growth potential'}, ${hasReasonableValuation && pe > 0 ? `(4) Reasonable P/E of ${pe.toFixed(1)}` : `(4) Strategic positioning`}. The ${thesisRating.toLowerCase()} thesis is rated ${thesisStrength}/4 on our framework.`
    },
    {
      question: `What is ${symbol}'s competitive advantage?`,
      answer: `${symbol}'s competitive advantages include: ${isLargeCap ? 'scale and market leadership, ' : ''}${sector === 'Technology' ? 'technological innovation, ' : ''}${revenueGrowth > 0.15 ? 'strong growth execution, ' : ''}${industry ? `${industry} industry expertise, ` : ''}brand recognition, and ${sector ? `${sector} sector positioning` : 'operational capabilities'}. These create barriers to entry and sustainable returns.`
    },
    {
      question: `What are the growth drivers for ${symbol}?`,
      answer: `Primary growth drivers for ${symbol}: market expansion, product innovation, ${sector === 'Technology' ? 'technology adoption, ' : ''}operational leverage, ${revenueGrowth > 0.1 ? 'proven execution track record, ' : ''}strategic partnerships, and favorable ${sector ? `${sector} sector ` : ''}trends. Revenue is currently growing at ${(revenueGrowth * 100).toFixed(1)}% annually.`
    },
    {
      question: `What are the risks to ${symbol}'s investment thesis?`,
      answer: `Key risks include: ${pe > 35 ? 'valuation concerns, ' : ''}${revenueGrowth < 0 ? 'revenue challenges, ' : ''}competitive pressure, ${sector ? `${sector} sector headwinds, ` : ''}execution risk, regulatory changes, macroeconomic factors, and market volatility. Investors should monitor these factors and ensure they align with their risk tolerance.`
    },
    {
      question: `Is ${symbol} a value or growth stock?`,
      answer: `${symbol} is best characterized as a ${revenueGrowth > 0.15 ? 'growth' : revenueGrowth > 0.05 ? 'growth-at-a-reasonable-price (GARP)' : 'value'} stock. With ${(revenueGrowth * 100).toFixed(1)}% revenue growth and ${pe > 0 ? `a P/E of ${pe.toFixed(1)}` : 'current metrics'}, it appeals to investors seeking ${revenueGrowth > 0.1 ? 'capital appreciation through growth' : 'value and potential recovery'}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Investment Thesis`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Investment Thesis - Why Invest in ${symbol}`,
    description: `Complete investment thesis for ${symbol} (${companyName}) covering competitive advantages, growth drivers, and key risks.`,
    url: pageUrl,
    keywords: [
      `${symbol} investment thesis`,
      `${symbol} investment case`,
      `why invest in ${symbol}`,
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
            <span>{symbol} Investment Thesis</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Investment Thesis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Why invest in {companyName}
          </p>

          {/* Thesis Rating Card */}
          <div className={`${
            thesisRating === 'Compelling' ? 'bg-green-500/10 border-green-500/30' :
            thesisRating === 'Solid' ? 'bg-blue-500/10 border-blue-500/30' :
            'bg-yellow-500/10 border-yellow-500/30'
          } p-8 rounded-xl border mb-8`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-2">Thesis Strength</p>
                <p className={`text-5xl font-bold ${
                  thesisRating === 'Compelling' ? 'text-green-500' :
                  thesisRating === 'Solid' ? 'text-blue-500' :
                  'text-yellow-500'
                }`}>{thesisRating}</p>
                <p className="text-sm text-muted-foreground mt-2">Score: {thesisStrength}/4</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground leading-relaxed mb-4">
                {companyName} ({symbol}) {description ? description.slice(0, 200) + '...' : `operates in the ${sector || 'stock market'} sector`}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The investment thesis rests on {hasStrongGrowth ? `exceptional ${(revenueGrowth * 100).toFixed(1)}% revenue growth, ` : ''}
                {isLargeCap ? 'market leadership, ' : ''}
                {sector ? `favorable ${sector} sector dynamics, ` : ''}
                and {hasReasonableValuation ? 'attractive valuation' : 'long-term potential'}.
                At $${price.toFixed(2)}, {symbol} represents a {thesisRating.toLowerCase()} investment opportunity
                for {revenueGrowth > 0.1 ? 'growth-oriented' : 'value-minded'} investors.
              </p>
            </div>
          </section>

          {/* Core Thesis Pillars */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Core Investment Pillars</h2>
            <div className="space-y-4">
              {/* Pillar 1: Growth */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasStrongGrowth ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    <span className={`text-xl ${hasStrongGrowth ? 'text-green-500' : 'text-blue-500'}`}>
                      {hasStrongGrowth ? '✓' : '◉'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">Growth & Expansion</h3>
                </div>
                <p className="text-muted-foreground pl-13">
                  {symbol} demonstrates {revenueGrowth > 0.15 ? 'exceptional' : revenueGrowth > 0.05 ? 'solid' : 'developing'} growth
                  with {(revenueGrowth * 100).toFixed(1)}% annual revenue increase.
                  {hasStrongGrowth ? ' This above-market growth rate indicates strong market demand and effective execution.' :
                   revenueGrowth > 0 ? ' Steady growth provides a foundation for long-term value creation.' :
                   ' The company is working to return to growth through strategic initiatives.'}
                </p>
              </div>

              {/* Pillar 2: Market Position */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLargeCap ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    <span className={`text-xl ${isLargeCap ? 'text-green-500' : 'text-blue-500'}`}>
                      {isLargeCap ? '✓' : '◉'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">Competitive Position</h3>
                </div>
                <p className="text-muted-foreground pl-13">
                  With a ${(marketCap / 1e9).toFixed(1)}B market capitalization, {symbol} is {isLargeCap ? 'an established leader' : 'a growing player'}
                  {sector ? ` in the ${sector} sector` : ''}.
                  {isLargeCap ? ' This scale provides competitive advantages through resources, brand recognition, and market influence.' :
                   ' The company has room to expand market share and scale operations.'}
                </p>
              </div>

              {/* Pillar 3: Valuation */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasReasonableValuation ? 'bg-green-500/20' : 'bg-yellow-500/20'
                  }`}>
                    <span className={`text-xl ${hasReasonableValuation ? 'text-green-500' : 'text-yellow-500'}`}>
                      {hasReasonableValuation ? '✓' : '◉'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">Valuation & Returns</h3>
                </div>
                <p className="text-muted-foreground pl-13">
                  At {pe > 0 ? `a P/E ratio of ${pe.toFixed(1)}` : 'current levels'}, {symbol} trades at
                  {hasReasonableValuation ? ' an attractive valuation relative to its growth profile and sector peers' :
                   pe > 30 ? ' a premium valuation that reflects high expectations' :
                   ' levels that warrant careful consideration of risk-reward dynamics'}.
                  {hasReasonableValuation && hasStrongGrowth ? ' This combination of growth and value creates compelling upside potential.' : ''}
                </p>
              </div>

              {/* Pillar 4: Momentum */}
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasPositiveMomentum ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <span className={`text-xl ${hasPositiveMomentum ? 'text-green-500' : 'text-red-500'}`}>
                      {hasPositiveMomentum ? '✓' : '◉'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">Market Momentum</h3>
                </div>
                <p className="text-muted-foreground pl-13">
                  {symbol} has {yearChange >= 0 ? `gained ${yearChange.toFixed(1)}%` : `declined ${Math.abs(yearChange).toFixed(1)}%`} over the past year,
                  {hasPositiveMomentum ? ' demonstrating positive investor sentiment and market validation of the business strategy.' :
                   ' which may present a buying opportunity for patient long-term investors willing to look past near-term volatility.'}
                </p>
              </div>
            </div>
          </section>

          {/* Risk Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Risk Factors</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">!</span>
                  <span className="text-muted-foreground">
                    <strong>Valuation Risk:</strong> {pe > 35 ? `High P/E of ${pe.toFixed(1)} leaves little margin for error` :
                                                       pe > 0 ? `Current valuation requires sustained growth to justify` :
                                                       'Valuation metrics require careful monitoring'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">!</span>
                  <span className="text-muted-foreground">
                    <strong>Execution Risk:</strong> Delivering on growth expectations requires flawless operational execution
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">!</span>
                  <span className="text-muted-foreground">
                    <strong>Competition:</strong> {sector ? `${sector} sector` : 'Industry'} faces intense competitive pressure and potential disruption
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">!</span>
                  <span className="text-muted-foreground">
                    <strong>Market Risk:</strong> Macroeconomic conditions and market volatility can impact performance
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Investment Suitability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Suitability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <h3 className="font-bold text-lg mb-3 text-green-500">Good Fit For</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {revenueGrowth > 0.1 ? 'Growth investors' : 'Value investors'} seeking {revenueGrowth > 0.1 ? 'capital appreciation' : 'potential recovery'}</li>
                  <li>• Long-term investors with {thesisStrength >= 3 ? '3-5' : '5-10'} year time horizon</li>
                  <li>• Portfolio diversification in {sector || 'various sectors'}</li>
                  <li>• {isLargeCap ? 'Core holdings' : 'Satellite positions'} in growth portfolios</li>
                </ul>
              </div>

              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <h3 className="font-bold text-lg mb-3 text-red-500">Not Ideal For</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Short-term traders seeking quick profits</li>
                  <li>• Risk-averse investors seeking income/dividends</li>
                  <li>• Those uncomfortable with {pe > 30 ? 'high valuation multiples' : 'market volatility'}</li>
                  <li>• Investors seeking {revenueGrowth > 0.1 ? 'defensive' : 'high-growth'} characteristics</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Dive Deeper into {symbol}</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed financials, DCF models, and AI-powered analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Analysis
              </Link>
              <Link
                href={`/bull-case/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Bull Case
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
            <p><strong>Disclaimer:</strong> This investment thesis is for informational purposes only and should not be considered financial advice. Investment decisions should be based on your own research, financial situation, risk tolerance, and investment objectives. Consult a qualified financial advisor before making any investment decisions. Past performance does not guarantee future results.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="investment-thesis" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
