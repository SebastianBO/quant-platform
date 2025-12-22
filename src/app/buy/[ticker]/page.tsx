import { Metadata } from 'next'
import Link from 'next/link'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `Buy ${symbol} Stock ${currentYear} - Investment Guide & How to Purchase`,
    description: `Learn how to buy ${symbol} stock in ${currentYear}. Complete guide covering where to buy, investment thesis, broker recommendations, and step-by-step purchase instructions.`,
    keywords: [
      `buy ${symbol} stock`,
      `how to buy ${symbol}`,
      `buy ${symbol}`,
      `where to buy ${symbol} stock`,
      `purchase ${symbol} stock`,
      `invest in ${symbol}`,
      `${symbol} stock broker`,
    ],
    openGraph: {
      title: `How to Buy ${symbol} Stock - Investment Guide ${currentYear}`,
      description: `Complete guide to buying ${symbol} stock. Learn where to buy, investment thesis, and step-by-step purchase instructions.`,
      type: 'article',
      url: `${SITE_URL}/buy/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `How to Buy ${symbol} Stock ${currentYear}`,
      description: `Complete guide to buying ${symbol} stock including broker recommendations and investment analysis.`,
    },
    alternates: {
      canonical: `${SITE_URL}/buy/${ticker.toLowerCase()}`,
    },
  }
}

// Dynamic rendering - no static params
export const dynamic = 'force-dynamic'

async function getStockData(ticker: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const response = await fetch(
      `${baseUrl}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch (err) {
    console.error('Error fetching stock data:', err)
    return null
  }
}

