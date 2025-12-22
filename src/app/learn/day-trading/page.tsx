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

export const metadata: Metadata = {
  title: 'Day Trading Guide: Strategies, Rules, and Risks (2025) - Learn Day Trading',
  description: 'Complete day trading guide covering strategies, Pattern Day Trader rule, tools, and honest risk warnings. Learn why 90%+ of day traders lose money and how to approach intraday trading.',
  keywords: [
    'day trading',
    'day trading stocks',
    'day trader',
    'pattern day trader',
    'day trading strategies',
    'intraday trading',
    'PDT rule',
    'how to day trade',
    'day trading for beginners',
    'day trading risks',
  ],
  openGraph: {
    title: 'Day Trading Guide - Strategies, Rules, and Honest Risk Warnings',
    description: 'Learn day trading strategies, PDT rule, and why 90%+ of day traders lose money. Comprehensive guide with honest risk assessment.',
    type: 'article',
    url: `${SITE_URL}/learn/day-trading`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/day-trading`,
  },
}

const faqs = [
  {
    question: 'What is day trading?',
    answer: 'Day trading is buying and selling securities within the same trading day, closing all positions before market close. Day traders aim to profit from short-term price movements, holding positions for minutes to hours. Unlike investors who hold for months or years, day traders capitalize on intraday volatility. This requires constant market monitoring, quick decision-making, and substantial risk tolerance.',
  },
  {
    question: 'What is the Pattern Day Trader (PDT) rule?',
    answer: 'The Pattern Day Trader rule requires traders who execute 4+ day trades within 5 business days to maintain a minimum $25,000 account balance. If you fall below this threshold, you\'re restricted from day trading until you restore the balance. This FINRA rule applies to margin accounts. Cash accounts aren\'t subject to PDT but face settlement restrictions (T+2), limiting trading frequency.',
  },
  {
    question: 'Do most day traders lose money?',
    answer: 'Yes. Studies consistently show 90-95% of day traders lose money over time. A Brazilian study found 97% of day traders lost money over 300 days, with only 1.1% earning more than minimum wage. The odds are statistically against you. High costs (commissions, spreads, taxes), emotional decisions, overtrading, and competing against algorithms and professionals make consistent profitability extremely rare.',
  },
  {
    question: 'How much money do I need to start day trading?',
    answer: 'Legally, $25,000 minimum in a margin account to comply with PDT rules. Realistically, $50,000+ is recommended - this allows you to risk 1-2% per trade ($500-1,000) while maintaining proper risk management. Starting with less forces excessive risk-taking per trade. Many professionals recommend $100,000+ to trade comfortably without capital constraints affecting your strategy.',
  },
  {
    question: 'What are the best day trading strategies?',
    answer: 'Common strategies include: Momentum trading (riding strong price moves), Scalping (dozens of small profits), Breakout trading (entering when price breaks key levels), Reversal trading (catching trend changes), and News trading (capitalizing on volatile reactions). Success requires mastering ONE strategy thoroughly rather than dabbling in many. Most profitable traders specialize and develop deep expertise.',
  },
  {
    question: 'Can you make a living day trading?',
    answer: 'It\'s possible but extremely rare and difficult. You need substantial capital ($100,000+), extensive experience (2-3 years), strong risk management, emotional discipline, and realistic expectations. Even skilled traders often have 40-60% win rates - profitability comes from winning big and cutting losses small. Most "successful" day traders supplement income with teaching, Discord groups, or other services rather than trading alone.',
  },
  {
    question: 'What tools do I need for day trading?',
    answer: 'Essential tools: Direct access broker with low commissions and fast execution (Interactive Brokers, TradeStation), Level 2 market data for order flow visibility, advanced charting software (TradingView, Thinkorswim), news feed for real-time catalysts, screener for finding opportunities, and fast, reliable internet. Professional setup costs $100-500/month in subscriptions. Inadequate tools put you at a severe disadvantage.',
  },
  {
    question: 'How is day trading taxed?',
    answer: 'Day trading profits are taxed as short-term capital gains at ordinary income rates (10-37% federal, plus state taxes). If you qualify as a "trader" (trading is your primary business, consistent activity), you may deduct expenses and elect Mark-to-Market accounting. However, this prevents using capital loss limitations. High-frequency trading generates significant tax complexity - consult a CPA specializing in trading taxation.',
  },
  {
    question: 'What\'s the difference between day trading and swing trading?',
    answer: 'Day trading: Close all positions same day, 0 overnight risk, requires constant monitoring, many small trades, extremely time-intensive. Swing trading: Hold 2 days to 2 weeks, overnight risk exists, less monitoring needed, fewer but larger moves, more compatible with full-time work. Swing trading has better odds for beginners - less stress, lower costs, more time to analyze. Most profitable retail traders are swing traders, not day traders.',
  },
  {
    question: 'What time should I day trade?',
    answer: 'Market open (9:30-11:30 AM ET) offers highest volume and volatility - best for momentum and breakout strategies. Mid-day (11:30 AM-2:00 PM) is typically slow and choppy - avoid unless experienced. Power hour (3:00-4:00 PM) sees increased activity as institutions adjust positions. Pre-market (4:00-9:30 AM) and after-hours (4:00-8:00 PM) have lower liquidity and wider spreads but can offer opportunities on news.',
  },
  {
    question: 'Should beginners start day trading?',
    answer: 'No. Day trading is the HARDEST form of trading with the LOWEST success rate. Beginners should start with long-term investing to learn market dynamics, then progress to swing trading if interested in active trading. Day trading requires split-second decisions under pressure, deep market knowledge, emotional control, and substantial capital. Starting with day trading is like learning to drive by racing Formula 1 - you\'ll crash.',
  },
  {
    question: 'What is the biggest mistake day traders make?',
    answer: 'Overtrading - taking too many trades, especially after losses trying to "make it back." This leads to death by 1,000 cuts through commissions, slippage, and poor decisions. Other major mistakes: No stop losses, risking too much per trade, trading without a plan, revenge trading after losses, and ignoring risk management. Emotional discipline separates the rare winners from the 95% who lose.',
  },
  {
    question: 'Can I day trade with a full-time job?',
    answer: 'Not effectively. Day trading requires constant market monitoring during trading hours (9:30 AM-4:00 PM ET). You can\'t watch charts, place orders, and manage positions while working. Swing trading or investing are realistic alternatives for working professionals. Some try pre-market/after-hours trading, but lower liquidity and higher spreads make this even more challenging. Day trading IS a full-time job.',
  },
  {
    question: 'How long does it take to become a profitable day trader?',
    answer: 'Most successful traders spend 2-5 years learning before consistent profitability, and many never achieve it. Expect 6-12 months just to learn basics, another year developing and testing strategies, and more time building emotional discipline and risk management. During this period, expect losses. Budget "tuition" money you can afford to lose. The learning curve is steep, and there are no shortcuts despite what gurus claim.',
  },
]

const strategies = [
  {
    name: 'Momentum Trading',
    description: 'Trade stocks showing strong directional movement with high volume',
    timeframe: '5-30 minutes',
    winRate: '40-50%',
    difficulty: 'Medium',
    risk: 'High volatility, quick reversals',
  },
  {
    name: 'Scalping',
    description: 'Make dozens of small trades capturing tiny price movements',
    timeframe: '1-5 minutes',
    winRate: '60-70%',
    difficulty: 'Hard',
    risk: 'Death by 1,000 cuts, high costs',
  },
  {
    name: 'Breakout Trading',
    description: 'Enter when price breaks above resistance or below support',
    timeframe: '15-60 minutes',
    winRate: '35-45%',
    difficulty: 'Medium',
    risk: 'False breakouts, whipsaws',
  },
  {
    name: 'Reversal Trading',
    description: 'Identify trend exhaustion and trade the reversal',
    timeframe: '15-60 minutes',
    winRate: '30-40%',
    difficulty: 'Very Hard',
    risk: 'Catching falling knife, trend continuation',
  },
  {
    name: 'News Trading',
    description: 'Capitalize on price volatility following major news/earnings',
    timeframe: '5-30 minutes',
    winRate: '35-45%',
    difficulty: 'Hard',
    risk: 'Extreme volatility, wide spreads',
  },
  {
    name: 'Range Trading',
    description: 'Buy at support, sell at resistance in sideways markets',
    timeframe: '30-120 minutes',
    winRate: '50-60%',
    difficulty: 'Medium',
    risk: 'Breakout kills strategy',
  },
]

const tools = [
  {
    category: 'Broker',
    tools: ['Interactive Brokers', 'TradeStation', 'Lightspeed'],
    cost: '$0-10/month',
    why: 'Low commissions ($0-1/trade), fast execution, advanced order types',
  },
  {
    category: 'Charting',
    tools: ['TradingView Pro+', 'Thinkorswim', 'TradeStation'],
    cost: '$15-50/month',
    why: 'Real-time data, technical indicators, drawing tools, alerts',
  },
  {
    category: 'Scanner',
    tools: ['Trade-Ideas', 'Finviz Elite', 'ThinkorSwim Scanner'],
    cost: '$30-118/month',
    why: 'Find stocks meeting criteria: volume, price action, patterns',
  },
  {
    category: 'News',
    tools: ['Benzinga Pro', 'Bloomberg', 'Reuters'],
    cost: '$100-300/month',
    why: 'Real-time news, earnings, FDA approvals, analyst upgrades',
  },
  {
    category: 'Level 2 Data',
    tools: ['Nasdaq TotalView', 'NYSE OpenBook'],
    cost: '$10-100/month',
    why: 'See order book depth, institutional orders, market maker activity',
  },
]

export default function DayTradingPage() {
  const pageUrl = `${SITE_URL}/learn/day-trading`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Day Trading', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Day Trading Guide: Strategies, Rules, and Honest Risk Warnings',
    description: 'Comprehensive guide to day trading including strategies, Pattern Day Trader rule, tools needed, and honest assessment of why 90%+ of day traders lose money.',
    url: pageUrl,
    keywords: ['day trading', 'day trading stocks', 'pattern day trader', 'day trading strategies', 'intraday trading'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>Day Trading</span>
          </nav>

          {/* Hero with Warning */}
          <div className="mb-12">
            <div className="bg-red-500/10 border-2 border-red-500/50 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-bold text-red-500 mb-3">Critical Risk Warning</h2>
              <p className="text-foreground font-medium mb-2">
                90-95% of day traders lose money. Academic studies show 97% of day traders lose money over 300 days.
              </p>
              <p className="text-muted-foreground text-sm">
                Day trading is extremely risky and not recommended for beginners. Most people lose their entire account.
                This guide is educational - understanding the risks and reality is crucial before attempting day trading.
              </p>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Day Trading: Complete Guide with Honest Risk Assessment
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn what day trading really involves, the Pattern Day Trader rule, proven strategies, tools required,
              and why the statistical odds are heavily against you. Make informed decisions with realistic expectations.
            </p>
          </div>

          {/* What is Day Trading */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Day Trading?</h2>
            <p className="text-muted-foreground mb-4">
              Day trading is the practice of buying and selling financial instruments within the same trading day.
              All positions are closed before market close to avoid overnight risk. Day traders aim to profit from
              short-term price movements, typically holding positions for minutes to hours.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-3">Day Trading Characteristics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-green-500 mb-2">How It Works:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• Open and close trades same day</div>
                    <div>• Hold positions minutes to hours</div>
                    <div>• Multiple trades per day (5-20+)</div>
                    <div>• No overnight exposure</div>
                    <div>• Requires constant monitoring</div>
                    <div>• High leverage often used (4:1)</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-red-500 mb-2">The Reality:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• 90-95% of day traders lose money</div>
                    <div>• Requires $25,000+ legally (PDT rule)</div>
                    <div>• Full-time commitment needed</div>
                    <div>• High stress and burnout</div>
                    <div>• Compete against algorithms</div>
                    <div>• Most quit within first year</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-yellow-500">Important:</span> Day trading is fundamentally different
                from investing. Investors buy quality companies and hold for years. Day traders speculate on short-term
                price movements. These are completely different skill sets with vastly different success rates.
              </p>
            </div>
          </section>

          {/* PDT Rule */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Pattern Day Trader (PDT) Rule</h2>
            <p className="text-muted-foreground mb-6">
              The Pattern Day Trader rule is a FINRA regulation that significantly impacts day traders.
              Understanding this rule is critical before attempting day trading.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-xl font-bold mb-4">PDT Rule Requirements</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <div className="font-bold mb-1">$25,000 Minimum Balance</div>
                    <div className="text-sm text-muted-foreground">
                      Must maintain $25,000+ in account at all times. If you fall below, you can't day trade until
                      you restore the balance. This is TOTAL account value (cash + stocks).
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🔢</div>
                  <div>
                    <div className="font-bold mb-1">4 Day Trades in 5 Days = PDT Status</div>
                    <div className="text-sm text-muted-foreground">
                      Execute 4+ day trades within 5 business days, you're flagged as Pattern Day Trader.
                      A day trade is buying and selling the same security same day.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <div className="font-bold mb-1">Margin Account Requirement</div>
                    <div className="text-sm text-muted-foreground">
                      PDT rule applies to margin accounts only. Cash accounts avoid PDT but face T+2 settlement
                      (can't use funds for 2 days after sale), severely limiting trading frequency.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🚫</div>
                  <div>
                    <div className="font-bold mb-1">Violation Consequences</div>
                    <div className="text-sm text-muted-foreground">
                      Break the rule: 90-day trading restriction. Can only close positions, not open new ones.
                      Broker may close positions without warning if you fall below $25k.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/50 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-bold text-blue-500">Pro Tip:</span> The PDT rule exists to protect retail
                traders from excessive risk. However, it effectively locks out small accounts from day trading.
                Some traders use multiple brokers or switch to cash accounts, but these workarounds have limitations.
              </p>
            </div>
          </section>

          {/* Day Trading Strategies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Day Trading Strategies</h2>
            <p className="text-muted-foreground mb-6">
              Different strategies suit different market conditions and trader personalities. Most successful day
              traders master ONE strategy deeply rather than dabbling in many.
            </p>
            <div className="grid grid-cols-1 gap-6">
              {strategies.map((strategy) => (
                <div key={strategy.name} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{strategy.name}</h3>
                    <span className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full">
                      {strategy.difficulty}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{strategy.description}</p>
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
                      <div className="font-bold">{strategy.timeframe}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Typical Win Rate</div>
                      <div className="font-bold text-green-500">{strategy.winRate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                      <div className="font-bold">{strategy.difficulty}</div>
                    </div>
                  </div>
                  <div className="text-xs bg-red-500/10 border border-red-500/30 p-3 rounded">
                    <span className="font-bold text-red-500">Risk:</span> {strategy.risk}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold mb-3">Critical Strategy Notes</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • <span className="font-bold text-foreground">Win rate alone means nothing.</span> A 60% win rate
                  with 1:1 risk/reward is break-even after costs. Need 2:1 or 3:1 reward/risk ratios.
                </p>
                <p>
                  • <span className="font-bold text-foreground">Paper trading WILL NOT prepare you.</span> Real money
                  triggers emotions that demolish strategies that worked on simulator. Small size until profitable.
                </p>
                <p>
                  • <span className="font-bold text-foreground">Market conditions matter.</span> Momentum works in
                  trending markets, fails in choppy ones. Reversal works at extremes, fails in trends. Adapt or die.
                </p>
                <p>
                  • <span className="font-bold text-foreground">Most traders fail by strategy-hopping.</span>
                  Spend 3-6 months mastering ONE strategy. Track every trade. Review weekly. Adjust methodically.
                </p>
              </div>
            </div>
          </section>

          {/* Tools Required */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Tools Required for Day Trading</h2>
            <p className="text-muted-foreground mb-6">
              Professional tools are non-negotiable. Inadequate technology puts you at severe disadvantage against
              algorithms and institutional traders. Expect $200-500/month in subscriptions.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {tools.map((tool) => (
                <div key={tool.category} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold">{tool.category}</h3>
                    <span className="text-sm font-mono text-green-500">{tool.cost}</span>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Popular Options:</div>
                    <div className="text-sm">{tool.tools.join(', ')}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Why needed:</span> {tool.why}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold mb-3">Additional Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold mb-2">Hardware:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• Fast computer (trading laptop minimum)</div>
                    <div>• Multiple monitors (2-4 screens)</div>
                    <div>• Wired high-speed internet (100+ Mbps)</div>
                    <div>• UPS battery backup</div>
                    <div>• Backup internet connection</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-2">Total Monthly Costs:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• Subscriptions: $200-500</div>
                    <div>• Commissions: $100-500</div>
                    <div>• Data fees: $50-150</div>
                    <div>• Internet: $50-100</div>
                    <div>• <span className="font-bold text-foreground">Total: $400-1,250/month</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Hours */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">When to Day Trade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-green-500/30">
                <h3 className="text-lg font-bold mb-3 text-green-500">Market Open (9:30-11:30 AM ET)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Highest volume and volatility. Best time for most strategies. Institutional traders active.
                  Price discovery after overnight news.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <span className="font-bold">Best for:</span> Momentum, breakouts, gap trading
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-red-500/30">
                <h3 className="text-lg font-bold mb-3 text-red-500">Mid-Day (11:30 AM-2:00 PM ET)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Slowest period. Lower volume and choppy price action. Many traders take lunch. Avoid unless
                  very experienced.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <span className="font-bold">Best for:</span> Taking a break, reviewing trades
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-green-500/30">
                <h3 className="text-lg font-bold mb-3 text-green-500">Power Hour (3:00-4:00 PM ET)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Volume increases as institutions adjust end-of-day positions. Good for experienced traders.
                  Last chance to close positions.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <span className="font-bold">Best for:</span> Momentum, reversals, closing positions
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-yellow-500/30">
                <h3 className="text-lg font-bold mb-3 text-yellow-500">Pre-Market & After-Hours</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Lower liquidity and wider spreads. Significant news can create opportunities but with higher risk.
                  Not for beginners.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <span className="font-bold">Best for:</span> Earnings plays, major news
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Link
                href="/markets/premarket"
                className="block bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold group-hover:text-green-500 transition-colors mb-1">
                      Pre-Market Movers
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      See which stocks are moving before market open
                    </p>
                  </div>
                  <span className="text-green-500">→</span>
                </div>
              </Link>
              <Link
                href="/markets/after-hours"
                className="block bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold group-hover:text-green-500 transition-colors mb-1">
                      After-Hours Trading
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor stocks moving after market close
                    </p>
                  </div>
                  <span className="text-green-500">→</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Risks - Most Important Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-red-500">The Harsh Reality: Why Day Traders Lose Money</h2>
            <p className="text-muted-foreground mb-6">
              This is the most important section. The overwhelming majority of day traders lose money.
              Understanding why is crucial before risking capital.
            </p>

            <div className="space-y-6">
              <div className="bg-red-500/10 border-2 border-red-500/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-red-500 mb-3">Statistical Reality</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    • <span className="font-bold text-foreground">Brazilian Market Study:</span> 97% of day traders
                    lost money over 300 days. Only 1.1% earned more than minimum wage.
                  </p>
                  <p>
                    • <span className="font-bold text-foreground">Taiwan Market Study:</span> Only 5% of day traders
                    were consistently profitable. Average day trader underperformed buy-and-hold by 3.8% annually.
                  </p>
                  <p>
                    • <span className="font-bold text-foreground">Academic Consensus:</span> Across all studies,
                    90-95% of day traders lose money over time. This is not marketing - it's peer-reviewed research.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border border-red-500/30">
                  <h3 className="font-bold mb-3 text-red-500">Trading Costs Kill Profits</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Even $0 commissions have hidden costs: bid-ask spread, slippage, SEC fees, data costs.
                    20 trades/day × $0.02 spread × 200 shares = $80/day = $20,000/year in costs.
                  </p>
                  <div className="text-xs bg-background p-3 rounded">
                    <span className="font-bold">Example:</span> Need 8-12% annual return just to break even after costs
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-red-500/30">
                  <h3 className="font-bold mb-3 text-red-500">Competing Against Professionals</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You're trading against high-frequency algorithms, hedge funds with PhD teams, and market makers
                    with millisecond advantages. They have better technology, information, and capital.
                  </p>
                  <div className="text-xs bg-background p-3 rounded">
                    <span className="font-bold">Reality:</span> You're playing poker with sharks, not fish
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-red-500/30">
                  <h3 className="font-bold mb-3 text-red-500">Emotional Decision Making</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Fear and greed destroy rational strategies. Revenge trading after losses, holding losers too
                    long, cutting winners too early, overtrading. Most traders can't control emotions with real money.
                  </p>
                  <div className="text-xs bg-background p-3 rounded">
                    <span className="font-bold">Truth:</span> Paper trading success doesn't predict real money results
                  </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-red-500/30">
                  <h3 className="font-bold mb-3 text-red-500">Overtrading & Poor Risk Management</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Taking too many trades, risking too much per trade, no stop losses, doubling down on losers.
                    One bad day can wipe out weeks of profits. Most traders blow up accounts learning this lesson.
                  </p>
                  <div className="text-xs bg-background p-3 rounded">
                    <span className="font-bold">Rule:</span> Risk only 1-2% per trade or you WILL blow up eventually
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-4">Additional Risk Factors</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="text-red-500 font-bold">✕</div>
                    <div>
                      <span className="font-bold text-foreground">Survivorship Bias:</span> You see "successful"
                      traders on social media, not the 95% who quit. Survivorship bias creates false impression
                      of profitability.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-red-500 font-bold">✕</div>
                    <div>
                      <span className="font-bold text-foreground">Tax Complexity:</span> Short-term gains taxed at
                      highest rates (37% federal + state). Wash sale rules. Must track every trade. Complexity alone
                      defeats many.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-red-500 font-bold">✕</div>
                    <div>
                      <span className="font-bold text-foreground">Lifestyle Impact:</span> Extreme stress, screen
                      addiction, relationship strain, health issues. Many profitable traders quit anyway due to burnout.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-red-500 font-bold">✕</div>
                    <div>
                      <span className="font-bold text-foreground">Opportunity Cost:</span> Time spent day trading
                      could build career, business, or long-term investments. Most would earn more with traditional job.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Psychology */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Psychology and Discipline</h2>
            <p className="text-muted-foreground mb-6">
              Technical skills can be learned. Emotional control is what separates the rare winners from the majority
              who lose. Most traders have adequate strategies but lack psychological discipline.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-3 text-green-500">Traits of Successful Traders</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Accept losses as cost of business</div>
                  <div>✓ Follow rules mechanically, no exceptions</div>
                  <div>✓ Cut losses quickly without hesitation</div>
                  <div>✓ Review and learn from every trade</div>
                  <div>✓ Patient - wait for A+ setups only</div>
                  <div>✓ Humble - know they can always lose</div>
                  <div>✓ Unemotional - treat it like business</div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-3 text-red-500">Traits That Guarantee Failure</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✕ Revenge trading after losses</div>
                  <div>✕ Moving stop losses when hit</div>
                  <div>✕ Holding losers hoping for comeback</div>
                  <div>✕ Taking trades out of boredom</div>
                  <div>✕ Overconfident after winning streak</div>
                  <div>✕ Blame markets/brokers for losses</div>
                  <div>✕ Can't admit when wrong</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold mb-4">Rules for Psychological Survival</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-background p-4 rounded">
                  <div className="font-bold mb-2">1. Risk Only What You Can Afford to Lose</div>
                  <p className="text-muted-foreground">
                    If losing this money would affect your life, you're trading with scared money. Scared money
                    makes emotional decisions. Only trade truly disposable capital.
                  </p>
                </div>
                <div className="bg-background p-4 rounded">
                  <div className="font-bold mb-2">2. Follow Your Trading Plan Without Exception</div>
                  <p className="text-muted-foreground">
                    Write down entry rules, exit rules, position sizing, daily loss limits. Follow them mechanically.
                    Breaking rules once starts death spiral. Plan the trade, trade the plan.
                  </p>
                </div>
                <div className="bg-background p-4 rounded">
                  <div className="font-bold mb-2">3. Keep a Detailed Trading Journal</div>
                  <p className="text-muted-foreground">
                    Log every trade: entry, exit, reasoning, emotions, mistakes. Review weekly. Pattern recognition
                    of your mistakes is more valuable than any strategy. Most traders won't do this.
                  </p>
                </div>
                <div className="bg-background p-4 rounded">
                  <div className="font-bold mb-2">4. Take Breaks After Losses or Wins</div>
                  <p className="text-muted-foreground">
                    Hit daily loss limit? Stop trading. On winning streak? Be careful - overconfidence kills. Take
                    regular breaks. Most destructive trading happens when emotional.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Day Trading vs Swing Trading vs Investing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-bold">Factor</th>
                    <th className="text-left p-3 font-bold text-red-500">Day Trading</th>
                    <th className="text-left p-3 font-bold text-yellow-500">Swing Trading</th>
                    <th className="text-left p-3 font-bold text-green-500">Long-Term Investing</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Time Commitment</td>
                    <td className="p-3">Full-time (8+ hours/day)</td>
                    <td className="p-3">Part-time (1-2 hours/day)</td>
                    <td className="p-3">Minimal (few hours/month)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Holding Period</td>
                    <td className="p-3">Minutes to hours</td>
                    <td className="p-3">2 days to 2 weeks</td>
                    <td className="p-3">Years to decades</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Success Rate</td>
                    <td className="p-3 text-red-500">5-10% profitable</td>
                    <td className="p-3 text-yellow-500">20-30% profitable</td>
                    <td className="p-3 text-green-500">~70% make money</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Capital Required</td>
                    <td className="p-3">$25,000+ (PDT rule)</td>
                    <td className="p-3">$5,000+ recommended</td>
                    <td className="p-3">Any amount</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Stress Level</td>
                    <td className="p-3">Extreme</td>
                    <td className="p-3">Moderate</td>
                    <td className="p-3">Low</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Tax Treatment</td>
                    <td className="p-3">Short-term (37% rate)</td>
                    <td className="p-3">Short-term (37% rate)</td>
                    <td className="p-3">Long-term (0-20% rate)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Compatible with Job?</td>
                    <td className="p-3">No</td>
                    <td className="p-3">Yes, with dedication</td>
                    <td className="p-3">Yes, easily</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Overnight Risk</td>
                    <td className="p-3">None</td>
                    <td className="p-3">Moderate</td>
                    <td className="p-3">Accept as normal</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-medium">Historical Returns</td>
                    <td className="p-3">Negative for most</td>
                    <td className="p-3">0-15% for winners</td>
                    <td className="p-3">~10% annually (S&P 500)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Recommended For</td>
                    <td className="p-3">Almost nobody</td>
                    <td className="p-3">Experienced traders</td>
                    <td className="p-3">Most people</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-green-500/10 border border-green-500/50 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-bold text-green-500">Honest Recommendation:</span> Start with long-term
                investing to learn market dynamics. After 1-2 years, consider swing trading if interested in
                active trading. Only attempt day trading after proving consistent profitability swing trading.
                Most successful day traders started as investors, then swing traders, then graduated to day trading.
              </p>
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

          {/* Continue Learning */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Better Alternatives to Day Trading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Analysis Fundamentals
                </h3>
                <p className="text-muted-foreground">
                  Learn to analyze companies for long-term investment with much higher success rates.
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
                  Build passive income with dividend stocks - proven strategy with much better odds.
                </p>
              </Link>
            </div>
          </section>

          {/* Final Warning */}
          <section className="bg-red-500/10 border-2 border-red-500/50 p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">
              Final Warning: The Statistics Don't Lie
            </h2>
            <p className="text-muted-foreground mb-4">
              If you're considering day trading, understand you're competing in one of the hardest financial
              endeavors with a 90-95% failure rate. This isn't marketing - it's peer-reviewed research across
              multiple studies and countries.
            </p>
            <p className="text-muted-foreground mb-6">
              Long-term investing in quality companies has made countless people wealthy. Day trading has
              destroyed far more accounts than it's created millionaires. The choice is yours - but make it
              with full knowledge of the overwhelming odds against you.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Find Quality Stocks to Invest (Not Day Trade)
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
