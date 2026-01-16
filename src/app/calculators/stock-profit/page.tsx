'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface ProfitResults {
  totalBuyCost: number
  totalSellValue: number
  grossProfit: number
  netProfit: number
  percentageReturn: number
  annualizedReturn: number | null
  dividendIncome: number
  breakEvenPrice: number
}

export default function StockProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState<number>(100)
  const [sellPrice, setSellPrice] = useState<number>(150)
  const [shares, setShares] = useState<number>(100)
  const [buyCommission, setBuyCommission] = useState<number>(0)
  const [sellCommission, setSellCommission] = useState<number>(0)
  const [dividendPerShare, setDividendPerShare] = useState<number>(0)
  const [holdingDays, setHoldingDays] = useState<number>(365)
  const [isShortSale, setIsShortSale] = useState<boolean>(false)

  const results = useMemo<ProfitResults>(() => {
    // Calculate costs and values
    const totalBuyCost = (buyPrice * shares) + buyCommission
    const totalSellValue = (sellPrice * shares) - sellCommission
    const dividendIncome = dividendPerShare * shares

    // For short sales, profit is reversed
    let grossProfit: number
    let netProfit: number

    if (isShortSale) {
      // Short sale: profit when price goes down
      grossProfit = (buyPrice - sellPrice) * shares
      netProfit = grossProfit - buyCommission - sellCommission + dividendIncome
    } else {
      // Long position: profit when price goes up
      grossProfit = (sellPrice - buyPrice) * shares
      netProfit = grossProfit - buyCommission - sellCommission + dividendIncome
    }

    // Percentage return based on initial investment
    const initialInvestment = isShortSale ? totalSellValue : totalBuyCost
    const percentageReturn = initialInvestment > 0
      ? ((netProfit) / initialInvestment) * 100
      : 0

    // Annualized return (only if holding period > 0)
    let annualizedReturn: number | null = null
    if (holdingDays > 0 && initialInvestment > 0) {
      const totalReturn = netProfit / initialInvestment
      const years = holdingDays / 365
      // Annualized return = (1 + total return)^(1/years) - 1
      if (totalReturn > -1) {
        annualizedReturn = (Math.pow(1 + totalReturn, 1 / years) - 1) * 100
      }
    }

    // Break-even price (accounting for commissions)
    const totalCommissions = buyCommission + sellCommission
    const breakEvenPrice = isShortSale
      ? buyPrice + (totalCommissions / shares)
      : buyPrice + (totalCommissions / shares)

    return {
      totalBuyCost,
      totalSellValue,
      grossProfit,
      netProfit,
      percentageReturn,
      annualizedReturn,
      dividendIncome,
      breakEvenPrice,
    }
  }, [buyPrice, sellPrice, shares, buyCommission, sellCommission, dividendPerShare, holdingDays, isShortSale])

  const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    return `${sign}$${absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value: number): string => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <ol className="flex items-center gap-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Home</Link></li>
              <li>/</li>
              <li><Link href="/calculators/compound-interest" className="hover:text-foreground">Calculators</Link></li>
              <li>/</li>
              <li className="text-foreground">Stock Profit Calculator</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold mb-2">Stock Profit Calculator</h1>
          <p className="text-muted-foreground mb-8">
            Calculate your stock trading profit or loss. Enter your buy and sell prices, number of shares,
            and any commissions to see your total return.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Trade Details</h2>

                {/* Trade Type Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Trade Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsShortSale(false)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        !isShortSale
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      Buy (Long)
                    </button>
                    <button
                      onClick={() => setIsShortSale(true)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        isShortSale
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted'
                      }`}
                    >
                      Short Sell
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isShortSale ? 'Short Price (per share)' : 'Buy Price (per share)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isShortSale ? 'Cover Price (per share)' : 'Sell Price (per share)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Shares</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={shares}
                      onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Additional Options</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Buy Commission</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={buyCommission}
                          onChange={(e) => setBuyCommission(parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sell Commission</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={sellCommission}
                          onChange={(e) => setSellCommission(parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dividends Received (per share)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={dividendPerShare}
                        onChange={(e) => setDividendPerShare(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total dividends received during holding period</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Holding Period (days)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={holdingDays}
                      onChange={(e) => setHoldingDays(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used to calculate annualized return</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Your Results</h2>

                {/* Main Result */}
                <div className={`text-center p-6 rounded-lg mb-6 ${
                  results.netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <p className="text-sm text-muted-foreground mb-1">Net Profit/Loss</p>
                  <p className={`text-4xl font-bold ${
                    results.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(results.netProfit)}
                  </p>
                  <p className={`text-lg ${
                    results.percentageReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercent(results.percentageReturn)}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      {isShortSale ? 'Short Sale Proceeds' : 'Total Buy Cost'}
                    </span>
                    <span className="font-medium">{formatCurrency(results.totalBuyCost)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      {isShortSale ? 'Cover Cost' : 'Total Sell Value'}
                    </span>
                    <span className="font-medium">{formatCurrency(results.totalSellValue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Gross Profit</span>
                    <span className={`font-medium ${results.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.grossProfit)}
                    </span>
                  </div>
                  {results.dividendIncome > 0 && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Dividend Income</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.dividendIncome)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Commissions</span>
                    <span className="font-medium text-red-600">-{formatCurrency(buyCommission + sellCommission)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Break-Even Price</span>
                    <span className="font-medium">{formatCurrency(results.breakEvenPrice)}</span>
                  </div>
                  {results.annualizedReturn !== null && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Annualized Return</span>
                      <span className={`font-medium ${results.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(results.annualizedReturn)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Scenarios */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Price Scenarios</h3>
                <div className="space-y-2 text-sm">
                  {[0.9, 0.95, 1.05, 1.1, 1.2].map((multiplier) => {
                    const scenarioPrice = buyPrice * multiplier
                    const scenarioProfit = isShortSale
                      ? (buyPrice - scenarioPrice) * shares - buyCommission - sellCommission
                      : (scenarioPrice - buyPrice) * shares - buyCommission - sellCommission
                    const scenarioReturn = ((scenarioProfit) / results.totalBuyCost) * 100
                    return (
                      <div key={multiplier} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {isShortSale ? 'Cover' : 'Sell'} at {formatCurrency(scenarioPrice)}
                        </span>
                        <span className={scenarioProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(scenarioProfit)} ({formatPercent(scenarioReturn)})
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>How to Calculate Stock Profit</h2>
            <p>
              Calculating your stock trading profit involves more than just the difference between buy and sell prices.
              A complete profit calculation should account for commissions, dividends received, and the time value of money.
            </p>

            <h3>Basic Profit Formula</h3>
            <p>For a standard long position:</p>
            <div className="bg-muted p-4 rounded-lg my-4 font-mono text-sm">
              Net Profit = (Sell Price - Buy Price) × Shares - Commissions + Dividends
            </div>

            <h3>Understanding Return Metrics</h3>
            <ul>
              <li><strong>Percentage Return:</strong> Your profit as a percentage of your initial investment</li>
              <li><strong>Annualized Return:</strong> Your return adjusted to a yearly basis, useful for comparing investments of different durations</li>
              <li><strong>Break-Even Price:</strong> The minimum sell price needed to cover your costs (including commissions)</li>
            </ul>

            <h3>Short Selling</h3>
            <p>
              When short selling, you profit when the stock price falls. You borrow shares, sell them at the current price,
              and later buy them back (cover) at hopefully a lower price. The profit calculation is reversed:
            </p>
            <div className="bg-muted p-4 rounded-lg my-4 font-mono text-sm">
              Short Profit = (Short Price - Cover Price) × Shares - Commissions
            </div>

            <h3>Tax Considerations</h3>
            <p>
              Remember that stock profits are subject to capital gains taxes. Short-term gains (held less than 1 year)
              are taxed at your ordinary income rate, while long-term gains benefit from lower tax rates.
              Always consult a tax professional for advice specific to your situation.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">How do I calculate profit on a stock trade?</h3>
                <p className="text-muted-foreground">
                  Subtract your total buy cost (shares × price + commission) from your total sell proceeds
                  (shares × price - commission). Add any dividends received during the holding period.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What is annualized return?</h3>
                <p className="text-muted-foreground">
                  Annualized return expresses your investment gain as if held for exactly one year.
                  It allows you to compare returns from investments held for different time periods.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Should I include dividends in profit calculations?</h3>
                <p className="text-muted-foreground">
                  Yes. Dividends are part of your total return. For accurate profit calculations,
                  include all dividends received while holding the stock.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What is the break-even price?</h3>
                <p className="text-muted-foreground">
                  The break-even price is the minimum price you need to sell at to recover your initial
                  investment including all commissions. Any price above this represents profit.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">How does short selling profit work?</h3>
                <p className="text-muted-foreground">
                  In short selling, you profit when prices fall. You borrow and sell shares at a high price,
                  then buy them back at a lower price. Your profit is the difference minus fees.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Are trading commissions still relevant?</h3>
                <p className="text-muted-foreground">
                  Many brokers now offer commission-free trading for stocks. However, some brokers charge fees,
                  and options/futures often have per-contract fees. Always check your broker&apos;s fee schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Tools & Resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/calculators/compound-interest" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
                <p className="text-sm text-muted-foreground">Calculate long-term investment growth</p>
              </Link>
              <Link href="/screener" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">Find stocks matching your criteria</p>
              </Link>
              <Link href="/learn/how-to-invest" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">How to Invest</h3>
                <p className="text-sm text-muted-foreground">Beginner&apos;s guide to stock investing</p>
              </Link>
              <Link href="/insights/sp500-historical-returns" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">S&P 500 Historical Returns</h3>
                <p className="text-sm text-muted-foreground">Historical stock market performance</p>
              </Link>
              <Link href="/dividends" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Stocks</h3>
                <p className="text-sm text-muted-foreground">Find dividend-paying stocks</p>
              </Link>
              <Link href="/learn/day-trading" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Day Trading Guide</h3>
                <p className="text-sm text-muted-foreground">Learn about active trading strategies</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
