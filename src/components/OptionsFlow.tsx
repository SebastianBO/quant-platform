"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface OptionsFlowProps {
  ticker: string
}

interface OptionsData {
  calls: OptionContract[]
  puts: OptionContract[]
  summary: {
    totalCallVolume: number
    totalPutVolume: number
    putCallRatio: number
    maxPain: number
    sentiment: string
  }
}

interface OptionContract {
  strike: number
  expiration: string
  volume: number
  openInterest: number
  impliedVolatility: number
  lastPrice: number
  type: 'call' | 'put'
}

export default function OptionsFlow({ ticker }: OptionsFlowProps) {
  const [data, setData] = useState<OptionsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOptionsData()
  }, [ticker])

  const fetchOptionsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/options?ticker=${ticker}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching options data:', error)
    }
    setLoading(false)
  }

  const getSentimentColor = (sentiment: string): string => {
    if (sentiment === 'Bullish') return 'text-emerald-500'
    if (sentiment === 'Bearish') return 'text-red-500'
    return 'text-yellow-500'
  }

  const getSentimentEmoji = (sentiment: string): string => {
    if (sentiment === 'Bullish') return '🐂'
    if (sentiment === 'Bearish') return '🐻'
    return '⚖️'
  }

  // Prepare volume by strike data
  const strikeData = data ? [...data.calls, ...data.puts]
    .reduce((acc: any[], opt) => {
      const existing = acc.find(a => a.strike === opt.strike)
      if (existing) {
        if (opt.type === 'call') {
          existing.callVolume = opt.volume
          existing.callOI = opt.openInterest
        } else {
          existing.putVolume = opt.volume
          existing.putOI = opt.openInterest
        }
      } else {
        acc.push({
          strike: opt.strike,
          callVolume: opt.type === 'call' ? opt.volume : 0,
          putVolume: opt.type === 'put' ? opt.volume : 0,
          callOI: opt.type === 'call' ? opt.openInterest : 0,
          putOI: opt.type === 'put' ? opt.openInterest : 0,
        })
      }
      return acc
    }, [])
    .sort((a, b) => a.strike - b.strike)
    .slice(-15) : []

  // Pie chart data for put/call ratio
  const pieData = data ? [
    { name: 'Calls', value: data.summary.totalCallVolume, color: '#10b981' },
    { name: 'Puts', value: data.summary.totalPutVolume, color: '#ef4444' },
  ] : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Options Flow Analysis - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Call Volume</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {data.summary.totalCallVolume.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Put Volume</p>
                <p className="text-2xl font-bold text-red-500">
                  {data.summary.totalPutVolume.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Put/Call Ratio</p>
                <p className={`text-2xl font-bold ${data.summary.putCallRatio > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {data.summary.putCallRatio.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Max Pain</p>
                <p className="text-2xl font-bold">${data.summary.maxPain}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(data.summary.sentiment)}`}>
                  {getSentimentEmoji(data.summary.sentiment)} {data.summary.sentiment}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Volume by Strike */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Volume by Strike Price</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strikeData}>
                      <XAxis dataKey="strike" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                      />
                      <Bar dataKey="callVolume" name="Call Volume" fill="#10b981" />
                      <Bar dataKey="putVolume" name="Put Volume" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Put/Call Pie */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Put/Call Distribution</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Open Interest by Strike */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Open Interest by Strike</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strikeData} layout="vertical">
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="strike" stroke="hsl(var(--muted-foreground))" width={60} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [value.toLocaleString(), 'OI']}
                    />
                    <Bar dataKey="callOI" name="Call OI" fill="#10b981" />
                    <Bar dataKey="putOI" name="Put OI" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interpretation */}
            <div className={`mt-6 p-4 rounded-lg ${
              data.summary.sentiment === 'Bullish'
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : data.summary.sentiment === 'Bearish'
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-secondary/30 border border-border'
            }`}>
              <p className="font-medium mb-1">Options Flow Interpretation</p>
              <p className="text-sm text-muted-foreground">
                {data.summary.putCallRatio < 0.7
                  ? `Heavy call buying suggests bullish sentiment. The put/call ratio of ${data.summary.putCallRatio.toFixed(2)} indicates traders expect ${ticker} to rise.`
                  : data.summary.putCallRatio > 1.2
                  ? `Elevated put activity signals bearish sentiment. The put/call ratio of ${data.summary.putCallRatio.toFixed(2)} suggests hedging or downside bets.`
                  : `Balanced options activity with a put/call ratio of ${data.summary.putCallRatio.toFixed(2)}. Market is neutral on ${ticker} direction.`
                }
                {data.summary.maxPain > 0 && ` Max pain at $${data.summary.maxPain} may act as a magnet for expiration.`}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No options data available for {ticker}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
