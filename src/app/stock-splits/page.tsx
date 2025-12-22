import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const metadata: Metadata = {
  title: 'Stock Splits Calendar 2025 - Upcoming Stock Splits & History',
  description: 'Track upcoming stock splits, recent stock split history, and reverse stock splits. Learn how stock splits affect shareholders with examples from NVIDIA, Apple, Tesla, Google, and Amazon.',
  keywords: [
    'stock splits',
    'upcoming stock splits',
    'stock split calendar',
    'reverse stock split',
    'stock split history',
    'forward stock split',
    'stock split dates',
    'stock split ratio',
    'what is a stock split',
    'how stock splits work',
    'NVDA stock split',
    'AAPL stock split',
    'TSLA stock split',
    'stock split 2025',
    'stock split news',
    'stock split today',
    'stock split announcement',
    'reverse split stocks',
  ],
  openGraph: {
    title: 'Stock Splits Calendar 2025 - Upcoming & Historical Stock Splits',
    description: 'Complete stock split calendar with upcoming splits, historical data, and detailed explanations of how stock splits affect shareholders.',
    type: 'website',
    url: 'https://lician.com/stock-splits',
  },
  alternates: {
    canonical: 'https://lician.com/stock-splits',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Splits Calendar - Track Upcoming Stock Splits',
    description: 'Track upcoming and historical stock splits, including forward and reverse splits with detailed analysis.',
  },
}

// Recent major stock splits (2022-2024)
const recentStockSplits = [
  {
    ticker: 'NVDA',
    company: 'NVIDIA Corporation',
    splitDate: 'June 10, 2024',
    ratio: '10-for-1',
    priceBeforeSplit: '$1,200',
    priceAfterSplit: '$120',
    performance: '+180%',
    reason: 'Make shares more accessible to retail investors',
  },
  {
    ticker: 'GOOGL',
    company: 'Alphabet Inc.',
    splitDate: 'July 18, 2022',
    ratio: '20-for-1',
    priceBeforeSplit: '$2,255',
    priceAfterSplit: '$112.75',
    performance: '+45%',
    reason: 'Increase accessibility and liquidity',
  },
  {
    ticker: 'AMZN',
    company: 'Amazon.com Inc.',
    splitDate: 'June 6, 2022',
    ratio: '20-for-1',
    priceBeforeSplit: '$2,447',
    priceAfterSplit: '$122.35',
    performance: '+25%',
    reason: 'Make stock more accessible to employees and investors',
  },
  {
    ticker: 'TSLA',
    company: 'Tesla Inc.',
    splitDate: 'August 25, 2022',
    ratio: '3-for-1',
    priceBeforeSplit: '$891',
    priceAfterSplit: '$297',
    performance: '-35%',
    reason: 'Increase employee accessibility to stock ownership',
  },
  {
    ticker: 'SHOP',
    company: 'Shopify Inc.',
    splitDate: 'June 29, 2022',
    ratio: '10-for-1',
    priceBeforeSplit: '$315',
    priceAfterSplit: '$31.50',
    performance: '+55%',
    reason: 'Make shares more accessible',
  },
  {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    splitDate: 'August 31, 2020',
    ratio: '4-for-1',
    priceBeforeSplit: '$499.23',
    priceAfterSplit: '$124.81',
    performance: '+230%',
    reason: 'Make stock more accessible to broader base of investors',
  },
]

// Upcoming/potential stock splits for 2025-2026
const upcomingSplits = [
  {
    ticker: 'BRK.A',
    company: 'Berkshire Hathaway Class A',
    status: 'Rumored',
    currentPrice: '$622,000',
    expectedRatio: 'Unlikely - Warren Buffett opposes splits',
    likelihood: 'Very Low',
    notes: 'Historically opposed to splits; Class B shares available at lower price point',
  },
  {
    ticker: 'NVR',
    company: 'NVR Inc.',
    status: 'Potential',
    currentPrice: '$8,500',
    expectedRatio: '10-for-1 or 20-for-1',
    likelihood: 'Low',
    notes: 'High share price could warrant split, but no indication from management',
  },
  {
    ticker: 'MELI',
    company: 'MercadoLibre',
    status: 'Potential',
    currentPrice: '$1,950',
    expectedRatio: '5-for-1 or 10-for-1',
    likelihood: 'Medium',
    notes: 'Share price has grown significantly; split would improve accessibility',
  },
  {
    ticker: 'AVGO',
    company: 'Broadcom Inc.',
    status: 'Potential',
    currentPrice: '$1,750',
    expectedRatio: '10-for-1',
    likelihood: 'Medium',
    notes: 'Previously split in 2020; high share price may warrant another split',
  },
]

