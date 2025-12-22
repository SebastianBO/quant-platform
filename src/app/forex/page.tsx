import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Live Forex Rates - EUR/USD, GBP/USD, USD/JPY Currency Exchange Rates',
  description: 'Real-time forex rates and currency exchange rates. Track major currency pairs including EUR/USD, GBP/USD, USD/JPY, and more. Live foreign exchange data updated every 5 minutes.',
  keywords: [
    'forex rates',
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'currency exchange rates',
    'live forex',
    'USD to EUR',
    'foreign exchange',
    'currency converter',
    'forex trading',
    'fx rates',
    'exchange rates today',
    'USD/CAD',
    'AUD/USD',
    'currency pairs',
    'forex market',
    'real-time forex',
    'currency trading',
  ],
  openGraph: {
    title: 'Live Forex & Currency Exchange Rates',
    description: 'Real-time forex rates for major currency pairs. Track EUR/USD, GBP/USD, USD/JPY and more.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/forex',
  },
}

const MAJOR_PAIRS = [
  { from: 'EUR', to: 'USD', name: 'Euro / US Dollar', description: 'The world\'s most traded currency pair' },
  { from: 'GBP', to: 'USD', name: 'British Pound / US Dollar', description: 'Known as "Cable" in forex markets' },
  { from: 'USD', to: 'JPY', name: 'US Dollar / Japanese Yen', description: 'Major Asian currency pair' },
  { from: 'USD', to: 'CHF', name: 'US Dollar / Swiss Franc', description: 'Safe haven currency pair' },
  { from: 'AUD', to: 'USD', name: 'Australian Dollar / US Dollar', description: 'Commodity-linked currency' },
  { from: 'USD', to: 'CAD', name: 'US Dollar / Canadian Dollar', description: 'North American pair' },
  { from: 'NZD', to: 'USD', name: 'New Zealand Dollar / US Dollar', description: 'Pacific region currency' },
  { from: 'EUR', to: 'GBP', name: 'Euro / British Pound', description: 'Major European cross' },
]

const ADDITIONAL_CURRENCIES = [
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
]

