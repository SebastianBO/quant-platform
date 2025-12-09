"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { PieChart as PieIcon, Building2, UserCheck, Users, TrendingUp, TrendingDown, Percent, AlertTriangle } from "lucide-react"

interface OwnershipBreakdownProps {
  ticker: string
}

export default function OwnershipBreakdown({ ticker }: OwnershipBreakdownProps) {
  const [data, setData] = useState<any>(null)
  const [institutionalData, setInstitutionalData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fundResponse, instResponse] = await Promise.all([
        fetch(`/api/fundamentals?ticker=${ticker}`),
        fetch(`/api/institutional?ticker=${ticker}`)
      ])
      const fundResult = await fundResponse.json()
      const instResult = await instResponse.json()
      setData(fundResult)
      setInstitutionalData(instResult)
    } catch (error) {
      console.error('Error fetching ownership data:', error)
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
          Unable to load ownership data for {ticker}
        </CardContent>
      </Card>
    )
  }

  const { sharesStats, institutionalOwnership } = data
  const percentInsiders = sharesStats?.percentInsiders || 0
  const percentInstitutions = sharesStats?.percentInstitutions || 0
  const percentRetail = Math.max(0, 100 - percentInsiders - percentInstitutions)
  const shortPercent = sharesStats?.shortPercentOutstanding || 0

  // Ownership distribution pie chart data
  const ownershipData = [
    { name: 'Institutional', value: percentInstitutions, color: '#3b82f6' },
    { name: 'Insiders', value: percentInsiders, color: '#10b981' },
    { name: 'Retail/Other', value: percentRetail, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

  // Float analysis
  const sharesOutstanding = sharesStats?.sharesOutstanding || 0
  const sharesFloat = sharesStats?.sharesFloat || 0
  const floatPercent = sharesOutstanding > 0 ? (sharesFloat / sharesOutstanding) * 100 : 0

  // Short interest data
  const sharesShort = sharesStats?.sharesShort || 0
  const shortRatio = sharesStats?.shortRatio || 0

  // Institutional holders breakdown
  const topHolders = institutionalOwnership?.topHolders?.slice(0, 10) || institutionalData?.holders?.slice(0, 10) || []

  // Calculate institutional activity
  const increased = institutionalData?.increased || []
  const decreased = institutionalData?.decreased || []
  const newPositions = institutionalData?.newPositions || []

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-emerald-500" />
            Ownership Breakdown - {ticker}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Institutional */}
            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Institutional</span>
              </div>
              <p className="text-3xl font-bold text-blue-500">{percentInstitutions.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">of shares</p>
            </div>

            {/* Insiders */}
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Insiders</span>
              </div>
              <p className="text-3xl font-bold text-emerald-500">{percentInsiders.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">of shares</p>
            </div>

            {/* Retail */}
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Retail/Other</span>
              </div>
              <p className="text-3xl font-bold text-purple-500">{percentRetail.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">of shares</p>
            </div>

            {/* Short Interest */}
            <div className={`p-4 rounded-xl border ${shortPercent > 10 ? 'bg-red-500/10 border-red-500/30' : 'bg-secondary/50 border-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-5 h-5 ${shortPercent > 10 ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className="text-sm text-muted-foreground">Short Interest</span>
              </div>
              <p className={`text-3xl font-bold ${shortPercent > 10 ? 'text-red-500' : shortPercent > 5 ? 'text-yellow-500' : 'text-foreground'}`}>
                {shortPercent.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">of float</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ownership Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ownership Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownershipData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {ownershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Ownership']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Float Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Share Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Shares Outstanding */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shares Outstanding</span>
                  <span className="font-bold">{(sharesOutstanding / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              {/* Shares Float */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Float</span>
                  <span className="font-bold">{(sharesFloat / 1000000).toFixed(2)}M</span>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${floatPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{floatPercent.toFixed(1)}% of outstanding</p>
                </div>
              </div>

              {/* Short Interest */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shares Short</span>
                  <span className="font-bold">{(sharesShort / 1000000).toFixed(2)}M</span>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${shortPercent > 10 ? 'bg-red-500' : shortPercent > 5 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(shortPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{shortPercent.toFixed(1)}% of float</span>
                    <span>Days to Cover: {shortRatio.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutional Activity */}
      {(increased.length > 0 || decreased.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Institutional Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-center">
                <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-500">{increased.length}</p>
                <p className="text-sm text-muted-foreground">Increased Positions</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
                <TrendingDown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">{decreased.length}</p>
                <p className="text-sm text-muted-foreground">Decreased Positions</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
                <Building2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-500">{newPositions.length}</p>
                <p className="text-sm text-muted-foreground">New Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Holders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Institutional Holders</CardTitle>
        </CardHeader>
        <CardContent>
          {topHolders.length > 0 ? (
            <div className="space-y-3">
              {topHolders.map((holder: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium">{holder.investor_name || holder.name}</p>
                      <p className="text-sm text-muted-foreground">{holder.investor_type || 'Institutional'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{((holder.shares || holder.shares_held || 0) / 1000000).toFixed(2)}M shares</p>
                    <p className="text-sm text-muted-foreground">
                      {holder.ownership_percent ? `${holder.ownership_percent.toFixed(2)}%` : ''}
                      {holder.value && ` • $${(holder.value / 1000000).toFixed(0)}M`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No institutional holder data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ownership Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ownership Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institutional Sentiment */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Institutional Sentiment</h4>
              <p className="text-sm text-muted-foreground">
                {percentInstitutions > 70
                  ? 'High institutional ownership indicates strong institutional confidence. These stocks tend to be more stable but may have limited retail participation.'
                  : percentInstitutions > 40
                    ? 'Moderate institutional ownership provides a balance between institutional backing and retail flexibility.'
                    : 'Low institutional ownership may indicate either a newer company or one that institutions have overlooked. Higher volatility possible.'
                }
              </p>
            </div>

            {/* Insider Confidence */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Insider Confidence</h4>
              <p className="text-sm text-muted-foreground">
                {percentInsiders > 20
                  ? 'High insider ownership suggests management has significant skin in the game, aligning their interests with shareholders.'
                  : percentInsiders > 5
                    ? 'Moderate insider ownership provides reasonable management alignment without excessive control concentration.'
                    : 'Low insider ownership may suggest management has less direct financial stake in share performance.'
                }
              </p>
            </div>

            {/* Short Interest Analysis */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Short Interest Analysis</h4>
              <p className="text-sm text-muted-foreground">
                {shortPercent > 20
                  ? 'Very high short interest indicates significant bearish sentiment. Potential for short squeeze but also indicates concerns about the stock.'
                  : shortPercent > 10
                    ? 'Elevated short interest suggests notable bearish bets. Monitor for potential short squeeze scenarios.'
                    : shortPercent > 5
                      ? 'Moderate short interest is normal for many stocks and doesn\'t necessarily indicate major concerns.'
                      : 'Low short interest suggests limited bearish sentiment among professional traders.'
                }
              </p>
            </div>

            {/* Float Analysis */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Float Analysis</h4>
              <p className="text-sm text-muted-foreground">
                {floatPercent < 50
                  ? 'Low float stocks can experience higher volatility as there are fewer shares available for trading.'
                  : floatPercent < 80
                    ? 'Moderate float provides reasonable liquidity while maintaining some price stability from locked shares.'
                    : 'High float percentage means most shares are available for trading, typically resulting in better liquidity.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
