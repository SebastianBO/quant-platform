import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dividend Calendar 2025 - Ex-Dividend Dates & High Yield Dividend Stocks',
  description: 'Track upcoming ex-dividend dates, payment dates, and record dates for dividend stocks. Find the best high yield dividend stocks, dividend aristocrats, and monthly dividend payers for income investing.',
  keywords: [
    'dividend calendar',
    'ex dividend date',
    'dividend stocks',
    'upcoming dividends',
    'best dividend stocks',
    'high yield dividend stocks',
    'dividend yield',
    'dividend aristocrats',
    'monthly dividend stocks',
    'dividend payment dates',
    'dividend record date',
    'dividend investing',
    'income stocks',
    'dividend growth stocks',
    'REITs dividends',
    'quarterly dividends',
  ],
  openGraph: {
    title: 'Dividend Calendar - Ex-Dividend Dates & High Yield Stocks',
    description: 'Complete dividend calendar with ex-dividend dates, payment schedules, and the best high yield dividend stocks for income investors.',
    type: 'website',
    url: 'https://lician.com/dividends',
  },
  alternates: {
    canonical: 'https://lician.com/dividends',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dividend Calendar - Track Ex-Dividend Dates',
    description: 'Find upcoming ex-dividend dates, high yield dividend stocks, and dividend aristocrats for income investing.',
  },
}

