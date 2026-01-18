import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import UserAvatar from "@/components/UserAvatar"
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/seo"
import { TrendingUp, TrendingDown, AlertCircle, Calculator, BookOpen, Shield } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SEOSidebar from '@/components/SEOSidebar'

export const metadata: Metadata = {
  title: "Options Trading Guide - Unusual Options Activity & Options Flow Analysis",
  description: "Learn options trading fundamentals: calls vs puts, options flow analysis, unusual options activity signals, Greeks (Delta, Gamma, Theta, Vega), and proven options strategies. Free educational guide for beginners.",
  keywords: [
    "options trading",
    "unusual options activity",
    "options flow",
    "call options",
    "put options",
    "stock options",
    "options Greeks",
    "Delta",
    "Gamma",
    "Theta",
    "Vega",
    "options strategies",
    "covered calls",
    "options spreads",
    "options education",
    "how to trade options",
    "options for beginners",
    "options premium",
    "options expiration",
    "in the money options",
    "out of the money options"
  ],
  openGraph: {
    title: "Options Trading Guide - Unusual Options Activity & Flow Analysis",
    description: "Master options trading: Learn calls, puts, options flow, unusual activity signals, Greeks, and strategies. Free comprehensive guide.",
    url: "https://lician.com/options",
    type: "article",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lician Options Trading Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Options Trading Guide - Flow & Unusual Activity",
    description: "Learn options trading: calls, puts, flow analysis, Greeks, and strategies. Free guide for beginners.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://lician.com/options",
  },
}

// Breadcrumb structured data
const breadcrumbSchema = getBreadcrumbSchema([
  { name: "Home", url: "https://lician.com" },
  { name: "Options Trading Guide", url: "https://lician.com/options" },
])

