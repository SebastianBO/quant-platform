import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

// Dynamic rendering - Supabase needs env vars at runtime
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Insider Trading - Track Corporate Insider Buys & Sells | Real-Time Data',
  description: 'Track insider trading activity with real-time data on insider buys and sells. Monitor CEO stock purchases, CFO transactions, and notable insider trades from SEC Form 4 filings.',
  keywords: [
    'insider trading',
    'insider buying',
    'insider selling',
    'CEO stock purchases',
    'CFO stock sales',
    'Form 4 filings',
    'insider transactions',
    'corporate insider trading',
    'insider activity',
    'insider trades tracker',
    'insider stock purchases',
    'executive stock transactions',
  ],
  openGraph: {
    title: 'Insider Trading - Track Insider Buys & Sells',
    description: 'Real-time insider trading data from SEC Form 4 filings. Track CEO, CFO, and director stock purchases and sales.',
    type: 'website',
    url: 'https://lician.com/insider-trading',
  },
  alternates: {
    canonical: 'https://lician.com/insider-trading',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insider Trading Tracker - Real-Time Data',
    description: 'Track insider buys and sells from CEOs, CFOs, and directors.',
  },
}

interface InsiderTrade {
  ticker: string
  issuer: string
  name: string
  title: string
  is_board_director: boolean
  transaction_date: string
  transaction_shares: number
  transaction_price_per_share: number
  transaction_value: number
  shares_owned_after_transaction: number
  filing_date: string
}

// Fetch insider trades directly from Supabase
async function getInsiderTrades(): Promise<InsiderTrade[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('insider_trades')
      .select('*')
      .order('filing_date', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Insider trades query error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching insider trades:', error)
    return []
  }
}

// Determine if trade is a buy or sell
function getTransactionType(shares: number): 'buy' | 'sell' {
  return shares > 0 ? 'buy' : 'sell'
}

// Format large numbers
function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}

// Check if insider is notable (CEO, CFO, President, etc.)
function isNotableInsider(title: string): boolean {
  const notableTitles = ['CEO', 'CFO', 'President', 'COO', 'CTO', 'Chairman', 'Chief']
  return notableTitles.some(t => title?.toUpperCase().includes(t))
}

const faqs = [
  {
    question: 'What is insider trading and is it legal?',
    answer: 'Legal insider trading occurs when corporate insiders (executives, directors, employees) buy or sell their company\'s stock and report these transactions to the SEC via Form 4 within two business days. This is perfectly legal and provides valuable information to investors. Illegal insider trading involves trading based on material non-public information, which is prohibited.',
  },
  {
    question: 'Why should I track insider buying?',
    answer: 'Insider buying is often considered a bullish signal because executives typically have the best understanding of their company\'s prospects. When insiders buy stock with their own money, it suggests confidence in the company\'s future. Studies show that following insider buys, especially by CEOs and CFOs, can lead to market-beating returns.',
  },
  {
    question: 'What is SEC Form 4?',
    answer: 'SEC Form 4 is a document that must be filed with the Securities and Exchange Commission within two business days whenever a corporate insider buys or sells company stock. It discloses the transaction details including the number of shares, price, date, and the insider\'s relationship to the company.',
  },
  {
    question: 'Does insider selling mean the stock will go down?',
    answer: 'Not necessarily. Insiders sell for many reasons unrelated to company performance, such as diversification, tax planning, personal expenses, or scheduled selling programs. However, heavy selling by multiple insiders, especially CEOs and CFOs, can be a warning sign worth investigating.',
  },
  {
    question: 'What makes an insider transaction significant?',
    answer: 'Significant insider transactions typically involve: 1) Large dollar amounts (over $100,000), 2) Multiple insiders buying at the same time, 3) Purchases by CEOs or CFOs rather than routine option exercises, 4) Buying in the open market rather than from the company, and 5) Transactions that substantially increase an insider\'s ownership percentage.',
  },
  {
    question: 'How can I use insider trading data?',
    answer: 'Use insider trading data as one factor in your investment research. Look for patterns like multiple insiders buying, CEOs making large purchases, or clusters of buying at lower prices. Combine this with fundamental analysis, valuation metrics, and technical indicators for a complete picture before making investment decisions.',
  },
  {
    question: 'What is the difference between insider buying and insider selling?',
    answer: 'Insider buying (purchases) generally carries more weight because insiders use their own money to buy stock, signaling confidence. Insider selling is less meaningful because insiders sell for various personal reasons. However, focus on the pattern: multiple insiders buying is bullish, while heavy selling by key executives may warrant caution.',
  },
  {
    question: 'Which insider transactions matter most?',
    answer: 'The most meaningful transactions are: 1) Open market purchases (not option exercises), 2) Transactions by top executives (CEO, CFO, President), 3) Large transactions relative to the insider\'s existing holdings, 4) Purchases near 52-week lows, and 5) Buying by multiple insiders within a short time period.',
  },
  {
    question: 'How recent is the insider trading data?',
    answer: 'Our insider trading data is sourced directly from SEC EDGAR filings and updated regularly. Since insiders must file Form 4 within two business days of a transaction, the data represents very recent activity. We display transactions by filing date to ensure you see the latest insider moves.',
  },
  {
    question: 'Can I filter insider trades by company or executive?',
    answer: 'Yes, you can click on any stock ticker to see all insider trading activity for that specific company. You can also view transactions by notable executives like CEOs and CFOs. Use the buy/sell filters to focus on insider purchases or sales based on your investment strategy.',
  },
]

