"use client"

import { useState, useMemo } from "react"
import { Calculator, Shield, TrendingUp, AlertTriangle, DollarSign, Target, Info } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PositionSizeCalculatorPage() {
  // Input states
  const [accountSize, setAccountSize] = useState(50000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [entryPrice, setEntryPrice] = useState(150)
  const [stopLossPrice, setStopLossPrice] = useState(145)
  const [targetPrice, setTargetPrice] = useState(165)
  const [isShort, setIsShort] = useState(false)

  // Calculations
  const calculations = useMemo(() => {
    const riskPerTrade = accountSize * (riskPercent / 100)

    // Risk per share (distance to stop loss)
    const riskPerShare = isShort
      ? stopLossPrice - entryPrice  // For shorts, stop loss is above entry
      : entryPrice - stopLossPrice  // For longs, stop loss is below entry

    // Prevent division by zero or negative risk
    if (riskPerShare <= 0) {
      return {
        positionSize: 0,
        positionValue: 0,
        riskPerTrade,
        riskPerShare: 0,
        maxLoss: 0,
        percentOfAccount: 0,
        rewardPerShare: 0,
        riskRewardRatio: 0,
        potentialProfit: 0,
        targetReturn: 0,
        breakEvenPrice: entryPrice,
        isValid: false,
        errorMessage: isShort
          ? "Stop loss must be above entry price for short positions"
          : "Stop loss must be below entry price for long positions"
      }
    }

    // Position size in shares
    const positionSize = Math.floor(riskPerTrade / riskPerShare)
    const positionValue = positionSize * entryPrice
    const maxLoss = positionSize * riskPerShare
    const percentOfAccount = (positionValue / accountSize) * 100

    // Target calculations
    const rewardPerShare = isShort
      ? entryPrice - targetPrice  // For shorts, profit when price goes down
      : targetPrice - entryPrice  // For longs, profit when price goes up

    const riskRewardRatio = rewardPerShare > 0 ? rewardPerShare / riskPerShare : 0
    const potentialProfit = positionSize * Math.max(0, rewardPerShare)
    const targetReturn = positionValue > 0 ? (potentialProfit / positionValue) * 100 : 0

    // Break-even with $10 commission assumption
    const commissionTotal = 20 // $10 buy + $10 sell
    const breakEvenMove = positionSize > 0 ? commissionTotal / positionSize : 0
    const breakEvenPrice = isShort
      ? entryPrice - breakEvenMove
      : entryPrice + breakEvenMove

    return {
      positionSize,
      positionValue,
      riskPerTrade,
      riskPerShare,
      maxLoss,
      percentOfAccount,
      rewardPerShare,
      riskRewardRatio,
      potentialProfit,
      targetReturn,
      breakEvenPrice,
      isValid: true,
      errorMessage: null
    }
  }, [accountSize, riskPercent, entryPrice, stopLossPrice, targetPrice, isShort])

  // Risk level indicator
  const getRiskLevel = () => {
    if (calculations.percentOfAccount > 25) return { level: "Very High", color: "text-red-500", bg: "bg-red-500/10" }
    if (calculations.percentOfAccount > 15) return { level: "High", color: "text-orange-500", bg: "bg-orange-500/10" }
    if (calculations.percentOfAccount > 10) return { level: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    return { level: "Conservative", color: "text-green-500", bg: "bg-green-500/10" }
  }

  const riskLevel = getRiskLevel()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <Link href="/calculators" className="hover:text-foreground">Calculators</Link>
              <span>/</span>
              <span>Position Size</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Position Size Calculator</h1>
            <p className="text-muted-foreground max-w-2xl">
              Calculate the optimal number of shares to buy or sell based on your account size,
              risk tolerance, and stop loss level. Essential for proper risk management.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Position Parameters
                </h2>

                {/* Position Type Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Position Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsShort(false)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        !isShort
                          ? "bg-green-500/20 text-green-500 border border-green-500/30"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      Long (Buy)
                    </button>
                    <button
                      onClick={() => setIsShort(true)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        isShort
                          ? "bg-red-500/20 text-red-500 border border-red-500/30"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      Short (Sell)
                    </button>
                  </div>
                </div>

                {/* Account Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Account Size
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={accountSize}
                      onChange={(e) => setAccountSize(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Risk Percentage */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Risk Per Trade: {riskPercent}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.5%</span>
                    <span className="text-yellow-500">2% (Recommended)</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Entry Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Entry Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(Math.max(0.01, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Stop Loss Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    Stop Loss Price
                    <span className={`text-xs ${isShort ? "text-red-400" : "text-green-400"}`}>
                      ({isShort ? "Above entry for shorts" : "Below entry for longs"})
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(Math.max(0.01, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Target Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Target Price (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Math.max(0.01, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {!calculations.isValid && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {calculations.errorMessage}
                  </div>
                )}
              </div>

              {/* Quick Risk Presets */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-3">Quick Risk Presets</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Conservative", value: 1, color: "green" },
                    { label: "Standard", value: 2, color: "blue" },
                    { label: "Aggressive", value: 3, color: "orange" },
                    { label: "High Risk", value: 5, color: "red" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setRiskPercent(preset.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        riskPercent === preset.value
                          ? `bg-${preset.color}-500/20 text-${preset.color}-500 border border-${preset.color}-500/30`
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {preset.value}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Main Result */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Recommended Position Size
                </h2>

                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {calculations.positionSize.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">shares</div>
                  <div className="text-2xl font-semibold mt-2">
                    ${calculations.positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">total position value</div>
                </div>

                {/* Risk Level Badge */}
                <div className={`mt-4 p-3 rounded-lg ${riskLevel.bg} flex items-center justify-between`}>
                  <span className="text-sm">Position as % of Account:</span>
                  <span className={`font-semibold ${riskLevel.color}`}>
                    {calculations.percentOfAccount.toFixed(1)}% ({riskLevel.level})
                  </span>
                </div>
              </div>

              {/* Risk/Reward Metrics */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Risk & Reward Analysis
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Max Loss (at stop)</div>
                    <div className="text-xl font-bold text-red-500">
                      -${calculations.maxLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {riskPercent}% of account
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Potential Profit</div>
                    <div className="text-xl font-bold text-green-500">
                      +${calculations.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {calculations.targetReturn.toFixed(1)}% return
                    </div>
                  </div>
                </div>

                {/* Risk Reward Ratio */}
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risk/Reward Ratio</span>
                    <span className={`text-xl font-bold ${
                      calculations.riskRewardRatio >= 2 ? "text-green-500" :
                      calculations.riskRewardRatio >= 1 ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      1:{calculations.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        calculations.riskRewardRatio >= 2 ? "bg-green-500" :
                        calculations.riskRewardRatio >= 1 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (calculations.riskRewardRatio / 3) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor (&lt;1:1)</span>
                    <span>Good (2:1+)</span>
                  </div>
                </div>
              </div>

              {/* Price Levels */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Price Levels
                </h3>

                <div className="space-y-3">
                  {[
                    { label: "Target Price", value: targetPrice, color: "text-green-500", icon: TrendingUp },
                    { label: "Entry Price", value: entryPrice, color: "text-blue-500", icon: Target },
                    { label: "Break-even", value: calculations.breakEvenPrice, color: "text-yellow-500", icon: Info },
                    { label: "Stop Loss", value: stopLossPrice, color: "text-red-500", icon: AlertTriangle },
                  ].sort((a, b) => b.value - a.value).map((level) => (
                    <div key={level.label} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2">
                        <level.icon className={`w-4 h-4 ${level.color}`} />
                        <span className="text-sm">{level.label}</span>
                      </div>
                      <span className={`font-mono font-semibold ${level.color}`}>
                        ${level.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 space-y-8">
            {/* Position Sizing Explanation */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">How Position Sizing Works</h2>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Position sizing is a fundamental risk management technique that determines how many shares or
                  contracts to trade based on your account size and risk tolerance. The goal is to limit your
                  loss on any single trade to a predetermined percentage of your portfolio.
                </p>

                <div className="bg-secondary p-4 rounded-lg font-mono text-sm mb-4">
                  <div className="text-muted-foreground mb-2">Position Size Formula:</div>
                  <div className="text-primary">
                    Position Size = (Account Size × Risk %) ÷ (Entry Price - Stop Loss)
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">Example Calculation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Account: $50,000</li>
                      <li>• Risk: 2% = $1,000</li>
                      <li>• Entry: $150, Stop: $145</li>
                      <li>• Risk per share: $5</li>
                      <li>• Position: $1,000 ÷ $5 = <strong className="text-foreground">200 shares</strong></li>
                    </ul>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">The 2% Rule</h4>
                    <p className="text-sm text-muted-foreground">
                      Most professional traders risk no more than 1-2% of their account on any single trade.
                      This means you can have 50 consecutive losing trades before losing your entire account,
                      which is statistically unlikely with a good trading strategy.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Risk Management Tips */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Risk Management Best Practices</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h3 className="font-semibold text-green-500 mb-2">Do</h3>
                  <ul className="text-sm space-y-2">
                    <li>✓ Always use stop losses</li>
                    <li>✓ Calculate position size BEFORE entering</li>
                    <li>✓ Risk consistent percentage per trade</li>
                    <li>✓ Consider total portfolio exposure</li>
                    <li>✓ Aim for 2:1 or better risk/reward</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <h3 className="font-semibold text-red-500 mb-2">Don&apos;t</h3>
                  <ul className="text-sm space-y-2">
                    <li>✗ Risk more than 2% per trade</li>
                    <li>✗ Move stops to avoid losses</li>
                    <li>✗ Average down on losing positions</li>
                    <li>✗ Overtrade to recover losses</li>
                    <li>✗ Trade without a plan</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <h3 className="font-semibold text-blue-500 mb-2">Pro Tips</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Scale into positions gradually</li>
                    <li>• Correlate position sizes with conviction</li>
                    <li>• Account for slippage and gaps</li>
                    <li>• Review and adjust sizing monthly</li>
                    <li>• Track your actual vs planned risk</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "What is the best risk percentage for trading?",
                    a: "Most professional traders use 1-2% risk per trade. Beginners should start with 1% until they develop a consistent winning strategy. Never risk more than 5% on a single trade, regardless of conviction."
                  },
                  {
                    q: "How do I determine my stop loss placement?",
                    a: "Stop losses should be placed at technical levels where your trade thesis is invalidated - below support for longs, above resistance for shorts. Avoid placing stops at round numbers where they can be easily triggered by market makers."
                  },
                  {
                    q: "What is a good risk/reward ratio?",
                    a: "A minimum of 2:1 risk/reward is recommended. This means your potential profit should be at least twice your potential loss. With 2:1 R/R, you only need to win 34% of trades to break even."
                  },
                  {
                    q: "Should I use the same position size for every trade?",
                    a: "While consistent risk percentage (e.g., 2%) is recommended, position size in shares will vary based on how far your stop loss is from entry. Tighter stops allow larger positions, wider stops require smaller positions."
                  },
                  {
                    q: "How does position sizing differ for options vs stocks?",
                    a: "For options, risk the same dollar amount but remember options can go to zero. Many traders risk 1% on options trades due to higher volatility. Calculate position size based on the premium paid, not the notional value."
                  },
                  {
                    q: "What is the Kelly Criterion for position sizing?",
                    a: "The Kelly Criterion suggests optimal bet sizing based on win rate and payoff ratio: Kelly % = W - (1-W)/R, where W is win rate and R is risk/reward. Most traders use 'half Kelly' to reduce volatility."
                  },
                ].map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">
                      <span className="font-medium">{faq.q}</span>
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="p-4 text-muted-foreground text-sm">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Related Resources */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Related Resources</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/calculators/stock-profit" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <h3 className="font-medium mb-1">Stock Profit Calculator</h3>
                  <p className="text-sm text-muted-foreground">Calculate gains and losses</p>
                </Link>
                <Link href="/screener" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <h3 className="font-medium mb-1">Stock Screener</h3>
                  <p className="text-sm text-muted-foreground">Find trading opportunities</p>
                </Link>
                <Link href="/learn/day-trading" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <h3 className="font-medium mb-1">Day Trading Guide</h3>
                  <p className="text-sm text-muted-foreground">Learn trading strategies</p>
                </Link>
                <Link href="/learn/technical-analysis" className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <h3 className="font-medium mb-1">Technical Analysis</h3>
                  <p className="text-sm text-muted-foreground">Chart reading basics</p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
