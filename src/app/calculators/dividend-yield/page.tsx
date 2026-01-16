'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface DividendResults {
  currentYield: number
  annualIncome: number
  monthlyIncome: number
  quarterlyIncome: number
  yieldOnCost: number
  projectedValue: number
  projectedAnnualIncome: number
  totalDividendsReceived: number
  totalShares: number
}

interface YearlyProjection {
  year: number
  shares: number
  sharePrice: number
  annualDividend: number
  dividendIncome: number
  portfolioValue: number
}

export default function DividendYieldCalculator() {
  const [stockPrice, setStockPrice] = useState<number>(50)
  const [annualDividend, setAnnualDividend] = useState<number>(2)
  const [sharesOwned, setSharesOwned] = useState<number>(100)
  const [costBasis, setCostBasis] = useState<number>(40)
  const [dividendGrowthRate, setDividendGrowthRate] = useState<number>(5)
  const [priceGrowthRate, setPriceGrowthRate] = useState<number>(7)
  const [years, setYears] = useState<number>(10)
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true)

  const results = useMemo<DividendResults>(() => {
    // Current dividend yield
    const currentYield = stockPrice > 0 ? (annualDividend / stockPrice) * 100 : 0

    // Yield on cost (based on original purchase price)
    const yieldOnCost = costBasis > 0 ? (annualDividend / costBasis) * 100 : 0

    // Current income calculations
    const annualIncome = sharesOwned * annualDividend
    const quarterlyIncome = annualIncome / 4
    const monthlyIncome = annualIncome / 12

    // Project future values
    let currentShares = sharesOwned
    let currentPrice = stockPrice
    let currentDividendPerShare = annualDividend
    let totalDividendsReceived = 0

    for (let year = 1; year <= years; year++) {
      // Calculate dividend income for this year
      const yearDividendIncome = currentShares * currentDividendPerShare
      totalDividendsReceived += yearDividendIncome

      // Reinvest dividends if enabled (buy fractional shares at year-end price)
      if (reinvestDividends && currentPrice > 0) {
        currentShares += yearDividendIncome / currentPrice
      }

      // Grow dividend and price for next year
      currentDividendPerShare *= (1 + dividendGrowthRate / 100)
      currentPrice *= (1 + priceGrowthRate / 100)
    }

    const projectedValue = currentShares * currentPrice
    const projectedAnnualIncome = currentShares * currentDividendPerShare

    return {
      currentYield,
      annualIncome,
      monthlyIncome,
      quarterlyIncome,
      yieldOnCost,
      projectedValue,
      projectedAnnualIncome,
      totalDividendsReceived,
      totalShares: currentShares,
    }
  }, [stockPrice, annualDividend, sharesOwned, costBasis, dividendGrowthRate, priceGrowthRate, years, reinvestDividends])

  const yearlyProjections = useMemo<YearlyProjection[]>(() => {
    const projections: YearlyProjection[] = []
    let currentShares = sharesOwned
    let currentPrice = stockPrice
    let currentDividendPerShare = annualDividend

    // Year 0 (starting point)
    projections.push({
      year: 0,
      shares: currentShares,
      sharePrice: currentPrice,
      annualDividend: currentDividendPerShare,
      dividendIncome: currentShares * currentDividendPerShare,
      portfolioValue: currentShares * currentPrice,
    })

    for (let year = 1; year <= years; year++) {
      const yearDividendIncome = currentShares * currentDividendPerShare

      if (reinvestDividends && currentPrice > 0) {
        currentShares += yearDividendIncome / currentPrice
      }

      currentDividendPerShare *= (1 + dividendGrowthRate / 100)
      currentPrice *= (1 + priceGrowthRate / 100)

      projections.push({
        year,
        shares: currentShares,
        sharePrice: currentPrice,
        annualDividend: currentDividendPerShare,
        dividendIncome: currentShares * currentDividendPerShare,
        portfolioValue: currentShares * currentPrice,
      })
    }

    return projections
  }, [sharesOwned, stockPrice, annualDividend, dividendGrowthRate, priceGrowthRate, years, reinvestDividends])

  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`
  }

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  // Filter projections for display (show key years)
  const displayProjections = yearlyProjections.filter((p, i) => {
    if (years <= 10) return true
    if (p.year === 0 || p.year === years) return true
    if (p.year <= 5) return true
    if (p.year % 5 === 0) return true
    return false
  })

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
              <li className="text-foreground">Dividend Yield Calculator</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold mb-2">Dividend Yield Calculator</h1>
          <p className="text-muted-foreground mb-8">
            Calculate dividend yield, annual income, and project future dividend growth with optional
            dividend reinvestment (DRIP).
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Stock Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Stock Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={stockPrice}
                        onChange={(e) => setStockPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Dividend Per Share</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={annualDividend}
                        onChange={(e) => setAnnualDividend(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total dividends paid per share in a year</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Shares Owned</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={sharesOwned}
                      onChange={(e) => setSharesOwned(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cost Basis Per Share</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={costBasis}
                        onChange={(e) => setCostBasis(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Your original purchase price (for yield on cost)</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Growth Projections</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dividend Growth Rate (Annual)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        value={dividendGrowthRate}
                        onChange={(e) => setDividendGrowthRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg bg-background pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Expected annual dividend increase</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price Growth Rate (Annual)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="-10"
                        max="30"
                        step="0.5"
                        value={priceGrowthRate}
                        onChange={(e) => setPriceGrowthRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg bg-background pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Expected annual stock price appreciation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Projection Period</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={years}
                        onChange={(e) => setYears(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-16 text-right font-medium">{years} years</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="drip"
                      checked={reinvestDividends}
                      onChange={(e) => setReinvestDividends(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="drip" className="text-sm">
                      Reinvest dividends (DRIP)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Current Metrics</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Dividend Yield</p>
                    <p className="text-3xl font-bold text-primary">{formatPercent(results.currentYield)}</p>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Annual Income</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(results.annualIncome)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Monthly Income</span>
                    <span className="font-medium">{formatCurrency(results.monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Quarterly Income</span>
                    <span className="font-medium">{formatCurrency(results.quarterlyIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Yield on Cost</span>
                    <span className="font-medium text-green-600">{formatPercent(results.yieldOnCost)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Portfolio Value</span>
                    <span className="font-medium">{formatCurrency(sharesOwned * stockPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">After {years} Years</h2>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Projected Portfolio Value</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.projectedValue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Projected Annual Income</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.projectedAnnualIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Dividends Received</span>
                    <span className="font-medium">{formatCurrency(results.totalDividendsReceived)}</span>
                  </div>
                  {reinvestDividends && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Total Shares (with DRIP)</span>
                      <span className="font-medium">{formatNumber(results.totalShares)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Yield Comparison */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Yield Comparison</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Stock</span>
                    <span className={results.currentYield >= 3 ? 'text-green-600' : ''}>{formatPercent(results.currentYield)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">S&P 500 Average</span>
                    <span>~1.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">10-Year Treasury</span>
                    <span>~4.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High-Yield Savings</span>
                    <span>~4.0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projection Table */}
          <div className="mt-8 bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Year-by-Year Projection</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Year</th>
                    <th className="text-right py-2 px-2">Shares</th>
                    <th className="text-right py-2 px-2">Price</th>
                    <th className="text-right py-2 px-2">Dividend/Share</th>
                    <th className="text-right py-2 px-2">Annual Income</th>
                    <th className="text-right py-2 px-2">Portfolio Value</th>
                  </tr>
                </thead>
                <tbody>
                  {displayProjections.map((proj) => (
                    <tr key={proj.year} className="border-b last:border-0">
                      <td className="py-2 px-2">{proj.year === 0 ? 'Start' : `Year ${proj.year}`}</td>
                      <td className="text-right py-2 px-2">{formatNumber(proj.shares)}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(proj.sharePrice)}</td>
                      <td className="text-right py-2 px-2">{formatCurrency(proj.annualDividend)}</td>
                      <td className="text-right py-2 px-2 text-green-600">{formatCurrency(proj.dividendIncome)}</td>
                      <td className="text-right py-2 px-2 font-medium">{formatCurrency(proj.portfolioValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>Understanding Dividend Yield</h2>
            <p>
              Dividend yield is one of the most important metrics for income investors. It tells you what percentage
              of your investment you can expect to receive as cash dividends each year.
            </p>

            <h3>Dividend Yield Formula</h3>
            <div className="bg-muted p-4 rounded-lg my-4 font-mono text-sm">
              Dividend Yield = (Annual Dividend Per Share / Stock Price) × 100
            </div>

            <h3>Key Dividend Metrics</h3>
            <ul>
              <li><strong>Current Yield:</strong> Based on the current stock price - this changes daily as the price moves</li>
              <li><strong>Yield on Cost:</strong> Based on your purchase price - useful for tracking how your income has grown</li>
              <li><strong>Dividend Growth Rate:</strong> How fast the company increases its dividend each year</li>
            </ul>

            <h3>DRIP (Dividend Reinvestment Plan)</h3>
            <p>
              Dividend reinvestment allows you to automatically use your dividend payments to buy more shares.
              This creates a compounding effect that can significantly boost your long-term returns. Many brokers
              offer commission-free DRIP programs.
            </p>

            <h3>What Makes a Good Dividend Stock?</h3>
            <ul>
              <li><strong>Sustainable payout ratio:</strong> Companies paying out less than 60% of earnings as dividends</li>
              <li><strong>Consistent dividend growth:</strong> Look for stocks that have increased dividends for 10+ years</li>
              <li><strong>Strong cash flow:</strong> Dividends should be well-covered by free cash flow</li>
              <li><strong>Reasonable yield:</strong> Extremely high yields (8%+) often signal potential dividend cuts</li>
            </ul>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What is a good dividend yield?</h3>
                <p className="text-muted-foreground">
                  A &quot;good&quot; yield depends on your goals. The S&P 500 average is around 1.5%. Yields between 2-4%
                  are generally considered solid for blue-chip stocks. Higher yields (5%+) may indicate higher risk.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What is yield on cost?</h3>
                <p className="text-muted-foreground">
                  Yield on cost calculates your dividend yield based on your original purchase price, not the current
                  price. If you bought a stock at $40 that now pays $3 in dividends, your yield on cost is 7.5%.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Should I reinvest dividends?</h3>
                <p className="text-muted-foreground">
                  Reinvesting dividends (DRIP) is generally recommended during the accumulation phase. The compounding
                  effect can significantly boost long-term returns. Consider taking dividends as cash if you need income.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">How often are dividends paid?</h3>
                <p className="text-muted-foreground">
                  Most US stocks pay quarterly dividends. REITs often pay monthly. Some international stocks pay
                  semi-annually or annually. Check the company&apos;s dividend history for their schedule.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Are dividends taxed?</h3>
                <p className="text-muted-foreground">
                  Yes, dividends are taxable income. Qualified dividends (held 60+ days) are taxed at lower capital
                  gains rates. Non-qualified dividends are taxed as ordinary income. Consult a tax professional.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What is dividend growth rate?</h3>
                <p className="text-muted-foreground">
                  Dividend growth rate measures how fast a company increases its dividend. A 5% growth rate means
                  dividends double roughly every 14 years. Dividend Aristocrats have raised dividends for 25+ years.
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
              <Link href="/calculators/stock-profit" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Stock Profit Calculator</h3>
                <p className="text-sm text-muted-foreground">Calculate trading profits and returns</p>
              </Link>
              <Link href="/dividends" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Stocks</h3>
                <p className="text-sm text-muted-foreground">Find high-yield dividend stocks</p>
              </Link>
              <Link href="/best-stocks/dividend" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Best Dividend Stocks</h3>
                <p className="text-sm text-muted-foreground">Top dividend stocks by yield and growth</p>
              </Link>
              <Link href="/learn/dividend-investing" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Investing Guide</h3>
                <p className="text-sm text-muted-foreground">Learn dividend investing strategies</p>
              </Link>
              <Link href="/insights/sp500-historical-returns" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">S&P 500 Historical Returns</h3>
                <p className="text-sm text-muted-foreground">Historical stock market performance</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