const faqs = [
  {
    question: 'What are forex rates and how do they work?',
    answer: 'Forex rates (foreign exchange rates) represent the value of one currency relative to another. For example, if EUR/USD is 1.10, it means 1 Euro equals 1.10 US Dollars. These rates fluctuate continuously based on supply and demand, economic indicators, central bank policies, geopolitical events, and market sentiment.',
  },
  {
    question: 'What is the EUR/USD exchange rate today?',
    answer: 'EUR/USD is the most traded currency pair in the forex market, representing the exchange rate between the Euro and US Dollar. Our platform provides real-time EUR/USD rates updated every 5 minutes during market hours. Check the live rates above for the current EUR/USD exchange rate.',
  },
  {
    question: 'How often do forex rates update?',
    answer: 'Our forex rates are updated every 5 minutes during market hours using real-time data from EODHD. The forex market operates 24 hours a day, 5 days a week (Sunday evening through Friday evening EST), allowing continuous trading across different time zones and financial centers worldwide.',
  },
  {
    question: 'What moves currency exchange rates?',
    answer: 'Currency exchange rates are influenced by multiple factors: interest rate differentials set by central banks, economic data (GDP, employment, inflation), trade balances, political stability, market sentiment, and capital flows. Central bank policies and interest rate decisions are among the most significant drivers of forex rates.',
  },
  {
    question: 'What is the difference between forex and currency exchange?',
    answer: 'Forex (foreign exchange) and currency exchange refer to the same concept - converting one currency into another. However, "forex" typically refers to the global decentralized market where currencies are traded, while "currency exchange" often refers to the physical exchange of money at banks or exchange bureaus.',
  },
  {
    question: 'Can I use these rates for currency conversion?',
    answer: 'Yes, our forex rates provide accurate real-time data for currency conversion calculations. However, note that banks and currency exchange services typically charge a spread (markup) above the market rate. The rates shown here are mid-market rates - the midpoint between buying and selling prices.',
  },
  {
    question: 'What are the most traded currency pairs?',
    answer: 'The major currency pairs (accounting for ~80% of forex trading volume) are: EUR/USD (Euro/Dollar), USD/JPY (Dollar/Yen), GBP/USD (Pound/Dollar), USD/CHF (Dollar/Franc), AUD/USD (Aussie/Dollar), USD/CAD (Dollar/Loonie), and NZD/USD (Kiwi/Dollar). EUR/USD alone accounts for about 25% of daily forex trading.',
  },
  {
    question: 'What is a currency pair in forex trading?',
    answer: 'A currency pair represents the quotation of two different currencies, showing how much of the quote currency is needed to purchase one unit of the base currency. In EUR/USD, EUR is the base currency and USD is the quote currency. If EUR/USD = 1.10, you need 1.10 USD to buy 1 EUR.',
  },
  {
    question: 'What is the spread in forex trading?',
    answer: 'The spread is the difference between the bid price (what buyers will pay) and the ask price (what sellers want) for a currency pair. It represents the cost of trading and is typically measured in pips (percentage in point). Major pairs like EUR/USD usually have tighter spreads than exotic currency pairs.',
  },
  {
    question: 'How does USD to EUR conversion work?',
    answer: 'To convert USD to EUR, you divide the USD amount by the EUR/USD rate. For example, if EUR/USD is 1.10 and you have $1,100 USD, divide 1,100 by 1.10 to get 1,000 EUR. For EUR to USD conversion, multiply the EUR amount by the EUR/USD rate: 1,000 EUR × 1.10 = $1,100 USD.',
  },
  {
    question: 'What affects the GBP/USD exchange rate?',
    answer: 'GBP/USD (called "Cable") is influenced by Bank of England monetary policy, UK economic data (inflation, employment, GDP), Brexit-related developments, US Federal Reserve decisions, and relative interest rate differentials. Political events in both countries and global risk sentiment also impact this major currency pair.',
  },
  {
    question: 'Why is USD/JPY important in forex trading?',
    answer: 'USD/JPY is crucial as the most traded Asian currency pair and a key indicator of risk appetite. The Japanese Yen is a safe-haven currency - when markets are uncertain, investors buy JPY, causing USD/JPY to fall. Bank of Japan policies, US-Japan interest rate differentials, and Asian economic conditions drive this pair.',
  },
  {
    question: 'When is the best time to trade forex?',
    answer: 'The forex market operates 24/5, but the best trading times are during market overlaps: London-New York overlap (8 AM - 12 PM EST) sees the highest volume and volatility. Major economic data releases (typically 8:30 AM EST for US data) also create trading opportunities. Avoid trading during low-liquidity periods like late Friday afternoons.',
  },
  {
    question: 'What is a pip in forex trading?',
    answer: 'A pip (percentage in point) is the smallest price move in forex trading. For most currency pairs, a pip is 0.0001 (fourth decimal place). For example, if EUR/USD moves from 1.1000 to 1.1001, that\'s a 1 pip move. For JPY pairs, a pip is 0.01 (second decimal place). Pips are used to measure profit, loss, and spread.',
  },
]

