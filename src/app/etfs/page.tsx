import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Best ETFs 2025 - Top Index Funds & ETF List | Lician',
  description: 'Discover the best ETFs for 2025 including SPY, QQQ, VOO, and VTI. Compare top index funds, sector ETFs, bond ETFs, and international ETFs with comprehensive analysis and performance data.',
  keywords: [
    'best ETFs',
    'ETF list',
    'SPY ETF',
    'QQQ ETF',
    'VOO ETF',
    'VTI ETF',
    'index funds',
    'Vanguard ETFs',
    'S&P 500 ETF',
    'ETF investing',
    'top ETFs 2025',
    'best index funds',
    'ETF comparison',
    'sector ETFs',
    'bond ETFs',
    'international ETFs',
    'dividend ETFs',
    'growth ETFs',
    'value ETFs',
    'ETF vs mutual funds'
  ],
  openGraph: {
    title: 'Best ETFs 2025 - Top Index Funds & ETF List',
    description: 'Compare the best ETFs including SPY, QQQ, VOO, and VTI. Find top index funds with AI-powered analysis and real-time data.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/etfs',
  },
}

// Popular ETF categories with top funds
const ETF_CATEGORIES = [
  {
    title: 'S&P 500 Index ETFs',
    description: 'Track the 500 largest U.S. companies with broad market exposure',
    icon: '📊',
    etfs: [
      {
        ticker: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        expense: '0.09%',
        aum: '$500B+',
        description: 'The original and most liquid S&P 500 ETF',
      },
      {
        ticker: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        expense: '0.03%',
        aum: '$400B+',
        description: 'Lowest cost S&P 500 tracking from Vanguard',
      },
      {
        ticker: 'IVV',
        name: 'iShares Core S&P 500 ETF',
        expense: '0.03%',
        aum: '$380B+',
        description: 'Low-cost S&P 500 exposure from BlackRock',
      },
    ],
  },
  {
    title: 'Total Market Index ETFs',
    description: 'Own the entire U.S. stock market with thousands of holdings',
    icon: '🌎',
    etfs: [
      {
        ticker: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        expense: '0.03%',
        aum: '$370B+',
        description: 'Complete U.S. market with 3,500+ stocks',
      },
      {
        ticker: 'ITOT',
        name: 'iShares Core S&P Total U.S. Stock Market ETF',
        expense: '0.03%',
        aum: '$60B+',
        description: 'Total market exposure at minimal cost',
      },
      {
        ticker: 'SCHB',
        name: 'Schwab U.S. Broad Market ETF',
        expense: '0.03%',
        aum: '$30B+',
        description: 'Broad market coverage from Schwab',
      },
    ],
  },
  {
    title: 'Technology & Growth ETFs',
    description: 'Focus on tech giants and high-growth companies',
    icon: '💻',
    etfs: [
      {
        ticker: 'QQQ',
        name: 'Invesco QQQ Trust',
        expense: '0.20%',
        aum: '$250B+',
        description: 'Top 100 Nasdaq stocks including AAPL, MSFT, NVDA',
      },
      {
        ticker: 'VGT',
        name: 'Vanguard Information Technology ETF',
        expense: '0.10%',
        aum: '$70B+',
        description: 'Pure-play technology sector exposure',
      },
      {
        ticker: 'XLK',
        name: 'Technology Select Sector SPDR Fund',
        expense: '0.10%',
        aum: '$60B+',
        description: 'S&P 500 tech stocks only',
      },
    ],
  },
  {
    title: 'Dividend ETFs',
    description: 'Income-focused funds with high dividend yields',
    icon: '💰',
    etfs: [
      {
        ticker: 'VYM',
        name: 'Vanguard High Dividend Yield ETF',
        expense: '0.06%',
        aum: '$55B+',
        description: 'High-yielding large-cap dividend stocks',
      },
      {
        ticker: 'SCHD',
        name: 'Schwab U.S. Dividend Equity ETF',
        expense: '0.06%',
        aum: '$60B+',
        description: 'Quality dividend growers with strong fundamentals',
      },
      {
        ticker: 'DVY',
        name: 'iShares Select Dividend ETF',
        expense: '0.38%',
        aum: '$20B+',
        description: 'High dividend yield with quality screens',
      },
    ],
  },
  {
    title: 'Bond ETFs',
    description: 'Fixed income exposure for diversification and stability',
    icon: '🏦',
    etfs: [
      {
        ticker: 'AGG',
        name: 'iShares Core U.S. Aggregate Bond ETF',
        expense: '0.03%',
        aum: '$110B+',
        description: 'Total bond market exposure',
      },
      {
        ticker: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        expense: '0.03%',
        aum: '$100B+',
        description: 'Comprehensive U.S. bond market coverage',
      },
      {
        ticker: 'TLT',
        name: 'iShares 20+ Year Treasury Bond ETF',
        expense: '0.15%',
        aum: '$50B+',
        description: 'Long-term U.S. Treasury exposure',
      },
    ],
  },
  {
    title: 'International ETFs',
    description: 'Global diversification beyond U.S. markets',
    icon: '🌍',
    etfs: [
      {
        ticker: 'VXUS',
        name: 'Vanguard Total International Stock ETF',
        expense: '0.08%',
        aum: '$75B+',
        description: 'Complete ex-U.S. global stock exposure',
      },
      {
        ticker: 'EFA',
        name: 'iShares MSCI EAFE ETF',
        expense: '0.32%',
        aum: '$60B+',
        description: 'Developed markets excluding U.S. and Canada',
      },
      {
        ticker: 'VWO',
        name: 'Vanguard FTSE Emerging Markets ETF',
        expense: '0.08%',
        aum: '$90B+',
        description: 'Emerging market stocks globally',
      },
    ],
  },
  {
    title: 'Sector ETFs',
    description: 'Targeted exposure to specific market sectors',
    icon: '🏭',
    etfs: [
      {
        ticker: 'XLF',
        name: 'Financial Select Sector SPDR Fund',
        expense: '0.10%',
        aum: '$45B+',
        description: 'Banks, insurance, and financial services',
      },
      {
        ticker: 'XLE',
        name: 'Energy Select Sector SPDR Fund',
        expense: '0.10%',
        aum: '$40B+',
        description: 'Oil, gas, and energy companies',
      },
      {
        ticker: 'XLV',
        name: 'Health Care Select Sector SPDR Fund',
        expense: '0.10%',
        aum: '$40B+',
        description: 'Healthcare and pharmaceutical stocks',
      },
    ],
  },
  {
    title: 'Value ETFs',
    description: 'Undervalued companies trading below intrinsic value',
    icon: '💎',
    etfs: [
      {
        ticker: 'VTV',
        name: 'Vanguard Value ETF',
        expense: '0.04%',
        aum: '$115B+',
        description: 'Large-cap value stocks',
      },
      {
        ticker: 'IWD',
        name: 'iShares Russell 1000 Value ETF',
        expense: '0.19%',
        aum: '$65B+',
        description: 'Russell 1000 value component',
      },
      {
        ticker: 'SCHV',
        name: 'Schwab U.S. Large-Cap Value ETF',
        expense: '0.04%',
        aum: '$20B+',
        description: 'Low-cost large-cap value exposure',
      },
    ],
  },
]

