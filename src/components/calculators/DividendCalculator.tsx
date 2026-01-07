'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DividendCalculatorProps {
  ticker: string
  companyName: string
  currentPrice: number
  dividendYield: number // As decimal (e.g., 0.025 for 2.5%)
  annualDividend?: number // Per share
  payoutFrequency?: 'quarterly' | 'monthly' | 'semi-annual' | 'annual'
  dividendGrowthRate?: number // Historical dividend growth rate
}

// Format large numbers with B/M/K
function formatCurrency(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num.toFixed(2)}`
}

export default function DividendCalculator({
  ticker,
  companyName,
  currentPrice,
  dividendYield,
  annualDividend,
  payoutFrequency = 'quarterly',
  dividendGrowthRate = 0.05, // Default 5% growth
}: DividendCalculatorProps) {
  const searchParams = useSearchParams()

  // Initialize from URL params or defaults
  const [investmentAmount, setInvestmentAmount] = useState<number>(() => {
    const param = searchParams.get('investment')
    return param ? parseInt(param) : 10000
  })

  const [projectionYears, setProjectionYears] = useState<number>(() => {
    const param = searchParams.get('years')
    return param ? parseInt(param) : 10
  })

  const [reinvestDividends, setReinvestDividends] = useState<boolean>(() => {
    const param = searchParams.get('drip')
    return param === 'true'
  })

  const [expectedGrowthRate, setExpectedGrowthRate] = useState<number>(
    dividendGrowthRate * 100
  )

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('investment', investmentAmount.toString())
    params.set('years', projectionYears.toString())
    params.set('drip', reinvestDividends.toString())

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [investmentAmount, projectionYears, reinvestDividends, searchParams])

  // Calculate dividend income projections
  const calculations = useMemo(() => {
    const effectiveYield = dividendYield || 0
    const effectiveAnnualDividend = annualDividend || currentPrice * effectiveYield
    const sharesOwned = investmentAmount / currentPrice
    const growthRate = expectedGrowthRate / 100

    // Calculate current income
    const currentAnnualIncome = sharesOwned * effectiveAnnualDividend
    const currentMonthlyIncome = currentAnnualIncome / 12
    const currentQuarterlyIncome = currentAnnualIncome / 4

    // Calculate income based on payout frequency
    const paymentsPerYear =
      payoutFrequency === 'monthly'
        ? 12
        : payoutFrequency === 'quarterly'
        ? 4
        : payoutFrequency === 'semi-annual'
        ? 2
        : 1

    const incomePerPayment = currentAnnualIncome / paymentsPerYear

    // Project future dividend income with growth
    const projectionData = []
    let cumulativeIncome = 0
    let currentShares = sharesOwned
    let currentDividendPerShare = effectiveAnnualDividend
    let portfolioValue = investmentAmount

    for (let year = 0; year <= projectionYears; year++) {
      const yearlyIncome = currentShares * currentDividendPerShare
      cumulativeIncome += year > 0 ? yearlyIncome : 0
      portfolioValue = currentShares * currentPrice

      projectionData.push({
        year: `Year ${year}`,
        yearNum: year,
        annualIncome: yearlyIncome,
        cumulativeIncome,
        portfolioValue: portfolioValue + cumulativeIncome,
        shares: currentShares,
      })

      // Apply growth for next year
      currentDividendPerShare *= 1 + growthRate

      // DRIP: reinvest dividends to buy more shares
      if (reinvestDividends && year > 0) {
        const newShares = yearlyIncome / currentPrice
        currentShares += newShares
      }
    }

    // Final year values
    const finalYear = projectionData[projectionData.length - 1]
    const totalDividendsReceived = finalYear.cumulativeIncome
    const finalAnnualIncome = finalYear.annualIncome
    const finalShares = finalYear.shares
    const yieldOnCost = (finalAnnualIncome / investmentAmount) * 100

    // Calculate vs no DRIP for comparison
    let noDripFinalIncome = sharesOwned * effectiveAnnualDividend
    for (let i = 0; i < projectionYears; i++) {
      noDripFinalIncome *= 1 + growthRate
    }
    const dripBenefit = finalAnnualIncome - noDripFinalIncome

    return {
      sharesOwned,
      currentAnnualIncome,
      currentMonthlyIncome,
      currentQuarterlyIncome,
      incomePerPayment,
      paymentsPerYear,
      projectionData,
      totalDividendsReceived,
      finalAnnualIncome,
      finalShares,
      yieldOnCost,
      dripBenefit,
      noDripFinalIncome,
      effectiveYield: effectiveYield * 100,
    }
  }, [
    investmentAmount,
    projectionYears,
    reinvestDividends,
    expectedGrowthRate,
    currentPrice,
    dividendYield,
    annualDividend,
    payoutFrequency,
  ])

  // Share results
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `${ticker} Dividend Calculator: $${investmentAmount.toLocaleString()} invested generates ${formatCurrency(calculations.currentAnnualIncome)}/year in dividends (${calculations.effectiveYield.toFixed(2)}% yield)!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticker} Dividend Calculator`,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        await navigator.clipboard.writeText(shareUrl)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  // Check if stock pays dividend
  if (!dividendYield || dividendYield <= 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {ticker} Dividend Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-2xl font-bold mb-2">{ticker} Does Not Pay Dividends</p>
            <p className="text-muted-foreground mb-4">
              {companyName} does not currently pay a regular dividend to shareholders.
            </p>
            <p className="text-sm text-muted-foreground">
              Growth companies often reinvest profits into expansion rather than paying
              dividends. Check back later as dividend policies can change.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-lg sm:text-xl">
            {ticker} Dividend Income Calculator
          </span>
          <button
            onClick={handleShare}
            className="text-sm bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            Share Results
          </button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate dividend income from your {companyName} investment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Dividend Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Dividend Yield</p>
            <p className="text-2xl font-bold text-green-500">
              {calculations.effectiveYield.toFixed(2)}%
            </p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Annual Dividend</p>
            <p className="text-xl font-bold">
              ${(annualDividend || currentPrice * dividendYield).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">per share</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Payout Frequency</p>
            <p className="text-xl font-bold capitalize">{payoutFrequency}</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Stock Price</p>
            <p className="text-xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Investment Amount
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-500">
                  ${investmentAmount.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({calculations.sharesOwned.toFixed(2)} shares)
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[10000, 25000, 50000, 100000, 250000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setInvestmentAmount(amount)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      investmentAmount === amount
                        ? 'bg-green-500 text-white'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    ${amount >= 1000 ? `${amount / 1000}K` : amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Projection Period
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={projectionYears}
                onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-2xl font-bold text-blue-500">
                {projectionYears} Years
              </span>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 15, 20, 25].map((years) => (
                  <button
                    key={years}
                    onClick={() => setProjectionYears(years)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      projectionYears === years
                        ? 'bg-blue-500 text-white'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {years}Y
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Expected Dividend Growth Rate
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={expectedGrowthRate}
                onChange={(e) => setExpectedGrowthRate(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
              <span className="text-xl font-bold text-purple-500">
                {expectedGrowthRate.toFixed(1)}% per year
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Dividend Reinvestment (DRIP)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setReinvestDividends(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors ${
                  !reinvestDividends
                    ? 'bg-blue-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Take Cash
              </button>
              <button
                onClick={() => setReinvestDividends(true)}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors ${
                  reinvestDividends
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                Reinvest (DRIP)
              </button>
            </div>
          </div>
        </div>

        {/* Income Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Annual Income</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500">
              {formatCurrency(calculations.currentAnnualIncome)}
            </p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-xl sm:text-2xl font-bold">
              {formatCurrency(calculations.currentMonthlyIncome)}
            </p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Per Payment</p>
            <p className="text-xl sm:text-2xl font-bold">
              {formatCurrency(calculations.incomePerPayment)}
            </p>
            <p className="text-xs text-muted-foreground">
              {calculations.paymentsPerYear}x/year
            </p>
          </div>
        </div>

        {/* Future Projections */}
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-6 rounded-xl border border-green-500/30">
          <h3 className="text-lg font-bold mb-4">
            After {projectionYears} Years {reinvestDividends && '(with DRIP)'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Income</p>
              <p className="text-xl font-bold text-green-500">
                {formatCurrency(calculations.finalAnnualIncome)}
              </p>
              <p className="text-xs text-muted-foreground">
                ({(calculations.finalAnnualIncome / 12).toFixed(0)}/mo)
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Dividends</p>
              <p className="text-xl font-bold">
                {formatCurrency(calculations.totalDividendsReceived)}
              </p>
              <p className="text-xs text-muted-foreground">received</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Yield on Cost</p>
              <p className="text-xl font-bold text-purple-500">
                {calculations.yieldOnCost.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                vs {calculations.effectiveYield.toFixed(1)}% today
              </p>
            </div>
            {reinvestDividends && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shares Owned</p>
                <p className="text-xl font-bold">
                  {calculations.finalShares.toFixed(2)}
                </p>
                <p className="text-xs text-green-500">
                  +{(calculations.finalShares - calculations.sharesOwned).toFixed(2)} from DRIP
                </p>
              </div>
            )}
          </div>

          {reinvestDividends && calculations.dripBenefit > 0 && (
            <div className="mt-4 pt-4 border-t border-green-500/30">
              <p className="text-sm">
                <span className="text-green-500 font-bold">DRIP Benefit:</span>{' '}
                Your annual income is {formatCurrency(calculations.dripBenefit)} higher than
                without reinvesting ({formatCurrency(calculations.noDripFinalIncome)}/year).
              </p>
            </div>
          )}
        </div>

        {/* Projection Chart */}
        <div className="h-64 sm:h-72">
          <p className="text-sm text-muted-foreground mb-2">
            Dividend Income Projection ({expectedGrowthRate}% annual growth
            {reinvestDividends ? ' + DRIP' : ''})
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculations.projectionData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'annualIncome' ? 'Annual Income' : 'Total Received',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) =>
                  value === 'annualIncome' ? 'Annual Income' : 'Cumulative Dividends'
                }
              />
              <Area
                type="monotone"
                dataKey="annualIncome"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="annualIncome"
              />
              <Area
                type="monotone"
                dataKey="cumulativeIncome"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#cumulativeGradient)"
                name="cumulativeIncome"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Income Milestones */}
        <div>
          <h3 className="text-sm font-bold mb-3">Income to Cover Expenses</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Phone Bill', amount: 100 },
              { label: 'Utilities', amount: 200 },
              { label: 'Car Payment', amount: 500 },
              { label: 'Rent/Mortgage', amount: 2000 },
            ].map((expense) => {
              const monthlyIncome = calculations.currentAnnualIncome / 12
              const covered = monthlyIncome >= expense.amount
              const percentCovered = Math.min(100, (monthlyIncome / expense.amount) * 100)

              return (
                <div
                  key={expense.label}
                  className={`p-3 rounded-lg ${
                    covered
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-secondary/50'
                  }`}
                >
                  <p className="text-xs text-muted-foreground">{expense.label}</p>
                  <p className="text-sm font-bold">${expense.amount}/mo</p>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        covered ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentCovered}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {percentCovered.toFixed(0)}% covered
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Projections assume constant dividend growth and stock price. Actual dividends may vary.
          Companies can reduce or eliminate dividends at any time. Past performance does not
          guarantee future results.
        </p>
      </CardContent>
    </Card>
  )
}
