'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

interface TargetPriceCalculatorProps {
  ticker: string
  companyName: string
  currentPrice: number
  avgTargetPrice?: number
  highTargetPrice?: number
  lowTargetPrice?: number
}

interface TooltipFormatterPayload {
  target: number
}

interface TooltipFormatterProps {
  payload?: TooltipFormatterPayload
}

// Format large numbers with B/M/K
function formatCurrency(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num.toFixed(2)}`
}

export default function TargetPriceCalculator({
  ticker,
  companyName,
  currentPrice,
  avgTargetPrice,
  highTargetPrice,
  lowTargetPrice,
}: TargetPriceCalculatorProps) {
  const searchParams = useSearchParams()

  // Initialize from URL params or defaults
  const [portfolioValue, setPortfolioValue] = useState<number>(() => {
    const param = searchParams.get('portfolio')
    return param ? parseInt(param) : 10000
  })

  const [customTarget, setCustomTarget] = useState<number>(() => {
    const param = searchParams.get('target')
    return param ? parseFloat(param) : avgTargetPrice || currentPrice * 1.15
  })

  const [useCustomTarget, setUseCustomTarget] = useState<boolean>(false)

  // Update URL when values change (for shareable results)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('portfolio', portfolioValue.toString())
    params.set('target', customTarget.toFixed(2))

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [portfolioValue, customTarget, searchParams])

  // Calculate potential outcomes
  const calculations = useMemo(() => {
    const targetPrice = useCustomTarget ? customTarget : (avgTargetPrice || currentPrice * 1.15)
    const highTarget = highTargetPrice || targetPrice * 1.2
    const lowTarget = lowTargetPrice || targetPrice * 0.8

    const sharesOwned = portfolioValue / currentPrice

    // Calculate potential values at different targets
    const atAvgTarget = sharesOwned * targetPrice
    const atHighTarget = sharesOwned * highTarget
    const atLowTarget = sharesOwned * lowTarget

    // Calculate gains/losses
    const avgGain = atAvgTarget - portfolioValue
    const avgGainPercent = ((atAvgTarget - portfolioValue) / portfolioValue) * 100

    const highGain = atHighTarget - portfolioValue
    const highGainPercent = ((atHighTarget - portfolioValue) / portfolioValue) * 100

    const lowGain = atLowTarget - portfolioValue
    const lowGainPercent = ((atLowTarget - portfolioValue) / portfolioValue) * 100

    // Scenario data for chart
    const scenarios = [
      {
        name: 'Bear Case',
        target: lowTarget,
        value: atLowTarget,
        gain: lowGain,
        percent: lowGainPercent,
        color: lowGainPercent >= 0 ? '#22c55e' : '#ef4444',
      },
      {
        name: 'Current',
        target: currentPrice,
        value: portfolioValue,
        gain: 0,
        percent: 0,
        color: '#6366f1',
      },
      {
        name: 'Analyst Target',
        target: targetPrice,
        value: atAvgTarget,
        gain: avgGain,
        percent: avgGainPercent,
        color: avgGainPercent >= 0 ? '#10b981' : '#ef4444',
      },
      {
        name: 'Bull Case',
        target: highTarget,
        value: atHighTarget,
        gain: highGain,
        percent: highGainPercent,
        color: '#22c55e',
      },
    ]

    return {
      targetPrice,
      highTarget,
      lowTarget,
      sharesOwned,
      atAvgTarget,
      atHighTarget,
      atLowTarget,
      avgGain,
      avgGainPercent,
      highGain,
      highGainPercent,
      lowGain,
      lowGainPercent,
      scenarios,
    }
  }, [
    portfolioValue,
    currentPrice,
    customTarget,
    useCustomTarget,
    avgTargetPrice,
    highTargetPrice,
    lowTargetPrice,
  ])

  // Share results
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `${ticker} Target Price Calculator: If ${ticker} reaches $${calculations.targetPrice.toFixed(2)}, my $${portfolioValue.toLocaleString()} investment would be worth ${formatCurrency(calculations.atAvgTarget)}!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticker} Target Price Calculator`,
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-lg sm:text-xl">
            What If {ticker} Reaches Target Price?
          </span>
          <button
            onClick={handleShare}
            className="text-sm bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            Share Results
          </button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate your potential gains if {companyName} hits analyst price targets
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Display */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current {ticker} Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Analyst Target</p>
            <p className="text-2xl font-bold text-green-500">
              ${(avgTargetPrice || currentPrice * 1.15).toFixed(2)}
            </p>
            <p className={`text-sm ${calculations.avgGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.avgGainPercent >= 0 ? '+' : ''}
              {((((avgTargetPrice || currentPrice * 1.15) - currentPrice) / currentPrice) * 100).toFixed(1)}%
              upside
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Your Portfolio Value in {ticker}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="250000"
                step="1000"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-500">
                  ${portfolioValue.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({calculations.sharesOwned.toFixed(2)} shares)
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[5000, 10000, 25000, 50000, 100000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPortfolioValue(amount)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      portfolioValue === amount
                        ? 'bg-blue-500 text-white'
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
              Target Price
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setUseCustomTarget(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !useCustomTarget
                      ? 'bg-green-500 text-white'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  Analyst Target
                </button>
                <button
                  onClick={() => setUseCustomTarget(true)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    useCustomTarget
                      ? 'bg-green-500 text-white'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  Custom Target
                </button>
              </div>
              {useCustomTarget && (
                <>
                  <input
                    type="range"
                    min={currentPrice * 0.5}
                    max={currentPrice * 2}
                    step={currentPrice * 0.01}
                    value={customTarget}
                    onChange={(e) => setCustomTarget(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <span className="text-2xl font-bold text-green-500">
                    ${customTarget.toFixed(2)}
                  </span>
                </>
              )}
              {!useCustomTarget && avgTargetPrice && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Wall Street Consensus</p>
                  <p className="text-2xl font-bold text-green-500">${avgTargetPrice.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Bear Case</p>
            <p className="text-lg font-bold">${calculations.lowTarget.toFixed(2)}</p>
            <p className="text-sm font-bold text-red-500">
              {formatCurrency(calculations.atLowTarget)}
            </p>
            <p className={`text-xs ${calculations.lowGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.lowGainPercent >= 0 ? '+' : ''}
              {calculations.lowGainPercent.toFixed(1)}%
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Target Price</p>
            <p className="text-lg font-bold text-green-500">
              ${calculations.targetPrice.toFixed(2)}
            </p>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(calculations.atAvgTarget)}
            </p>
            <p className={`text-sm font-bold ${calculations.avgGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculations.avgGainPercent >= 0 ? '+' : ''}
              {formatCurrency(calculations.avgGain)}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Bull Case</p>
            <p className="text-lg font-bold">${calculations.highTarget.toFixed(2)}</p>
            <p className="text-sm font-bold text-emerald-500">
              {formatCurrency(calculations.atHighTarget)}
            </p>
            <p className="text-xs text-emerald-500">
              +{calculations.highGainPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Visual Comparison Chart */}
        <div className="h-64 sm:h-72">
          <p className="text-sm text-muted-foreground mb-2">Portfolio Value by Scenario</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calculations.scenarios} layout="vertical">
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, _name: string, props: TooltipFormatterProps) => [
                  formatCurrency(value),
                  `At $${props.payload?.target.toFixed(2) || ''}`,
                ]}
              />
              <ReferenceLine
                x={portfolioValue}
                stroke="#6366f1"
                strokeDasharray="3 3"
                label={{
                  value: 'Current',
                  fill: '#6366f1',
                  fontSize: 10,
                  position: 'top',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {calculations.scenarios.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Potential Gains Summary */}
        <div
          className={`p-4 rounded-lg ${
            calculations.avgGainPercent >= 20
              ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30'
              : calculations.avgGainPercent >= 0
              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30'
              : 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">If {ticker} reaches analyst target:</p>
              <p className="text-2xl font-bold">
                Your {formatCurrency(portfolioValue)} becomes{' '}
                <span className="text-green-500">{formatCurrency(calculations.atAvgTarget)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Potential Profit</p>
              <p
                className={`text-3xl font-bold ${
                  calculations.avgGain >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {calculations.avgGain >= 0 ? '+' : ''}
                {formatCurrency(calculations.avgGain)}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Note */}
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Price targets are analyst estimates and not guarantees. Actual
            stock performance may differ significantly. Past analyst accuracy varies. Always
            consider your risk tolerance and do your own research before investing.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
