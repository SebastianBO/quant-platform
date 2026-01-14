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
    title: `${symbol} Stock Split History - Past & Upcoming Splits`,
    description: `Complete ${symbol} stock split history. Track past splits, upcoming split dates, and understand how ${symbol} splits affect your shares and investment returns.`,
    keywords: [
      `${symbol} stock split`,
      `${symbol} split history`,
      `when did ${symbol} split`,
      `${symbol} stock split date`,
      `${symbol} reverse split`,
      `${symbol} shares outstanding`,
      `${symbol} split adjusted price`,
    ],
    openGraph: {
      title: `${symbol} Stock Split History | Past & Upcoming Splits`,
      description: `Track ${symbol} stock split history, see how splits affected share price, and get current shares outstanding data.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/splits/${ticker.toLowerCase()}`,
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

// Known stock split data for popular stocks (this could be moved to a database later)
const KNOWN_SPLITS: Record<string, Array<{ date: string; ratio: string; type: 'forward' | 'reverse' }>> = {
  'AAPL': [
    { date: '2020-08-31', ratio: '4:1', type: 'forward' },
    { date: '2014-06-09', ratio: '7:1', type: 'forward' },
    { date: '2005-02-28', ratio: '2:1', type: 'forward' },
    { date: '2000-06-21', ratio: '2:1', type: 'forward' },
    { date: '1987-06-16', ratio: '2:1', type: 'forward' },
  ],
  'TSLA': [
    { date: '2022-08-25', ratio: '3:1', type: 'forward' },
    { date: '2020-08-31', ratio: '5:1', type: 'forward' },
  ],
  'NVDA': [
    { date: '2024-06-07', ratio: '10:1', type: 'forward' },
    { date: '2021-07-20', ratio: '4:1', type: 'forward' },
    { date: '2007-09-11', ratio: '3:2', type: 'forward' },
    { date: '2006-04-07', ratio: '2:1', type: 'forward' },
    { date: '2001-09-17', ratio: '2:1', type: 'forward' },
    { date: '2000-06-27', ratio: '2:1', type: 'forward' },
  ],
  'GOOGL': [
    { date: '2022-07-15', ratio: '20:1', type: 'forward' },
    { date: '2014-04-03', ratio: '2:1', type: 'forward' },
  ],
  'AMZN': [
    { date: '2022-06-06', ratio: '20:1', type: 'forward' },
    { date: '1999-09-02', ratio: '2:1', type: 'forward' },
    { date: '1999-01-05', ratio: '3:1', type: 'forward' },
    { date: '1998-06-02', ratio: '2:1', type: 'forward' },
  ],
  'MSFT': [
    { date: '2003-02-18', ratio: '2:1', type: 'forward' },
    { date: '1999-03-29', ratio: '2:1', type: 'forward' },
    { date: '1998-02-23', ratio: '2:1', type: 'forward' },
    { date: '1996-12-09', ratio: '2:1', type: 'forward' },
    { date: '1994-05-23', ratio: '2:1', type: 'forward' },
    { date: '1992-06-15', ratio: '3:2', type: 'forward' },
    { date: '1991-04-16', ratio: '3:2', type: 'forward' },
    { date: '1990-06-27', ratio: '2:1', type: 'forward' },
    { date: '1987-09-21', ratio: '2:1', type: 'forward' },
  ],
}

export default async function SplitsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/splits/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry
  const sharesOutstanding = snapshot.shares_outstanding || companyFacts?.shares_outstanding

  // Get split history for this ticker
  const splitHistory = KNOWN_SPLITS[symbol] || []
  const hasSplits = splitHistory.length > 0
  const mostRecentSplit = splitHistory[0]

  // Calculate split-adjusted impact
  const getTotalSplitMultiplier = () => {
    return splitHistory.reduce((total, split) => {
      const [numerator, denominator] = split.ratio.split(':').map(Number)
      if (split.type === 'forward') {
        return total * (numerator / denominator)
      } else {
        return total * (denominator / numerator)
      }
    }, 1)
  }

  const totalMultiplier = getTotalSplitMultiplier()

  // Generate FAQs
  const splitFaqs = [
    {
      question: `When did ${symbol} last split?`,
      answer: hasSplits
        ? `${symbol} (${companyName}) last split on ${new Date(mostRecentSplit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at a ${mostRecentSplit.ratio} ratio. This was a ${mostRecentSplit.type} stock split.`
        : `${symbol} (${companyName}) has not had any recorded stock splits in its trading history, or split data is not currently available.`
    },
    {
      question: `How do stock splits affect share price?`,
      answer: `In a forward stock split (e.g., 2:1), the share price is divided by the split ratio while the number of shares multiplies accordingly. For example, if ${symbol} was trading at $100 and executed a 2:1 split, you would own twice as many shares, each worth $50. The total value of your investment remains the same immediately after the split.`
    },
    {
      question: `What is a reverse stock split?`,
      answer: `A reverse stock split (e.g., 1:2) reduces the number of shares outstanding and increases the price per share proportionally. Companies often use reverse splits to boost their stock price above minimum listing requirements or to appear more attractive to institutional investors.`
    },
    {
      question: `How many shares of ${symbol} are outstanding?`,
      answer: sharesOutstanding
        ? `${symbol} currently has approximately ${(sharesOutstanding / 1e9).toFixed(2)} billion shares outstanding. ${hasSplits ? `This figure reflects all historical stock splits, including the ${mostRecentSplit.ratio} split in ${new Date(mostRecentSplit.date).getFullYear()}.` : 'This number can change due to stock buybacks, new share issuance, or potential future stock splits.'}`
        : `Current shares outstanding data for ${symbol} is not immediately available. Check the company's latest SEC filings for the most up-to-date share count.`
    },
    {
      question: `Should I buy ${symbol} stock before or after a split?`,
      answer: `Stock splits are cosmetic and don't change the fundamental value of ${symbol}. However, splits can generate positive momentum and make shares more accessible to retail investors. Focus on ${symbol}'s underlying business fundamentals, earnings growth, and valuation rather than timing around split dates.`
    },
    {
      question: `How do I calculate split-adjusted prices for ${symbol}?`,
      answer: hasSplits
        ? `To calculate split-adjusted historical prices for ${symbol}, multiply the original price by the cumulative split ratio. For example, with a total split multiplier of ${totalMultiplier.toFixed(1)}x from all splits, a historical price of $${price.toFixed(2)} would be $${(price / totalMultiplier).toFixed(2)} on a pre-split basis.`
        : `Since ${symbol} has not had major stock splits, historical prices generally don't require split adjustments. However, always verify with your broker or financial data provider for the most accurate historical pricing.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock Splits`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Stock Split History - Past & Upcoming Splits`,
    description: `Complete stock split history for ${symbol} (${companyName}), including all past splits and their impact on share price.`,
    url: pageUrl,
    keywords: [
      `${symbol} stock split`,
      `${symbol} split history`,
      `when did ${symbol} split`,
      `${symbol} shares outstanding`,
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

  const faqSchema = getFAQSchema(splitFaqs)

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
            <Link href="/stock-splits" className="hover:text-foreground">Stock Splits</Link>
            {' / '}
            <span>{symbol}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Stock Split History
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete split history and analysis for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Shares Outstanding</p>
                <p className="text-3xl font-bold">
                  {sharesOutstanding
                    ? `${(sharesOutstanding / 1e9).toFixed(2)}B`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total Splits</p>
                <p className="text-3xl font-bold">{splitHistory.length}</p>
              </div>
            </div>
          </div>

          {/* Split History Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Split History</h2>
            {hasSplits ? (
              <div className="space-y-4">
                {splitHistory.map((split, index) => (
                  <div
                    key={index}
                    className={`bg-card p-6 rounded-lg border ${
                      index === 0
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold">{split.ratio}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              split.type === 'forward'
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-orange-500/20 text-orange-500'
                            }`}
                          >
                            {split.type === 'forward' ? 'Forward Split' : 'Reverse Split'}
                          </span>
                          {index === 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                              Most Recent
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {new Date(split.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {split.type === 'forward' ? (
                          <p>Each share became {split.ratio.split(':')[0]} shares</p>
                        ) : (
                          <p>
                            {split.ratio.split(':')[1]} shares became {split.ratio.split(':')[0]}{' '}
                            share
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">
                  {symbol} has not executed any stock splits in its trading history, or split
                  data is not currently available in our database.
                </p>
              </div>
            )}
          </section>

          {/* How Splits Affect Share Price */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How Stock Splits Affect Share Price</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Forward Stock Split (e.g., 2:1)</h3>
                <p className="text-muted-foreground mb-3">
                  When a company executes a forward split, shareholders receive additional shares
                  while the price per share decreases proportionally.
                </p>
                <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                  <p className="font-mono text-sm">
                    <strong>Example:</strong> If you owned 100 shares of {symbol} at $100/share:
                  </p>
                  <p className="font-mono text-sm mt-2">Before 2:1 Split: 100 shares × $100 = $10,000</p>
                  <p className="font-mono text-sm">After 2:1 Split: 200 shares × $50 = $10,000</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Reverse Stock Split (e.g., 1:2)</h3>
                <p className="text-muted-foreground mb-3">
                  In a reverse split, the number of shares decreases while the price per share
                  increases. Often used to meet exchange listing requirements.
                </p>
                <div className="bg-orange-500/10 p-4 rounded border border-orange-500/30">
                  <p className="font-mono text-sm">
                    <strong>Example:</strong> If you owned 100 shares of {symbol} at $5/share:
                  </p>
                  <p className="font-mono text-sm mt-2">Before 1:2 Split: 100 shares × $5 = $500</p>
                  <p className="font-mono text-sm">After 1:2 Split: 50 shares × $10 = $500</p>
                </div>
              </div>

              <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30">
                <p className="text-sm">
                  <strong>Key Takeaway:</strong> Stock splits don't change the total value of your
                  investment immediately after the split. However, they can affect liquidity,
                  accessibility to retail investors, and market perception.
                </p>
              </div>
            </div>
          </section>

          {/* Shares Outstanding Impact */}
          {sharesOutstanding && hasSplits && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Impact on Shares Outstanding</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">
                  With {splitHistory.length} stock split{splitHistory.length !== 1 ? 's' : ''}, {symbol}'s shares outstanding have increased by a factor of {totalMultiplier.toFixed(1)}x over time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/30 p-4 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Current Shares Outstanding</p>
                    <p className="text-2xl font-bold">
                      {(sharesOutstanding / 1e9).toFixed(2)}B shares
                    </p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded">
                    <p className="text-sm text-muted-foreground mb-1">Pre-Split Equivalent</p>
                    <p className="text-2xl font-bold">
                      {(sharesOutstanding / totalMultiplier / 1e9).toFixed(2)}B shares
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze {symbol} Stock in Real-Time</h2>
            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis, financial metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href="/stock-splits"
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                All Stock Splits
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {splitFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p>
              <strong>Disclaimer:</strong> Stock split information is provided for educational
              purposes and should not be considered financial advice. Always verify split dates
              and ratios with official company announcements or your broker. Consult a financial
              advisor for investment decisions.
            </p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="splits" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
