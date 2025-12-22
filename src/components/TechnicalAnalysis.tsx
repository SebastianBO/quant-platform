"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, PieChart, Pie } from "recharts"

interface TechnicalAnalysisProps {
  ticker: string
  currentPrice: number
}

export default function TechnicalAnalysis({ ticker, currentPrice }: TechnicalAnalysisProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fundamentals?ticker=${ticker}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12 text-muted-foreground">
          Unable to load technical data for {ticker}
        </CardContent>
      </Card>
    )
  }

  const { technicals, valuation, highlights, analystRatings, riskMetrics, qualityScores, priceHistory, institutionalOwnership } = data

  // Calculate price position in 52-week range
  const fiftyTwoWeekRange = technicals?.fiftyTwoWeekHigh - technicals?.fiftyTwoWeekLow || 1
  const pricePositionPct = ((currentPrice - technicals?.fiftyTwoWeekLow) / fiftyTwoWeekRange) * 100

  // MA signals
  const aboveFiftyMA = currentPrice > (technicals?.fiftyDayMA || 0)
  const aboveTwoHundredMA = currentPrice > (technicals?.twoHundredDayMA || 0)
  const goldenCross = (technicals?.fiftyDayMA || 0) > (technicals?.twoHundredDayMA || 0)

  // Analyst rating distribution for pie chart
  const ratingData = analystRatings ? [
    { name: 'Strong Buy', value: analystRatings.strongBuy, color: '#10b981' },
    { name: 'Buy', value: analystRatings.buy, color: '#6ee7b7' },
    { name: 'Hold', value: analystRatings.hold, color: '#fbbf24' },
    { name: 'Sell', value: analystRatings.sell, color: '#f97316' },
    { name: 'Strong Sell', value: analystRatings.strongSell, color: '#ef4444' },
  ].filter(d => d.value > 0) : []

  // Price upside/downside
  const targetPrice = analystRatings?.targetPrice || currentPrice
  const upside = ((targetPrice - currentPrice) / currentPrice) * 100

  return (
    <div className="space-y-6">
      {/* Technical Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="text-2xl">📈</span>
            Technical Analysis - {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
            <MetricCard label="Beta" value={technicals?.beta?.toFixed(2)} highlight={technicals?.beta > 1.2 || technicals?.beta < 0.8} />
            <MetricCard label="52W High" value={`$${technicals?.fiftyTwoWeekHigh?.toFixed(2)}`} />
            <MetricCard label="52W Low" value={`$${technicals?.fiftyTwoWeekLow?.toFixed(2)}`} />
            <MetricCard label="50D MA" value={`$${technicals?.fiftyDayMA?.toFixed(2)}`} highlight={aboveFiftyMA} positive={aboveFiftyMA} />
            <MetricCard label="200D MA" value={`$${technicals?.twoHundredDayMA?.toFixed(2)}`} highlight={aboveTwoHundredMA} positive={aboveTwoHundredMA} />
            <MetricCard label="Short Interest" value={formatPercent(technicals?.shortPercent || 0)} highlight={(technicals?.shortPercent || 0) > 0.1} />
          </div>

          {/* 52-Week Price Position */}
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">52-Week Price Range</p>
            <div className="relative h-8 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 opacity-30"
                style={{ width: '100%' }}
              />
              <div
                className="absolute h-full w-1 bg-foreground"
                style={{ left: `${Math.min(100, Math.max(0, pricePositionPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>${technicals?.fiftyTwoWeekLow?.toFixed(2)}</span>
              <span className="font-bold text-foreground">${currentPrice.toFixed(2)} ({pricePositionPct.toFixed(0)}%)</span>
              <span>${technicals?.fiftyTwoWeekHigh?.toFixed(2)}</span>
            </div>
          </div>

          {/* MA Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <SignalCard
              label="50 Day MA"
              signal={aboveFiftyMA ? 'Above' : 'Below'}
              positive={aboveFiftyMA}
              detail={`Price is ${aboveFiftyMA ? 'above' : 'below'} the 50-day moving average`}
            />
            <SignalCard
              label="200 Day MA"
              signal={aboveTwoHundredMA ? 'Above' : 'Below'}
              positive={aboveTwoHundredMA}
              detail={`Price is ${aboveTwoHundredMA ? 'above' : 'below'} the 200-day moving average`}
            />
            <SignalCard
              label="MA Cross"
              signal={goldenCross ? 'Golden Cross' : 'Death Cross'}
              positive={goldenCross}
              detail={goldenCross ? '50 MA > 200 MA (bullish)' : '50 MA < 200 MA (bearish)'}
            />
          </div>

          {/* Short Interest */}
          {technicals?.sharesShort && (
            <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg mb-6">
              <p className="font-medium mb-2 text-sm sm:text-base">Short Interest Analysis</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground">Shares Short</p>
                  <p className="font-bold">{(technicals.sharesShort / 1e6).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Short Ratio</p>
                  <p className="font-bold">{technicals.shortRatio?.toFixed(2)} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Short % of Float</p>
                  <p className={`font-bold ${(technicals.shortPercent || 0) > 0.1 ? 'text-red-500' : ''}`}>
                    {formatPercent(technicals.shortPercent || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">MoM Change</p>
                  <p className={`font-bold ${technicals.sharesShort < technicals.sharesShortPriorMonth ? 'text-emerald-500' : 'text-red-500'}`}>
                    {technicals.sharesShort < technicals.sharesShortPriorMonth ? 'Decreasing' : 'Increasing'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyst Ratings & Price Target */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <span className="text-2xl">🎯</span>
            Analyst Ratings & Price Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">Analyst Recommendation Distribution</p>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ratingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-2">
                <p className="text-muted-foreground text-xs sm:text-sm">{analystRatings?.totalAnalysts} Analysts</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {analystRatings?.rating?.toFixed(2)} / 5
                </p>
              </div>
            </div>

            {/* Price Target */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">Price Target Analysis</p>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg border border-emerald-500/30 text-center">
                  <p className="text-muted-foreground text-xs sm:text-sm">Wall Street Target Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-500">${targetPrice.toFixed(2)}</p>
                  <p className={`text-base sm:text-lg ${upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% {upside >= 0 ? 'Upside' : 'Downside'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">Current Price</p>
                    <p className="font-bold text-sm sm:text-base">${currentPrice.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs">To Target</p>
                    <p className={`font-bold text-sm sm:text-base ${upside >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${Math.abs(targetPrice - currentPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics & Quality Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-2xl">⚠️</span>
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <RiskMetric
                label="Annualized Volatility"
                value={riskMetrics?.volatility ? formatPercent(riskMetrics.volatility) : 'N/A'}
                interpretation={riskMetrics?.volatility > 0.4 ? 'High Risk' : riskMetrics?.volatility > 0.2 ? 'Moderate' : 'Low Risk'}
                color={riskMetrics?.volatility > 0.4 ? 'text-red-400' : riskMetrics?.volatility > 0.2 ? 'text-yellow-400' : 'text-emerald-400'}
              />
              <RiskMetric
                label="Sharpe Ratio"
                value={riskMetrics?.sharpeRatio?.toFixed(2) || 'N/A'}
                interpretation={riskMetrics?.sharpeRatio > 1 ? 'Good Risk-Adjusted Returns' : riskMetrics?.sharpeRatio > 0 ? 'Positive' : 'Negative'}
                color={riskMetrics?.sharpeRatio > 1 ? 'text-emerald-400' : riskMetrics?.sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'}
              />
              <RiskMetric
                label="Max Drawdown"
                value={riskMetrics?.maxDrawdown ? formatPercent(riskMetrics.maxDrawdown) : 'N/A'}
                interpretation={riskMetrics?.maxDrawdown > 0.3 ? 'Significant Drawdown' : riskMetrics?.maxDrawdown > 0.15 ? 'Moderate' : 'Low Drawdown'}
                color={riskMetrics?.maxDrawdown > 0.3 ? 'text-red-400' : riskMetrics?.maxDrawdown > 0.15 ? 'text-yellow-400' : 'text-emerald-400'}
              />
              <RiskMetric
                label="Beta"
                value={technicals?.beta?.toFixed(2) || 'N/A'}
                interpretation={technicals?.beta > 1.2 ? 'High Market Sensitivity' : technicals?.beta > 0.8 ? 'Market Correlated' : 'Defensive'}
                color={technicals?.beta > 1.2 ? 'text-yellow-400' : technicals?.beta < 0.8 ? 'text-blue-400' : 'text-zinc-400'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quality Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-2xl">✅</span>
              Quality Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Piotroski F-Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm sm:text-base">Piotroski F-Score</p>
                  <p className={`text-xl sm:text-2xl font-bold ${
                    qualityScores?.piotroskiFScore >= 7 ? 'text-emerald-500' :
                    qualityScores?.piotroskiFScore >= 4 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {qualityScores?.piotroskiFScore || 0}/9
                  </p>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      qualityScores?.piotroskiFScore >= 7 ? 'bg-emerald-500' :
                      qualityScores?.piotroskiFScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${((qualityScores?.piotroskiFScore || 0) / 9) * 100}%` }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{qualityScores?.piotroskiInterpretation || 'Unknown'} Financial Health</p>
              </div>

              {/* Altman Z-Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm sm:text-base">Altman Z-Score</p>
                  <p className={`text-xl sm:text-2xl font-bold ${
                    qualityScores?.altmanInterpretation === 'Safe' ? 'text-emerald-500' :
                    qualityScores?.altmanInterpretation === 'Grey Zone' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {qualityScores?.altmanZScore?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <p className={`text-xs sm:text-sm ${
                  qualityScores?.altmanInterpretation === 'Safe' ? 'text-emerald-500' :
                  qualityScores?.altmanInterpretation === 'Grey Zone' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {qualityScores?.altmanInterpretation === 'Safe' ? 'Low Bankruptcy Risk' :
                   qualityScores?.altmanInterpretation === 'Grey Zone' ? 'Moderate Risk - Monitor' : 'High Bankruptcy Risk'}
                </p>
              </div>

              {/* Interpretation */}
              <div className="p-3 sm:p-4 bg-secondary/30 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {qualityScores?.piotroskiFScore >= 7 && qualityScores?.altmanInterpretation === 'Safe'
                    ? `${ticker} shows strong fundamental quality with low financial distress risk.`
                    : qualityScores?.piotroskiFScore >= 4
                    ? `${ticker} has average financial quality. Monitor key metrics closely.`
                    : `${ticker} shows some financial weakness. Exercise caution.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutional Ownership */}
      {institutionalOwnership?.topHolders?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-2xl">🏛️</span>
              Top Institutional Holders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-xs">Total Institutional Value</p>
                <p className="font-bold text-emerald-500 text-sm sm:text-base">{formatCurrency(institutionalOwnership.totalValue)}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-xs">Total Shares Held</p>
                <p className="font-bold text-sm sm:text-base">{(institutionalOwnership.totalShares / 1e6).toFixed(2)}M</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-xs">Number of Holders</p>
                <p className="font-bold text-sm sm:text-base">{institutionalOwnership.topHolders.length}+</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-xs">Avg Position</p>
                <p className="font-bold text-sm sm:text-base">{formatCurrency(institutionalOwnership.totalValue / institutionalOwnership.topHolders.length)}</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left">Investor</th>
                    <th className="p-2 text-right">Shares</th>
                    <th className="p-2 text-right">Value</th>
                    <th className="p-2 text-right hidden sm:table-cell">Report Date</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionalOwnership.topHolders.slice(0, 10).map((holder: any, i: number) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2 font-medium">{holder.investor?.replace(/_/g, ' ')}</td>
                      <td className="p-2 text-right">{(holder.shares / 1e6).toFixed(2)}M</td>
                      <td className="p-2 text-right text-emerald-500">{formatCurrency(holder.market_value)}</td>
                      <td className="p-2 text-right text-muted-foreground hidden sm:table-cell">{holder.report_period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ label, value, highlight, positive }: { label: string; value: string | undefined; highlight?: boolean; positive?: boolean }) {
  return (
    <div className={`p-2 sm:p-3 rounded-lg text-center ${highlight ? (positive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30') : 'bg-secondary/50'}`}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`font-bold text-sm sm:text-base ${highlight ? (positive ? 'text-emerald-500' : 'text-red-500') : ''}`}>{value || 'N/A'}</p>
    </div>
  )
}

function SignalCard({ label, signal, positive, detail }: { label: string; signal: string; positive: boolean; detail: string }) {
  return (
    <div className={`p-3 sm:p-4 rounded-lg ${positive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
      <p className="text-muted-foreground text-xs sm:text-sm">{label}</p>
      <p className={`text-lg sm:text-xl font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
        {positive ? '🟢' : '🔴'} {signal}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{detail}</p>
    </div>
  )
}

function RiskMetric({ label, value, interpretation, color }: { label: string; value: string; interpretation: string; color: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-secondary/30 rounded-lg gap-2">
      <div>
        <p className="font-medium text-sm sm:text-base">{label}</p>
        <p className={`text-xs sm:text-sm ${color}`}>{interpretation}</p>
      </div>
      <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