// Notable reverse stock splits (warning signs)
const reverseStockSplits = [
  {
    ticker: 'GE',
    company: 'General Electric',
    splitDate: 'July 30, 2021',
    ratio: '1-for-8',
    priceBeforeSplit: '$13.00',
    priceAfterSplit: '$104.00',
    reason: 'Maintain NYSE listing requirements and improve perception',
    outcome: 'Company restructuring; now trading ~$165',
  },
  {
    ticker: 'SOFI',
    company: 'SoFi Technologies',
    splitDate: 'N/A',
    ratio: 'Considered 1-for-10',
    priceBeforeSplit: 'N/A',
    priceAfterSplit: 'N/A',
    reason: 'Potential delisting concerns',
    outcome: 'Not executed; company recovered',
  },
  {
    ticker: 'MULN',
    company: 'Mullen Automotive',
    splitDate: 'November 2023',
    ratio: '1-for-100',
    priceBeforeSplit: '$0.08',
    priceAfterSplit: '$8.00',
    reason: 'Avoid NASDAQ delisting',
    outcome: 'Significant shareholder dilution',
  },
]

// Historical stock split data from major companies
const historicalSplits = [
  {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    totalSplits: 5,
    splits: '7-for-1 (2014), 4-for-1 (2020)',
    notes: 'If you bought 1 share in 1980 IPO, you\'d have 224 shares today',
  },
  {
    ticker: 'TSLA',
    company: 'Tesla Inc.',
    totalSplits: 2,
    splits: '5-for-1 (2020), 3-for-1 (2022)',
    notes: '1 share pre-2020 split equals 15 shares today',
  },
  {
    ticker: 'NVDA',
    company: 'NVIDIA Corporation',
    totalSplits: 5,
    splits: '4-for-1 (2021), 10-for-1 (2024)',
    notes: 'Recent splits due to AI boom driving price surge',
  },
  {
    ticker: 'AMZN',
    company: 'Amazon.com Inc.',
    totalSplits: 4,
    splits: '3-for-1 (1998), 2-for-1 (1999), 20-for-1 (2022)',
    notes: '1 share from 1997 IPO equals 120 shares today',
  },
]

