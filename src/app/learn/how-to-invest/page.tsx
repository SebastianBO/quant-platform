import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'How to Invest in Stocks: Complete Beginner\'s Guide (2025)',
  description: 'Learn how to invest in stocks step-by-step. Master stock market basics, investment accounts, picking stocks, portfolio building, and avoiding common beginner mistakes.',
  keywords: [
    'how to invest in stocks',
    'stock market for beginners',
    'how to buy stocks',
    'investing for beginners',
    'start investing',
    'beginner investor',
    'how to invest money',
    'stock investing guide',
    'learn stock market',
    'first time investor',
  ],
  openGraph: {
    title: 'How to Invest in Stocks: Complete Beginner\'s Guide',
    description: 'Ultimate guide for beginners: Learn how to invest in stocks, open accounts, pick stocks, and build wealth through the stock market.',
    type: 'article',
    url: `${SITE_URL}/learn/how-to-invest`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/how-to-invest`,
  },
}

const howToSteps = [
  {
    name: 'Open an Investment Account',
    text: 'Choose between a brokerage account (flexible access), IRA (tax advantages for retirement), or 401(k) (employer-sponsored retirement). Online brokers like Fidelity, Schwab, or Robinhood make it easy to open accounts with no minimums. You\'ll need your SSN, bank account info, and basic personal details.',
  },
  {
    name: 'Fund Your Account',
    text: 'Link your bank account and transfer money to your investment account. Start with an amount you\'re comfortable investing - even $100 is enough to begin. Set up automatic transfers to build the habit of regular investing, the foundation of long-term wealth building.',
  },
  {
    name: 'Learn the Basics',
    text: 'Understand what stocks are (ownership in companies), how the market works (buyers and sellers exchanging shares), and basic investment concepts like diversification, risk tolerance, and time horizon. Knowledge reduces fear and improves decision-making.',
  },
  {
    name: 'Choose Your Investment Strategy',
    text: 'Decide between individual stocks (requires research and time), index funds/ETFs (instant diversification, lower risk), or a combination. Beginners often start with broad market ETFs like VOO (S&P 500) or VTI (total stock market) to build a foundation.',
  },
  {
    name: 'Research and Pick Your First Stocks',
    text: 'If buying individual stocks, research companies you understand and believe in long-term. Look at financial health, competitive advantages, growth prospects, and valuation. Start with well-known, profitable companies before venturing into speculative plays.',
  },
  {
    name: 'Place Your First Trade',
    text: 'Use your broker\'s platform to search for the stock ticker, enter the number of shares, choose market or limit order, and review before submitting. Market orders execute immediately at current price; limit orders only execute at your specified price or better.',
  },
  {
    name: 'Build a Diversified Portfolio',
    text: 'Don\'t put all your money in one stock. Spread investments across different sectors (technology, healthcare, finance), market caps (large, mid, small), and asset types (stocks, bonds). Diversification reduces risk while maintaining growth potential.',
  },
  {
    name: 'Invest Consistently Over Time',
    text: 'Use dollar-cost averaging: invest a fixed amount regularly (monthly, biweekly) regardless of market conditions. This strategy buys more shares when prices are low, fewer when high, reducing the impact of market timing and building wealth steadily.',
  },
  {
    name: 'Monitor and Rebalance',
    text: 'Check your portfolio periodically (quarterly or annually) but avoid obsessing over daily movements. Rebalance when allocations drift significantly from targets. Stay informed about your investments but don\'t let short-term volatility drive emotional decisions.',
  },
  {
    name: 'Stay Disciplined for the Long Term',
    text: 'Investing is a marathon, not a sprint. Markets fluctuate, but historically trend upward over decades. Don\'t panic during downturns; view them as buying opportunities. Compound growth works magic over 10, 20, 30+ years of consistent investing.',
  },
]

const faqs = [
  {
    question: 'How much money do I need to start investing in stocks?',
    answer: 'You can start investing with as little as $1 thanks to fractional shares offered by modern brokers. However, $500-$1,000 gives you more flexibility to diversify. The most important factor isn\'t the amount - it\'s starting early and investing consistently. Time in the market beats timing the market, so even small amounts invested regularly compound significantly over decades.',
  },
  {
    question: 'What is the difference between stocks and bonds?',
    answer: 'Stocks represent ownership in a company. When you buy a stock, you own a piece of that business and benefit from its growth and profits (through price appreciation and dividends). Bonds are loans to companies or governments. You lend money and receive fixed interest payments, plus your principal back at maturity. Stocks offer higher growth potential but more volatility; bonds provide stability and income but lower returns.',
  },
  {
    question: 'Should I invest in individual stocks or index funds?',
    answer: 'For most beginners, index funds are the better starting point. They provide instant diversification across hundreds of companies, require minimal research, have low fees, and historically return 10% annually. Individual stocks can outperform but require significant research, expertise, and time. Many successful investors combine both: index funds as a core holding (70-80%) with individual stocks (20-30%) for companies they believe will outperform.',
  },
  {
    question: 'What is a brokerage account and how do I open one?',
    answer: 'A brokerage account is like a bank account for investments - it holds your stocks, bonds, and funds. Opening one takes 10-15 minutes online with brokers like Fidelity, Schwab, Vanguard, or Robinhood. You\'ll provide your SSN, address, employment info, and link a bank account. Most brokers have no account minimums or trading commissions. Choose based on features, research tools, customer service, and platform usability.',
  },
  {
    question: 'What is the difference between a brokerage account, IRA, and 401(k)?',
    answer: 'A brokerage account is a taxable investment account with complete flexibility - invest and withdraw anytime, but pay taxes on gains. An IRA (Individual Retirement Account) offers tax advantages: Traditional IRA contributions are tax-deductible, Roth IRA withdrawals are tax-free in retirement. Both have annual contribution limits ($6,500 in 2024) and penalties for early withdrawal before 59.5. A 401(k) is employer-sponsored, often with company matching (free money!), higher contribution limits ($23,000), and similar tax treatment to IRAs.',
  },
  {
    question: 'How do I pick my first stocks to invest in?',
    answer: 'Start with companies you know and understand - products you use, services you trust, businesses with clear value propositions. Research their financial health (growing revenue, profits, manageable debt), competitive advantages (brand strength, patents, network effects), and valuation (P/E ratio compared to peers). Avoid "hot tips" and hype stocks. Use tools like Lician to analyze fundamentals quickly. Beginners should favor large, established companies with track records over speculative plays.',
  },
  {
    question: 'What is the difference between a market order and a limit order?',
    answer: 'A market order buys or sells immediately at the current market price. It guarantees execution but not price - you might pay slightly more/less than expected due to price movements. Use market orders for liquid stocks when you want immediate execution. A limit order specifies the maximum price you\'ll pay (buy) or minimum you\'ll accept (sell). It guarantees price but not execution - the order only fills if the stock reaches your limit. Use limit orders for volatile stocks or when price matters more than timing.',
  },
  {
    question: 'How many stocks should I own as a beginner?',
    answer: 'Financial experts suggest 15-20 stocks for adequate diversification, reducing company-specific risk while remaining manageable. However, this assumes individual stock picking. For beginners, owning 1-2 index funds or ETFs provides diversification across hundreds of stocks instantly. If building an individual stock portfolio, start with 3-5 high-quality companies in different sectors, then gradually expand to 10-15 as you gain experience and capital.',
  },
  {
    question: 'What are the biggest mistakes beginner investors make?',
    answer: 'Common mistakes include: (1) Trying to time the market instead of investing consistently, (2) Panic selling during market downturns, (3) Chasing "hot" stocks without research, (4) Lack of diversification - putting too much in one stock, (5) Paying high fees for actively managed funds, (6) Not starting early enough - losing years of compound growth, (7) Checking portfolios obsessively and reacting to short-term volatility, (8) Ignoring tax-advantaged accounts like IRAs and 401(k)s.',
  },
  {
    question: 'Should I invest for the long term or try to trade short term?',
    answer: 'For beginners, long-term investing (5+ years) is far more successful than short-term trading. The stock market has returned ~10% annually over decades, but daily/weekly movements are unpredictable. Short-term trading requires significant expertise, time, and emotional discipline - 90% of day traders lose money. Long-term investors benefit from compound growth, pay less in taxes (long-term capital gains rates), and avoid the stress of constant monitoring. Warren Buffett\'s advice: "The stock market is a device for transferring money from the impatient to the patient."',
  },
  {
    question: 'How do I know if a stock is overvalued or a good deal?',
    answer: 'Compare valuation metrics to historical averages and industry peers: P/E ratio (price relative to earnings), P/B ratio (price relative to book value), PEG ratio (P/E adjusted for growth), and dividend yield. Use DCF analysis to estimate intrinsic value based on future cash flows. A stock trading below intrinsic value may be undervalued. However, valuation is complex - "cheap" stocks can be cheap for good reasons (declining business, competitive threats). Tools like Lician automate these calculations and provide AI-driven insights.',
  },
  {
    question: 'How much of my income should I invest in stocks?',
    answer: 'A common guideline is the 50/30/20 rule: 50% of income for needs, 30% for wants, 20% for savings and investments. Within that 20%, prioritize high-interest debt payoff, emergency fund (3-6 months expenses), then invest the rest. As a target, save 15-20% of gross income for retirement. Start with whatever you can afford - even 5-10% builds the habit and compounds over time. Increase contributions as your income grows or expenses decrease.',
  },
  {
    question: 'What happens if the stock market crashes after I invest?',
    answer: 'Market corrections (10%+ declines) happen regularly; crashes (20%+ declines) occur every few years. If you\'re investing for the long term, these are normal and temporary. History shows markets always recover and reach new highs given time. The worst thing you can do is panic sell and lock in losses. Instead: (1) Continue investing - buy stocks "on sale" with discounted prices, (2) Review if fundamentals of your holdings changed, (3) Rebalance if needed, (4) Remember why you invested long-term. Every market crash has been followed by recovery and growth.',
  },
  {
    question: 'Do I need to pay taxes on stock investments?',
    answer: 'Yes, but tax treatment varies. In taxable brokerage accounts: dividends and capital gains (profit from selling stocks) are taxable. Stocks held over 1 year qualify for lower long-term capital gains rates (0%, 15%, or 20% depending on income). Short-term gains (under 1 year) are taxed as ordinary income at higher rates. In tax-advantaged accounts (IRA, 401k), investments grow tax-deferred or tax-free. You only pay taxes when withdrawing in retirement, making these accounts powerful for long-term growth.',
  },
  {
    question: 'How often should I check my investment portfolio?',
    answer: 'Quarterly or semi-annually is sufficient for long-term investors. Checking daily or weekly often leads to emotional reactions to normal volatility and poor decisions. Review your portfolio to: (1) Ensure diversification remains balanced, (2) Assess if holdings still meet your investment thesis, (3) Rebalance if allocations drift significantly, (4) Add new capital from savings. Focus on long-term trends, not daily fluctuations. Set up automatic contributions and let compound growth work while you focus on earning more income to invest.',
  },
]

const accountTypes = [
  {
    name: 'Taxable Brokerage Account',
    description: 'Complete flexibility to invest and withdraw anytime without penalties',
    pros: ['No contribution limits', 'Access funds anytime', 'No age restrictions', 'Can invest unlimited amounts'],
    cons: ['Pay taxes on dividends and capital gains', 'No tax deductions or credits'],
    bestFor: 'Short-to-medium term goals, or after maxing out retirement accounts',
  },
  {
    name: 'Traditional IRA',
    description: 'Individual retirement account with tax-deductible contributions',
    pros: ['Tax-deductible contributions (reduce current taxes)', 'Tax-deferred growth', 'Lower current tax bill'],
    cons: ['$6,500 annual limit ($7,500 if 50+)', '10% penalty if withdrawn before 59.5', 'Required distributions at 73'],
    bestFor: 'Retirement savings when you expect to be in a lower tax bracket in retirement',
  },
  {
    name: 'Roth IRA',
    description: 'Retirement account with tax-free withdrawals in retirement',
    pros: ['Tax-free growth and withdrawals', 'No required distributions', 'Can withdraw contributions anytime', 'Tax-free for heirs'],
    cons: ['$6,500 annual limit ($7,500 if 50+)', 'Contributions not tax-deductible', 'Income limits for eligibility'],
    bestFor: 'Young investors, high earners expecting higher taxes in retirement, estate planning',
  },
  {
    name: '401(k)',
    description: 'Employer-sponsored retirement plan, often with company matching',
    pros: ['Employer match (free money!)', 'High contribution limit ($23,000)', 'Tax-deferred growth', 'Automatic payroll deductions'],
    cons: ['Limited investment options', 'Early withdrawal penalties', 'Required distributions at 73'],
    bestFor: 'Everyone with access - always contribute enough to get full employer match',
  },
]

const orderTypes = [
  {
    name: 'Market Order',
    description: 'Buy or sell immediately at the current market price',
    execution: 'Immediate - executes within seconds during market hours',
    price: 'Not guaranteed - you get whatever the current price is',
    whenToUse: 'Liquid stocks (Apple, Microsoft) when you want immediate execution',
    example: 'You want to buy Apple stock right now at whatever the current price is (~$180). Your order fills instantly at the best available price.',
  },
  {
    name: 'Limit Order',
    description: 'Buy or sell only at a specific price or better',
    execution: 'Not guaranteed - only executes if stock reaches your price',
    price: 'Guaranteed - you specify max buy price or min sell price',
    whenToUse: 'Volatile stocks, large orders, or when price is more important than timing',
    example: 'Apple is at $180, but you only want to buy at $175 or less. Your limit order sits waiting until the price drops to $175, then executes.',
  },
  {
    name: 'Stop-Loss Order',
    description: 'Automatically sell if the stock falls to a specific price',
    execution: 'Becomes a market order when stop price is hit',
    price: 'Not guaranteed - executes at market price after trigger',
    whenToUse: 'Protecting profits or limiting losses on positions',
    example: 'You bought Tesla at $200, it\'s now $250. Set a stop-loss at $230 to protect most gains if the stock drops.',
  },
]

const commonMistakes = [
  {
    mistake: 'Trying to Time the Market',
    description: 'Waiting for the "perfect" moment to invest or selling before crashes',
    solution: 'Invest consistently through dollar-cost averaging. Time IN the market beats timing the market. Studies show even professional investors can\'t consistently time markets.',
    impact: 'Missing the market\'s 10 best days over 20 years reduces returns by ~50%',
  },
  {
    mistake: 'Panic Selling During Downturns',
    description: 'Selling stocks during market crashes, locking in losses',
    solution: 'View market crashes as sales - opportunity to buy quality stocks at discounts. Markets always recover given time. If fundamentals haven\'t changed, hold or buy more.',
    impact: 'Missing the recovery means potentially never recouping losses',
  },
  {
    mistake: 'Chasing Hot Stocks and Trends',
    description: 'Buying stocks because they\'re popular, without research',
    solution: 'Invest based on fundamentals, not hype. Research business models, financials, and competitive advantages. If everyone\'s talking about a stock, you\'re probably late.',
    impact: 'Buying at peaks often leads to 50-80% losses when trends reverse',
  },
  {
    mistake: 'Lack of Diversification',
    description: 'Putting too much money in one stock or sector',
    solution: 'Spread investments across 10-15 stocks minimum, multiple sectors, different market caps. Use index funds for instant diversification if picking stocks is overwhelming.',
    impact: 'One bad stock can wipe out years of gains in a concentrated portfolio',
  },
  {
    mistake: 'Ignoring Fees and Expenses',
    description: 'Paying high fees for actively managed funds or trading excessively',
    solution: 'Choose low-cost index funds (0.03-0.20% expense ratios) over actively managed funds (0.5-2%+). Avoid excessive trading. Every 1% in fees compounds against you.',
    impact: 'A 1% fee difference costs ~$500,000 on a $1M portfolio over 30 years',
  },
  {
    mistake: 'Not Starting Early Enough',
    description: 'Waiting to invest until you have more money or knowledge',
    solution: 'Start now with whatever you have. Compound growth rewards time more than amount. $100/month starting at 25 beats $500/month starting at 35.',
    impact: 'Delaying 10 years can cost hundreds of thousands in lost compound growth',
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
    headline: 'How to Invest in Stocks: Complete Beginner\'s Guide',
    description: 'Comprehensive step-by-step guide to investing in stocks for beginners. Learn about investment accounts, picking stocks, portfolio building, and avoiding common mistakes.',
    url: pageUrl,
    keywords: ['how to invest in stocks', 'stock investing for beginners', 'how to buy stocks', 'investment guide'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Invest in Stocks for Beginners',
    description: 'Complete step-by-step guide to start investing in the stock market, from opening accounts to building a diversified portfolio.',
    steps: howToSteps,
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, howToSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>How to Invest in Stocks</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              How to Invest in Stocks: The Complete Beginner's Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Master stock market investing from zero to confident investor. This comprehensive guide covers everything
              beginners need to know: opening accounts, picking stocks, building portfolios, and avoiding costly mistakes.
            </p>
          </div>

          {/* Why Invest in Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Invest in Stocks?</h2>
            <p className="text-muted-foreground mb-4">
              Stocks have historically returned ~10% annually, significantly outpacing inflation and other asset classes
              over the long term. A $10,000 investment growing at 10% annually becomes $174,000 after 30 years - that's
              the power of compound growth.
            </p>
            <p className="text-muted-foreground mb-4">
              Unlike savings accounts (2-4% interest) or bonds (3-5% returns), stocks represent ownership in businesses
              that grow, innovate, and increase in value. While more volatile short-term, stocks have proven to be the
              most reliable path to building significant long-term wealth.
            </p>
            <div className="bg-card p-6 rounded-xl border border-green-500/20">
              <p className="text-muted-foreground">
                <span className="font-bold text-green-500">The Earlier You Start, The Better:</span> Someone who invests
                $500/month from age 25-35 (total: $60,000) will have more at retirement than someone who invests
                $500/month from 35-65 (total: $180,000), thanks to compound growth. Time is your greatest advantage.
              </p>
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Start Investing: Step-by-Step</h2>
            <div className="space-y-6">
              {howToSteps.map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                      <p className="text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Account Types */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Types of Investment Accounts</h2>
            <p className="text-muted-foreground mb-6">
              Choosing the right account type significantly impacts your taxes and when you can access funds.
              Here's a breakdown of the most common investment accounts:
            </p>
            <div className="space-y-6">
              {accountTypes.map((account, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-bold mb-2">{account.name}</h3>
                  <p className="text-muted-foreground mb-4">{account.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-green-500 mb-2">Pros:</h4>
                      <ul className="space-y-1">
                        {account.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-green-500">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-500 mb-2">Cons:</h4>
                      <ul className="space-y-1">
                        {account.cons.map((con, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-red-500">✗</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-background/50 p-3 rounded">
                    <span className="font-bold">Best For: </span>
                    <span className="text-muted-foreground">{account.bestFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Pick Your First Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Pick Your First Stocks</h2>
            <p className="text-muted-foreground mb-6">
              Picking individual stocks requires research and patience. Here's a beginner-friendly framework:
            </p>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">1. Start with What You Know</h3>
                <p className="text-muted-foreground">
                  Invest in companies whose products you use and businesses you understand. Apple, Microsoft, Coca-Cola,
                  Nike - these are easier to evaluate than complex biotech or semiconductor firms. Understanding the
                  business model is foundational to successful investing.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">2. Look for Strong Fundamentals</h3>
                <p className="text-muted-foreground mb-2">
                  Evaluate financial health using key metrics:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex gap-2"><span className="text-green-500">•</span> Consistent revenue growth (10%+ annually is strong)</li>
                  <li className="flex gap-2"><span className="text-green-500">•</span> Profitability and improving margins</li>
                  <li className="flex gap-2"><span className="text-green-500">•</span> Manageable debt levels (debt-to-equity below 2)</li>
                  <li className="flex gap-2"><span className="text-green-500">•</span> Positive free cash flow</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">3. Assess Competitive Advantages</h3>
                <p className="text-muted-foreground">
                  Great investments have "moats" - sustainable competitive advantages that protect profits. Look for
                  strong brands (Apple), network effects (Facebook), switching costs (Microsoft), economies of scale
                  (Walmart), or proprietary technology (patents, trade secrets).
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">4. Check Valuation</h3>
                <p className="text-muted-foreground">
                  Compare the stock's P/E ratio to industry peers and historical averages. A low P/E might indicate
                  value, but could also signal problems. Use <Link href="/learn/dcf-valuation" className="text-green-500 hover:underline">DCF analysis</Link> to
                  estimate intrinsic value. Tools like Lician automate these calculations.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">5. Start with Large, Stable Companies</h3>
                <p className="text-muted-foreground">
                  For your first stocks, favor large-cap companies ($100B+ market cap) with long track records.
                  They're less volatile, better researched, and more likely to survive market downturns. Save speculative
                  small-caps for when you have more experience.
                </p>
              </div>
            </div>
          </section>

          {/* Market Orders vs Limit Orders */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Understanding Order Types</h2>
            <p className="text-muted-foreground mb-6">
              When buying or selling stocks, you'll choose between different order types. Here's what beginners need to know:
            </p>
            <div className="space-y-6">
              {orderTypes.map((order, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-bold mb-2">{order.name}</h3>
                  <p className="text-muted-foreground mb-4">{order.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-bold">Execution: </span>
                      <span className="text-muted-foreground">{order.execution}</span>
                    </div>
                    <div>
                      <span className="font-bold">Price: </span>
                      <span className="text-muted-foreground">{order.price}</span>
                    </div>
                  </div>
                  <div className="bg-background/50 p-3 rounded mb-3">
                    <span className="font-bold">When to Use: </span>
                    <span className="text-muted-foreground">{order.whenToUse}</span>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded border border-green-500/20">
                    <span className="font-bold text-green-500">Example: </span>
                    <span className="text-muted-foreground">{order.example}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Building a Portfolio */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Building a Diversified Portfolio</h2>
            <p className="text-muted-foreground mb-6">
              Diversification is the only free lunch in investing - it reduces risk without sacrificing returns.
              Here's how to build a well-diversified portfolio:
            </p>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Sector Diversification</h3>
                <p className="text-muted-foreground mb-3">
                  Don't put all your money in one sector. Spread across technology, healthcare, finance, consumer goods,
                  energy, and others. When tech slumps, healthcare might thrive. A sample allocation:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="bg-background/50 p-2 rounded">Technology: 25%</div>
                  <div className="bg-background/50 p-2 rounded">Healthcare: 15%</div>
                  <div className="bg-background/50 p-2 rounded">Finance: 15%</div>
                  <div className="bg-background/50 p-2 rounded">Consumer: 15%</div>
                  <div className="bg-background/50 p-2 rounded">Industrial: 10%</div>
                  <div className="bg-background/50 p-2 rounded">Other: 20%</div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Market Cap Diversification</h3>
                <p className="text-muted-foreground">
                  Combine large-caps (stability, 70%), mid-caps (balance, 20%), and small-caps (growth potential, 10%).
                  Large-caps weather storms better; small-caps offer higher growth. The mix depends on your age and
                  risk tolerance.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">Asset Class Diversification</h3>
                <p className="text-muted-foreground">
                  Don't invest 100% in stocks, especially as you near retirement. A common rule: stocks = 110 - your age.
                  At 30, that's 80% stocks, 20% bonds. At 60, it's 50/50. Bonds provide stability when stocks plummet.
                  Some investors add real estate (REITs), commodities, or crypto for further diversification.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">The Easy Way: Index Funds</h3>
                <p className="text-muted-foreground">
                  Instead of picking 15-20 individual stocks, buy 1-2 index funds for instant diversification. VOO
                  (S&P 500) holds 500 large companies. VTI (Total Stock Market) holds 3,600+ stocks. These funds
                  have historically returned ~10% annually with minimal effort.
                </p>
              </div>
            </div>
          </section>

          {/* Long-term vs Short-term */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Long-Term vs Short-Term Investing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-green-500/50">
                <h3 className="text-xl font-bold mb-4 text-green-500">Long-Term Investing (Recommended for Beginners)</h3>
                <p className="text-muted-foreground mb-3">
                  <span className="font-bold">Time Horizon:</span> 5+ years, ideally 10-30+ years
                </p>
                <p className="text-muted-foreground mb-3">
                  <span className="font-bold">Strategy:</span> Buy quality companies and index funds, hold through market
                  cycles, reinvest dividends
                </p>
                <div className="mb-3">
                  <span className="font-bold">Advantages:</span>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Compound growth multiplies wealth</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Lower tax rates (long-term capital gains)</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Less stressful - ignore daily volatility</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Proven success - 10% annual returns</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Requires minimal time and expertise</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  <span className="font-bold">Best For:</span> Building retirement wealth, financial independence,
                  steady portfolio growth
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/50">
                <h3 className="text-xl font-bold mb-4 text-red-500">Short-Term Trading (High Risk for Beginners)</h3>
                <p className="text-muted-foreground mb-3">
                  <span className="font-bold">Time Horizon:</span> Days to months
                </p>
                <p className="text-muted-foreground mb-3">
                  <span className="font-bold">Strategy:</span> Buy low, sell high based on price movements, technical
                  analysis, news events
                </p>
                <div className="mb-3">
                  <span className="font-bold">Disadvantages:</span>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li className="flex gap-2"><span className="text-red-500">✗</span> 90% of day traders lose money</li>
                    <li className="flex gap-2"><span className="text-red-500">✗</span> Higher tax rates (short-term gains)</li>
                    <li className="flex gap-2"><span className="text-red-500">✗</span> Extremely stressful and time-consuming</li>
                    <li className="flex gap-2"><span className="text-red-500">✗</span> Requires significant expertise</li>
                    <li className="flex gap-2"><span className="text-red-500">✗</span> Emotion-driven mistakes common</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  <span className="font-bold">Best For:</span> Experienced traders with risk capital, time, emotional
                  discipline, and proven strategies
                </p>
              </div>
            </div>
            <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20 mt-6">
              <p className="text-muted-foreground">
                <span className="font-bold text-green-500">Warren Buffett's Advice:</span> "If you aren't willing to
                own a stock for ten years, don't even think about owning it for ten minutes." Long-term investing has
                made him one of the world's richest people, while most day traders lose money.
              </p>
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Common Beginner Mistakes to Avoid</h2>
            <p className="text-muted-foreground mb-6">
              Learning from others' mistakes is cheaper than making them yourself. Here are the most costly beginner errors:
            </p>
            <div className="space-y-4">
              {commonMistakes.map((item, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-red-500/20">
                  <h3 className="font-bold mb-2 text-red-500 text-lg">{item.mistake}</h3>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  <div className="bg-green-500/10 p-3 rounded border border-green-500/20 mb-3">
                    <span className="font-bold text-green-500">Solution: </span>
                    <span className="text-muted-foreground">{item.solution}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-bold">Impact: </span>{item.impact}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Continue Your Investing Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  How to Analyze Stocks
                </h3>
                <p className="text-muted-foreground">
                  Learn to evaluate companies using financial statements, valuation metrics, and competitive analysis.
                </p>
              </Link>
              <Link
                href="/learn/pe-ratio"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Understanding P/E Ratios
                </h3>
                <p className="text-muted-foreground">
                  Master the most important valuation metric for determining if a stock is fairly priced.
                </p>
              </Link>
              <Link
                href="/learn/dividend-investing"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Dividend Investing Guide
                </h3>
                <p className="text-muted-foreground">
                  Build passive income streams through dividend-paying stocks and compound your wealth.
                </p>
              </Link>
              <Link
                href="/learn"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Learning Hub
                </h3>
                <p className="text-muted-foreground">
                  Explore all our educational guides on stock investing, analysis, and valuation.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Your Investing Journey?
            </h2>
            <p className="text-muted-foreground mb-6">
              Put your knowledge into action with our AI-powered stock screener and analysis tools.
              Find quality stocks, analyze fundamentals, and build your portfolio with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Analyze Stocks Now
              </Link>
              <Link
                href="/screener"
                className="inline-block bg-card hover:bg-card/80 border border-border px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Stock Screener
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
