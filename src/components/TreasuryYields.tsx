"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts"

interface TreasuryData {
  yieldCurve: { maturity: string; yield: number; name: string }[]
  history: { date: string; y2: number; y10: number; spread: number }[]
  inverted: boolean
  spread: number
}

export default function TreasuryYields() {
  const [data, setData] = useState<TreasuryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTreasuryData()
  }, [])

  const fetchTreasuryData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/treasury')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching treasury data:', error)
    }
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          Treasury Yields & Yield Curve
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg text-center ${data.inverted ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                <p className="text-muted-foreground text-sm">Yield Curve</p>
                <p className={`text-2xl font-bold ${data.inverted ? 'text-red-500' : 'text-emerald-500'}`}>
                  {data.inverted ? '⚠️ Inverted' : '✅ Normal'}
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">2Y-10Y Spread</p>
                <p className={`text-2xl font-bold ${data.spread < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {data.spread > 0 ? '+' : ''}{(data.spread * 100).toFixed(0)} bps
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">2Y Yield</p>
                <p className="text-2xl font-bold">
                  {(data.yieldCurve.find(y => y.maturity === '2Y')?.yield || 0).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-muted-foreground text-sm">10Y Yield</p>
                <p className="text-2xl font-bold">
                  {(data.yieldCurve.find(y => y.maturity === '10Y')?.yield || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Yield Curve Chart */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Current Treasury Yield Curve</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.yieldCurve}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Yield']}
                    />
                    <Area
                      type="monotone"
                      dataKey="yield"
                      stroke={data.inverted ? '#ef4444' : '#10b981'}
                      fill={data.inverted ? '#ef4444' : '#10b981'}
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historical Spread */}
            {data.history.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">2Y-10Y Spread History</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history}>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v * 100).toFixed(0)}bp`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [`${(value * 100).toFixed(0)} bps`, 'Spread']}
                      />
                      <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="spread"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Interpretation */}
            <div className={`p-4 rounded-lg ${data.inverted ? 'bg-red-500/10 border border-red-500/30' : 'bg-secondary/30 border border-border'}`}>
              <p className="font-medium mb-1">Yield Curve Analysis</p>
              <p className="text-sm text-muted-foreground">
                {data.inverted
                  ? 'The yield curve is inverted (2Y yield > 10Y yield). Historically, an inverted yield curve has preceded recessions by 6-18 months. Consider defensive positioning.'
                  : data.spread < 0.005
                  ? 'The yield curve is nearly flat, suggesting economic uncertainty. Markets are pricing in slower growth or potential Fed rate cuts.'
                  : 'A normal upward-sloping yield curve indicates healthy economic expectations. Longer maturities offer higher yields to compensate for duration risk.'
                }
              </p>
            </div>

            {/* Yield Table */}
            <div className="mt-6 overflow-x-auto">
              <p className="text-sm text-muted-foreground mb-2">Current Yields by Maturity</p>
              <div className="flex gap-2 flex-wrap">
                {data.yieldCurve.map((item, i) => (
                  <div key={i} className="p-3 bg-secondary/30 rounded-lg text-center min-w-20">
                    <p className="text-muted-foreground text-xs">{item.name}</p>
                    <p className="font-bold">{item.yield.toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load treasury data
          </div>
        )}
      </CardContent>
    </Card>
  )
}