const stockSplitFAQs = [
  {
    question: 'What is a stock split?',
    answer: 'A stock split is when a company divides its existing shares into multiple shares to lower the trading price of the stock. The most common type is a forward split (like 2-for-1, 3-for-1, or 10-for-1), where shareholders receive additional shares for each share they own. For example, in a 2-for-1 split, you\'d receive 2 shares for every 1 share you owned. The total value of your investment stays the same - if you had 100 shares at $200 each ($20,000 total), after a 2-for-1 split you\'d have 200 shares at $100 each (still $20,000 total). Companies split stocks to make shares more affordable and accessible to retail investors.',
  },
  {
    question: 'How does a stock split affect shareholders?',
    answer: 'A stock split does not change the total value of your investment. You receive more shares, but each share is worth proportionally less. For example, in a 3-for-1 split, your 100 shares at $300 become 300 shares at $100 - still worth $30,000 total. Your ownership percentage in the company remains the same. However, splits can have indirect benefits: increased liquidity, more accessibility to retail investors, and often positive market sentiment. Historically, stocks that split have performed well afterward, though this isn\'t guaranteed. Dividend payments per share also adjust proportionally.',
  },
  {
    question: 'What is a reverse stock split and why do companies do it?',
    answer: 'A reverse stock split consolidates multiple shares into fewer shares, increasing the share price. For example, in a 1-for-10 reverse split, every 10 shares you own become 1 share worth 10 times the price. Companies typically do reverse splits for negative reasons: to avoid delisting from exchanges (which require minimum share prices like $1 for NASDAQ), to improve perception (stocks under $5 are often seen as "penny stocks"), or to attract institutional investors who have minimum price requirements. Reverse splits are often red flags suggesting financial distress, though established companies like General Electric have done them during restructuring.',
  },
  {
    question: 'Should I buy a stock before or after a split?',
    answer: 'There\'s no inherent advantage to buying before or after a stock split - the total value is the same either way. However, consider these factors: 1) Stocks often rally leading up to and after a split due to positive sentiment and increased accessibility, 2) Post-split, the lower price may attract more retail investors, increasing demand and liquidity, 3) Options become more affordable post-split, potentially increasing trading activity. Research shows stocks that split often outperform the market in the following year, but this may be because strong companies split, not because the split itself creates value. Focus on company fundamentals rather than split timing.',
  },
  {
    question: 'What are the most common stock split ratios?',
    answer: 'Common forward split ratios include 2-for-1, 3-for-1, 4-for-1, 5-for-1, 7-for-1, 10-for-1, and 20-for-1. Recently, ultra-high-priced stocks have favored larger splits (Google and Amazon did 20-for-1, NVIDIA did 10-for-1) to significantly lower share prices. For reverse splits, common ratios are 1-for-2, 1-for-5, 1-for-10, or even 1-for-100 for severely distressed stocks. The ratio chosen depends on the current share price and the target price - companies typically want shares trading in a "sweet spot" of $50-$150 to balance accessibility with institutional appeal.',
  },
  {
    question: 'How do stock splits affect options and fractional shares?',
    answer: 'Stock splits adjust options contracts proportionally. In a 2-for-1 split, if you owned 1 contract (100 shares) at a $200 strike price, you\'d have 2 contracts at a $100 strike, maintaining the same total value. Some brokers adjust to maintain 100-share contracts while changing the strike. Fractional shares also split - if you owned 1.5 shares before a 2-for-1 split, you\'d have 3 shares after. However, some brokers may pay out cash for fractional shares instead. Always check with your broker about their specific policies on how they handle splits for options and fractional shares.',
  },
  {
    question: 'Do stock splits affect dividend payments?',
    answer: 'Yes, dividend payments adjust proportionally with stock splits. If a stock paying $2 per share quarterly does a 2-for-1 split, the dividend becomes $1 per share - but you now have twice as many shares, so your total dividend income stays the same. For example, 100 shares x $2 = $200 before split, and 200 shares x $1 = $200 after split. The dividend yield percentage remains unchanged. Most companies announce whether they\'ll maintain, increase, or adjust their dividend policy when announcing a split. Dividend aristocrats that split typically continue their dividend growth trajectory.',
  },
  {
    question: 'What was the NVIDIA stock split and how did it perform?',
    answer: 'NVIDIA executed a 10-for-1 stock split on June 10, 2024, when shares were trading around $1,200. After the split, shares opened at about $120. This was NVIDIA\'s fifth stock split in company history. The split made shares more accessible to retail investors during the AI boom. Prior to the split, NVIDIA had split 4-for-1 in 2021. Since the 2024 split, NVIDIA shares have continued strong performance, driven by AI chip demand rather than the split itself. The split was well-received as it enabled more investors to own whole shares rather than fractional shares.',
  },
  {
    question: 'What is the Apple stock split history?',
    answer: 'Apple has split its stock 5 times: 2-for-1 (June 1987), 2-for-1 (June 2000), 2-for-1 (February 2005), 7-for-1 (June 2014), and 4-for-1 (August 2020). If you bought 1 share at Apple\'s 1980 IPO at $22, you would have 224 shares today worth over $40,000 (as of late 2024). The 2020 split reduced shares from about $500 to $125, making them more accessible. Apple tends to split when shares exceed $400-500, believing this price range optimizes accessibility while maintaining institutional appeal. Each split has been followed by continued strong performance.',
  },
  {
    question: 'Can you lose money on a stock split?',
    answer: 'No, you cannot lose money directly from a stock split itself - the total value of your holdings remains exactly the same immediately after the split. If you own $10,000 in stock before the split, you own $10,000 in stock after the split, just in more (or fewer) shares. However, you can lose money on the stock afterward if the share price declines due to market conditions or company performance. Some investors incorrectly assume splits create value, buying at inflated prices. Also, reverse splits often signal financial distress, and stocks tend to continue declining after reverse splits. The split itself is neutral, but market perception and company fundamentals determine subsequent performance.',
  },
  {
    question: 'How do I find out about upcoming stock splits?',
    answer: 'Companies announce stock splits in press releases and SEC filings (typically Form 8-K). Most financial news sites cover major split announcements. You can track upcoming splits through stock split calendars (like this one), broker alerts, financial news sites like Bloomberg or CNBC, and the investor relations sections of company websites. Follow stocks you own or watch closely for announcements. Splits are typically announced 2-4 weeks before the effective date. Enable notifications from your broker for corporate actions affecting stocks you own. Major splits from large companies get significant media coverage.',
  },
  {
    question: 'What is a stock split calendar and why use it?',
    answer: 'A stock split calendar tracks announced stock splits with key dates: announcement date, record date (when you must own shares), and effective date (when the split occurs). Use it to: 1) Stay informed about splits affecting stocks you own, 2) Identify stocks with upcoming splits that may experience price momentum, 3) Understand historical split patterns from successful companies, 4) Track reverse splits which may indicate troubled companies to avoid. The calendar helps investors plan purchases (some buy before splits anticipating positive sentiment) and manage portfolios (splits affect option strategies, cost basis calculations, and fractional shares).',
  },
  {
    question: 'Why did Tesla split its stock twice in 2 years?',
    answer: 'Tesla executed a 5-for-1 split in August 2020 (reducing shares from ~$2,230 to ~$446) and a 3-for-1 split in August 2022 (reducing shares from ~$891 to ~$297). The rapid succession reflects Tesla\'s massive stock price appreciation during 2020-2021. Both splits aimed to make shares more accessible to employees and retail investors. Tesla cited enabling employee stock ownership through compensation programs as a key reason. The splits occurred during different market conditions - the 2020 split during a bull run (stock continued soaring), while the 2022 split preceded a significant decline as the overall market corrected.',
  },
  {
    question: 'Do stock splits signal a good investment opportunity?',
    answer: 'Stock splits themselves don\'t make a stock a better or worse investment - they\'re cosmetic changes. However, companies that split often share positive characteristics: strong recent performance (price appreciation triggering the split), confidence in future growth (management wants to increase accessibility), and often institutional support. Studies show stocks tend to outperform after splits, but causation is debated - great companies split because they\'re doing well, not the other way around. Don\'t buy a stock solely because it\'s splitting. Evaluate fundamentals, valuation, growth prospects, and competitive position. A split by an overvalued company doesn\'t create value.',
  },
  {
    question: 'What happens to my cost basis after a stock split?',
    answer: 'Your cost basis per share adjusts proportionally after a stock split, but your total cost basis remains the same. Example: You bought 100 shares at $200 ($20,000 total cost basis). After a 4-for-1 split, you have 400 shares with a cost basis of $50 per share (still $20,000 total). Your broker should automatically adjust your cost basis. For tax purposes, the IRS requires adjusted cost basis calculations when you sell. If you bought shares at different times, each lot adjusts separately. Keep good records - especially important for stocks with multiple splits over time like Apple or NVIDIA. Most brokers provide cost basis reports that account for all corporate actions including splits.',
  },
]