// Static dividend data for popular dividend stocks
const upcomingDividends = [
  // Week 1
  {
    ticker: 'JPM',
    company: 'JPMorgan Chase & Co.',
    exDate: '2025-01-06',
    recordDate: '2025-01-07',
    paymentDate: '2025-01-31',
    amount: 1.15,
    yield: 2.4,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'JNJ',
    company: 'Johnson & Johnson',
    exDate: '2025-01-07',
    recordDate: '2025-01-08',
    paymentDate: '2025-03-11',
    amount: 1.24,
    yield: 3.1,
    frequency: 'Quarterly',
    type: 'Dividend King',
  },
  {
    ticker: 'PG',
    company: 'Procter & Gamble',
    exDate: '2025-01-09',
    recordDate: '2025-01-10',
    paymentDate: '2025-02-14',
    amount: 0.99,
    yield: 2.5,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'KO',
    company: 'Coca-Cola Company',
    exDate: '2025-01-10',
    recordDate: '2025-01-13',
    paymentDate: '2025-04-01',
    amount: 0.485,
    yield: 3.0,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'VZ',
    company: 'Verizon Communications',
    exDate: '2025-01-10',
    recordDate: '2025-01-13',
    paymentDate: '2025-02-03',
    amount: 0.665,
    yield: 6.5,
    frequency: 'Quarterly',
    type: 'High Yield',
  },
  // Week 2
  {
    ticker: 'T',
    company: 'AT&T Inc.',
    exDate: '2025-01-13',
    recordDate: '2025-01-14',
    paymentDate: '2025-02-03',
    amount: 0.2775,
    yield: 6.2,
    frequency: 'Quarterly',
    type: 'High Yield',
  },
  {
    ticker: 'XOM',
    company: 'Exxon Mobil Corporation',
    exDate: '2025-01-14',
    recordDate: '2025-01-15',
    paymentDate: '2025-03-10',
    amount: 0.95,
    yield: 3.4,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'CVX',
    company: 'Chevron Corporation',
    exDate: '2025-01-15',
    recordDate: '2025-01-16',
    paymentDate: '2025-03-10',
    amount: 1.63,
    yield: 4.2,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'PEP',
    company: 'PepsiCo Inc.',
    exDate: '2025-01-16',
    recordDate: '2025-01-17',
    paymentDate: '2025-03-31',
    amount: 1.355,
    yield: 3.1,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
  {
    ticker: 'WMT',
    company: 'Walmart Inc.',
    exDate: '2025-01-17',
    recordDate: '2025-01-20',
    paymentDate: '2025-02-03',
    amount: 0.83,
    yield: 1.3,
    frequency: 'Quarterly',
    type: 'Dividend Aristocrat',
  },
]

const dividendAristocrats = [
  {
    ticker: 'JNJ',
    company: 'Johnson & Johnson',
    yield: 3.1,
    years: 62,
    price: 158.50,
    category: 'Dividend King',
  },
  {
    ticker: 'PG',
    company: 'Procter & Gamble',
    yield: 2.5,
    years: 68,
    price: 159.80,
    category: 'Dividend King',
  },
  {
    ticker: 'KO',
    company: 'Coca-Cola',
    yield: 3.0,
    years: 62,
    price: 64.25,
    category: 'Dividend King',
  },
  {
    ticker: 'MMM',
    company: '3M Company',
    yield: 6.8,
    years: 66,
    price: 96.40,
    category: 'Dividend King',
  },
  {
    ticker: 'CAT',
    company: 'Caterpillar',
    yield: 1.6,
    years: 30,
    price: 385.20,
    category: 'Dividend Aristocrat',
  },
  {
    ticker: 'XOM',
    company: 'Exxon Mobil',
    yield: 3.4,
    years: 41,
    price: 112.50,
    category: 'Dividend Aristocrat',
  },
]

const highYieldStocks = [
  {
    ticker: 'VZ',
    company: 'Verizon Communications',
    yield: 6.5,
    price: 41.20,
    sector: 'Telecommunications',
    type: 'Blue Chip',
  },
  {
    ticker: 'T',
    company: 'AT&T Inc.',
    yield: 6.2,
    price: 22.15,
    sector: 'Telecommunications',
    type: 'Blue Chip',
  },
  {
    ticker: 'MMM',
    company: '3M Company',
    yield: 6.8,
    price: 96.40,
    sector: 'Industrials',
    type: 'Dividend King',
  },
  {
    ticker: 'O',
    company: 'Realty Income',
    yield: 5.8,
    price: 58.30,
    sector: 'REIT',
    type: 'Monthly Dividend',
  },
  {
    ticker: 'MO',
    company: 'Altria Group',
    yield: 8.2,
    price: 54.80,
    sector: 'Consumer Staples',
    type: 'High Yield',
  },
  {
    ticker: 'BTI',
    company: 'British American Tobacco',
    yield: 9.1,
    price: 35.60,
    sector: 'Consumer Staples',
    type: 'High Yield',
  },
]

const monthlyDividendStocks = [
  {
    ticker: 'O',
    company: 'Realty Income Corporation',
    yield: 5.8,
    price: 58.30,
    monthlyDividend: 0.26,
  },
  {
    ticker: 'STAG',
    company: 'STAG Industrial',
    yield: 4.2,
    price: 37.85,
    monthlyDividend: 0.12,
  },
  {
    ticker: 'MAIN',
    company: 'Main Street Capital',
    yield: 6.5,
    price: 48.20,
    monthlyDividend: 0.235,
  },
  {
    ticker: 'AGNC',
    company: 'AGNC Investment Corp',
    yield: 15.2,
    price: 9.85,
    monthlyDividend: 0.12,
  },
]

const dividendFAQs = [
  {
    question: 'What is a dividend calendar and how do I use it?',
    answer: 'A dividend calendar shows upcoming ex-dividend dates, record dates, and payment dates for dividend-paying stocks. The ex-dividend date is crucial - you must own the stock before this date to receive the dividend payment. Use the calendar to plan purchases of dividend stocks and track when you\'ll receive dividend income. Look for stocks with upcoming ex-dividend dates that match your investment timeline and income goals.',
  },
  {
    question: 'What is an ex-dividend date and why is it important?',
    answer: 'The ex-dividend date is the cutoff date to be eligible for the next dividend payment. To receive a dividend, you must own the stock before the ex-dividend date (typically buying at least 2 business days before due to T+2 settlement). If you buy on or after the ex-dividend date, you won\'t receive the upcoming dividend - the seller will. The stock price typically drops by approximately the dividend amount on the ex-dividend date.',
  },
  {
    question: 'What are the best dividend stocks to buy now?',
    answer: 'The best dividend stocks combine sustainable yields, dividend growth history, strong fundamentals, and reasonable valuations. Look for Dividend Aristocrats (25+ years of increases), Dividend Kings (50+ years), high-quality REITs, and blue-chip companies with payout ratios under 60%. Top sectors include utilities, consumer staples, healthcare, and real estate. Consider stocks like Johnson & Johnson, Procter & Gamble, Realty Income, and JPMorgan Chase for reliable dividend income.',
  },
  {
    question: 'What are high yield dividend stocks and are they safe?',
    answer: 'High yield dividend stocks offer yields above 4-5%, significantly higher than the market average of 1.5-2%. While attractive for income, high yields can signal risk - the stock price may have fallen due to business challenges, or the dividend may be unsustainable. Evaluate the payout ratio (dividends/earnings), cash flow stability, and dividend history. Safe high-yielders often include utilities, telecom companies, and established REITs. Avoid yields above 10% unless you understand the risks.',
  },
  {
    question: 'What is a Dividend Aristocrat?',
    answer: 'Dividend Aristocrats are S&P 500 companies that have increased their dividends for at least 25 consecutive years. There are currently 67 Dividend Aristocrats, including companies like Coca-Cola, Johnson & Johnson, and Procter & Gamble. These companies demonstrate exceptional financial stability, strong business models, and shareholder-friendly management. Dividend Kings have an even longer track record with 50+ years of dividend increases. Both groups are popular for retirement portfolios seeking reliable, growing income.',
  },
  {
    question: 'How do dividend payments work?',
    answer: 'Companies pay dividends on a regular schedule (quarterly, monthly, or annually). The process involves four key dates: 1) Declaration date - when the company announces the dividend, 2) Ex-dividend date - the cutoff to be eligible, 3) Record date - when the company checks who owns shares, and 4) Payment date - when cash is deposited into your brokerage account. Most U.S. stocks pay quarterly dividends, but some REITs and funds pay monthly. Dividends are typically paid in cash but can also be stock.',
  },
  {
    question: 'What is a good dividend yield?',
    answer: 'A "good" dividend yield depends on your goals and the market environment. The S&P 500 average is around 1.5-2%. Yields of 2-4% are common for stable blue-chip stocks. Yields of 4-7% can be found in REITs, utilities, and telecom companies. Yields above 7% warrant caution - verify the dividend is sustainable by checking the payout ratio, cash flow, and company financial health. For growth investors, lower yields (1-2%) with strong dividend growth may be preferable to high current yields.',
  },
  {
    question: 'What is the difference between dividend yield and dividend growth?',
    answer: 'Dividend yield is the annual dividend payment divided by the stock price, expressed as a percentage. It shows current income. Dividend growth is the rate at which a company increases its dividend over time, typically measured annually. Young investors often prefer dividend growth stocks (even with lower yields) because compounding dividend increases can generate higher future income. Retirees may prioritize high current yield. The best dividend stocks offer both: reasonable yield (3-5%) plus consistent growth (5-10% annually).',
  },
  {
    question: 'Should I reinvest dividends or take cash?',
    answer: 'Dividend reinvestment (DRIP) automatically uses dividend payments to buy more shares, accelerating compound growth. This is ideal for investors in the accumulation phase who don\'t need current income. Taking cash dividends works better for retirees needing income or investors wanting to rebalance manually. Many brokers offer free DRIP programs that buy fractional shares. Consider reinvesting dividends in tax-advantaged accounts (IRA, 401k) to avoid taxes. In taxable accounts, you owe taxes on dividends regardless of reinvestment.',
  },
  {
    question: 'What is a dividend payout ratio and why does it matter?',
    answer: 'The dividend payout ratio is dividends divided by earnings (or free cash flow), showing what percentage of profits are paid as dividends. A ratio of 40-60% is generally sustainable, leaving room for dividend growth and business reinvestment. Ratios above 80% may be risky - the company has little cushion if earnings decline. Below 30% suggests room for dividend increases but may indicate management prefers buybacks or reinvestment. REITs typically have higher ratios (80-90%) due to regulatory requirements.',
  },
  {
    question: 'How are dividends taxed?',
    answer: 'Qualified dividends are taxed at favorable capital gains rates (0%, 15%, or 20% depending on income), while ordinary dividends are taxed as regular income. To be qualified, you must hold the stock for more than 60 days during the 121-day period beginning 60 days before the ex-dividend date. REIT dividends are typically ordinary income. In tax-advantaged accounts (IRA, 401k), dividends grow tax-deferred or tax-free. High-income investors may also pay 3.8% net investment income tax on dividends.',
  },
  {
    question: 'What are monthly dividend stocks?',
    answer: 'Monthly dividend stocks pay dividends every month instead of quarterly, providing more frequent income. Popular monthly payers include REITs like Realty Income (O), BDCs like Main Street Capital (MAIN), and covered call ETFs. Monthly dividends are attractive for retirees needing regular cash flow to cover living expenses. However, focus on total return and dividend sustainability, not just payment frequency. Some monthly payers use return of capital, which isn\'t sustainable long-term.',
  },
  {
    question: 'Can dividend stocks lose money?',
    answer: 'Yes, dividend stocks can decline in price just like any stock. During market downturns, even dividend aristocrats can fall 20-40%. However, dividends provide a cushion - while you wait for recovery, you collect income. The key risks are dividend cuts (reducing income) and permanent capital loss (company fundamentals deteriorate). Diversify across sectors and companies. Quality dividend stocks with strong balance sheets, stable cash flows, and reasonable payout ratios tend to recover better than high-risk, high-yield stocks.',
  },
  {
    question: 'What is dividend capture strategy?',
    answer: 'Dividend capture involves buying a stock just before the ex-dividend date to receive the dividend, then selling shortly after. While tempting, this strategy rarely works because: 1) The stock typically drops by the dividend amount on the ex-date, 2) Transaction costs eat profits, 3) Short-term capital gains taxes are higher than qualified dividend rates, and 4) You need to hold 60+ days for qualified dividend treatment. It\'s generally more effective to buy quality dividend stocks and hold long-term.',
  },
  {
    question: 'What sectors have the best dividend stocks?',
    answer: 'Consumer staples (Coca-Cola, Procter & Gamble) offer stable dividends from recession-resistant businesses. Utilities (Duke Energy, NextEra) provide high yields due to regulated, predictable cash flows. Healthcare (Johnson & Johnson, AbbVie) combines defensive characteristics with innovation. Financials (JPMorgan, Bank of America) pay growing dividends when profitable. Real Estate (REITs) are required to pay 90% of income as dividends. Energy (Exxon, Chevron) offers high yields but more volatility. Diversify across sectors for stable income.',
  },
  {
    question: 'How do I build a dividend portfolio?',
    answer: 'Start by determining your income goal and timeline. Allocate 20-30% to high-quality dividend aristocrats for stability (JNJ, PG, KO). Add 20-30% to high-yield blue chips (VZ, T, XOM) for income. Include 15-20% REITs for monthly income and diversification (O, STAG). Add 15-20% dividend growth stocks for future income (MSFT, AAPL, V). Keep 10-15% in dividend ETFs for instant diversification (VYM, SCHD, DGRO). Rebalance annually, reinvest dividends when young, and shift to higher yields as you approach retirement. Target 3-4% portfolio yield.',
  },
]

export default function DividendsPage() {
  const pageUrl = `${SITE_URL}/dividends`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Dividend Calendar', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(dividendFAQs)

  // Event schema for dividend calendar
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Dividend Calendar - Upcoming Ex-Dividend Dates',
    description: 'Track ex-dividend dates, record dates, and payment dates for dividend stocks. Find high yield dividend stocks and dividend aristocrats for income investing.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: pageUrl,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Lician',
      url: SITE_URL,
    },
  }

  const getWeekLabel = (exDate: string) => {
    const date = new Date(exDate)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) return 'This Week'
    if (diffDays <= 14) return 'Next Week'
    return 'Later'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, eventSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Dividend Calendar</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Dividend Calendar 2025
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track upcoming ex-dividend dates, payment schedules, and record dates for dividend stocks.
              Find the best high yield dividend stocks, dividend aristocrats, and monthly dividend payers for income investing.
            </p>
          </div>

          {/* Key Dividend Dates Explained */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Important Dividend Dates Explained
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Declaration Date</h3>
                <p className="text-sm text-muted-foreground">
                  When the company announces the dividend amount and payment schedule.
                  The board of directors approves the dividend.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Ex-Dividend Date</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Most important!</strong> You must own the stock before this date to receive the dividend.
                  Stock price typically drops by the dividend amount.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Record Date</h3>
                <p className="text-sm text-muted-foreground">
                  The date when the company checks its records to see who owns shares.
                  Usually 1-2 business days after the ex-dividend date.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Payment Date</h3>
                <p className="text-sm text-muted-foreground">
                  When the dividend cash is deposited into your brokerage account.
                  Typically 2-4 weeks after the record date.
                </p>
              </div>
            </div>
          </section>

          {/* Upcoming Dividends Calendar */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Upcoming Ex-Dividend Dates
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Ex-Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Payment Date</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Yield</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {upcomingDividends.map((dividend) => (
                      <tr key={dividend.ticker} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/stock/${dividend.ticker}`}
                            className="font-bold text-green-500 hover:text-green-400 transition-colors"
                          >
                            {dividend.ticker}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm">{dividend.company}</td>
                        <td className="px-6 py-4 text-sm font-medium">{formatDate(dividend.exDate)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(dividend.paymentDate)}</td>
                        <td className="px-6 py-4 text-right font-medium">${dividend.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-green-500 font-medium">{dividend.yield.toFixed(2)}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                            {dividend.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Dividend Aristocrats */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Dividend Aristocrats & Kings
            </h2>
            <p className="text-muted-foreground mb-6">
              Companies that have increased their dividends for 25+ consecutive years (Aristocrats) or 50+ years (Kings).
              These stocks represent the highest quality dividend investments with proven track records.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dividendAristocrats.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-green-500 transition-colors">
                        {stock.ticker}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stock.company}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                      {stock.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dividend Yield</p>
                      <p className="text-lg font-bold text-green-500">{stock.yield.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Years of Growth</p>
                      <p className="text-lg font-bold">{stock.years}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Current Price: <span className="font-medium text-foreground">${stock.price.toFixed(2)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* High Yield Dividend Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              High Yield Dividend Stocks
            </h2>
            <p className="text-muted-foreground mb-6">
              Stocks offering above-average dividend yields (4%+). High yields can provide substantial income,
              but always verify the dividend is sustainable by checking the payout ratio and company financials.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highYieldStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-green-500 transition-colors">
                        {stock.ticker}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stock.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">{stock.yield.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Yield</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sector:</span>
                      <span className="font-medium">{stock.sector}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{stock.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${stock.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Monthly Dividend Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Monthly Dividend Stocks
            </h2>
            <p className="text-muted-foreground mb-6">
              Stocks that pay dividends every month instead of quarterly. Perfect for investors seeking
              regular monthly income to cover living expenses or reinvest more frequently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthlyDividendStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl group-hover:text-green-500 transition-colors">
                        {stock.ticker}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stock.company}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-500">
                      Monthly
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Annual Yield</p>
                      <p className="text-lg font-bold text-green-500">{stock.yield.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Monthly Payout</p>
                      <p className="text-lg font-bold">${stock.monthlyDividend.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="text-lg font-bold">${stock.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Annual Income per Share: <span className="font-medium text-green-500">${(stock.monthlyDividend * 12).toFixed(2)}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Dividend Investing Strategies */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Dividend Investing Strategies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Dividend Growth Investing
                </h3>
                <p className="text-muted-foreground mb-4">
                  Focus on companies that consistently increase dividends over time. Even with lower
                  initial yields (2-3%), dividend growth compounds to generate substantial future income.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                  <li>Target Dividend Aristocrats and Kings</li>
                  <li>Look for 5-10% annual dividend growth</li>
                  <li>Payout ratios under 60% indicate room for growth</li>
                  <li>Best for long-term wealth building</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  High Yield Income Strategy
                </h3>
                <p className="text-muted-foreground mb-4">
                  Prioritize current income by investing in stocks with high dividend yields (5%+).
                  Common in retirement portfolios where regular cash flow is needed.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                  <li>REITs, utilities, and telecoms offer high yields</li>
                  <li>Verify dividend sustainability (payout ratio, cash flow)</li>
                  <li>Diversify to manage risk of dividend cuts</li>
                  <li>Best for retirees needing current income</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Dividend Reinvestment (DRIP)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Automatically reinvest dividends to buy more shares, accelerating compound growth.
                  One of the most powerful wealth-building strategies over time.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
                  <li>Compound returns without additional capital</li>
                  <li>Buy fractional shares with dividends</li>
                  <li>No transaction fees with most brokers</li>
                  <li>Best for accumulation phase investors</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Build a Dividend Portfolio */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to Build a Dividend Portfolio
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Set Your Income Goal</h3>
                  <p className="text-muted-foreground">
                    Determine how much annual dividend income you want. A portfolio yielding 4% generates
                    $4,000 per year for every $100,000 invested. Consider both current yield and dividend growth.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Diversify Across Sectors</h3>
                  <p className="text-muted-foreground">
                    Spread investments across consumer staples, healthcare, financials, utilities, and REITs.
                    Sector diversification protects against dividend cuts if one industry struggles.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Balance Yield and Growth</h3>
                  <p className="text-muted-foreground">
                    Allocate 40% to dividend aristocrats (stability), 30% to high-yield stocks (income),
                    20% to dividend growth stocks (future income), and 10% to REITs (diversification and monthly income).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Verify Dividend Safety</h3>
                  <p className="text-muted-foreground">
                    Check payout ratios (should be under 60-70% for most stocks), free cash flow coverage,
                    debt levels, and dividend history. Avoid stocks with payout ratios above 100% unless they're REITs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Reinvest and Rebalance</h3>
                  <p className="text-muted-foreground">
                    Reinvest dividends during accumulation phase for compound growth. Rebalance annually to
                    maintain sector allocation and replace underperforming dividend stocks. Take cash dividends when you need income.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {dividendFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border group"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Stock Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upcoming earnings reports
                </p>
              </Link>

              <Link
                href="/screener"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Screener
                </h3>
                <p className="text-sm text-muted-foreground">
                  Filter by dividend yield
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Sectors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Analyze Dividend Stocks with AI
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Get detailed dividend analysis, payout ratio calculations, yield history, and AI-powered
              insights for any dividend stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Dividend Stocks Free
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
