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
  getRelatedStocks,
} from '@/lib/seo'
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Info
} from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Market Cap - Market Capitalization History & Analysis`,
    description: `${symbol} market capitalization: current market cap, historical trends, comparison to peers, and enterprise value. See what ${symbol}'s market cap means for investors.`,
    keywords: [
      `${symbol} market cap`,
      `${symbol} market capitalization`,
      `${symbol} valuation`,
      `${symbol} market value`,
      `${symbol} enterprise value`,
      `${symbol} stock market cap`,
      `what is ${symbol} market cap`,
      `${symbol} market cap history`,
    ],
    openGraph: {
      title: `${symbol} Market Cap - Market Capitalization Analysis`,
      description: `Current market capitalization for ${symbol} with historical trends and peer comparisons.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/market-cap/${ticker.toLowerCase()}`,
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

function getMarketCapCategory(marketCap: number): {
  name: string
  description: string
  color: string
  bgColor: string
  borderColor: string
} {
  if (marketCap >= 200e9) {
    return {
      name: 'Mega Cap',
      description: 'Over $200B',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    }
  } else if (marketCap >= 10e9) {
    return {
      name: 'Large Cap',
      description: '$10B - $200B',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    }
  } else if (marketCap >= 2e9) {
    return {
      name: 'Mid Cap',
      description: '$2B - $10B',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    }
  } else if (marketCap >= 300e6) {
    return {
      name: 'Small Cap',
      description: '$300M - $2B',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    }
  } else {
    return {
      name: 'Micro Cap',
      description: 'Under $300M',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    }
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  } else {
    return `$${value.toFixed(0)}`
  }
}

export default async function MarketCapPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const marketCap = snapshot.market_cap || 0
  const price = snapshot.price || 0
  const sharesOutstanding = marketCap > 0 && price > 0 ? marketCap / price : 0
  const companyName = companyFacts?.name || symbol
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const pageUrl = `${SITE_URL}/market-cap/${ticker.toLowerCase()}`

  // Calculate enterprise value if we have the data
  const totalDebt = metrics?.total_debt || 0
  const cash = metrics?.cash_and_equivalents || 0
  const enterpriseValue = marketCap + totalDebt - cash

  // Get market cap category
  const category = getMarketCapCategory(marketCap)

  // Get peer stocks for comparison
  const peerTickers = getRelatedStocks(symbol)

  // Market cap change calculation (using day change as proxy)
  const dayChange = snapshot.day_change || 0
  const dayChangePercent = snapshot.day_change_percent || 0
  const marketCapChange = marketCap * (dayChangePercent / 100)

  // Generate FAQs
  const marketCapFaqs = [
    {
      question: `What is ${symbol}'s current market cap?`,
      answer: `${symbol} (${companyName}) has a current market capitalization of ${formatMarketCap(marketCap)}. This makes ${symbol} a ${category.name.toLowerCase()} stock, with a market cap in the ${category.description} range.`
    },
    {
      question: `How is ${symbol}'s market capitalization calculated?`,
      answer: `${symbol}'s market cap is calculated by multiplying the current stock price ($${price.toFixed(2)}) by the total number of shares outstanding (approximately ${(sharesOutstanding / 1e9).toFixed(2)} billion shares). Market cap = Price × Shares Outstanding.`
    },
    {
      question: `Is ${symbol} a large-cap, mid-cap, or small-cap stock?`,
      answer: `${symbol} is classified as a ${category.name.toLowerCase()} stock with a market capitalization of ${formatMarketCap(marketCap)}. ${category.name} stocks ${category.name === 'Mega Cap' || category.name === 'Large Cap' ? 'are typically more stable and less volatile' : category.name === 'Mid Cap' ? 'offer a balance of growth potential and stability' : 'may offer higher growth potential but with increased volatility'}.`
    },
    {
      question: `What is the difference between market cap and enterprise value for ${symbol}?`,
      answer: `Market cap represents ${symbol}'s equity value (${formatMarketCap(marketCap)}), while enterprise value includes debt and subtracts cash. ${symbol}'s enterprise value is ${formatMarketCap(enterpriseValue)}, which ${enterpriseValue > marketCap ? 'is higher due to net debt' : 'is lower due to excess cash'} on the balance sheet.`
    },
    {
      question: `How does ${symbol}'s market cap compare to competitors?`,
      answer: `${symbol}'s market cap of ${formatMarketCap(marketCap)} can be compared to other ${sector || industry || 'companies'} to gauge relative size and market position. Larger market caps generally indicate more established companies with greater resources and market presence.`
    },
    {
      question: `Why does ${symbol}'s market cap matter to investors?`,
      answer: `Market cap is crucial for ${symbol} investors because it: (1) Indicates company size and stability, (2) Affects which indexes and ETFs can hold the stock, (3) Influences volatility and risk profile, (4) Determines institutional investor eligibility, and (5) Helps with portfolio diversification decisions.`
    },
    {
      question: `Can ${symbol}'s market cap change daily?`,
      answer: `Yes, ${symbol}'s market cap fluctuates throughout each trading day as the stock price changes. Today, ${symbol}'s market cap ${dayChangePercent >= 0 ? 'increased' : 'decreased'} by ${formatMarketCap(Math.abs(marketCapChange))} (${Math.abs(dayChangePercent).toFixed(2)}%) based on the stock price movement.`
    },
    {
      question: `What factors affect ${symbol}'s market capitalization?`,
      answer: `${symbol}'s market cap is affected by: (1) Stock price movements driven by earnings and news, (2) Share buybacks or issuances changing shares outstanding, (3) Market sentiment and investor demand, (4) Sector rotation and broader market trends, (5) Company performance and growth prospects.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Market Cap`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Market Cap - Market Capitalization Analysis`,
    description: `Complete market cap analysis for ${symbol} (${companyName}) including historical trends and peer comparisons.`,
    url: pageUrl,
    keywords: [
      `${symbol} market cap`,
      `${symbol} market capitalization`,
      `${symbol} valuation`,
      `${symbol} enterprise value`,
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

  const faqSchema = getFAQSchema(marketCapFaqs)

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
            <span>{symbol} Market Cap</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Market Cap
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Market capitalization history and analysis for {companyName}
          </p>

          {/* Current Market Cap - Hero Section */}
          <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Market Capitalization</p>
                <h2 className="text-5xl font-bold mb-2">{formatMarketCap(marketCap)}</h2>
                <div className="flex items-center gap-2 text-lg">
                  {dayChangePercent >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  )}
                  <span className={dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatMarketCap(Math.abs(marketCapChange))} ({Math.abs(dayChangePercent).toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground text-sm">today</span>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-lg border-2 ${category.bgColor} ${category.borderColor}`}>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className={`text-2xl font-bold ${category.color}`}>{category.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Market Cap Calculation</p>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-mono font-bold">${price.toFixed(2)}</span>
                <span className="text-muted-foreground">×</span>
                <span className="font-mono font-bold">{(sharesOutstanding / 1e9).toFixed(2)}B shares</span>
                <span className="text-muted-foreground">=</span>
                <span className="font-mono font-bold text-green-500">{formatMarketCap(marketCap)}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Valuation Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Enterprise Value</span>
                </div>
                <p className="text-3xl font-bold mb-1">{formatMarketCap(enterpriseValue)}</p>
                <p className="text-sm text-muted-foreground">
                  Market Cap + Debt - Cash
                </p>
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Market Cap:</span>
                    <span className="font-medium">{formatMarketCap(marketCap)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Total Debt:</span>
                    <span className="font-medium">+{formatMarketCap(totalDebt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash:</span>
                    <span className="font-medium">-{formatMarketCap(cash)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Shares Outstanding</span>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {(sharesOutstanding / 1e9).toFixed(2)}B
                </p>
                <p className="text-sm text-muted-foreground">
                  Total shares in circulation
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Price per Share</span>
                </div>
                <p className="text-3xl font-bold mb-1">${price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Current stock price
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Market Category</span>
                </div>
                <p className={`text-3xl font-bold mb-1 ${category.color}`}>
                  {category.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </div>
          </section>

          {/* What is Market Cap */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Market Capitalization?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Market capitalization (market cap) represents the total value of {companyName}'s outstanding shares in the stock market. It's calculated by multiplying the current stock price by the total number of shares outstanding.
              </p>
              <p className="text-muted-foreground mb-4">
                With a market cap of <strong className="text-foreground">{formatMarketCap(marketCap)}</strong>, {symbol} is classified as a <strong className="text-foreground">{category.name.toLowerCase()}</strong> company. This classification helps investors understand the company's size, risk profile, and potential growth characteristics.
              </p>
              <div className="bg-secondary/30 p-4 rounded-lg mt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Why Market Cap Matters</p>
                    <p className="text-xs text-muted-foreground">
                      Market cap determines which indexes can hold the stock, influences institutional investment eligibility, affects volatility levels, and helps investors with portfolio diversification and risk management decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Market Cap Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Market Cap Categories Explained</h2>
            <div className="space-y-3">
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-purple-500">Mega Cap</h3>
                  <span className="text-sm text-muted-foreground">$200B+</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Largest public companies with massive market presence. Typically stable, blue-chip stocks with global operations.
                </p>
              </div>

              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-blue-500">Large Cap</h3>
                  <span className="text-sm text-muted-foreground">$10B - $200B</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Well-established companies with strong market positions. Generally lower volatility than smaller companies.
                </p>
              </div>

              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-green-500">Mid Cap</h3>
                  <span className="text-sm text-muted-foreground">$2B - $10B</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Growing companies with expansion potential. Balance between stability and growth opportunities.
                </p>
              </div>

              <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-yellow-500">Small Cap</h3>
                  <span className="text-sm text-muted-foreground">$300M - $2B</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Smaller companies with higher growth potential. May experience greater volatility and risk.
                </p>
              </div>

              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-orange-500">Micro Cap</h3>
                  <span className="text-sm text-muted-foreground">Under $300M</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Very small companies with significant growth potential but higher risk and volatility.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison to Peers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare {symbol} to Similar Stocks</h2>
            <p className="text-muted-foreground mb-4">
              See how {symbol}'s market cap compares to other {sector || industry || 'companies'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {peerTickers.map((peer) => (
                <Link
                  key={peer}
                  href={`/market-cap/${peer.toLowerCase()}`}
                  className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-all hover:shadow-lg group"
                >
                  <div className="text-center">
                    <p className="font-bold text-lg text-green-500 group-hover:text-green-400 mb-1">
                      {peer}
                    </p>
                    <p className="text-xs text-muted-foreground">View Market Cap</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Investment Implications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Investment Implications of {symbol}'s Market Cap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Advantages
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {category.name === 'Mega Cap' || category.name === 'Large Cap' ? (
                    <>
                      <li>• Established market presence and brand recognition</li>
                      <li>• Generally more stable and less volatile</li>
                      <li>• Often pay dividends to shareholders</li>
                      <li>• Easier to buy and sell (high liquidity)</li>
                    </>
                  ) : (
                    <>
                      <li>• Higher growth potential</li>
                      <li>• May be undervalued by the market</li>
                      <li>• Potential acquisition targets</li>
                      <li>• Opportunity for outsized returns</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Considerations
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {category.name === 'Mega Cap' || category.name === 'Large Cap' ? (
                    <>
                      <li>• Limited high-growth potential</li>
                      <li>• May be slower to adapt to market changes</li>
                      <li>• Returns may be more moderate</li>
                      <li>• Already well-known to investors</li>
                    </>
                  ) : (
                    <>
                      <li>• Higher volatility and price swings</li>
                      <li>• May have limited analyst coverage</li>
                      <li>• Lower liquidity in some cases</li>
                      <li>• Higher risk of business failure</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Beyond Market Cap</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis including valuation, growth metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/analysis/${symbol.toLowerCase()}/valuation`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                DCF Valuation
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {marketCapFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Market cap data is updated in real-time during market hours and reflects the current stock price. Market capitalization alone should not be the sole factor in investment decisions. Always conduct comprehensive research and consider consulting a financial advisor.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