// FAQ structured data
const faqSchema = getFAQSchema([
  {
    question: "What are options in stock trading?",
    answer: "Options are financial contracts that give you the right (but not the obligation) to buy or sell a stock at a specific price (strike price) before a certain date (expiration). Call options give you the right to buy, while put options give you the right to sell. Options allow traders to speculate on price movements with less capital than buying stocks outright, or to hedge existing positions."
  },
  {
    question: "What is the difference between call options and put options?",
    answer: "Call options give you the right to BUY a stock at a specific price, and you profit when the stock price goes UP. Put options give you the right to SELL a stock at a specific price, and you profit when the stock price goes DOWN. Call buyers are bullish (expect price increase), while put buyers are bearish (expect price decrease)."
  },
  {
    question: "What is unusual options activity?",
    answer: "Unusual options activity refers to abnormally high volume or open interest in specific options contracts, often indicating that large institutional investors or informed traders are positioning for a significant move. This can include: unusually large block trades, high volume compared to open interest, aggressive premium payments, and concentrated activity at specific strike prices. Monitoring unusual activity can provide insights into potential future price movements."
  },
  {
    question: "What is options flow and why does it matter?",
    answer: "Options flow is the real-time tracking of options transactions as they occur in the market. It shows you what institutional traders and smart money are buying or selling, including the size of trades, premium paid, and whether positions are being opened or closed. Flow analysis helps identify market sentiment, potential catalysts, and where big money is positioning. Bullish flow (heavy call buying) suggests upside expectations, while bearish flow (heavy put buying) suggests downside expectations."
  },
  {
    question: "What are the Options Greeks?",
    answer: "The Options Greeks are risk measures that describe how option prices change based on different factors: Delta measures price sensitivity (how much the option price moves for each $1 move in the stock), Gamma measures the rate of Delta change, Theta measures time decay (how much value the option loses each day), and Vega measures volatility sensitivity (how much the option price changes when implied volatility changes). Understanding Greeks is essential for managing options risk."
  },
  {
    question: "What is Delta in options trading?",
    answer: "Delta measures how much an option's price will change for every $1 move in the underlying stock. Delta ranges from 0 to 1 for calls and 0 to -1 for puts. A call with 0.50 Delta will gain $0.50 if the stock rises $1. Delta also represents the approximate probability that an option will expire in-the-money. At-the-money options typically have a Delta around 0.50, while deep in-the-money options approach 1.0 (or -1.0 for puts)."
  },
  {
    question: "What is Theta and how does time decay affect options?",
    answer: "Theta measures how much an option loses in value each day as it approaches expiration. All options suffer from time decay, with the rate accelerating in the final 30-45 days before expiration. For example, an option with Theta of -0.05 loses $5 in value per day ($0.05 per share x 100 shares). Time decay works against option buyers but benefits option sellers. At-the-money options have the highest Theta, while deep in-the-money or out-of-the-money options decay more slowly."
  },
  {
    question: "What is a covered call strategy?",
    answer: "A covered call is a conservative options strategy where you own 100 shares of a stock and sell one call option contract against it. This generates income (the premium) while capping your upside potential. If the stock stays below the strike price, you keep the premium and the shares. If it rises above the strike, you must sell your shares at the strike price. Covered calls are ideal for generating income on stocks you're willing to sell at higher prices."
  },
  {
    question: "What are options spreads?",
    answer: "Options spreads involve buying and selling multiple options contracts simultaneously to reduce risk and capital requirements. Common spreads include: Bull Call Spread (buy lower strike call, sell higher strike call for bullish trades with limited risk), Bear Put Spread (buy higher strike put, sell lower strike put for bearish trades), Iron Condor (selling both call and put spreads for range-bound markets), and Credit Spreads (selling options spreads to collect premium). Spreads limit both maximum profit and maximum loss."
  },
  {
    question: "How do I read unusual options activity signals?",
    answer: "When analyzing unusual options activity, look for: 1) Volume significantly higher than average (5-10x normal), 2) Large block trades (100+ contracts), 3) Aggressive premium payments (buying at the ask price), 4) Concentrated activity at specific strikes, 5) Near-term expiration focus suggesting imminent catalysts, and 6) Bullish vs bearish bias. Cross-reference with stock technicals, news, and earnings dates. Large institutional sweeps and blocks often precede significant price moves."
  },
  {
    question: "What is implied volatility in options?",
    answer: "Implied volatility (IV) represents the market's expectation of future price volatility. High IV means expensive options premiums (market expects big moves), while low IV means cheap premiums (market expects calm). IV typically spikes before earnings announcements and significant events. Buying options when IV is low and selling when IV is high is generally advantageous. IV is measured using the VIX (market volatility index) and individual stock IV percentiles."
  },
  {
    question: "What are in-the-money vs out-of-the-money options?",
    answer: "In-the-money (ITM) options have intrinsic value: calls with strike below the stock price, puts with strike above. Out-of-the-money (OTM) options have no intrinsic value and are pure time value: calls with strike above the stock price, puts with strike below. At-the-money (ATM) options have strike prices equal to the stock price. ITM options are more expensive but move more with the stock (higher Delta). OTM options are cheaper but require larger moves to profit."
  },
  {
    question: "What are the risks of trading options?",
    answer: "Options trading carries significant risks: 1) Total loss of premium paid (options can expire worthless), 2) Time decay erodes value daily, 3) Leverage amplifies both gains and losses, 4) Complexity requires substantial education, 5) Liquidity can be poor in less active strikes, 6) Assignment risk for sellers, 7) Early assignment on dividend-paying stocks, and 8) Gap risk over weekends and earnings. Options sellers face theoretically unlimited risk on naked positions. Only trade with risk capital you can afford to lose."
  },
  {
    question: "How much money do I need to start trading options?",
    answer: "You can start trading options with as little as $500-$1,000, but most brokers require $2,000 minimum for margin accounts. Each options contract controls 100 shares. A $5 option costs $500 ($5 x 100). Start small while learning: risk only 1-2% of your account per trade. More capital provides better diversification and the ability to trade spreads. Level 1 (covered calls) requires owning the underlying stock. Higher levels (spreads, naked options) require more experience and capital."
  },
  {
    question: "What is options expiration and what happens at expiry?",
    answer: "Options expiration is the last date an option contract is valid. Standard options expire on the third Friday of each month at market close. Weekly options expire every Friday. At expiration: in-the-money options are automatically exercised (you buy/sell the stock at the strike price), out-of-the-money options expire worthless, and brokers typically close positions automatically on expiration day to prevent exercise. Most traders close positions before expiration to avoid assignment and capture remaining time value."
  }
])

