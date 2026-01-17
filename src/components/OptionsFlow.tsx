"use client"

import { useState, useEffect, useMemo, memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { AlertTriangle, Calendar, TrendingUp, TrendingDown, Activity, Target } from "lucide-react"

interface OptionsFlowProps {
  ticker: string
}

interface UnusualActivity {
  strike: number
  type: string
  volume: number
  openInterest: number
  ratio: string
}

interface ExpectedMove {
  amount: number
  percent: number
  high: number
  low: number
  daysToExpiration: number
  atmStrike: number
  atmCallPrice: number
  atmPutPrice: number
}

interface IVData {
  atm: number
  rank: number
  percentile: number
  min: number
  max: number
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
    expirationDate?: string
    currentPrice?: number
    unusualActivity?: UnusualActivity[]
    expectedMove?: ExpectedMove
    iv?: IVData
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

interface StrikeData {
  strike: number
  callVolume: number
  putVolume: number
  callOI: number
  putOI: number
}

function OptionsFlowComponent({ ticker }: OptionsFlowProps) {
  const [data, setData] = useState<OptionsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOptionsData()
  }, [ticker])

  const fetchOptionsData = async () => {
    setLoading(true)
    try {
      // Request 'flow' format for simplified data structure
      const response = await fetch(`/api/options?ticker=${ticker}&format=flow`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching options data:', error)
    }
    setLoading(false)
  }

  const getSentimentColor = (sentiment: string): string => {
    if (sentiment === 'Bullish') return 'text-[#4ebe96]'
    if (sentiment === 'Bearish') return 'text-[#ff5c5c]'
    return 'text-yellow-500'
  }

  const getSentimentEmoji = (sentiment: string): string => {
    if (sentiment === 'Bullish') return '🐂'
    if (sentiment === 'Bearish') return '🐻'
    return '⚖️'
  }

  const formatExpiration = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Calculate days until expiration
  const getDaysUntilExpiration = (dateStr: string) => {
    if (!dateStr) return 0
    const today = new Date()
    const expDate = new Date(dateStr)
    const diffTime = expDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Prepare volume by strike data - memoized for performance
  const strikeData = useMemo(() => {
    if (!data) return []
    const safeCalls = data.calls && Array.isArray(data.calls) ? data.calls : []
    const safePuts = data.puts && Array.isArray(data.puts) ? data.puts : []
    return [...safeCalls, ...safePuts]
      .reduce((acc: StrikeData[], opt) => {
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
      .slice(-15)
  }, [data])

  // Pie chart data for put/call ratio - memoized
  const pieData = useMemo(() => {
    if (!data?.summary) return []
    return [
      { name: 'Calls', value: data.summary.totalCallVolume || 0, color: '#4ebe96' },
      { name: 'Puts', value: data.summary.totalPutVolume || 0, color: '#ff5c5c' },
    ]
  }, [data?.summary])

  const daysUntilExp = data?.summary?.expirationDate ? getDaysUntilExpiration(data.summary.expirationDate) : 0

  return (
    <Card className="w-full bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Options Flow - {ticker}
          </CardTitle>
          {data?.summary?.expirationDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#868f97]" />
              <span className="text-[#868f97]">Exp:</span>
              <span className="font-medium">{formatExpiration(data.summary.expirationDate)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ${
                daysUntilExp <= 2 ? 'bg-[#ff5c5c]/20 text-[#ff5c5c]' :
                daysUntilExp <= 7 ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-white/[0.05] text-[#868f97]'
              }`}>
                {daysUntilExp}d
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
          </div>
        ) : data?.summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-[#4ebe96]/10 border border-[#4ebe96]/30 rounded-2xl text-center">
                <p className="text-[#868f97] text-sm">Call Volume</p>
                <p className="text-2xl font-bold text-[#4ebe96] tabular-nums">
                  {(data.summary.totalCallVolume || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#ff5c5c]/10 border border-[#ff5c5c]/30 rounded-2xl text-center">
                <p className="text-[#868f97] text-sm">Put Volume</p>
                <p className="text-2xl font-bold text-[#ff5c5c] tabular-nums">
                  {(data.summary.totalPutVolume || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white/[0.05] rounded-2xl text-center">
                <p className="text-[#868f97] text-sm">Put/Call Ratio</p>
                <p className={`text-2xl font-bold tabular-nums ${(data.summary.putCallRatio || 0) > 1 ? 'text-[#ff5c5c]' : 'text-[#4ebe96]'}`}>
                  {(data.summary.putCallRatio || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-white/[0.05] rounded-2xl text-center">
                <p className="text-[#868f97] text-sm">Max Pain</p>
                <p className="text-2xl font-bold tabular-nums">${data.summary.maxPain || 0}</p>
              </div>
              <div className="p-4 bg-white/[0.05] rounded-2xl text-center">
                <p className="text-[#868f97] text-sm">Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(data.summary.sentiment || 'Neutral')}`}>
                  {getSentimentEmoji(data.summary.sentiment || 'Neutral')} {data.summary.sentiment || 'Neutral'}
                </p>
              </div>
            </div>

            {/* Expected Move & IV Section */}
            {data.summary.expectedMove && data.summary.iv && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Expected Move Card */}
                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-[#479ffa]/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-purple-400">Expected Move</h3>
                    <span className="ml-auto text-xs text-[#868f97]">
                      {data.summary.expectedMove.daysToExpiration}d to exp
                    </span>
                  </div>

                  {/* Price Range Visualization */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#ff5c5c] tabular-nums">${data.summary.expectedMove.low.toFixed(2)}</span>
                      <span className="font-bold text-lg tabular-nums">${data.summary.currentPrice?.toFixed(2)}</span>
                      <span className="text-[#4ebe96] tabular-nums">${data.summary.expectedMove.high.toFixed(2)}</span>
                    </div>
                    <div className="relative h-3 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 right-0 flex">
                        <div className="flex-1 bg-[#ff5c5c]/30" />
                        <div className="w-1 bg-white" />
                        <div className="flex-1 bg-[#4ebe96]/30" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-[#868f97] mt-1">
                      <span className="tabular-nums">-{data.summary.expectedMove.percent.toFixed(1)}%</span>
                      <span>Current</span>
                      <span className="tabular-nums">+{data.summary.expectedMove.percent.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Straddle Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 bg-white/[0.05] rounded-2xl">
                      <p className="text-[#868f97] text-xs">ATM Strike</p>
                      <p className="font-bold tabular-nums">${data.summary.expectedMove.atmStrike}</p>
                    </div>
                    <div className="p-2 bg-[#4ebe96]/10 rounded-2xl">
                      <p className="text-[#868f97] text-xs">Call</p>
                      <p className="font-bold text-[#4ebe96] tabular-nums">${data.summary.expectedMove.atmCallPrice.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-[#ff5c5c]/10 rounded-2xl">
                      <p className="text-[#868f97] text-xs">Put</p>
                      <p className="font-bold text-[#ff5c5c] tabular-nums">${data.summary.expectedMove.atmPutPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-white/[0.05] rounded-2xl text-xs text-[#868f97]">
                    Market expects <span className="font-bold text-white tabular-nums">±${data.summary.expectedMove.amount.toFixed(2)}</span> (<span className="tabular-nums">{data.summary.expectedMove.percent.toFixed(1)}%</span>) move by expiration
                  </div>
                </div>

                {/* IV Rank Card */}
                <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-amber-400">Implied Volatility</h3>
                  </div>

                  {/* IV Rank Gauge */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold tabular-nums">{data.summary.iv.atm.toFixed(1)}%</p>
                      <p className="text-xs text-[#868f97]">ATM IV</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-[#868f97] mb-1">
                        <span>IV Rank</span>
                        <span className={`font-bold tabular-nums ${
                          data.summary.iv.rank > 70 ? 'text-[#ff5c5c]' :
                          data.summary.iv.rank < 30 ? 'text-[#4ebe96]' :
                          'text-amber-500'
                        }`}>
                          {data.summary.iv.rank.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full motion-safe:transition-all motion-safe:duration-150 ease-out ${
                            data.summary.iv.rank > 70 ? 'bg-[#ff5c5c]' :
                            data.summary.iv.rank < 30 ? 'bg-[#4ebe96]' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, data.summary.iv.rank)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#868f97] mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  {/* IV Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="p-2 bg-white/[0.05] rounded-2xl">
                      <p className="text-[#868f97] text-xs">IV Range Low</p>
                      <p className="font-bold tabular-nums">{data.summary.iv.min.toFixed(1)}%</p>
                    </div>
                    <div className="p-2 bg-white/[0.05] rounded-2xl">
                      <p className="text-[#868f97] text-xs">IV Range High</p>
                      <p className="font-bold tabular-nums">{data.summary.iv.max.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className={`mt-3 p-2 rounded-2xl text-xs ${
                    data.summary.iv.rank > 70 ? 'bg-[#ff5c5c]/10 text-[#ff5c5c]' :
                    data.summary.iv.rank < 30 ? 'bg-[#4ebe96]/10 text-[#4ebe96]' :
                    'bg-white/[0.05] text-[#868f97]'
                  }`}>
                    {data.summary.iv.rank > 70
                      ? '⚠️ High IV - Options are expensive. Consider selling strategies.'
                      : data.summary.iv.rank < 30
                      ? '✅ Low IV - Options are cheap. Good for buying strategies.'
                      : '📊 Normal IV levels. Both buying and selling can work.'}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Volume by Strike */}
              <div>
                <p className="text-sm text-[#868f97] mb-2">Volume by Strike Price</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strikeData}>
                      <XAxis
                        dataKey="strike"
                        stroke="currentColor"
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        tickLine={{ stroke: 'currentColor' }}
                        className="text-[#868f97]"
                      />
                      <YAxis
                        stroke="currentColor"
                        tick={{ fill: 'currentColor' }}
                        tickLine={{ stroke: 'currentColor' }}
                        className="text-[#868f97]"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          color: 'white'
                        }}
                        labelStyle={{ color: 'white' }}
                        formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                      />
                      <Bar dataKey="callVolume" name="Call Volume" fill="#4ebe96" />
                      <Bar dataKey="putVolume" name="Put Volume" fill="#ff5c5c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Put/Call Pie */}
              <div>
                <p className="text-sm text-[#868f97] mb-2">Put/Call Distribution</p>
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
                        labelLine={{ stroke: '#868f97' }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          color: 'white'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Open Interest by Strike */}
            <div className="mb-6">
              <p className="text-sm text-[#868f97] mb-2">Open Interest by Strike</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strikeData} layout="vertical">
                    <XAxis
                      type="number"
                      stroke="currentColor"
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      className="text-[#868f97]"
                    />
                    <YAxis
                      type="category"
                      dataKey="strike"
                      stroke="currentColor"
                      tick={{ fontSize: 10, fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      width={60}
                      className="text-[#868f97]"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        color: 'white'
                      }}
                      formatter={(value: number) => [value.toLocaleString(), 'OI']}
                    />
                    <Bar dataKey="callOI" name="Call OI" fill="#4ebe96" />
                    <Bar dataKey="putOI" name="Put OI" fill="#ff5c5c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Unusual Activity Section */}
            {data.summary.unusualActivity && data.summary.unusualActivity.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <p className="font-medium text-yellow-500">Unusual Options Activity</p>
                </div>
                <div className="space-y-2">
                  {data.summary.unusualActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/[0.05] rounded-2xl text-sm">
                      <div className="flex items-center gap-2">
                        {activity.type === 'call' ? (
                          <TrendingUp className="w-4 h-4 text-[#4ebe96]" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-[#ff5c5c]" />
                        )}
                        <span className={activity.type === 'call' ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}>
                          {activity.type.toUpperCase()}
                        </span>
                        <span className="font-medium tabular-nums">${activity.strike}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[#868f97]">
                        <span>Vol: <span className="text-white font-medium tabular-nums">{activity.volume.toLocaleString()}</span></span>
                        <span>OI: <span className="text-white tabular-nums">{activity.openInterest.toLocaleString()}</span></span>
                        <span className="text-yellow-500 font-medium">{activity.ratio}x OI</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interpretation */}
            <div className={`p-4 rounded-2xl ${
              (data.summary.sentiment || 'Neutral') === 'Bullish'
                ? 'bg-[#4ebe96]/10 border border-[#4ebe96]/30'
                : (data.summary.sentiment || 'Neutral') === 'Bearish'
                ? 'bg-[#ff5c5c]/10 border border-[#ff5c5c]/30'
                : 'bg-white/[0.05] border border-white/[0.08]'
            }`}>
              <p className="font-medium mb-1">Options Flow Interpretation</p>
              <p className="text-sm text-[#868f97]">
                {(data.summary.putCallRatio || 0) < 0.7
                  ? `Heavy call buying suggests bullish sentiment. The put/call ratio of ${(data.summary.putCallRatio || 0).toFixed(2)} indicates traders expect ${ticker} to rise.`
                  : (data.summary.putCallRatio || 0) > 1.2
                  ? `Elevated put activity signals bearish sentiment. The put/call ratio of ${(data.summary.putCallRatio || 0).toFixed(2)} suggests hedging or downside bets.`
                  : `Balanced options activity with a put/call ratio of ${(data.summary.putCallRatio || 0).toFixed(2)}. Market is neutral on ${ticker} direction.`
                }
                {(data.summary.maxPain || 0) > 0 && ` Max pain at $${data.summary.maxPain} may act as a magnet for expiration.`}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-[#868f97]">
            No options data available for {ticker}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Memoize to prevent unnecessary re-renders when parent components update
export default memo(OptionsFlowComponent)