// Comprehensive FAQs about ETF investing
const faqs = [
  {
    question: 'What is an ETF and how does it work?',
    answer: 'An ETF (Exchange-Traded Fund) is an investment fund that trades on stock exchanges like individual stocks. ETFs hold a basket of assets (stocks, bonds, commodities) and track an underlying index or strategy. When you buy an ETF share, you own a proportional slice of all the holdings in that fund. ETFs combine the diversification benefits of mutual funds with the trading flexibility of stocks.',
  },
  {
    question: 'What are the best ETFs for beginners in 2025?',
    answer: 'The best ETFs for beginners are low-cost, broad-market index funds like VOO (Vanguard S&P 500), VTI (Vanguard Total Stock Market), and QQQ (Invesco QQQ for tech exposure). These ETFs provide instant diversification across hundreds of stocks with expense ratios as low as 0.03%. Start with total market or S&P 500 ETFs before adding sector-specific or international funds.',
  },
  {
    question: 'Should I invest in SPY, VOO, or IVV?',
    answer: 'SPY, VOO, and IVV all track the S&P 500 index and have nearly identical performance. VOO and IVV have lower expense ratios (0.03% vs 0.09% for SPY), making them better for long-term buy-and-hold investors. SPY has higher trading volume and tighter bid-ask spreads, making it better for active traders. For most investors, VOO or IVV are the best choices due to lower costs.',
  },
  {
    question: 'What is the difference between ETFs and mutual funds?',
    answer: 'ETFs trade throughout the day like stocks at market prices, while mutual funds trade once per day at net asset value (NAV). ETFs typically have lower expense ratios and no minimum investment requirements. ETFs are more tax-efficient due to their unique creation/redemption process. Mutual funds may have sales loads and higher fees, but some offer active management strategies not available in ETF form.',
  },
  {
    question: 'Are ETFs good for long-term investing?',
    answer: 'Yes, ETFs are excellent for long-term investing. Low-cost index ETFs like VOO, VTI, and QQQ provide broad market exposure with minimal fees (as low as 0.03% annually). Over decades, these costs savings compound significantly. ETFs are tax-efficient and allow automatic dividend reinvestment. Many investors build entire retirement portfolios using just 3-5 ETFs covering U.S. stocks, international stocks, and bonds.',
  },
  {
    question: 'What is the expense ratio and why does it matter?',
    answer: 'The expense ratio is the annual fee charged by an ETF, expressed as a percentage of your investment. A 0.03% expense ratio means you pay $3 per year for every $10,000 invested. While this seems small, expense ratios compound over time. Over 30 years, a 0.50% expense ratio vs 0.03% can cost tens of thousands of dollars on a $100,000 investment. Always compare expense ratios when choosing between similar ETFs.',
  },
  {
    question: 'How many ETFs should I own in my portfolio?',
    answer: 'Most investors need only 3-5 ETFs for complete diversification: one U.S. total market ETF (like VTI), one international ETF (like VXUS), and one bond ETF (like BND). You can add 1-2 sector or thematic ETFs for specific exposure. Owning too many ETFs (10+) creates overlap, increases costs, and makes portfolio management difficult without providing meaningful additional diversification.',
  },
  {
    question: 'What is the difference between QQQ and SPY?',
    answer: 'QQQ tracks the Nasdaq-100 index with 100 large-cap tech and growth stocks (heavily weighted toward Apple, Microsoft, Nvidia). SPY tracks the S&P 500 with 500 large-cap stocks across all sectors. QQQ has higher tech concentration (50%+) and higher volatility, while SPY offers broader diversification. QQQ has outperformed historically but with greater risk. Many investors own both for balanced exposure.',
  },
  {
    question: 'Can you lose money in ETFs?',
    answer: 'Yes, ETFs can lose value just like individual stocks. Stock ETFs decline during market downturns - for example, SPY dropped 34% in early 2020 during COVID. However, broad market ETFs have historically recovered and reached new highs over time. Bond ETFs can lose value when interest rates rise. The key is diversification, long time horizons, and understanding that short-term volatility is normal in equity investing.',
  },
  {
    question: 'What are the tax advantages of ETFs?',
    answer: 'ETFs are more tax-efficient than mutual funds due to their unique structure. ETF redemptions happen "in-kind," avoiding capital gains distributions that mutual funds generate. Most ETFs distribute minimal capital gains annually, allowing you to control when you realize gains by choosing when to sell. This tax efficiency is especially valuable in taxable brokerage accounts, though less important in IRAs and 401(k)s.',
  },
  {
    question: 'What is the minimum investment for ETFs?',
    answer: 'ETFs have no minimum investment - you can buy as little as one share. With fractional shares available at most brokers, you can invest with even less (as little as $1 in some cases). This makes ETFs more accessible than mutual funds, which often require $1,000-$3,000 minimums. You can start building a diversified portfolio with just a few hundred dollars across multiple ETFs.',
  },
  {
    question: 'Should I invest in sector ETFs or broad market ETFs?',
    answer: 'Most investors should build their core portfolio with broad market ETFs (SPY, VOO, VTI) for diversification. Sector ETFs like XLK (tech) or XLE (energy) can be added as satellite holdings (10-20% of portfolio) if you have conviction about specific sectors. Sector ETFs increase concentration risk and require more active management. Beginners should focus on broad market exposure before adding sector tilts.',
  },
  {
    question: 'Are Vanguard ETFs better than other providers?',
    answer: 'Vanguard ETFs (VOO, VTI, VYM) are excellent choices with rock-bottom expense ratios (0.03-0.08%) and strong track records. However, iShares and Schwab offer equally competitive low-cost ETFs. The key differences are minimal - focus on expense ratio, tracking error, and fund size rather than provider. Vanguard invented the index fund and maintains a shareholder-owned structure, but BlackRock (iShares) and Schwab also offer quality, low-cost options.',
  },
  {
    question: 'What is tracking error in ETFs?',
    answer: 'Tracking error measures how closely an ETF follows its underlying index. A small tracking error (0.01-0.10%) means the ETF accurately replicates index performance. Tracking error comes from expenses, cash drag, sampling techniques, and dividend timing. Top ETFs like VOO and SPY have minimal tracking error. Check an ETF\'s historical tracking difference before investing - consistent underperformance relative to the index indicates poor fund management.',
  },
]