async function getForexRates() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/fx`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })
    if (!res.ok) throw new Error('Failed to fetch forex rates')
    const data = await res.json()
    return data.rates || {}
  } catch (error) {
    console.error('Error fetching forex rates:', error)
    // Return fallback rates
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CHF: 0.88,
      AUD: 1.52,
      CAD: 1.36,
      NZD: 1.64,
      SEK: 10.85,
      NOK: 10.67,
      DKK: 6.87,
      SGD: 1.34,
      HKD: 7.82,
      CNY: 7.26,
      INR: 83.42,
    }
  }
}

function calculateRate(rates: Record<string, number>, from: string, to: string): number {
  if (from === to) return 1
  if (from === 'USD' && rates[to]) return rates[to]
  if (to === 'USD' && rates[from]) return 1 / rates[from]
  if (rates[from] && rates[to]) return rates[to] / rates[from]
  return 0
}

function formatRate(rate: number, pair: string): string {
  // JPY pairs use 2 decimal places, others use 4
  if (pair.includes('JPY')) {
    return rate.toFixed(2)
  }
  return rate.toFixed(4)
}

function getCurrencyFlag(code: string): string {
  const flags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CHF: '🇨🇭',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    NZD: '🇳🇿',
    SEK: '🇸🇪',
    NOK: '🇳🇴',
    DKK: '🇩🇰',
    SGD: '🇸🇬',
    HKD: '🇭🇰',
    CNY: '🇨🇳',
    INR: '🇮🇳',
  }
  return flags[code] || '🌍'
}

export default async function ForexPage() {
  const rates = await getForexRates()
  const pageUrl = `${SITE_URL}/forex`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Forex Rates', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Live Forex & Currency Exchange Rates - EUR/USD, GBP/USD, USD/JPY',
    description: 'Real-time forex rates for major currency pairs. Track live exchange rates for EUR/USD, GBP/USD, USD/JPY and all major currencies.',
    url: pageUrl,
    keywords: ['forex rates', 'EUR/USD', 'GBP/USD', 'currency exchange', 'live forex', 'USD to EUR'],
  })

  const faqSchema = getFAQSchema(faqs)

  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Forex Rates</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Live Forex & Currency Exchange Rates
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Real-time foreign exchange rates for major currency pairs including EUR/USD, GBP/USD, USD/JPY, and more.
              Track live forex rates updated every 5 minutes.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Major Currency Pairs */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Major Currency Pairs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MAJOR_PAIRS.map((pair) => {
                const rate = calculateRate(rates, pair.from, pair.to)
                const pairCode = `${pair.from}/${pair.to}`
                const inverseRate = rate > 0 ? 1 / rate : 0

                return (
                  <div
                    key={pairCode}
                    className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCurrencyFlag(pair.from)}</span>
                        <span className="text-xl font-bold">{pairCode}</span>
                      </div>
                      <span className="text-2xl">{getCurrencyFlag(pair.to)}</span>
                    </div>
                    <div className="mb-2">
                      <div className="text-3xl font-bold text-green-500 tabular-nums">
                        {formatRate(rate, pairCode)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pair.description}</p>
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      1 {pair.from} = {formatRate(rate, pairCode)} {pair.to}
                      <br />
                      1 {pair.to} = {formatRate(inverseRate, pairCode)} {pair.from}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* USD Exchange Rates */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">USD Exchange Rates</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Currency</th>
                      <th className="text-left p-4 font-semibold">Code</th>
                      <th className="text-right p-4 font-semibold">1 USD =</th>
                      <th className="text-right p-4 font-semibold">1 Unit = USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADDITIONAL_CURRENCIES.map((currency) => {
                      const rate = rates[currency.code] || 0
                      const inverseRate = rate > 0 ? 1 / rate : 0

                      return (
                        <tr key={currency.code} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{currency.flag}</span>
                              <span className="font-medium">{currency.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-muted-foreground">{currency.code}</td>
                          <td className="p-4 text-right font-mono text-lg">{rate.toFixed(4)}</td>
                          <td className="p-4 text-right font-mono text-lg text-green-500">{inverseRate.toFixed(4)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Quick Currency Converter */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Popular Conversions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { from: 'USD', to: 'EUR', amount: 100 },
                { from: 'EUR', to: 'USD', amount: 100 },
                { from: 'GBP', to: 'USD', amount: 100 },
                { from: 'USD', to: 'JPY', amount: 100 },
                { from: 'USD', to: 'CAD', amount: 100 },
                { from: 'AUD', to: 'USD', amount: 100 },
              ].map((conversion) => {
                const rate = calculateRate(rates, conversion.from, conversion.to)
                const result = conversion.amount * rate

                return (
                  <div
                    key={`${conversion.from}-${conversion.to}`}
                    className="bg-card p-6 rounded-xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{getCurrencyFlag(conversion.from)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-2xl">{getCurrencyFlag(conversion.to)}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold mb-2">
                        {conversion.amount} {conversion.from}
                      </div>
                      <div className="text-2xl font-bold text-green-500 mb-2">
                        {result.toFixed(2)} {conversion.to}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rate: {formatRate(rate, `${conversion.from}/${conversion.to}`)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Understanding Forex Markets */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Understanding Forex Markets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">What is Forex Trading?</h3>
                <p className="text-muted-foreground mb-4">
                  Forex (foreign exchange) is the global marketplace for trading national currencies.
                  It's the largest financial market in the world, with over $7.5 trillion traded daily.
                  Unlike stock markets, forex operates 24 hours a day, 5 days a week across major
                  financial centers in London, New York, Tokyo, and Sydney.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">How Currency Pairs Work</h3>
                <p className="text-muted-foreground mb-4">
                  Currency pairs are quoted with a base currency and a quote currency. In EUR/USD = 1.10,
                  EUR is the base currency and USD is the quote currency. The rate shows how much of the
                  quote currency (1.10 USD) is needed to buy one unit of the base currency (1 EUR).
                  When EUR/USD rises, the Euro is strengthening against the Dollar.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">Major vs Minor vs Exotic Pairs</h3>
                <p className="text-muted-foreground mb-4">
                  Major pairs include USD and account for 80% of forex volume (EUR/USD, USD/JPY, GBP/USD, etc.).
                  Minor pairs (or crosses) don't include USD (EUR/GBP, EUR/JPY). Exotic pairs involve
                  one major currency and one from an emerging economy (USD/TRY, EUR/ZAR). Major pairs
                  have the highest liquidity and tightest spreads.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">Factors Affecting Exchange Rates</h3>
                <p className="text-muted-foreground mb-4">
                  Exchange rates are driven by interest rate differentials, inflation rates, economic
                  growth, political stability, and trade balances. Central bank decisions are particularly
                  influential - when a central bank raises interest rates, it typically strengthens that
                  currency as higher yields attract foreign investment. Economic data releases can cause
                  significant short-term volatility.
                </p>
              </div>
            </div>
          </section>

          {/* Key Forex Concepts */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Key Forex Concepts</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="pb-4 border-b border-border">
                  <h3 className="font-bold text-green-500 mb-2 text-lg">Pip (Percentage in Point)</h3>
                  <p className="text-muted-foreground">
                    The smallest price increment in forex trading. For most pairs, a pip is 0.0001
                    (fourth decimal place). If EUR/USD moves from 1.1000 to 1.1001, that's 1 pip.
                    For JPY pairs, a pip is 0.01 (second decimal place). Traders measure profit and
                    loss in pips.
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <h3 className="font-bold text-green-500 mb-2 text-lg">Bid/Ask Spread</h3>
                  <p className="text-muted-foreground">
                    The difference between the bid price (what buyers pay) and ask price (what sellers
                    receive). The spread represents the broker's commission. Major pairs like EUR/USD
                    typically have spreads of 0-2 pips, while exotic pairs may have spreads of 10+ pips.
                    Tighter spreads reduce trading costs.
                  </p>
                </div>

                <div className="pb-4 border-b border-border">
                  <h3 className="font-bold text-green-500 mb-2 text-lg">Leverage in Forex</h3>
                  <p className="text-muted-foreground">
                    Leverage allows traders to control large positions with relatively small capital.
                    For example, 100:1 leverage means you can control $100,000 with $1,000. While
                    leverage amplifies potential profits, it also magnifies losses. Retail traders
                    commonly use 50:1 or 100:1 leverage in forex markets.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-green-500 mb-2 text-lg">Market Sessions</h3>
                  <p className="text-muted-foreground">
                    The forex market operates through four main sessions: Sydney (5 PM - 2 AM EST),
                    Tokyo (7 PM - 4 AM EST), London (3 AM - 12 PM EST), and New York (8 AM - 5 PM EST).
                    The highest volume and volatility occurs during session overlaps, particularly
                    London-New York (8 AM - 12 PM EST).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Pages */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/markets"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Market Movers
                </h3>
                <p className="text-muted-foreground text-sm">
                  Track top gainers, losers, and most active stocks in real-time.
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Analysis Dashboard
                </h3>
                <p className="text-muted-foreground text-sm">
                  AI-powered stock research and fundamental analysis tools.
                </p>
              </Link>

              <Link
                href="/screener"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Screener
                </h3>
                <p className="text-muted-foreground text-sm">
                  Filter stocks by market cap, P/E ratio, growth metrics, and more.
                </p>
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions About Forex</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h3 className="text-lg font-bold mb-3 text-green-500">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section 1 - Analysis Tools */}
          <section className="bg-gradient-to-r from-green-600 to-green-500 p-8 rounded-xl text-white text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Track Forex Impact on Global Markets
            </h2>
            <p className="text-lg mb-6 text-green-50">
              Currency movements affect multinational companies, commodities, and international investments.
              Use our AI-powered tools to analyze how forex impacts your portfolio.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Analyze Stocks Now
            </Link>
          </section>

          {/* CTA Section 2 - Premium */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Get Real-Time Forex Alerts & Analysis
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Upgrade to premium for real-time forex notifications, currency correlation analysis,
              and AI-powered insights on how currency movements impact your investments.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/premium"
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Upgrade to Premium
              </Link>
              <Link
                href="/learn"
                className="bg-secondary hover:bg-secondary/70 text-foreground px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn More About Forex
              </Link>
            </div>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