export default function StockSplitsPage() {
  const pageUrl = `${SITE_URL}/stock-splits`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Splits', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(stockSplitFAQs)

  const recentSplitsListSchema = getItemListSchema({
    name: 'Recent Stock Splits 2022-2024',
    description: 'Major stock splits from leading companies including NVIDIA, Apple, Tesla, Google, and Amazon',
    url: pageUrl,
    items: recentStockSplits.map((split, index) => ({
      name: `${split.company} ${split.ratio} Stock Split`,
      url: `${SITE_URL}/stock/${split.ticker}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema, recentSplitsListSchema]),
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
            <span className="text-foreground">Stock Splits</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Stock Splits Calendar 2025
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track upcoming stock splits, recent stock split history, and reverse stock splits.
              Learn how stock splits affect shareholders with real examples from NVIDIA, Apple, Tesla, Google, and Amazon.
            </p>
          </div>

          {/* What is a Stock Split */}
          <section className="mb-16 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              What is a Stock Split?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-green-500">Forward Stock Split</h3>
                <p className="text-muted-foreground mb-4">
                  A forward stock split increases the number of shares outstanding while reducing the price per share proportionally.
                  The total market value remains unchanged. Companies split stocks to make shares more affordable and accessible.
                </p>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <h4 className="font-bold mb-2">Example: 2-for-1 Split</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Before Split:</span>
                      <span className="font-medium">100 shares @ $200 = $20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After Split:</span>
                      <span className="font-medium">200 shares @ $100 = $20,000</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Your Value:</span>
                      <span className="font-bold text-green-500">Unchanged</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-red-500">Reverse Stock Split</h3>
                <p className="text-muted-foreground mb-4">
                  A reverse stock split reduces the number of shares outstanding while increasing the price per share.
                  Often done to avoid delisting or improve perception. Usually a warning sign of financial distress.
                </p>
                <div className="bg-background p-4 rounded-lg border border-border">
                  <h4 className="font-bold mb-2">Example: 1-for-10 Reverse Split</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Before Split:</span>
                      <span className="font-medium">1,000 shares @ $0.50 = $500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">After Split:</span>
                      <span className="font-medium">100 shares @ $5.00 = $500</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Your Value:</span>
                      <span className="font-bold text-yellow-500">Unchanged (but risky)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {recentStockSplits.length}
              </div>
              <div className="text-sm text-muted-foreground">Recent Major Splits</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {upcomingSplits.length}
              </div>
              <div className="text-sm text-muted-foreground">Potential Upcoming</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {reverseStockSplits.length}
              </div>
              <div className="text-sm text-muted-foreground">Reverse Splits</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                10-20x
              </div>
              <div className="text-sm text-muted-foreground">Common Split Ratios</div>
            </div>
          </div>

          {/* Recent Stock Splits */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Recent Major Stock Splits (2020-2024)
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-bold">Company</th>
                      <th className="text-left p-4 font-bold">Date</th>
                      <th className="text-left p-4 font-bold">Ratio</th>
                      <th className="text-left p-4 font-bold">Before</th>
                      <th className="text-left p-4 font-bold">After</th>
                      <th className="text-left p-4 font-bold">Performance</th>
                      <th className="text-left p-4 font-bold">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStockSplits.map((split, index) => {
                      const isPositive = split.performance.startsWith('+')
                      return (
                        <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <Link
                              href={`/stock/${split.ticker}`}
                              className="font-bold hover:text-green-500 transition-colors"
                            >
                              {split.company}
                            </Link>
                            <div className="text-sm">
                              <Link
                                href={`/stock/${split.ticker}`}
                                className="text-green-500 hover:underline font-mono"
                              >
                                {split.ticker}
                              </Link>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{split.splitDate}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                              {split.ratio}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{split.priceBeforeSplit}</td>
                          <td className="p-4 font-medium">{split.priceAfterSplit}</td>
                          <td className={`p-4 font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {split.performance}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-xs">{split.reason}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Performance shown is approximate from split date to present. Past performance does not guarantee future results.
            </p>
          </section>

          {/* Upcoming/Potential Stock Splits */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Potential Upcoming Stock Splits 2025-2026
            </h2>
            <p className="text-muted-foreground mb-6">
              These are stocks with high share prices that could potentially split, based on current prices and historical patterns.
              No official announcements have been made.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSplits.map((split, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link href={`/stock/${split.ticker}`} className="text-xl font-bold hover:text-green-500 transition-colors">
                        {split.ticker}
                      </Link>
                      <p className="text-sm text-muted-foreground">{split.company}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      split.likelihood === 'Very Low' ? 'bg-red-500/10 text-red-500' :
                      split.likelihood === 'Low' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {split.likelihood} Probability
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="font-bold text-lg">{split.currentPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expected Ratio</span>
                      <span className="font-medium text-sm">{split.expectedRatio}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="font-medium text-sm">{split.status}</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">{split.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reverse Stock Splits - Warning Signs */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Reverse Stock Splits - Warning Signs
            </h2>
            <p className="text-muted-foreground mb-6">
              Reverse stock splits often signal financial distress. Companies consolidate shares to boost the price and avoid delisting.
              Exercise caution with stocks that have executed reverse splits.
            </p>
            <div className="space-y-4">
              {reverseStockSplits.map((split, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{split.ticker}</h3>
                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                          Reverse Split
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{split.company}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Split Date</p>
                          <p className="font-medium text-sm">{split.splitDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Ratio</p>
                          <p className="font-medium text-sm">{split.ratio}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Before</p>
                          <p className="font-medium text-sm">{split.priceBeforeSplit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">After</p>
                          <p className="font-medium text-sm">{split.priceAfterSplit}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-bold text-muted-foreground">Reason: </span>
                          <span className="text-sm">{split.reason}</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-muted-foreground">Outcome: </span>
                          <span className="text-sm">{split.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-500">
                ⚠️ Warning: Reverse splits are often red flags. Research thoroughly before investing in stocks that have executed reverse splits.
              </p>
            </div>
          </section>

          {/* Historical Stock Split Data */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Historical Stock Split Champions
            </h2>
            <p className="text-muted-foreground mb-6">
              These companies have split multiple times over their history, reflecting strong long-term growth and price appreciation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {historicalSplits.map((stock, index) => (
                <Link
                  key={index}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-xl group-hover:text-green-500 transition-colors mb-1">
                      {stock.ticker}
                    </h3>
                    <p className="text-sm text-muted-foreground">{stock.company}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Splits</p>
                      <p className="text-2xl font-bold text-green-500">{stock.totalSplits}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Recent Splits</p>
                      <p className="text-sm font-medium">{stock.splits}</p>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{stock.notes}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* How Stock Splits Affect You */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How Stock Splits Affect Shareholders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Portfolio Value</h3>
                <p className="text-muted-foreground text-sm">
                  Your total investment value remains exactly the same immediately after a split. You own more shares,
                  but each share is worth proportionally less. No value is created or destroyed.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Ownership Percentage</h3>
                <p className="text-muted-foreground text-sm">
                  Your ownership stake in the company stays constant. If you owned 0.001% before the split,
                  you still own 0.001% after, since all shareholders receive the same proportional increase.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">💵</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Dividend Payments</h3>
                <p className="text-muted-foreground text-sm">
                  Dividends per share adjust proportionally. If you received $2/share quarterly before a 2-for-1 split,
                  you\'ll receive $1/share after - but with twice as many shares, your total dividend income stays the same.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Stock Price</h3>
                <p className="text-muted-foreground text-sm">
                  The stock price adjusts down proportionally on the split date. A $300 stock becomes $100 after a 3-for-1 split.
                  Future price movements depend on company performance and market conditions, not the split itself.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Options Contracts</h3>
                <p className="text-muted-foreground text-sm">
                  Options adjust proportionally. Strike prices decrease and the number of contracts may increase to maintain
                  equivalent value. Check with your broker for specific adjustment procedures.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">💳</div>
                <h3 className="text-lg font-bold mb-2 text-green-500">Cost Basis</h3>
                <p className="text-muted-foreground text-sm">
                  Your cost basis per share adjusts down proportionally, but total cost basis remains unchanged.
                  Important for tax calculations when you sell. Most brokers automatically adjust this for you.
                </p>
              </div>
            </div>
          </section>

          {/* Forward vs Reverse Splits Comparison */}
          <section className="mb-16 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Forward Split vs Reverse Split: Key Differences
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-bold">Aspect</th>
                    <th className="text-left p-4 font-bold text-green-500">Forward Split</th>
                    <th className="text-left p-4 font-bold text-red-500">Reverse Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-medium">Number of Shares</td>
                    <td className="p-4">Increases</td>
                    <td className="p-4">Decreases</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Share Price</td>
                    <td className="p-4">Decreases proportionally</td>
                    <td className="p-4">Increases proportionally</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Common Ratios</td>
                    <td className="p-4">2-for-1, 3-for-1, 10-for-1, 20-for-1</td>
                    <td className="p-4">1-for-5, 1-for-10, 1-for-100</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Typical Reason</td>
                    <td className="p-4">Make shares more affordable and accessible</td>
                    <td className="p-4">Avoid delisting, improve perception</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Market Signal</td>
                    <td className="p-4 text-green-500">Usually positive - strong performance</td>
                    <td className="p-4 text-red-500">Usually negative - financial distress</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Examples</td>
                    <td className="p-4">NVDA, AAPL, GOOGL, AMZN, TSLA</td>
                    <td className="p-4">GE, MULN, many penny stocks</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Historical Performance</td>
                    <td className="p-4 text-green-500">Often outperforms market after split</td>
                    <td className="p-4 text-red-500">Often continues declining</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Your Investment Value</td>
                    <td className="p-4">Unchanged immediately</td>
                    <td className="p-4">Unchanged immediately</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions About Stock Splits
            </h2>
            <div className="space-y-4">
              {stockSplitFAQs.map((faq, index) => (
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

          {/* Related Resources */}
          <section className="mb-16">
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
                  Track upcoming earnings
                </p>
              </Link>

              <Link
                href="/ipo"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  IPO Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  New stock listings
                </p>
              </Link>

              <Link
                href="/dividends"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Dividend Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ex-dividend dates
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
                  Find stocks by criteria
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Research Stocks Before Buying
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Don\'t buy a stock just because it\'s splitting. Use our AI-powered analysis to evaluate
              fundamentals, valuation, growth prospects, and competitive position.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
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