export default function ETFsPage() {
  const pageUrl = `${SITE_URL}/etfs`
  const currentYear = new Date().getFullYear()

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'ETFs', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `Best ETFs ${currentYear} - Complete ETF Investment Guide`,
    description: 'Comprehensive guide to the best ETFs including SPY, QQQ, VOO, and VTI with analysis, comparisons, and investment strategies.',
    url: pageUrl,
    keywords: ['best ETFs', 'ETF list', 'SPY ETF', 'QQQ ETF', 'index funds', 'ETF investing'],
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(faqs)

  // ItemList Schema for top ETFs
  const topETFs = ETF_CATEGORIES.flatMap(cat => cat.etfs).slice(0, 20)
  const itemListSchema = getItemListSchema({
    name: `Top ${currentYear} ETFs`,
    description: 'Most popular and best performing ETFs for long-term investing',
    url: pageUrl,
    items: topETFs.map((etf, index) => ({
      name: `${etf.ticker} - ${etf.name}`,
      url: `${SITE_URL}/stock/${etf.ticker}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema, itemListSchema])
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <span>ETFs</span>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Best ETFs for {currentYear} - Complete Investment Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Discover the top exchange-traded funds including SPY, QQQ, VOO, and VTI. Compare index funds,
              sector ETFs, dividend ETFs, and international funds with comprehensive analysis and real-time data.
            </p>
            <p className="text-base text-muted-foreground max-w-3xl">
              ETFs (Exchange-Traded Funds) provide instant diversification at low cost, making them ideal for
              long-term investors. This guide covers the best ETFs across all categories with detailed analysis
              to help you build a winning portfolio.
            </p>
          </div>

          {/* Quick Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">3,000+</div>
              <div className="text-sm text-muted-foreground">ETFs Available</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">0.03%</div>
              <div className="text-sm text-muted-foreground">Lowest Expense Ratio</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">$10T+</div>
              <div className="text-sm text-muted-foreground">Total ETF Assets</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">1 Share</div>
              <div className="text-sm text-muted-foreground">Minimum Investment</div>
            </div>
          </section>

          {/* Popular ETF Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular ETF Categories</h2>
            <div className="space-y-8">
              {ETF_CATEGORIES.map((category) => (
                <div key={category.title} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{category.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {category.etfs.map((etf) => (
                      <Link
                        key={etf.ticker}
                        href={`/stock/${etf.ticker}`}
                        className="bg-secondary/30 p-4 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg font-bold group-hover:text-green-500 transition-colors">
                            {etf.ticker}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {etf.expense}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium mb-2">{etf.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{etf.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">AUM: {etf.aum}</span>
                          <span className="text-green-500 group-hover:underline">View Details →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ETF vs Mutual Funds */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">ETFs vs Mutual Funds: Key Differences</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left p-4 font-bold">Feature</th>
                      <th className="text-left p-4 font-bold text-green-500">ETFs</th>
                      <th className="text-left p-4 font-bold text-blue-500">Mutual Funds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-4 font-medium">Trading</td>
                      <td className="p-4">Trade all day like stocks</td>
                      <td className="p-4">Once per day at NAV</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Minimum Investment</td>
                      <td className="p-4 text-green-500">1 share (typically $50-500)</td>
                      <td className="p-4">Often $1,000-$3,000</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Expense Ratios</td>
                      <td className="p-4 text-green-500">As low as 0.03%</td>
                      <td className="p-4">Average 0.50-1.50%</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Tax Efficiency</td>
                      <td className="p-4 text-green-500">Highly tax-efficient</td>
                      <td className="p-4">Less tax-efficient</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Trading Costs</td>
                      <td className="p-4">Commission-free at most brokers</td>
                      <td className="p-4">Often no commission</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Transparency</td>
                      <td className="p-4 text-green-500">Holdings disclosed daily</td>
                      <td className="p-4">Holdings disclosed quarterly</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Auto-Investing</td>
                      <td className="p-4">Limited availability</td>
                      <td className="p-4 text-green-500">Widely available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ETF Investing Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Complete ETF Investing Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Getting Started</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Start with broad market ETFs (SPY, VOO, or VTI)</li>
                  <li>• Keep it simple with 3-5 core ETFs</li>
                  <li>• Focus on low expense ratios (under 0.20%)</li>
                  <li>• Verify high assets under management ($1B+)</li>
                  <li>• Check daily trading volume for liquidity</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-blue-500">Building Your Portfolio</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 60-70% U.S. stocks (VTI or VOO)</li>
                  <li>• 20-30% International stocks (VXUS)</li>
                  <li>• 10-20% Bonds (BND or AGG)</li>
                  <li>• Optional: 5-10% sector tilts (QQQ, VGT)</li>
                  <li>• Rebalance annually to maintain targets</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-purple-500">Advanced Strategies</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Tax-loss harvesting with similar ETFs</li>
                  <li>• Dollar-cost averaging for volatility</li>
                  <li>• Dividend reinvestment for compounding</li>
                  <li>• Sector rotation based on economic cycles</li>
                  <li>• Factor investing (value, growth, momentum)</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-orange-500">Common Mistakes to Avoid</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Don't overtrade - ETFs work best long-term</li>
                  <li>• Avoid overlapping holdings in multiple ETFs</li>
                  <li>• Don't chase past performance</li>
                  <li>• Watch out for high expense ratios (over 0.50%)</li>
                  <li>• Don't panic sell during market downturns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Top ETF Picks by Goal */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Best ETFs by Investment Goal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Long-Term Growth</h3>
                <div className="space-y-2">
                  <Link href="/stock/VTI" className="block text-sm hover:text-green-500">
                    <span className="font-medium">VTI</span> - Total Market
                  </Link>
                  <Link href="/stock/QQQ" className="block text-sm hover:text-green-500">
                    <span className="font-medium">QQQ</span> - Tech Growth
                  </Link>
                  <Link href="/stock/VGT" className="block text-sm hover:text-green-500">
                    <span className="font-medium">VGT</span> - Technology
                  </Link>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Income & Dividends</h3>
                <div className="space-y-2">
                  <Link href="/stock/SCHD" className="block text-sm hover:text-green-500">
                    <span className="font-medium">SCHD</span> - Dividend Growth
                  </Link>
                  <Link href="/stock/VYM" className="block text-sm hover:text-green-500">
                    <span className="font-medium">VYM</span> - High Yield
                  </Link>
                  <Link href="/stock/DGRO" className="block text-sm hover:text-green-500">
                    <span className="font-medium">DGRO</span> - Dividend Growth
                  </Link>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Stability & Safety</h3>
                <div className="space-y-2">
                  <Link href="/stock/BND" className="block text-sm hover:text-green-500">
                    <span className="font-medium">BND</span> - Total Bond Market
                  </Link>
                  <Link href="/stock/AGG" className="block text-sm hover:text-green-500">
                    <span className="font-medium">AGG</span> - Aggregate Bonds
                  </Link>
                  <Link href="/stock/TIP" className="block text-sm hover:text-green-500">
                    <span className="font-medium">TIP</span> - Inflation Protected
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions About ETF Investing
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/sectors"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="font-bold mb-1">Sectors</p>
                <p className="text-xs text-muted-foreground">Browse by sector</p>
              </Link>
              <Link
                href="/best-stocks/dividend"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="font-bold mb-1">Dividend Stocks</p>
                <p className="text-xs text-muted-foreground">Income investing</p>
              </Link>
              <Link
                href="/screener"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="font-bold mb-1">Stock Screener</p>
                <p className="text-xs text-muted-foreground">Find opportunities</p>
              </Link>
              <Link
                href="/markets"
                className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="font-bold mb-1">Market Data</p>
                <p className="text-xs text-muted-foreground">Live quotes</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Start Analyzing ETFs Today</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get real-time quotes, comprehensive analysis, and AI-powered insights for any ETF.
              Compare holdings, track performance, and make informed investment decisions.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Access Dashboard
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
