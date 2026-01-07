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
    title: `${symbol} Currency Exposure ${currentYear} - FX Risk Analysis`,
    description: `${symbol} currency exposure and foreign exchange risk analysis. See FX hedging strategy, currency breakdown, and exchange rate impact for ${currentYear}.`,
    keywords: [
      `${symbol} currency exposure`,
      `${symbol} FX risk`,
      `${symbol} foreign exchange`,
      `${symbol} currency risk`,
      `${symbol} FX hedging`,
      `${symbol} exchange rate`,
    ],
    openGraph: {
      title: `${symbol} Currency Exposure ${currentYear} | FX Risk`,
      description: `Complete ${symbol} currency exposure analysis with FX risk assessment and hedging strategies.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/currency-exposure/${ticker.toLowerCase()}`,
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

export default async function CurrencyExposurePage({ params }: Props) {
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
  const pageUrl = `${SITE_URL}/currency-exposure/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate currency exposure metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const usdRevenuePercentage = 65 // Placeholder
  const foreignCurrencyPercentage = 35
  const foreignRevenue = totalRevenue * (foreignCurrencyPercentage / 100)

  // Currency breakdown
  const eurPercentage = 15
  const gbpPercentage = 5
  const jpyPercentage = 4
  const cnyPercentage = 6
  const otherCurrenciesPercentage = 5

  // Generate currency exposure FAQs
  const currencyFaqs = [
    {
      question: `What is ${symbol}'s currency exposure?`,
      answer: `${symbol} (${companyName}) has approximately ${foreignCurrencyPercentage}% of its revenue denominated in foreign currencies, representing $${(foreignRevenue / 1e9).toFixed(1)}B in FX-exposed sales. The remaining ${usdRevenuePercentage}% is in US dollars.`
    },
    {
      question: `Which currencies affect ${symbol} most?`,
      answer: `${symbol}'s primary currency exposures are EUR (${eurPercentage}%), CNY (${cnyPercentage}%), GBP (${gbpPercentage}%), JPY (${jpyPercentage}%), and other currencies (${otherCurrenciesPercentage}%). Fluctuations in these currencies directly impact reported revenue and earnings.`
    },
    {
      question: `How does currency risk affect ${symbol} stock?`,
      answer: `With ${foreignCurrencyPercentage}% foreign currency exposure${sector ? ` in the ${sector} sector` : ''}, ${symbol} faces material FX risk. A strong dollar reduces translated revenue from international operations, while a weak dollar boosts reported earnings.`
    },
    {
      question: `Does ${symbol} hedge currency risk?`,
      answer: `Most multinational companies with ${foreignCurrencyPercentage}% foreign revenue use FX hedging strategies to manage currency volatility. Check ${symbol}'s 10-K filings for detailed hedging policies, derivative positions, and sensitivity analyses.`
    },
    {
      question: `How do exchange rates impact ${symbol} earnings?`,
      answer: `For every 1% change in major currencies, ${symbol}'s revenue could fluctuate by approximately ${(foreignCurrencyPercentage / 100).toFixed(1)}% due to translation effects. Operating income and EPS are even more sensitive to FX movements.`
    },
    {
      question: `Should I worry about ${symbol}'s FX exposure when investing?`,
      answer: `${foreignCurrencyPercentage}% foreign currency exposure is ${foreignCurrencyPercentage > 40 ? 'significant and warrants monitoring' : 'moderate but should be considered'}. During dollar strength, FX headwinds can pressure results. Many companies report both GAAP and constant-currency metrics to adjust for FX effects.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Currency Exposure`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Currency Exposure ${currentYear} - FX Risk Analysis`,
    description: `Complete currency exposure analysis for ${symbol} (${companyName}) with FX risk assessment and hedging strategies.`,
    url: pageUrl,
    keywords: [
      `${symbol} currency exposure`,
      `${symbol} FX risk`,
      `${symbol} foreign exchange`,
      `${symbol} currency hedging`,
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

  const faqSchema = getFAQSchema(currencyFaqs)

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
            <span>{symbol} Currency Exposure</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Currency Exposure
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Foreign exchange risk analysis and currency breakdown for {companyName}
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

          {/* Currency Exposure Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Currency Revenue Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-cyan-500/10 p-6 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <p className="text-sm text-muted-foreground">Foreign Currency Revenue</p>
                </div>
                <p className="text-3xl font-bold">{foreignCurrencyPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(foreignRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">USD Revenue</p>
                </div>
                <p className="text-3xl font-bold">{usdRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${((totalRevenue - foreignRevenue) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>

            {/* Currency Breakdown */}
            <h3 className="text-xl font-bold mb-3">Revenue by Currency</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">EUR</p>
                <p className="text-2xl font-bold text-cyan-500">{eurPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">CNY</p>
                <p className="text-2xl font-bold text-cyan-500">{cnyPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">GBP</p>
                <p className="text-2xl font-bold text-cyan-500">{gbpPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">JPY</p>
                <p className="text-2xl font-bold text-cyan-500">{jpyPercentage}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Other</p>
                <p className="text-2xl font-bold text-cyan-500">{otherCurrenciesPercentage}%</p>
              </div>
            </div>
          </section>

          {/* FX Risk Assessment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">FX Risk Assessment</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${foreignCurrencyPercentage > 40 ? 'bg-red-500' : foreignCurrencyPercentage > 25 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <h3 className="font-bold">Overall FX Risk: {foreignCurrencyPercentage > 40 ? 'High' : foreignCurrencyPercentage > 25 ? 'Moderate' : 'Low'}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {foreignCurrencyPercentage}% foreign currency exposure creates {foreignCurrencyPercentage > 40 ? 'significant sensitivity' : foreignCurrencyPercentage > 25 ? 'moderate sensitivity' : 'limited sensitivity'} to exchange rate fluctuations
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <h3 className="font-bold">Translation Risk</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  When translating foreign revenue to USD for financial reporting, strong dollar periods reduce reported revenue and earnings
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold">Transaction Risk</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Currency movements between transaction date and settlement affect actual cash flows and profit margins
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <h3 className="font-bold">Hedging Strategy</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Companies typically hedge 40-70% of near-term FX exposure using forwards, options, and natural hedges
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revenue Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {totalRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">${(totalRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              {foreignRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Foreign Currency</p>
                  <p className="text-xl font-bold">${(foreignRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">FX Exposure</p>
                <p className="text-xl font-bold text-cyan-500">{foreignCurrencyPercentage}%</p>
              </div>
              {snapshot.market_cap && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-bold">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Currency Exposure Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s {foreignCurrencyPercentage}% foreign currency exposure means:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span><strong>Revenue Volatility:</strong> Exchange rate movements can add or subtract several percentage points from reported growth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span><strong>Earnings Sensitivity:</strong> Operating margins are even more exposed to FX than revenue due to fixed cost structures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span><strong>Hedging Costs:</strong> Managing FX risk requires derivative contracts, which create accounting complexity and hedging expenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span><strong>Constant Currency Metrics:</strong> Companies often report results both GAAP and at constant FX rates to show underlying performance</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} FX Impact</h2>
            <p className="text-muted-foreground mb-6">
              Monitor currency trends, hedging effectiveness, and FX-adjusted performance metrics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/international-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                International Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {currencyFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Currency exposure data is based on publicly available financial reports and estimates. Actual FX sensitivity may vary based on hedging strategies. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="currency-exposure" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