export default async function BuyTickerPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  // Use fallback values if API fails - don't show 404 for valid tickers
  const snapshot = stockData?.snapshot || {}
  const companyFacts = stockData?.companyFacts || {}
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const sector = companyFacts?.sector || undefined
  const industry = companyFacts?.industry || undefined
  const description = companyFacts?.description || `${companyName} (${symbol}) common stock`
  const pageUrl = `${SITE_URL}/buy/${ticker.toLowerCase()}`

  // Top brokers for buying stocks
  const brokers = [
    {
      name: 'Fidelity',
      pros: ['No commissions', 'Excellent research', 'Fractional shares', 'Great mobile app'],
      bestFor: 'Long-term investors and beginners'
    },
    {
      name: 'Interactive Brokers',
      pros: ['Lowest margin rates', 'Global market access', 'Advanced tools', 'API trading'],
      bestFor: 'Active traders and international investors'
    },
    {
      name: 'Charles Schwab',
      pros: ['No commissions', 'Bank integration', '24/7 customer service', 'Research tools'],
      bestFor: 'All-in-one banking and investing'
    },
    {
      name: 'Robinhood',
      pros: ['Easy interface', 'No minimum', 'Fractional shares', 'Instant deposits'],
      bestFor: 'Beginners and small accounts'
    },
  ]

  // Steps for buying stock
  const buyingSteps = [
    {
      name: 'Choose a Broker',
      text: `Select a brokerage that fits your needs. For buying ${symbol}, consider factors like commission fees (most major brokers now offer $0 commissions), research tools, mobile app quality, and customer service. Popular options include Fidelity, Charles Schwab, Interactive Brokers, and Robinhood.`,
    },
    {
      name: 'Open and Fund Your Account',
      text: `Complete the account opening process by providing personal information, employment details, and financial information. Fund your account via bank transfer (ACH), wire transfer, or check. ACH transfers typically take 2-3 business days but some brokers offer instant deposit up to certain limits.`,
    },
    {
      name: 'Research the Stock',
      text: `Before buying ${symbol}, review the company's financial statements, earnings reports, analyst ratings, and recent news. Our platform provides AI-powered analysis, DCF valuations, and comprehensive metrics to help you make informed decisions about ${companyName}.`,
    },
    {
      name: 'Decide Order Type',
      text: `Choose between a market order (buy at current price) or limit order (specify maximum price). Market orders execute immediately but at the current market price. Limit orders give price control but may not execute if the stock doesn't reach your price. For ${symbol} at $${price.toFixed(2)}, consider using a limit order slightly above current price.`,
    },
    {
      name: 'Place Your Order',
      text: `Enter ${symbol} in your broker's search bar, specify the number of shares or dollar amount to purchase (fractional shares available at most brokers), select order type, and review the order details. Many brokers now support fractional shares, allowing you to invest specific dollar amounts.`,
    },
    {
      name: 'Monitor Your Investment',
      text: `After purchasing ${symbol}, monitor your investment regularly. Set up price alerts, review quarterly earnings reports, track analyst ratings, and reassess your investment thesis. Use our platform's AI analysis and real-time data to stay informed about ${companyName}'s performance.`,
    },
  ]

  // Investment considerations
  const investmentConsiderations = [
    {
      title: 'Dollar-Cost Averaging',
      description: `Instead of investing a lump sum, consider buying ${symbol} in smaller increments over time. This strategy reduces timing risk and can smooth out volatility. For example, invest $500 monthly rather than $6,000 at once.`,
    },
    {
      title: 'Position Sizing',
      description: `Don't overconcentrate in ${symbol}. A common rule is to limit individual stock positions to 5-10% of your portfolio. This diversification helps manage company-specific risk while still allowing meaningful exposure.`,
    },
    {
      title: 'Tax Implications',
      description: `Consider using tax-advantaged accounts like IRAs or 401(k)s for long-term ${symbol} holdings. Capital gains from stocks held over 1 year qualify for lower long-term tax rates (0-20% vs ordinary income rates). Keep detailed records for tax reporting.`,
    },
    {
      title: 'Investment Time Horizon',
      description: `Determine your holding period before buying ${symbol}. Long-term investors (5+ years) can better weather volatility and benefit from compound growth. Short-term traders need different strategies and risk management approaches.`,
    },
  ]

  // FAQs specific to buying
  const faqs = [
    {
      question: `How much money do I need to buy ${symbol} stock?`,
      answer: `With fractional shares available at most brokers, you can buy ${symbol} with as little as $1-5. At the current price of $${price.toFixed(2)}, one full share costs exactly that amount. However, many financial advisors recommend starting with at least $500-1,000 to build a diversified portfolio and offset trading costs.`,
    },
    {
      question: `What is the best time to buy ${symbol} stock?`,
      answer: `There's no perfect time to buy stocks. Rather than timing the market, focus on ${symbol}'s fundamentals, valuation, and your investment timeline. Dollar-cost averaging (buying regularly over time) removes timing pressure. Avoid buying after major price spikes; instead, look for pullbacks or consolidation periods. Our AI analysis can help identify potentially attractive entry points.`,
    },
    {
      question: `Can I buy ${symbol} stock after hours?`,
      answer: `Yes, most brokers offer extended-hours trading for ${symbol}, typically 4:00 AM - 9:30 AM ET (pre-market) and 4:00 PM - 8:00 PM ET (after-hours). However, extended hours have lower liquidity and wider bid-ask spreads, potentially resulting in worse prices. For most investors, trading during regular hours (9:30 AM - 4:00 PM ET) is recommended.`,
    },
    {
      question: `Should I buy ${symbol} stock now or wait?`,
      answer: `The decision depends on ${symbol}'s current valuation, your investment goals, and market conditions. Review our comprehensive analysis including P/E ratio, growth prospects, analyst ratings, and AI-powered insights. If ${symbol} meets your investment criteria and fits your risk tolerance, dollar-cost averaging into a position can reduce timing risk. Avoid making purchase decisions based solely on recent price movements.`,
    },
    {
      question: `What are the risks of buying ${symbol} stock?`,
      answer: `All stocks carry risk, including ${symbol}. Key risks include market volatility, company-specific challenges, sector headwinds, competitive pressures, regulatory changes, and macroeconomic factors. ${companyName} operates in ${sector || 'its sector'}, which has specific industry dynamics. Diversify your portfolio and only invest money you won't need in the short term.`,
    },
    {
      question: `Do I need a minimum amount to open a brokerage account?`,
      answer: `Most major brokers (Fidelity, Charles Schwab, Robinhood, Webull) have $0 minimum deposits to open accounts, making it easy to start buying ${symbol}. However, some specialized accounts (like margin accounts) or premium services may have minimums. Interactive Brokers requires no minimum for standard accounts.`,
    },
    {
      question: `Are there fees for buying ${symbol} stock?`,
      answer: `Most major U.S. brokers now offer $0 commission trading for stocks like ${symbol}. However, be aware of potential fees: SEC fees (small percentage of sale proceeds), wire transfer fees, paper statement fees, or account inactivity fees. Brokers make money through payment for order flow, margin interest, and premium services. Always review your broker's fee schedule.`,
    },
    {
      question: `Can I buy ${symbol} stock in my IRA or 401(k)?`,
      answer: `Yes, if your IRA or 401(k) offers a brokerage option (self-directed IRA or brokerage link), you can buy ${symbol}. IRAs generally offer more flexibility than 401(k)s. Tax-advantaged accounts are excellent for long-term stock holdings, allowing gains to grow tax-deferred (traditional IRA) or tax-free (Roth IRA). Check with your plan administrator about available investment options.`,
    },
  ]

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Buy ${symbol}`, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `How to Buy ${symbol} Stock - Complete Investment Guide ${currentYear}`,
    description: `Complete guide to buying ${companyName} (${symbol}) stock including broker recommendations, step-by-step instructions, and investment considerations.`,
    url: pageUrl,
    keywords: [`buy ${symbol}`, `how to buy ${symbol}`, `purchase ${symbol} stock`, `invest in ${symbol}`],
  })

  // HowTo Schema for buying process
  const howToSchema = getHowToSchema({
    name: `How to Buy ${symbol} Stock`,
    description: `Step-by-step guide to purchasing ${companyName} (${symbol}) stock`,
    steps: buyingSteps,
  })

  // Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(faqs)

  // Combine schemas
  const schemas = [breadcrumbSchema, articleSchema, howToSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>Buy {symbol}</span>
          </nav>

          {/* Main Title */}
          <h1 className="text-4xl font-bold mb-4">
            How to Buy {symbol} Stock in {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete investment guide for purchasing {companyName} stock
          </p>

          {/* Quick Summary Box */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-2xl font-bold text-green-500">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="text-xl font-semibold">
                  {snapshot.market_cap
                    ? `$${(snapshot.market_cap / 1e9).toFixed(1)}B`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Minimum Investment</p>
                <p className="text-xl font-semibold">$1 (fractional)</p>
              </div>
            </div>
          </div>

          {/* Best Brokers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Best Brokers for Buying {symbol}</h2>
            <div className="space-y-4">
              {brokers.map((broker, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{broker.name}</h3>
                      <p className="text-sm text-muted-foreground">{broker.bestFor}</p>
                    </div>
                    <span className="text-xs bg-green-600/20 text-green-500 px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {broker.pros.map((pro, i) => (
                      <span key={i} className="text-xs bg-secondary px-3 py-1 rounded-full">
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Step-by-Step: How to Buy {symbol}</h2>
            <div className="space-y-6">
              {buyingSteps.map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                      <p className="text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Investment Considerations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentConsiderations.map((consideration, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{consideration.title}</h3>
                  <p className="text-sm text-muted-foreground">{consideration.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Current Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Current {symbol} Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Before buying {symbol}, review our comprehensive analysis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link
                  href={`/stock/${ticker.toLowerCase()}`}
                  className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <p className="font-semibold text-green-500 mb-1">Stock Analysis</p>
                  <p className="text-sm text-muted-foreground">Financials, metrics, charts & news</p>
                </Link>
                <Link
                  href={`/should-i-buy/${ticker.toLowerCase()}`}
                  className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <p className="font-semibold text-green-500 mb-1">Investment Recommendation</p>
                  <p className="text-sm text-muted-foreground">AI-powered buy/sell/hold analysis</p>
                </Link>
                <Link
                  href={`/prediction/${ticker.toLowerCase()}`}
                  className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <p className="font-semibold text-green-500 mb-1">Price Prediction</p>
                  <p className="text-sm text-muted-foreground">Future price targets & forecasts</p>
                </Link>
                <Link
                  href={`/dashboard?ticker=${symbol}&tab=ai`}
                  className="bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <p className="font-semibold text-green-500 mb-1">AI Insights</p>
                  <p className="text-sm text-muted-foreground">Deep analysis & recommendations</p>
                </Link>
              </div>
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

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-green-500/20 p-8 rounded-xl border border-green-500/30 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Buy {symbol}?</h2>
            <p className="text-muted-foreground mb-6">
              Get the complete analysis, AI insights, and real-time data you need to make an informed investment decision
            </p>
            <Link
              href={`/dashboard?ticker=${symbol}&tab=overview`}
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              View Full {symbol} Analysis
            </Link>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="buy" companyName={companyName} />
        </div>
      </main>
    </>
  )
}