export default function OptionsPage() {
  return (
    <>
      <Header />
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema]),
        }}
      />

      <main className="min-h-dvh bg-black text-white pt-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-[10px] border-b border-white/[0.08]">
          <div className="max-w-[1400px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded-full outline-none">
                <div className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">L</span>
                </div>
                <span className="font-semibold text-lg hidden sm:inline">Lician</span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-4">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-[#868f97] hover:text-white hover:bg-white/[0.05] rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                >
                  Dashboard
                </Link>
                <Link
                  href="/options"
                  className="px-4 py-2 text-sm font-medium bg-[#4ebe96] text-white rounded-full hover:bg-[#4ebe96]/90 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                >
                  Options Guide
                </Link>
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <ThemeToggle />
                <UserAvatar />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#4ebe96]/10 to-black border-b border-white/[0.08]">
          <div className="max-w-[1400px] mx-auto px-6 py-16">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Options Trading Guide: Master Calls, Puts & Unusual Activity
              </h1>
              <p className="text-xl text-[#868f97] mb-8">
                Learn how to analyze options flow, identify unusual options activity, understand the Greeks, and implement proven strategies. Free comprehensive guide for beginners and advanced traders.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#options"
                  className="inline-flex items-center gap-2 bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-6 py-3 rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                >
                  <TrendingUp className="w-5 h-5" />
                  View Live Options Flow
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] text-white px-6 py-3 rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                >
                  <Calculator className="w-5 h-5" />
                  Analyze Stocks
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* What are Options */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <BookOpen className="w-6 h-6 text-[#4ebe96]" />
                    What Are Stock Options?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#868f97] leading-relaxed">
                    <strong className="text-white">Options</strong> are financial contracts that give you the right (but not the obligation) to buy or sell a stock at a predetermined price (called the strike price) before a specific expiration date. Unlike buying stocks, options allow you to control 100 shares with less capital while limiting your risk to the premium paid.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {/* Call Options */}
                    <div className="p-5 bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-[#4ebe96]" />
                        <h3 className="font-bold text-lg">Call Options</h3>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Right to <strong className="text-white">BUY</strong> stock at strike price
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-[#4ebe96] mt-1">•</span>
                          <span>Profit when stock price rises above strike</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#4ebe96] mt-1">•</span>
                          <span>Bullish strategy (expect price increase)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#4ebe96] mt-1">•</span>
                          <span>Limited risk: Only premium paid</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#4ebe96] mt-1">•</span>
                          <span>Unlimited upside potential</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-black/50 rounded-2xl">
                        <p className="text-xs font-mono text-[#868f97]">Example:</p>
                        <p className="text-xs mt-1 tabular-nums">Buy AAPL $180 Call for $5.00</p>
                        <p className="text-xs tabular-nums">Stock rises to $190 = $5 profit</p>
                        <p className="text-xs text-[#4ebe96] tabular-nums">($10 intrinsic - $5 premium)</p>
                      </div>
                    </div>

                    {/* Put Options */}
                    <div className="p-5 bg-[#ff5c5c]/10 border border-[#ff5c5c]/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-[#ff5c5c]" />
                        <h3 className="font-bold text-lg">Put Options</h3>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Right to <strong className="text-white">SELL</strong> stock at strike price
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5c5c] mt-1">•</span>
                          <span>Profit when stock price falls below strike</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5c5c] mt-1">•</span>
                          <span>Bearish strategy (expect price decrease)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5c5c] mt-1">•</span>
                          <span>Limited risk: Only premium paid</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5c5c] mt-1">•</span>
                          <span>Large profit potential as stock drops</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-black/50 rounded-2xl">
                        <p className="text-xs font-mono text-[#868f97]">Example:</p>
                        <p className="text-xs mt-1 tabular-nums">Buy TSLA $250 Put for $8.00</p>
                        <p className="text-xs tabular-nums">Stock drops to $230 = $12 profit</p>
                        <p className="text-xs text-[#4ebe96] tabular-nums">($20 intrinsic - $8 premium)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Options Flow */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Understanding Options Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#868f97] leading-relaxed">
                    <strong className="text-white">Options flow</strong> is the real-time tracking of options transactions as they happen in the market. By monitoring flow, you can see what institutional traders and smart money are buying or selling, giving you insights into market sentiment and potential price movements.
                  </p>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-lg">Key Flow Indicators:</h4>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Premium Spent</h5>
                      <p className="text-sm text-[#868f97]">
                        Total dollar amount spent on options contracts. Large premium (millions) suggests institutional positioning.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Aggressive Buyers/Sellers</h5>
                      <p className="text-sm text-[#868f97]">
                        Trades executed at the ask (bullish) vs bid (bearish). Aggressive buying at ask shows urgency and conviction.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Contract Volume</h5>
                      <p className="text-sm text-[#868f97]">
                        Number of contracts traded. Compare to average volume - 5-10x normal suggests unusual activity.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Open Interest</h5>
                      <p className="text-sm text-[#868f97]">
                        Total outstanding contracts. High volume with low open interest indicates new positions being opened.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl">
                    <p className="text-sm">
                      <strong className="text-white">Pro Tip:</strong> Watch for block trades (100+ contracts) and sweeps (aggressive multi-exchange orders). These often precede significant price moves and indicate informed institutional activity.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Unusual Options Activity */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <AlertCircle className="w-6 h-6 text-[#ffa16c]" />
                    What Unusual Options Activity Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#868f97] leading-relaxed">
                    <strong className="text-white">Unusual options activity</strong> occurs when options volume significantly exceeds normal levels, often indicating that large institutional investors or informed traders are positioning for a major move. This can signal upcoming catalysts like earnings beats, acquisitions, FDA approvals, or product launches.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#4ebe96] rounded-full"></span>
                        Bullish Signals
                      </h5>
                      <ul className="space-y-2 text-sm text-[#868f97]">
                        <li>• Heavy call buying above current price</li>
                        <li>• Large call sweeps at the ask</li>
                        <li>• Put selling (collecting premium)</li>
                        <li>• Upside call spreads</li>
                        <li>• Short-dated calls before catalysts</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ff5c5c] rounded-full"></span>
                        Bearish Signals
                      </h5>
                      <ul className="space-y-2 text-sm text-[#868f97]">
                        <li>• Heavy put buying below current price</li>
                        <li>• Large put sweeps at the ask</li>
                        <li>• Call selling (expecting downside)</li>
                        <li>• Downside put spreads</li>
                        <li>• Unusual put/call ratio spikes</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold">How to Identify Unusual Activity:</h4>
                    <ol className="space-y-2 text-sm text-[#868f97] list-decimal list-inside">
                      <li>Volume 5-10x higher than average</li>
                      <li>Volume exceeds open interest (new positions)</li>
                      <li>Large block trades (100-1000+ contracts)</li>
                      <li>Premium exceeding $1 million on single trades</li>
                      <li>Concentrated at specific strike prices</li>
                      <li>Near-term expiration suggesting imminent catalyst</li>
                      <li>Institutional sweeps across multiple exchanges</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Options Greeks */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Options Greeks Explained</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#868f97] leading-relaxed">
                    The <strong className="text-white">Options Greeks</strong> are risk measures that quantify how option prices change based on different factors. Understanding Greeks is essential for managing risk and optimizing entry/exit points.
                  </p>

                  <div className="space-y-4 mt-6">
                    {/* Delta */}
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">Delta (Δ)</h4>
                        <span className="text-xs bg-[#4ebe96]/20 text-[#4ebe96] px-3 py-1 rounded-full">Price Sensitivity</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Measures how much the option price moves for each $1 change in stock price.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-black/50 rounded-2xl">
                          <p className="font-medium mb-1">Call Delta: 0 to 1.0</p>
                          <p className="text-xs text-[#868f97] tabular-nums">0.50 Delta = $0.50 gain per $1 stock rise</p>
                        </div>
                        <div className="p-3 bg-black/50 rounded-2xl">
                          <p className="font-medium mb-1">Put Delta: 0 to -1.0</p>
                          <p className="text-xs text-[#868f97] tabular-nums">-0.50 Delta = $0.50 gain per $1 stock drop</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#868f97] mt-3">
                        <strong>Also represents:</strong> Approximate probability option expires in-the-money. 0.70 Delta ≈ 70% chance of ITM expiry.
                      </p>
                    </div>

                    {/* Gamma */}
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">Gamma (Γ)</h4>
                        <span className="text-xs bg-[#479ffa]/20 text-[#479ffa] px-3 py-1 rounded-full">Delta Change Rate</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Measures the rate of change in Delta. How much Delta increases for each $1 stock move.
                      </p>
                      <ul className="space-y-2 text-sm text-[#868f97]">
                        <li>• Highest for at-the-money options near expiration</li>
                        <li>• High Gamma = Delta changes rapidly (more volatile)</li>
                        <li>• Low Gamma = Delta changes slowly (more stable)</li>
                        <li>• Important for delta hedging and risk management</li>
                      </ul>
                    </div>

                    {/* Theta */}
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">Theta (Θ)</h4>
                        <span className="text-xs bg-[#ff5c5c]/20 text-[#ff5c5c] px-3 py-1 rounded-full">Time Decay</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Measures how much value the option loses each day as expiration approaches.
                      </p>
                      <div className="p-3 bg-black/50 rounded-2xl mb-3">
                        <p className="text-xs font-mono tabular-nums">Theta = -0.05 means option loses $5/day ($0.05 × 100 shares)</p>
                      </div>
                      <ul className="space-y-2 text-sm text-[#868f97]">
                        <li>• Time decay accelerates in final 30-45 days</li>
                        <li>• Works against option buyers (losing value)</li>
                        <li>• Benefits option sellers (collecting decay)</li>
                        <li>• Highest for at-the-money options</li>
                      </ul>
                    </div>

                    {/* Vega */}
                    <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">Vega (ν)</h4>
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-3 py-1 rounded-full">Volatility Sensitivity</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Measures how much the option price changes for each 1% change in implied volatility.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                        <div className="p-3 bg-black/50 rounded-2xl">
                          <p className="font-medium mb-1">High IV Environment</p>
                          <p className="text-xs text-[#868f97]">Expensive premiums, good for selling</p>
                        </div>
                        <div className="p-3 bg-black/50 rounded-2xl">
                          <p className="font-medium mb-1">Low IV Environment</p>
                          <p className="text-xs text-[#868f97]">Cheap premiums, good for buying</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-[#868f97]">
                        <li>• IV spikes before earnings and major events</li>
                        <li>• Long-dated options have higher Vega</li>
                        <li>• Buy low IV, sell high IV</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Options Strategies */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Popular Options Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#868f97] leading-relaxed">
                    Options strategies combine buying and selling contracts to achieve specific risk/reward profiles. Here are proven strategies for different market conditions.
                  </p>

                  <div className="space-y-4 mt-6">
                    {/* Covered Call */}
                    <div className="p-5 border border-white/[0.08] rounded-2xl">
                      <h4 className="font-bold text-lg mb-2">Covered Call</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-[#4ebe96]/20 text-[#4ebe96] px-2 py-1 rounded-full">Income Strategy</span>
                        <span className="text-xs bg-white/[0.03] border border-white/[0.08] px-2 py-1 rounded-full">Conservative</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Own 100 shares of stock and sell 1 call option against it to generate income.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-medium text-[#4ebe96] mb-1">Pros:</p>
                          <ul className="space-y-1 text-[#868f97]">
                            <li>• Immediate income from premium</li>
                            <li>• Reduces cost basis of shares</li>
                            <li>• Lower risk than owning stock alone</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-[#ff5c5c] mb-1">Cons:</p>
                          <ul className="space-y-1 text-[#868f97]">
                            <li>• Caps upside potential</li>
                            <li>• Must sell shares if assigned</li>
                            <li>• Still exposed to downside risk</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bull Call Spread */}
                    <div className="p-5 border border-white/[0.08] rounded-2xl">
                      <h4 className="font-bold text-lg mb-2">Bull Call Spread</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-[#4ebe96]/20 text-[#4ebe96] px-2 py-1 rounded-full">Bullish</span>
                        <span className="text-xs bg-white/[0.03] border border-white/[0.08] px-2 py-1 rounded-full">Defined Risk</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Buy lower strike call, sell higher strike call. Reduces cost and risk vs buying call outright.
                      </p>
                      <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs font-mono mb-3">
                        <p className="tabular-nums">Buy $100 Call for $5.00</p>
                        <p className="tabular-nums">Sell $110 Call for $2.00</p>
                        <p className="text-[#4ebe96] mt-1 tabular-nums">Net Cost: $3.00 | Max Profit: $7.00</p>
                      </div>
                      <p className="text-xs text-[#868f97]">
                        Best for: Moderate bullish outlook with limited capital. Max profit = (spread width - net cost).
                      </p>
                    </div>

                    {/* Bear Put Spread */}
                    <div className="p-5 border border-white/[0.08] rounded-2xl">
                      <h4 className="font-bold text-lg mb-2">Bear Put Spread</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-[#ff5c5c]/20 text-[#ff5c5c] px-2 py-1 rounded-full">Bearish</span>
                        <span className="text-xs bg-white/[0.03] border border-white/[0.08] px-2 py-1 rounded-full">Defined Risk</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Buy higher strike put, sell lower strike put. Profit from downward moves with capped risk.
                      </p>
                      <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs font-mono mb-3">
                        <p className="tabular-nums">Buy $100 Put for $6.00</p>
                        <p className="tabular-nums">Sell $90 Put for $3.00</p>
                        <p className="text-[#4ebe96] mt-1 tabular-nums">Net Cost: $3.00 | Max Profit: $7.00</p>
                      </div>
                      <p className="text-xs text-[#868f97]">
                        Best for: Bearish outlook with limited downside target. Cheaper than buying puts outright.
                      </p>
                    </div>

                    {/* Iron Condor */}
                    <div className="p-5 border border-white/[0.08] rounded-2xl">
                      <h4 className="font-bold text-lg mb-2">Iron Condor</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-[#ffa16c]/20 text-[#ffa16c] px-2 py-1 rounded-full">Neutral</span>
                        <span className="text-xs bg-white/[0.03] border border-white/[0.08] px-2 py-1 rounded-full">Premium Collection</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Sell OTM call spread + sell OTM put spread. Profit when stock stays in range.
                      </p>
                      <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs font-mono mb-3">
                        <p className="tabular-nums">Sell $110 Call, Buy $115 Call</p>
                        <p className="tabular-nums">Sell $90 Put, Buy $85 Put</p>
                        <p className="text-[#4ebe96] mt-1 tabular-nums">Collect $2.00 premium if stock stays $90-$110</p>
                      </div>
                      <p className="text-xs text-[#868f97]">
                        Best for: Low volatility, range-bound markets. High probability of profit, limited reward.
                      </p>
                    </div>

                    {/* Long Straddle */}
                    <div className="p-5 border border-white/[0.08] rounded-2xl">
                      <h4 className="font-bold text-lg mb-2">Long Straddle</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full">Volatility Play</span>
                        <span className="text-xs bg-white/[0.03] border border-white/[0.08] px-2 py-1 rounded-full">Directional Neutral</span>
                      </div>
                      <p className="text-sm text-[#868f97] mb-3">
                        Buy ATM call + ATM put. Profit from large move in either direction.
                      </p>
                      <p className="text-xs text-[#868f97]">
                        Best for: Before earnings or major catalysts. Need stock to move more than premium paid. High cost but unlimited profit potential.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risks */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Shield className="w-6 h-6 text-[#ffa16c]" />
                    Risks of Options Trading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#ffa16c]/10 border border-[#ffa16c]/20 rounded-2xl mb-4">
                    <p className="text-sm">
                      <strong className="text-white">Warning:</strong> Options trading involves substantial risk and is not suitable for all investors. You can lose 100% of your investment. Only trade with capital you can afford to lose.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Total Loss of Premium</h5>
                      <p className="text-sm text-[#868f97]">
                        Options can expire worthless if the stock doesn't move as expected. Unlike stocks that retain some value, out-of-the-money options expire with zero value. Many option buyers lose their entire investment.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Time Decay (Theta)</h5>
                      <p className="text-sm text-[#868f97]">
                        Every day that passes, your option loses value due to time decay. This accelerates as expiration approaches. Even if you're right about direction, timing wrong can result in losses.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Leverage Amplifies Losses</h5>
                      <p className="text-sm text-[#868f97]">
                        Options provide leverage - controlling $10,000+ in stock with a $500 option. While this amplifies gains, it equally amplifies losses. A 10% adverse stock move can result in 50-100% option loss.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Complexity Requires Education</h5>
                      <p className="text-sm text-[#868f97]">
                        Options pricing involves Greeks, implied volatility, time decay, and probability. Without proper education, traders often make costly mistakes. Start small and paper trade before risking real capital.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Liquidity and Slippage</h5>
                      <p className="text-sm text-[#868f97]">
                        Less popular strikes and expirations may have wide bid-ask spreads, making it expensive to enter/exit. Slippage on large orders can significantly reduce profits. Always check volume and open interest.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Assignment Risk (Sellers)</h5>
                      <p className="text-sm text-[#868f97]">
                        Option sellers can be assigned at any time if options are in-the-money. This means you must buy (puts) or sell (calls) shares at the strike price, potentially at significant losses. Naked option selling carries theoretically unlimited risk.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h5 className="font-medium mb-2">Gap Risk</h5>
                      <p className="text-sm text-[#868f97]">
                        Stocks can gap up or down significantly over weekends, holidays, or after earnings announcements. Options held through these events can experience massive losses that exceed normal stop-loss protections.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl">
                    <p className="text-sm">
                      <strong className="text-white">Best Practices:</strong> Start with small positions (1-2% of capital per trade), use defined-risk strategies (spreads), avoid earnings plays until experienced, set stop losses, never sell naked options, and continuously educate yourself. Consider paper trading for 2-3 months before using real money.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      q: "What are options in stock trading?",
                      a: "Options are financial contracts that give you the right (but not the obligation) to buy or sell a stock at a specific price (strike price) before a certain date (expiration). Call options give you the right to buy, while put options give you the right to sell. Options allow traders to speculate on price movements with less capital than buying stocks outright, or to hedge existing positions."
                    },
                    {
                      q: "How much money do I need to start trading options?",
                      a: "You can start trading options with as little as $500-$1,000, but most brokers require $2,000 minimum for margin accounts. Each options contract controls 100 shares. A $5 option costs $500 ($5 × 100). Start small while learning: risk only 1-2% of your account per trade. More capital provides better diversification and the ability to trade spreads."
                    },
                    {
                      q: "What is the difference between call and put options?",
                      a: "Call options give you the right to BUY a stock at a specific price, and you profit when the stock price goes UP. Put options give you the right to SELL a stock at a specific price, and you profit when the stock price goes DOWN. Call buyers are bullish (expect price increase), while put buyers are bearish (expect price decrease)."
                    },
                    {
                      q: "Can I lose more money than I invest in options?",
                      a: "As an option buyer, your maximum loss is limited to the premium paid. You cannot lose more than your initial investment. However, as an option seller (especially naked options), you can face unlimited losses. Always use defined-risk strategies when starting out, such as covered calls or credit spreads."
                    },
                    {
                      q: "What happens when options expire?",
                      a: "At expiration, in-the-money options are automatically exercised (you buy/sell the stock at the strike price), while out-of-the-money options expire worthless. Most brokers automatically close positions on expiration day to prevent assignment. Most traders close positions before expiration to capture remaining time value."
                    },
                    {
                      q: "Should I buy or sell options?",
                      a: "Buying options offers limited risk (premium paid) with unlimited profit potential, but you're fighting time decay. Selling options generates immediate income and benefits from time decay, but carries higher risk and capital requirements. Beginners should start with buying defined-risk spreads or selling covered calls."
                    },
                    {
                      q: "What is a good options trading strategy for beginners?",
                      a: "Covered calls are best for beginners - own 100 shares and sell a call to generate income. Bull/bear spreads are also good defined-risk strategies. Avoid: selling naked options, complex multi-leg strategies, and earnings plays until you have experience. Always start with paper trading."
                    },
                    {
                      q: "How do I know if an option is expensive or cheap?",
                      a: "Check implied volatility (IV) percentile. Options are historically cheap when IV is in the 0-30 percentile, fair at 30-70, and expensive at 70-100. Buy options when IV is low (cheap premiums) and sell when IV is high (expensive premiums). IV typically spikes before earnings."
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <h4 className="font-medium mb-2">{faq.q}</h4>
                      <p className="text-sm text-[#868f97]">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2 text-sm">
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">What Are Options?</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Call vs Put Options</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Options Flow</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Unusual Activity</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Options Greeks</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Trading Strategies</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Risks & Warnings</a>
                    <a href="/learn" className="block text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">FAQs</a>
                  </nav>
                </CardContent>
              </Card>

              {/* Key Takeaways */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Options provide leverage with defined risk (buyers)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Greeks help quantify risk and optimize timing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Unusual flow signals institutional positioning</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Spreads reduce cost and risk vs naked options</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#ffa16c] mt-1">⚠</span>
                    <span>Time decay works against option buyers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#ffa16c] mt-1">⚠</span>
                    <span>Start small, paper trade, educate before risking capital</span>
                  </div>
                </CardContent>
              </Card>

              {/* Related Resources */}
              <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Related Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/#options"
                    className="block p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                  >
                    <p className="font-medium text-sm mb-1">Live Options Flow</p>
                    <p className="text-xs text-[#868f97]">Track real-time unusual activity</p>
                  </Link>
                  <Link
                    href="/"
                    className="block p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                  >
                    <p className="font-medium text-sm mb-1">Stock Analysis</p>
                    <p className="text-xs text-[#868f97]">Fundamental & technical analysis</p>
                  </Link>
                  <Link
                    href="/#screener"
                    className="block p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] outline-none"
                  >
                    <p className="font-medium text-sm mb-1">Stock Screener</p>
                    <p className="text-xs text-[#868f97]">Find trading opportunities</p>
                  </Link>
                </CardContent>
              </Card>

              {/* Educational Notice */}
              <Card className="bg-[#ffa16c]/10 border-[#ffa16c]/20 rounded-2xl">
                <CardContent className="pt-6">
                  <p className="text-xs text-[#868f97] leading-relaxed">
                    <strong className="text-white">Educational Content:</strong> This guide is for educational purposes only and does not constitute financial advice. Options trading involves substantial risk. Consult with a licensed financial advisor before making investment decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.08] mt-16">
          <div className="max-w-[1400px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Options Education</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li><Link href="/options" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Options Basics</Link></li>
                  <li><Link href="/options#greeks" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Greeks Explained</Link></li>
                  <li><Link href="/options#strategies" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Trading Strategies</Link></li>
                  <li><Link href="/options#flow" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Options Flow</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Trading Tools</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Stock Dashboard</Link></li>
                  <li><Link href="/#options" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Options Chain</Link></li>
                  <li><Link href="/#screener" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Stock Screener</Link></li>
                  <li><Link href="/#dcf" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">DCF Calculator</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Market Overview</Link></li>
                  <li><Link href="/#earnings" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Earnings Calendar</Link></li>
                  <li><Link href="/#news" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Market News</Link></li>
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">AI Analysis</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">About Lician</Link></li>
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Terms of Service</Link></li>
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Privacy Policy</Link></li>
                  <li><Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/[0.08] text-center text-sm text-[#868f97]">
              <p>© 2024 Lician. Options trading involves substantial risk. Educational content only - not financial advice.</p>
            </div>
          </div>
        </footer>
      </main>
      <Footer />
    </>
  )
}
