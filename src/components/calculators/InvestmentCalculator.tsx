'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface InvestmentCalculatorProps {
  ticker: string
  companyName: string
  currentPrice: number
  historicalPrices?: { date: string; close: number }[]
  // Fallback growth rate if no historical data
  avgAnnualReturn?: number
}

// Format large numbers with B/M/K
function formatCurrency(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num.toFixed(2)}`
}

export default function InvestmentCalculator({
  ticker,
  companyName,
  currentPrice,
  historicalPrices = [],
  avgAnnualReturn = 0.12, // Default 12% annual return
}: InvestmentCalculatorProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize from URL params or defaults
  const [investmentAmount, setInvestmentAmount] = useState<number>(() => {
    const param = searchParams.get('investment')
    return param ? parseInt(param) : 10000
  })

  const [yearsAgo, setYearsAgo] = useState<number>(() => {
    const param = searchParams.get('years')
    return param ? parseInt(param) : 5
  })

  // Update URL when values change (for shareable results)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('investment', investmentAmount.toString())
    params.set('years', yearsAgo.toString())

    // Update URL without navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [investmentAmount, yearsAgo, searchParams])

  // Calculate historical performance
  const calculatedResults = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(startDate.getFullYear() - yearsAgo)

    // Try to find historical price data
    let startPrice = currentPrice
    let actualReturns = false

    if (historicalPrices.length > 0) {
      // Sort by date ascending
      const sorted = [...historicalPrices].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      // Find price closest to start date
      const startPriceData = sorted.find(
        (p) => new Date(p.date) >= startDate
      )

      if (startPriceData) {
        startPrice = startPriceData.close
        actualReturns = true
      }
    }

    // If no historical data, use average annual return
    if (!actualReturns) {
      // Calculate what the price would have been yearsAgo based on avg return
      startPrice = currentPrice / Math.pow(1 + avgAnnualReturn, yearsAgo)
    }

    // Calculate shares bought
    const sharesBought = investmentAmount / startPrice
    const currentValue = sharesBought * currentPrice
    const totalGain = currentValue - investmentAmount
    const totalReturn = ((currentValue - investmentAmount) / investmentAmount) * 100
    const annualizedReturn = (Math.pow(currentValue / investmentAmount, 1 / yearsAgo) - 1) * 100

    // Generate chart data
    const chartData = []
    for (let year = 0; year <= yearsAgo; year++) {
      const date = new Date(startDate)
      date.setFullYear(date.getFullYear() + year)

      let valueAtYear = investmentAmount

      if (actualReturns && historicalPrices.length > 0) {
        // Find price at this point in time
        const sorted = [...historicalPrices].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        const priceAtYear = sorted.find(
          (p) => new Date(p.date) >= date
        )
        if (priceAtYear) {
          valueAtYear = sharesBought * priceAtYear.close
        } else {
          // Interpolate
          valueAtYear = sharesBought * (startPrice + ((currentPrice - startPrice) * (year / yearsAgo)))
        }
      } else {
        // Use compound growth
        valueAtYear = investmentAmount * Math.pow(1 + avgAnnualReturn, year)
      }

      chartData.push({
        year: date.getFullYear(),
        value: valueAtYear,
        label: `${date.getFullYear()}`,
      })
    }

    return {
      startPrice,
      sharesBought,
      currentValue,
      totalGain,
      totalReturn,
      annualizedReturn,
      chartData,
      actualReturns,
    }
  }, [investmentAmount, yearsAgo, currentPrice, historicalPrices, avgAnnualReturn])

  // Share results
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `If I invested $${investmentAmount.toLocaleString()} in ${ticker} ${yearsAgo} years ago, it would be worth ${formatCurrency(calculatedResults.currentValue)} today!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticker} Investment Calculator`,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
        await navigator.clipboard.writeText(shareUrl)
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-lg sm:text-xl">
            If You Invested in {ticker}...
          </span>
          <button
            onClick={handleShare}
            className="text-sm bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            Share Results
          </button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate what your investment in {companyName} would be worth today
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
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
                max="100000"
                step="1000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-500">
                  ${investmentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1000, 5000, 10000, 25000, 50000].map((amount) => (
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
              Years Ago
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={yearsAgo}
                onChange={(e) => setYearsAgo(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-500">
                  {yearsAgo} {yearsAgo === 1 ? 'Year' : 'Years'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 3, 5, 10, 15].map((years) => (
                  <button
                    key={years}
                    onClick={() => setYearsAgo(years)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      yearsAgo === years
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

        {/* Results Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Initial Investment</p>
            <p className="text-lg font-bold">${investmentAmount.toLocaleString()}</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Shares Bought</p>
            <p className="text-lg font-bold">{calculatedResults.sharesBought.toFixed(2)}</p>
          </div>
          <div className="bg-green-500/20 p-4 rounded-lg text-center border border-green-500/30">
            <p className="text-xs text-muted-foreground mb-1">Value Today</p>
            <p className="text-xl font-bold text-green-500">
              {formatCurrency(calculatedResults.currentValue)}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg text-center ${
              calculatedResults.totalGain >= 0
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">Total Gain</p>
            <p
              className={`text-xl font-bold ${
                calculatedResults.totalGain >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {calculatedResults.totalGain >= 0 ? '+' : ''}
              {formatCurrency(calculatedResults.totalGain)}
            </p>
          </div>
        </div>

        {/* Return Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg ${
              calculatedResults.totalReturn >= 0
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'
                : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-1">Total Return</p>
            <p
              className={`text-3xl font-bold ${
                calculatedResults.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {calculatedResults.totalReturn >= 0 ? '+' : ''}
              {calculatedResults.totalReturn.toFixed(1)}%
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              calculatedResults.annualizedReturn >= 0
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20'
                : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-1">Annualized Return</p>
            <p
              className={`text-3xl font-bold ${
                calculatedResults.annualizedReturn >= 0 ? 'text-blue-500' : 'text-red-500'
              }`}
            >
              {calculatedResults.annualizedReturn >= 0 ? '+' : ''}
              {calculatedResults.annualizedReturn.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">per year</p>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="h-64 sm:h-72">
          <p className="text-sm text-muted-foreground mb-2">Investment Growth Over Time</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculatedResults.chartData}>
              <defs>
                <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <ReferenceLine
                y={investmentAmount}
                stroke="#6366f1"
                strokeDasharray="3 3"
                label={{
                  value: 'Initial',
                  fill: '#6366f1',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#investmentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insight */}
        <div
          className={`p-4 rounded-lg ${
            calculatedResults.totalReturn >= 50
              ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30'
              : calculatedResults.totalReturn >= 0
              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30'
              : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30'
          }`}
        >
          <p className="text-sm">
            {calculatedResults.totalReturn >= 100 ? (
              <>
                <span className="font-bold text-green-500">Incredible growth!</span> A $
                {investmentAmount.toLocaleString()} investment in {ticker} {yearsAgo} years ago
                would have more than doubled to {formatCurrency(calculatedResults.currentValue)}.
                That is a {calculatedResults.totalReturn.toFixed(1)}% total return.
              </>
            ) : calculatedResults.totalReturn >= 50 ? (
              <>
                <span className="font-bold text-green-500">Strong performance!</span> Your $
                {investmentAmount.toLocaleString()} investment would have grown to{' '}
                {formatCurrency(calculatedResults.currentValue)}, a gain of{' '}
                {formatCurrency(calculatedResults.totalGain)}.
              </>
            ) : calculatedResults.totalReturn >= 0 ? (
              <>
                <span className="font-bold text-blue-500">Positive return.</span> Your investment
                would have grown from ${investmentAmount.toLocaleString()} to{' '}
                {formatCurrency(calculatedResults.currentValue)} over {yearsAgo} years.
              </>
            ) : (
              <>
                <span className="font-bold text-red-500">Negative return.</span> The investment
                would have declined from ${investmentAmount.toLocaleString()} to{' '}
                {formatCurrency(calculatedResults.currentValue)} ({calculatedResults.totalReturn.toFixed(1)}%
                ).
              </>
            )}
          </p>
        </div>

        {/* Data Source Note */}
        <p className="text-xs text-muted-foreground text-center">
          {calculatedResults.actualReturns
            ? 'Calculated using actual historical price data.'
            : `Estimated using ${(avgAnnualReturn * 100).toFixed(0)}% average annual return assumption.`}
          {' '}Past performance does not guarantee future results.
        </p>
      </CardContent>
    </Card>
  )
}
