import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'How to Invest in Stocks - Complete Beginner\'s Guide 2025',
  description: 'Learn how to invest in stocks with our comprehensive beginner\'s guide. Understand investing basics, valuation, risk management, and portfolio building strategies.',
  keywords: [
    'how to invest in stocks',
    'stock investing for beginners',
    'learn stock investing',
    'investment guide',
    'stock market basics',
    'investing strategies',
    'portfolio building',
    'stock valuation',
    'risk management',
  ],
  openGraph: {
    title: 'How to Invest in Stocks - Complete Guide for Beginners',
    description: 'Master stock investing from basics to advanced strategies. Learn valuation, risk management, and portfolio building.',
    type: 'article',
    url: `${SITE_URL}/learn/how-to-invest`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/how-to-invest`,
  },
}

const investmentTypes = [
  {
    title: 'Individual Stocks',
    icon: '📊',
    description: 'Buy shares of specific companies you believe will grow. Requires research but offers highest potential returns and control.',
    pros: 'High growth potential, dividends, full control',
    cons: 'Higher risk, time-intensive research required',
  },
  {
    title: 'Index Funds',
    icon: '📈',
    description: 'Invest in funds that track market indexes like S&P 500. Instant diversification with minimal effort.',
    pros: 'Low cost, diversified, passive management',
    cons: 'Market-level returns only, no control over holdings',
  },
  {
    title: 'ETFs',
    icon: '💼',
    description: 'Exchange-traded funds combine the diversification of index funds with the flexibility of stocks. Trade like stocks throughout the day.',
    pros: 'Diversified, liquid, tax-efficient, low cost',
    cons: 'Trading commissions, slight tracking error',
  },
  {
    title: 'Dividend Stocks',
    icon: '💰',
    description: 'Focus on companies that regularly pay dividends. Provides steady income stream while building wealth.',
    pros: 'Passive income, lower volatility, compound growth',
    cons: 'Lower capital appreciation, dividend cuts possible',
  },
]

const investingStrategies = [
  {
    name: 'Value Investing',
    description: 'Buy undervalued stocks trading below intrinsic value. Made famous by Warren Buffett. Focus on low P/E ratios, strong fundamentals.',
    bestFor: 'Patient investors with research skills',
  },
  {
    name: 'Growth Investing',
    description: 'Invest in companies expected to grow faster than market average. Focus on revenue growth, market expansion, innovation.',
    bestFor: 'Higher risk tolerance, long-term horizon',
  },
  {
    name: 'Dividend Investing',
    description: 'Build portfolio of dividend-paying stocks for passive income. Reinvest dividends to compound returns over time.',
    bestFor: 'Income-focused investors, retirees',
  },
  {
    name: 'Index Investing',
    description: 'Track broad market indexes for diversified, low-cost exposure. Based on efficient market hypothesis.',
    bestFor: 'Beginners, passive investors, low-effort approach',
  },
]

const riskManagement = [
  {
    principle: 'Diversification',
    description: 'Spread investments across sectors, market caps, and geographies to reduce single-stock risk.',
    impact: 'Lower portfolio volatility, smoother returns',
  },
  {
    principle: 'Position Sizing',
    description: 'Limit any single position to 5-10% of portfolio. Prevents one bad investment from devastating your wealth.',
    impact: 'Controlled downside, manageable losses',
  },
  {
    principle: 'Dollar-Cost Averaging',
    description: 'Invest fixed amounts regularly rather than timing the market. Reduces impact of volatility.',
    impact: 'Lower average purchase cost, less stress',
  },
  {
    principle: 'Emergency Fund',
    description: 'Keep 3-6 months expenses in cash before investing. Prevents forced selling during market downturns.',
    impact: 'Financial stability, confidence to hold',
  },
  {
    principle: 'Rebalancing',
    description: 'Periodically adjust portfolio to maintain target allocation. Sell high, buy low automatically.',
    impact: 'Risk control, forced profit-taking',
  },
]

const faqs = [
  {
    question: 'How much money do I need to start investing in stocks?',
    answer: 'You can start investing with as little as $1 thanks to fractional shares offered by modern brokers. However, it\'s wise to have at least $500-$1,000 to adequately diversify. More importantly, ensure you have an emergency fund (3-6 months expenses) before investing, as stocks are volatile and you shouldn\'t invest money you\'ll need soon.',
  },
  {
    question: 'What is the best investing strategy for beginners?',
    answer: 'Index investing is often best for beginners. Invest in low-cost index funds or ETFs that track the S&P 500 or total market. This provides instant diversification, requires minimal research, and historically returns 10% annually long-term. As you learn more, you can graduate to individual stock picking. Dollar-cost averaging (investing fixed amounts monthly) reduces timing risk.',
  },
  {
    question: 'How do I know if a stock is a good investment?',
    answer: 'Evaluate stocks using multiple criteria: (1) Valuation - Is the P/E ratio reasonable compared to industry peers? (2) Fundamentals - Is revenue and earnings growing? (3) Competitive advantage - Does the company have a moat? (4) Financial health - Strong balance sheet with manageable debt? (5) Management - Competent leadership with shareholder-friendly policies? Our AI stock analyzer can help with this research.',
  },
  {
    question: 'Should I invest in individual stocks or index funds?',
    answer: 'It depends on your goals, time, and skill level. Index funds are better for most people: they provide diversification, require no research, and historically match or beat active investors. Individual stocks offer higher potential returns and control, but require significant research, time, and carry higher risk. A hybrid approach works well: core portfolio in index funds (70-80%), satellite positions in individual stocks (20-30%).',
  },
  {
    question: 'How do I build a diversified portfolio?',
    answer: 'Diversify across multiple dimensions: (1) Sectors - Spread across technology, healthcare, finance, consumer, etc. (2) Market caps - Mix large, mid, and small-cap stocks. (3) Geographies - Include international exposure (20-30%). (4) Asset types - Stocks, bonds, REITs. (5) Investment styles - Blend growth and value stocks. Aim for 15-25 individual stocks minimum, or use index funds for instant diversification.',
  },
  {
    question: 'What are the most common investing mistakes to avoid?',
    answer: 'Top mistakes include: (1) Emotional trading - Buying high during euphoria, selling low in panic. (2) Lack of diversification - Over-concentration in one or few stocks. (3) Market timing - Trying to predict short-term movements. (4) Following hot tips without research. (5) Ignoring fees and taxes. (6) No investment plan or strategy. (7) Investing money needed soon. (8) Panic selling during downturns. (9) Over-trading and racking up commissions. (10) Not rebalancing portfolio.',
  },
  {
    question: 'How long should I hold stocks?',
    answer: 'The best investors hold for the long-term (5+ years, ideally decades). This allows compound growth, reduces taxes (long-term capital gains are lower), minimizes trading costs, and lets you ride out volatility. Warren Buffett\'s favorite holding period is "forever." However, sell if: (1) Fundamentals deteriorate significantly. (2) Stock becomes significantly overvalued. (3) Better opportunities exist. (4) Investment thesis breaks. Don\'t sell due to short-term price movements.',
  },
  {
    question: 'Should I invest during a market crash?',
    answer: 'Yes! Market crashes create the best buying opportunities. Stock prices are discounted, great companies are "on sale," and future returns are higher when starting from lower valuations. Continue dollar-cost averaging, or even increase contributions if possible. Never panic sell - this locks in losses. History shows markets always recover and reach new highs. The 2020 COVID crash rebounded in months. The 2008 crash took 4 years but went on to all-time highs.',
  },
  {
    question: 'What percentage of my income should I invest?',
    answer: 'Aim to invest 15-20% of gross income for retirement and wealth building. If that feels high, start with 10% and increase 1% each year. Max out tax-advantaged accounts first (401k match, then Roth IRA, then HSA, then remainder to taxable brokerage). The earlier you start, the lower the percentage needed due to compound growth. If you start at 25, 15% may be enough. Starting at 40 may require 25-30%.',
  },
  {
    question: 'How do taxes affect my stock investments?',
    answer: 'Taxes significantly impact returns. Dividends and capital gains from selling stocks are taxable. Hold stocks over 1 year for long-term capital gains rates (0%, 15%, or 20% vs ordinary income tax rates up to 37%). Use tax-advantaged accounts (401k, IRA, Roth IRA) to defer or eliminate taxes. Tax-loss harvesting can offset gains. Dividends are taxed annually even if reinvested. Index funds are more tax-efficient than actively managed funds due to lower turnover.',
  },
]

export default function HowToInvestPage() {
  const pageUrl = `${SITE_URL}/learn/how-to-invest`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'How to Invest in Stocks', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'How to Invest in Stocks - Complete Beginner\'s Guide',
    description: 'Comprehensive guide to stock investing covering basics, strategies, risk management, and portfolio building for beginners.',
    url: pageUrl,
    keywords: [
      'how to invest',
      'stock investing guide',
      'investment strategies',
      'portfolio building',
      'risk management',
    ],
  })

  const faqSchema = getFAQSchema(faqs)

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-4 sm:mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            {' / '}
            <span>How to Invest in Stocks</span>
          </nav>

          {/* Hero */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              How to Invest in Stocks: Complete Beginner&apos;s Guide
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Master the fundamentals of stock investing, from opening your first brokerage account
              to building a diversified portfolio. Learn proven strategies used by successful investors.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-card p-4 sm:p-6 rounded-xl border border-border mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
              <a href="#basics" className="text-green-500 hover:underline">1. Investing Basics</a>
              <a href="#types" className="text-green-500 hover:underline">2. Types of Investments</a>
              <a href="#strategies" className="text-green-500 hover:underline">3. Investment Strategies</a>
              <a href="#getting-started" className="text-green-500 hover:underline">4. Getting Started</a>
              <a href="#risk" className="text-green-500 hover:underline">5. Risk Management</a>
              <a href="#faq" className="text-green-500 hover:underline">6. FAQs</a>
            </div>
          </div>

          {/* Why Invest in Stocks */}
          <section id="basics" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Why Invest in Stocks?</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Stocks have historically been the best way to build long-term wealth. Since 1926, the S&P 500
              has returned approximately 10% annually, far outpacing inflation, bonds, and savings accounts.
              $10,000 invested in the S&P 500 in 1980 would be worth over $1 million today (including reinvested dividends).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <h3 className="text-base sm:text-lg font-bold mb-3 text-green-500">Benefits of Stock Investing</h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Wealth Building:</strong> Compound growth over decades creates significant wealth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Beat Inflation:</strong> Stocks historically outpace inflation by 7% annually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Dividend Income:</strong> Many stocks pay regular dividends for passive income</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Ownership:</strong> Become a partial owner in world-class companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Liquidity:</strong> Easily buy and sell during market hours</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <h3 className="text-base sm:text-lg font-bold mb-3 text-red-500">Risks to Understand</h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span><strong>Volatility:</strong> Stock prices fluctuate daily, sometimes dramatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span><strong>No Guarantees:</strong> Past performance doesn&apos;t ensure future returns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span><strong>Company Risk:</strong> Individual companies can go bankrupt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span><strong>Market Crashes:</strong> Markets can drop 30-50% during severe downturns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span><strong>Emotional Decisions:</strong> Fear and greed lead to poor timing</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Types of Stock Investments */}
          <section id="types" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Types of Stock Investments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {investmentTypes.map((type, index) => (
                <div key={index} className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl sm:text-4xl">{type.icon}</span>
                    <h3 className="text-lg sm:text-xl font-bold">{type.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">{type.description}</p>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-green-500">Pros: </span>
                      <span className="text-muted-foreground">{type.pros}</span>
                    </div>
                    <div>
                      <span className="font-bold text-red-500">Cons: </span>
                      <span className="text-muted-foreground">{type.cons}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Strategies */}
          <section id="strategies" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Popular Investment Strategies</h2>
            <div className="space-y-4 sm:space-y-6">
              {investingStrategies.map((strategy, index) => (
                <div key={index} className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{strategy.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">{strategy.description}</p>
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-green-500">Best for: </span>
                    <span className="text-muted-foreground">{strategy.bestFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started Steps */}
          <section id="getting-started" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">How to Get Started Investing</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold mb-2">Build Your Emergency Fund</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Before investing, save 3-6 months of expenses in a high-yield savings account.
                      This prevents you from selling stocks during emergencies or market downturns.
                      Only invest money you won&apos;t need for at least 5 years.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold mb-2">Choose a Brokerage Account</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3">
                      Open a brokerage account with a reputable broker. Popular options include Fidelity,
                      Charles Schwab, Vanguard, and Interactive Brokers. Look for zero commission trades,
                      fractional shares, strong research tools, and good customer service.
                    </p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Consider tax-advantaged accounts first: 401(k) with employer match, Roth IRA,
                      Traditional IRA, HSA, then taxable brokerage accounts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold mb-2">Start with Index Funds</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Beginners should start with low-cost index funds or ETFs tracking the S&P 500
                      (like VOO, SPY, or IVV) or total market (VTI, ITOT). This provides instant
                      diversification across 500+ companies with minimal fees (often below 0.10% annually).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold mb-2">Dollar-Cost Average</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Invest a fixed amount regularly (monthly or each paycheck) rather than trying
                      to time the market. This reduces the impact of volatility and removes emotional
                      decision-making. Set up automatic investments to build the habit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold mb-2">Learn and Expand</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      As you gain experience and knowledge, gradually add individual stocks to your
                      portfolio. Start with 5-10% in individual picks, increasing as your research
                      skills improve. Use our stock analysis tools to evaluate companies, understand
                      valuations, and make informed decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Management */}
          <section id="risk" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Risk Management Principles</h2>
            <div className="space-y-4 sm:space-y-6">
              {riskManagement.map((item, index) => (
                <div key={index} className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-green-500">{item.principle}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">{item.description}</p>
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold">Impact: </span>{item.impact}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl border border-border group"
                >
                  <summary className="text-base sm:text-lg font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="flex-1">{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform flex-shrink-0">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Continue Your Investing Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-4 sm:p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  How to Analyze Stocks
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn to evaluate companies using financial statements, valuation metrics, and competitive analysis.
                </p>
              </Link>
              <Link
                href="/learn/pe-ratio"
                className="bg-card p-4 sm:p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Understanding P/E Ratios
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Master the most important valuation metric for determining if a stock is fairly priced.
                </p>
              </Link>
              <Link
                href="/learn/dividend-investing"
                className="bg-card p-4 sm:p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Dividend Investing Guide
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Build passive income streams through dividend-paying stocks and compound your wealth.
                </p>
              </Link>
              <Link
                href="/learn"
                className="bg-card p-4 sm:p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-base sm:text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Learning Hub
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Explore all our educational guides on stock investing, analysis, and valuation.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 sm:p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Ready to Start Your Investing Journey?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Put your knowledge into action with our AI-powered stock screener and analysis tools.
              Find quality stocks, analyze fundamentals, and build your portfolio with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Analyze Stocks Now
              </Link>
              <Link
                href="/screener"
                className="inline-block w-full sm:w-auto bg-card hover:bg-card/80 border border-border px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Stock Screener
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
