import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Options Trading for Beginners: Complete Guide to Calls, Puts & Greeks (2026)',
  description: 'Learn options trading basics including calls, puts, strike prices, expiration dates, and the Greeks (Delta, Gamma, Theta, Vega). Understand options strategies and risks before you start trading.',
  keywords: [
    'options trading',
    'options for beginners',
    'call options',
    'put options',
    'options greeks',
    'delta gamma theta vega',
    'strike price',
    'options strategies',
    'how to trade options',
    'options explained',
  ],
  openGraph: {
    title: 'Options Trading for Beginners - Complete Guide',
    description: 'Master options trading basics with our complete guide. Learn calls, puts, the Greeks, and essential strategies for beginners.',
    type: 'article',
    url: `${SITE_URL}/learn/options-basics`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/options-basics`,
  },
}

const howToSteps = [
  {
    name: 'Understand What Options Are',
    text: 'Options are contracts that give you the right (but not obligation) to buy or sell a stock at a specific price before a certain date. A call option lets you buy stock; a put option lets you sell. You pay a premium for this right. Options expire worthless if not exercised.',
  },
  {
    name: 'Learn Calls vs Puts',
    text: 'Call options profit when stock prices rise - you can buy shares below market price. Put options profit when prices fall - you can sell shares above market price. Buying calls = bullish bet. Buying puts = bearish bet or portfolio insurance. Each contract typically represents 100 shares.',
  },
  {
    name: 'Understand Strike Price and Expiration',
    text: 'Strike price is the price at which you can exercise the option. In-the-money (ITM) options have intrinsic value; out-of-the-money (OTM) options have only time value. Expiration date is when the option contract ends. Longer expirations cost more but give you more time to be right.',
  },
  {
    name: 'Learn the Greeks',
    text: 'Delta (0 to 1) measures price change per $1 stock move. Gamma measures delta change rate. Theta is time decay - options lose value daily. Vega measures sensitivity to volatility changes. Understanding Greeks helps manage risk and choose the right options.',
  },
  {
    name: 'Start with Simple Strategies',
    text: 'Begin with buying calls or puts - limited risk to premium paid. Progress to covered calls (own stock, sell calls) for income. Avoid selling naked options as a beginner - unlimited loss potential. Paper trade first to understand mechanics without risking real money.',
  },
  {
    name: 'Manage Risk Carefully',
    text: 'Never risk more than 2-5% of your portfolio on a single options trade. Options can expire worthless - be prepared to lose your entire premium. Set stop losses. Understand that 70%+ of options expire worthless. Time decay works against option buyers.',
  },
]

const faqs = [
  {
    question: 'What is options trading?',
    answer: 'Options trading involves buying or selling contracts that give you the right to buy (call) or sell (put) a stock at a predetermined price (strike price) before a specific date (expiration). Unlike stocks, options have an expiration date and can become worthless. You pay a premium for this right. Options provide leverage - control 100 shares for a fraction of the cost - but also carry higher risk.',
  },
  {
    question: 'What is the difference between calls and puts?',
    answer: 'A call option gives you the right to BUY 100 shares at the strike price - you profit if the stock rises above the strike. A put option gives you the right to SELL 100 shares at the strike price - you profit if the stock falls below the strike. Buying calls is a bullish bet; buying puts is bearish. Both have limited risk (premium paid) and unlimited potential profit.',
  },
  {
    question: 'What are the options Greeks?',
    answer: 'The Greeks measure option risk: Delta (Δ) measures price change per $1 stock move (0.50 delta = $0.50 option change per $1 stock move). Gamma (Γ) measures how fast delta changes. Theta (Θ) is time decay - options lose value daily. Vega (ν) measures sensitivity to volatility. Understanding Greeks helps you choose options and manage positions.',
  },
  {
    question: 'What is a strike price?',
    answer: 'Strike price is the predetermined price at which you can exercise the option. For a $100 strike call, you can buy shares at $100 regardless of market price. Options are "in-the-money" when profitable to exercise (stock above strike for calls, below for puts), "at-the-money" when strike equals stock price, and "out-of-the-money" when not immediately profitable.',
  },
  {
    question: 'What happens when options expire?',
    answer: 'At expiration, options either have value or expire worthless. In-the-money options are typically auto-exercised (check with your broker). Out-of-the-money options expire worthless - you lose your entire premium. You can sell options before expiration to capture remaining value. About 70% of options expire worthless, which is why selling options can be profitable.',
  },
  {
    question: 'Are options risky for beginners?',
    answer: 'Yes, options carry significant risks for beginners. You can lose 100% of your investment if the option expires worthless. Time decay works against option buyers. Leverage amplifies both gains and losses. Start with paper trading, use small position sizes (1-2% of portfolio), and only buy options (limited risk) rather than selling naked options (unlimited risk). Education before trading is essential.',
  },
  {
    question: 'What is theta decay?',
    answer: 'Theta decay is the daily erosion of an option\'s time value. Options are "wasting assets" that lose value as expiration approaches, even if the stock price stays flat. Theta accelerates in the final 30 days. For example, an option might lose $0.05/day initially but $0.20/day in the last week. This benefits option sellers but hurts option buyers - choose your expiration wisely.',
  },
  {
    question: 'What is implied volatility?',
    answer: 'Implied volatility (IV) reflects the market\'s expected future price movement. High IV = expensive options (expect big moves). Low IV = cheap options (expect stability). IV rises before earnings and events, then drops after ("IV crush"). Buy options when IV is low; sell when high. Compare current IV to historical volatility to assess if options are cheap or expensive.',
  },
]

export default function OptionsBasicsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Options Trading Basics', url: `${SITE_URL}/learn/options-basics` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Options Trading for Beginners: Complete Guide to Calls, Puts & Greeks',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Learn options trading basics including calls, puts, strike prices, expiration dates, and the Greeks. Understand options strategies and risks.',
    url: `${SITE_URL}/learn/options-basics`,
  })

  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema({
    name: 'How to Start Trading Options',
    description: 'Step-by-step guide to understanding and trading options',
    steps: howToSteps,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema,
            articleSchema,
            faqSchema,
            howToSchema,
          ]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/learn/how-to-invest" className="hover:text-primary">
                Learn
              </Link>
              <span className="mx-2">/</span>
              <span>Options Trading</span>
            </nav>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Options Trading for Beginners
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Learn the fundamentals of options trading including calls, puts, strike
              prices, expiration, and the Greeks. Understand risk and reward before
              you start trading.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="border-b py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-4 text-lg font-semibold">In This Guide</h2>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <a href="#what-are-options" className="text-primary hover:underline">
                1. What Are Options?
              </a>
              <a href="#calls-vs-puts" className="text-primary hover:underline">
                2. Calls vs Puts Explained
              </a>
              <a href="#options-terminology" className="text-primary hover:underline">
                3. Key Options Terminology
              </a>
              <a href="#the-greeks" className="text-primary hover:underline">
                4. Understanding the Greeks
              </a>
              <a href="#basic-strategies" className="text-primary hover:underline">
                5. Basic Options Strategies
              </a>
              <a href="#risk-management" className="text-primary hover:underline">
                6. Risk Management
              </a>
              <a href="#faq" className="text-primary hover:underline">
                7. Frequently Asked Questions
              </a>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto max-w-4xl px-4 py-12">
          {/* What Are Options */}
          <section id="what-are-options" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              What Are Options?
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">
                Options are financial contracts that give you the <strong>right, but not the obligation</strong>,
                to buy or sell an underlying asset (usually stocks) at a predetermined price before a specific date.
                Unlike buying stocks directly, options provide leverage and flexibility - but they also expire and
                can become worthless.
              </p>

              <div className="my-8 rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-xl font-semibold">Options Contract Basics</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong>Premium:</strong> The price you pay to buy an option contract
                  </li>
                  <li>
                    <strong>Strike Price:</strong> The price at which you can buy/sell the underlying stock
                  </li>
                  <li>
                    <strong>Expiration Date:</strong> The date when the option contract expires
                  </li>
                  <li>
                    <strong>Contract Size:</strong> Each option contract represents 100 shares of stock
                  </li>
                </ul>
              </div>

              <div className="my-8 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6">
                <h4 className="mb-2 font-semibold text-yellow-700 dark:text-yellow-400">
                  ⚠️ Important Risk Warning
                </h4>
                <p className="text-sm text-muted-foreground">
                  Options trading involves substantial risk. You can lose your entire investment if the option
                  expires worthless. Statistics show that approximately 70% of options expire worthless.
                  Never trade options with money you cannot afford to lose.
                </p>
              </div>
            </div>
          </section>

          {/* Calls vs Puts */}
          <section id="calls-vs-puts" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Calls vs Puts Explained
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-muted-foreground">
                There are two types of options: calls (bullish) and puts (bearish). Understanding the
                difference is fundamental to options trading.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-green-500/5 p-6">
                  <h3 className="mb-4 flex items-center text-xl font-semibold text-green-600">
                    <span className="mr-2">📈</span> Call Options
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Right to <strong>buy</strong> shares at strike price</li>
                    <li>• Profit when stock price <strong>rises</strong></li>
                    <li>• Maximum loss = premium paid</li>
                    <li>• Unlimited profit potential</li>
                    <li>• Bullish strategy</li>
                  </ul>
                  <div className="mt-4 rounded bg-muted p-3 text-xs">
                    <strong>Example:</strong> Buy $150 call on AAPL for $5. If AAPL rises to $170,
                    your option is worth $20 (profit = $15 per share × 100 = $1,500)
                  </div>
                </div>

                <div className="rounded-lg border bg-red-500/5 p-6">
                  <h3 className="mb-4 flex items-center text-xl font-semibold text-red-600">
                    <span className="mr-2">📉</span> Put Options
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Right to <strong>sell</strong> shares at strike price</li>
                    <li>• Profit when stock price <strong>falls</strong></li>
                    <li>• Maximum loss = premium paid</li>
                    <li>• Maximum profit = strike price - premium (if stock goes to $0)</li>
                    <li>• Bearish strategy or portfolio hedge</li>
                  </ul>
                  <div className="mt-4 rounded bg-muted p-3 text-xs">
                    <strong>Example:</strong> Buy $150 put on AAPL for $5. If AAPL falls to $130,
                    your option is worth $20 (profit = $15 per share × 100 = $1,500)
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Options Terminology */}
          <section id="options-terminology" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Key Options Terminology
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Term</th>
                      <th className="px-4 py-3 text-left font-semibold">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    <tr>
                      <td className="px-4 py-3 font-medium">In-the-Money (ITM)</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Option with intrinsic value. Call: stock above strike. Put: stock below strike.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">At-the-Money (ATM)</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Stock price equals strike price. Highest time value, most sensitive to moves.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Out-of-the-Money (OTM)</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        No intrinsic value. Call: stock below strike. Put: stock above strike.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Intrinsic Value</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Real value if exercised now. Only ITM options have intrinsic value.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Extrinsic (Time) Value</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Premium above intrinsic value. Decreases as expiration approaches (theta decay).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Implied Volatility (IV)</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Market's expectation of future price movement. High IV = expensive options.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Open Interest</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        Total number of outstanding option contracts. Higher = more liquidity.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Assignment</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        When option seller is obligated to fulfill the contract (buy/sell shares).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* The Greeks */}
          <section id="the-greeks" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Understanding the Greeks
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-muted-foreground">
                The "Greeks" measure different risk dimensions of options positions.
                Understanding them helps you choose the right options and manage risk.
              </p>

              <div className="grid gap-4">
                <div className="rounded-lg border p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">Δ</span>
                    <div>
                      <h3 className="text-lg font-semibold">Delta</h3>
                      <p className="text-sm text-muted-foreground">
                        Price change per $1 stock move
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Range:</strong> Calls 0 to 1, Puts -1 to 0<br />
                      <strong>Example:</strong> Delta of 0.50 means option gains $0.50 for every $1 stock increase<br />
                      <strong>Tip:</strong> ATM options have ~0.50 delta. Deep ITM options approach 1.00 delta.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">Γ</span>
                    <div>
                      <h3 className="text-lg font-semibold">Gamma</h3>
                      <p className="text-sm text-muted-foreground">
                        Rate of delta change
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Range:</strong> Always positive for long options<br />
                      <strong>Example:</strong> Gamma of 0.05 means delta increases by 0.05 for every $1 stock move<br />
                      <strong>Tip:</strong> Highest for ATM options near expiration. High gamma = rapidly changing delta.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">Θ</span>
                    <div>
                      <h3 className="text-lg font-semibold">Theta</h3>
                      <p className="text-sm text-muted-foreground">
                        Daily time decay
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Range:</strong> Negative for long options (you lose value daily)<br />
                      <strong>Example:</strong> Theta of -0.05 means option loses $5 per day (× 100 shares)<br />
                      <strong>Tip:</strong> Theta accelerates in final 30 days. Long-dated options have less daily decay.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">V</span>
                    <div>
                      <h3 className="text-lg font-semibold">Vega</h3>
                      <p className="text-sm text-muted-foreground">
                        Sensitivity to volatility changes
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <strong>Range:</strong> Positive for long options<br />
                      <strong>Example:</strong> Vega of 0.10 means option gains $10 for every 1% IV increase<br />
                      <strong>Tip:</strong> IV rises before events (earnings). "IV crush" happens after, hurting option buyers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Strategies */}
          <section id="basic-strategies" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Basic Options Strategies for Beginners
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-muted-foreground">
                Start with these fundamental strategies before progressing to more complex trades.
                Each strategy has different risk/reward profiles.
              </p>

              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 text-xl font-semibold">1. Long Call (Bullish)</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Buy a call option when you expect the stock to rise significantly before expiration.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Profit</p>
                      <p className="text-muted-foreground">Unlimited</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Loss</p>
                      <p className="text-muted-foreground">Premium paid</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Best When</p>
                      <p className="text-muted-foreground">IV is low, strong upside expected</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 text-xl font-semibold">2. Long Put (Bearish / Hedge)</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Buy a put when you expect the stock to fall, or to protect (hedge) existing stock positions.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Profit</p>
                      <p className="text-muted-foreground">Strike - Premium (if stock → $0)</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Loss</p>
                      <p className="text-muted-foreground">Premium paid</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Best When</p>
                      <p className="text-muted-foreground">Downside protection, bearish outlook</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 text-xl font-semibold">3. Covered Call (Income)</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Own 100 shares of stock and sell a call against them. Collect premium for income but cap upside.
                  </p>
                  <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Profit</p>
                      <p className="text-muted-foreground">Strike - Stock Cost + Premium</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Max Loss</p>
                      <p className="text-muted-foreground">Stock cost - Premium (if stock → $0)</p>
                    </div>
                    <div className="rounded bg-muted p-3">
                      <p className="font-medium">Best When</p>
                      <p className="text-muted-foreground">Neutral/slightly bullish, want income</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-red-500/50 p-6">
                  <h3 className="mb-3 text-xl font-semibold text-red-600">
                    ⚠️ Strategies to Avoid as a Beginner
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Naked Calls/Puts:</strong> Selling options without owning the underlying stock.
                      Unlimited loss potential.
                    </li>
                    <li>
                      <strong>Complex Spreads:</strong> Multi-leg strategies require advanced understanding.
                    </li>
                    <li>
                      <strong>Weekly Options:</strong> Extremely high theta decay and volatility.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Management */}
          <section id="risk-management" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Options Risk Management
            </h2>
            <div className="rounded-lg border bg-muted/30 p-6">
              <h3 className="mb-4 text-xl font-semibold">Essential Rules for Options Trading</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded bg-background p-4">
                  <p className="mb-2 font-semibold">Position Sizing</p>
                  <p className="text-sm text-muted-foreground">
                    Never risk more than 2-5% of your portfolio on a single options trade.
                    Assume you could lose 100% of the premium.
                  </p>
                </div>
                <div className="rounded bg-background p-4">
                  <p className="mb-2 font-semibold">Time Management</p>
                  <p className="text-sm text-muted-foreground">
                    Buy options with enough time to be right. 45-60 days is often optimal.
                    Avoid holding through the final 2 weeks when theta accelerates.
                  </p>
                </div>
                <div className="rounded bg-background p-4">
                  <p className="mb-2 font-semibold">IV Awareness</p>
                  <p className="text-sm text-muted-foreground">
                    Check IV before buying. Don't buy before earnings unless you understand IV crush.
                    High IV = expensive options that can lose value even if you're directionally right.
                  </p>
                </div>
                <div className="rounded bg-background p-4">
                  <p className="mb-2 font-semibold">Exit Strategy</p>
                  <p className="text-sm text-muted-foreground">
                    Have a plan before entering. Take profits at 50-100% gain.
                    Cut losses at 50% decline. Don't hope for recovery.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-blue-500/10 p-6">
              <h3 className="mb-3 text-lg font-semibold text-blue-700 dark:text-blue-400">
                📚 Paper Trade First
              </h3>
              <p className="text-sm text-muted-foreground">
                Before risking real money, practice with paper trading. Most brokers offer simulated
                trading accounts where you can learn options mechanics without financial risk.
                Spend at least 3 months paper trading before going live. Track your theoretical
                results to build confidence and identify weaknesses in your strategy.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-lg border p-6">
                  <h3 className="mb-3 text-lg font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Resources */}
          <section className="rounded-lg border bg-muted/30 p-8">
            <h2 className="mb-6 text-xl font-bold">Related Resources</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/options"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Options Hub</h3>
                <p className="text-sm text-muted-foreground">
                  Track options data and explore strategies
                </p>
              </Link>
              <Link
                href="/calculators/position-size"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Position Size Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate proper position sizes using the 2% rule
                </p>
              </Link>
              <Link
                href="/learn/technical-analysis"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Technical Analysis Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Learn chart patterns and indicators for timing
                </p>
              </Link>
              <Link
                href="/learn/day-trading"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Day Trading Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Short-term trading strategies and risks
                </p>
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