export default async function InsiderTradingPage() {
  const allTrades = await getInsiderTrades()
  const pageUrl = `${SITE_URL}/insider-trading`

  // Separate buys and sells
  const recentBuys = allTrades
    .filter(t => t.transaction_shares > 0)
    .slice(0, 50)

  const recentSells = allTrades
    .filter(t => t.transaction_shares < 0)
    .slice(0, 50)

  // Notable insider transactions (CEOs, CFOs, etc.)
  const notableTrades = allTrades
    .filter(t => isNotableInsider(t.title))
    .slice(0, 30)

  // Largest transactions by value
  const largestTrades = [...allTrades]
    .sort((a, b) => Math.abs(b.transaction_value) - Math.abs(a.transaction_value))
    .slice(0, 20)

  // Calculate statistics
  const totalBuys = allTrades.filter(t => t.transaction_shares > 0).length
  const totalSells = allTrades.filter(t => t.transaction_shares < 0).length
  const buyVolume = allTrades
    .filter(t => t.transaction_shares > 0)
    .reduce((sum, t) => sum + Math.abs(t.transaction_value), 0)
  const sellVolume = allTrades
    .filter(t => t.transaction_shares < 0)
    .reduce((sum, t) => sum + Math.abs(t.transaction_value), 0)

  // SEO Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insider Trading', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Insider Trading Tracker - Real-Time Insider Buys & Sells',
    description: 'Track corporate insider trading activity including CEO stock purchases and CFO transactions from SEC Form 4 filings.',
    url: pageUrl,
    keywords: ['insider trading', 'insider buying', 'insider selling', 'CEO stock purchases'],
  })

  const itemListSchema = getItemListSchema({
    name: 'Recent Insider Trades',
    description: 'Latest insider trading activity from SEC Form 4 filings',
    url: pageUrl,
    items: allTrades.slice(0, 30).map((trade, index) => ({
      name: `${trade.ticker} - ${trade.name} (${trade.title})`,
      url: `${SITE_URL}/stock/${trade.ticker}`,
      position: index + 1,
    })),
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            articleSchema,
            itemListSchema,
            faqSchema,
          ]),
        }}
      />
      <main className="min-h-dvh bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#479ffa] motion-safe:transition-all motion-safe:duration-150 ease-out">
              Home
            </Link>
            {' / '}
            <span className="text-white">Insider Trading</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Insider Trading Tracker
            </h1>
            <p className="text-lg sm:text-xl text-[#868f97] max-w-3xl">
              Track real-time corporate insider trading activity from SEC Form 4 filings.
              Monitor insider buys and sells from CEOs, CFOs, directors, and other key executives.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12">
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 sm:p-6 rounded-2xl">
              <p className="text-sm text-[#868f97] mb-2">Recent Buys</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-[#4ebe96]">{totalBuys}</p>
              <p className="text-xs text-[#868f97] mt-1 tabular-nums">
                ${formatNumber(buyVolume)} value
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 sm:p-6 rounded-2xl">
              <p className="text-sm text-[#868f97] mb-2">Recent Sells</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-[#ff5c5c]">{totalSells}</p>
              <p className="text-xs text-[#868f97] mt-1 tabular-nums">
                ${formatNumber(sellVolume)} value
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 sm:p-6 rounded-2xl">
              <p className="text-sm text-[#868f97] mb-2">Buy/Sell Ratio</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                {totalSells > 0 ? (totalBuys / totalSells).toFixed(2) : totalBuys.toFixed(2)}
              </p>
              <p className="text-xs text-[#868f97] mt-1">
                {totalBuys > totalSells ? 'Bullish' : 'Bearish'} sentiment
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 sm:p-6 rounded-2xl">
              <p className="text-sm text-[#868f97] mb-2">Notable Trades</p>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-[#4ebe96]">
                {notableTrades.length}
              </p>
              <p className="text-xs text-[#868f97] mt-1">
                By CEOs & CFOs
              </p>
            </div>
          </div>

          {/* Notable Insider Trades Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Notable Insider Trades</h2>
                <p className="text-[#868f97] mt-1">
                  Transactions by CEOs, CFOs, and key executives
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {notableTrades.map((trade, index) => {
                const isBuy = trade.transaction_shares > 0
                const transactionType = isBuy ? 'Buy' : 'Sell'

                return (
                  <div
                    key={`${trade.ticker}-${trade.filing_date}-${index}`}
                    className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 sm:p-5 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/stock/${trade.ticker}`}
                            className="text-lg sm:text-xl font-bold hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
                          >
                            {trade.ticker}
                          </Link>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isBuy
                                ? 'bg-[#4ebe96]/20 text-[#4ebe96]'
                                : 'bg-[#ff5c5c]/20 text-[#ff5c5c]'
                            }`}
                          >
                            {transactionType}
                          </span>
                          {trade.is_board_director && (
                            <span className="px-2 py-1 rounded-full text-xs bg-[#479ffa]/20 text-[#479ffa]">
                              Director
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#868f97] line-clamp-1 mb-1">
                          {trade.issuer}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="font-medium">{trade.name}</span>
                          <span className="text-[#868f97]">{trade.title}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-4 sm:gap-1 text-right">
                        <div className="flex-1 sm:flex-none">
                          <p className={`text-lg sm:text-xl font-bold tabular-nums ${
                            isBuy ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'
                          }`}>
                            ${formatNumber(Math.abs(trade.transaction_value))}
                          </p>
                          <p className="text-sm text-[#868f97] tabular-nums">
                            {formatNumber(Math.abs(trade.transaction_shares))} shares
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#868f97] tabular-nums">
                            @ ${trade.transaction_price_per_share?.toFixed(2) || 'N/A'}
                          </p>
                          <p className="text-xs text-[#868f97]">
                            {new Date(trade.filing_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button className="px-4 py-2 rounded-full bg-[#4ebe96] text-black font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              All Trades
            </button>
            <button className="px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              Buys Only
            </button>
            <button className="px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              Sells Only
            </button>
          </div>

          {/* Recent Insider Buys */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Recent Insider Buys</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.05] border-b border-white/[0.08]">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Ticker</th>
                      <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Insider</th>
                      <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Title</th>
                      <th className="text-right p-3 text-sm font-medium">Shares</th>
                      <th className="text-right p-3 text-sm font-medium">Value</th>
                      <th className="text-right p-3 text-sm font-medium hidden lg:table-cell">Price</th>
                      <th className="text-right p-3 text-sm font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBuys.slice(0, 25).map((trade, index) => (
                      <tr
                        key={`buy-${trade.ticker}-${trade.filing_date}-${index}`}
                        className="border-b border-white/[0.08] hover:bg-white/[0.05] motion-safe:transition-all motion-safe:duration-150 ease-out"
                      >
                        <td className="p-3">
                          <Link
                            href={`/stock/${trade.ticker}`}
                            className="font-bold text-[#4ebe96] hover:text-[#4ebe96]/80 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
                          >
                            {trade.ticker}
                          </Link>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <div className="text-sm">
                            <p className="font-medium">{trade.name}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[#868f97] hidden md:table-cell">
                          {trade.title}
                        </td>
                        <td className="p-3 text-right font-medium tabular-nums">
                          {formatNumber(trade.transaction_shares)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#4ebe96] tabular-nums">
                          ${formatNumber(Math.abs(trade.transaction_value))}
                        </td>
                        <td className="p-3 text-right text-sm text-[#868f97] hidden lg:table-cell tabular-nums">
                          ${trade.transaction_price_per_share?.toFixed(2) || 'N/A'}
                        </td>
                        <td className="p-3 text-right text-sm text-[#868f97]">
                          {new Date(trade.filing_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Recent Insider Sells */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Recent Insider Sells</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.05] border-b border-white/[0.08]">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Ticker</th>
                      <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Insider</th>
                      <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Title</th>
                      <th className="text-right p-3 text-sm font-medium">Shares</th>
                      <th className="text-right p-3 text-sm font-medium">Value</th>
                      <th className="text-right p-3 text-sm font-medium hidden lg:table-cell">Price</th>
                      <th className="text-right p-3 text-sm font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSells.slice(0, 25).map((trade, index) => (
                      <tr
                        key={`sell-${trade.ticker}-${trade.filing_date}-${index}`}
                        className="border-b border-white/[0.08] hover:bg-white/[0.05] motion-safe:transition-all motion-safe:duration-150 ease-out"
                      >
                        <td className="p-3">
                          <Link
                            href={`/stock/${trade.ticker}`}
                            className="font-bold text-[#ff5c5c] hover:text-[#ff5c5c]/80 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
                          >
                            {trade.ticker}
                          </Link>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <div className="text-sm">
                            <p className="font-medium">{trade.name}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[#868f97] hidden md:table-cell">
                          {trade.title}
                        </td>
                        <td className="p-3 text-right font-medium tabular-nums">
                          {formatNumber(Math.abs(trade.transaction_shares))}
                        </td>
                        <td className="p-3 text-right font-bold text-[#ff5c5c] tabular-nums">
                          ${formatNumber(Math.abs(trade.transaction_value))}
                        </td>
                        <td className="p-3 text-right text-sm text-[#868f97] hidden lg:table-cell tabular-nums">
                          ${trade.transaction_price_per_share?.toFixed(2) || 'N/A'}
                        </td>
                        <td className="p-3 text-right text-sm text-[#868f97]">
                          {new Date(trade.filing_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Understanding Insider Trading */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding Insider Trading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-3 text-[#4ebe96]">
                  Why Insider Buying Matters
                </h3>
                <p className="text-[#868f97] mb-4">
                  When corporate insiders purchase their company's stock with their own money,
                  it's often a strong bullish signal. Insiders have access to information that
                  gives them unique insight into the company's prospects.
                </p>
                <ul className="list-disc list-inside text-[#868f97] space-y-2">
                  <li>Insiders know the business better than anyone</li>
                  <li>Buying signals confidence in future performance</li>
                  <li>Studies show insider buys can predict stock outperformance</li>
                  <li>Particularly meaningful when CEOs and CFOs buy</li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-3 text-[#4ebe96]">
                  How to Interpret Insider Sells
                </h3>
                <p className="text-[#868f97] mb-4">
                  Insider selling is less meaningful than buying because executives sell for
                  many personal reasons. However, heavy selling can be a warning sign worth
                  investigating further.
                </p>
                <ul className="list-disc list-inside text-[#868f97] space-y-2">
                  <li>Diversification and tax planning drive many sales</li>
                  <li>Pre-planned selling programs are routine</li>
                  <li>Heavy selling by multiple insiders warrants attention</li>
                  <li>Look at the pattern, not individual transactions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Key Signals to Watch */}
          <section className="mb-12 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 sm:p-8 rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Key Insider Trading Signals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#4ebe96] mb-3 flex items-center gap-2">
                  <span className="text-xl">🟢</span>
                  Bullish Signals
                </h3>
                <ul className="space-y-2 text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">•</span>
                    <span>Multiple insiders buying within a short period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">•</span>
                    <span>CEO or CFO making large open-market purchases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">•</span>
                    <span>Insider buying near 52-week lows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">•</span>
                    <span>Purchases that significantly increase ownership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">•</span>
                    <span>Insider buying during market weakness</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-[#ff5c5c] mb-3 flex items-center gap-2">
                  <span className="text-xl">🔴</span>
                  Warning Signals
                </h3>
                <ul className="space-y-2 text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">•</span>
                    <span>Multiple top executives selling large amounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">•</span>
                    <span>CEO or CFO selling after recent stock price surge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">•</span>
                    <span>Insiders selling more than 25% of holdings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">•</span>
                    <span>Cluster of selling with no accompanying buys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">•</span>
                    <span>Sales occurring before negative news or earnings</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl group hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">
                    <span>{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150 ease-out">
                      ▼
                    </span>
                  </summary>
                  <p className="text-[#868f97] mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Market Data
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/markets/top-gainers"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  Top Gainers
                </h3>
                <p className="text-sm text-[#868f97]">
                  Biggest price movers up
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  Sectors
                </h3>
                <p className="text-sm text-[#868f97]">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/earnings"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-[#868f97]">
                  Upcoming earnings reports
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  Stock Analysis
                </h3>
                <p className="text-sm text-[#868f97]">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#4ebe96] to-[#4ebe96]/80 p-8 sm:p-12 rounded-2xl text-black text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Combine insider trading data with our AI-powered fundamental analysis,
              DCF valuations, and technical indicators for smarter investment decisions.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-black text-white hover:bg-black/90 px-8 py-3 rounded-full font-bold motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-black"
            >
              Start Analyzing Stocks Free
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
