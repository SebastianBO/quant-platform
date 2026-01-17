"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

interface IPAsset {
  name: string
  type: 'patent' | 'trademark' | 'trade_secret' | 'technology'
  segment: string
  value: number
  royaltyRate: number
  attributionPct: number
}

interface IPValuationProps {
  ticker: string
  marketCap: number
  revenue: number
  segments: { name: string; revenue: number }[]
}

const COLORS = ['#4ebe96', '#479ffa', '#f4a623', '#e15241', '#8b5cf6', '#06b6d4']

// Industry royalty rates (based on standard licensing rates)
const ROYALTY_RATES: Record<string, number> = {
  'Technology': 0.05,
  'Software': 0.15,
  'Semiconductor': 0.04,
  'Pharmaceutical': 0.08,
  'Consumer Electronics': 0.03,
  'Services': 0.02,
  'Default': 0.05
}

export default function IPValuation({ ticker, marketCap, revenue, segments }: IPValuationProps) {
  const [ipAssets, setIpAssets] = useState<IPAsset[]>([])
  const [totalIPValue, setTotalIPValue] = useState(0)
  const [fairValuePerShare, setFairValuePerShare] = useState(0)

  useEffect(() => {
    calculateIPValuation()
  }, [segments, revenue, marketCap])

  const calculateIPValuation = () => {
    if (!segments || segments.length === 0) return

    // Discover IP assets from segments using Relief from Royalty method
    const discoveredAssets: IPAsset[] = segments.map((segment, index) => {
      const segmentType = detectSegmentType(segment.name)
      const royaltyRate = ROYALTY_RATES[segmentType] || ROYALTY_RATES['Default']

      // Calculate IP value using Relief from Royalty
      // Value = Revenue × Royalty Rate × (1 - Tax Rate) × Present Value Factor
      const taxRate = 0.21 // Assumed corporate tax rate
      const discountRate = 0.10 // WACC assumption
      const remainingLife = 15 // Years of IP protection

      // Present value of royalty stream
      const pvFactor = (1 - Math.pow(1 + discountRate, -remainingLife)) / discountRate
      const ipValue = segment.revenue * royaltyRate * (1 - taxRate) * pvFactor

      return {
        name: `${segment.name} IP Portfolio`,
        type: detectIPType(segment.name),
        segment: segment.name,
        value: ipValue,
        royaltyRate: royaltyRate,
        attributionPct: segment.revenue / revenue
      }
    })

    setIpAssets(discoveredAssets)

    const total = discoveredAssets.reduce((sum, asset) => sum + asset.value, 0)
    setTotalIPValue(total)

    // Calculate fair value per share
    // Assuming shares = marketCap / currentPrice (simplified)
    const estimatedShares = marketCap / 100 // Placeholder
    setFairValuePerShare(total / estimatedShares)
  }

  const detectSegmentType = (segmentName: string): string => {
    const name = segmentName.toLowerCase()
    if (name.includes('software') || name.includes('cloud') || name.includes('service')) return 'Software'
    if (name.includes('chip') || name.includes('semiconductor')) return 'Semiconductor'
    if (name.includes('iphone') || name.includes('mac') || name.includes('device')) return 'Consumer Electronics'
    if (name.includes('pharma') || name.includes('drug') || name.includes('therapy')) return 'Pharmaceutical'
    return 'Technology'
  }

  const detectIPType = (segmentName: string): 'patent' | 'trademark' | 'trade_secret' | 'technology' => {
    const name = segmentName.toLowerCase()
    if (name.includes('brand') || name.includes('name')) return 'trademark'
    if (name.includes('process') || name.includes('secret')) return 'trade_secret'
    return 'patent'
  }

  const ipAsMarketCapPct = (totalIPValue / marketCap) * 100

  // Prepare chart data
  const pieData = ipAssets.map((asset, i) => ({
    name: asset.segment,
    value: asset.value,
    color: COLORS[i % COLORS.length]
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          IP Valuation Analysis - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 p-4 rounded-lg text-center border border-[#4ebe96]/30">
            <p className="text-[#868f97] text-sm">Total IP Value</p>
            <p className="text-2xl font-bold text-[#4ebe96]">{formatCurrency(totalIPValue)}</p>
          </div>
          <div className="bg-white/[0.05] p-4 rounded-lg text-center">
            <p className="text-[#868f97] text-sm">IP as % of Market Cap</p>
            <p className={`text-2xl font-bold ${ipAsMarketCapPct > 30 ? 'text-[#4ebe96]' : ipAsMarketCapPct > 15 ? 'text-[#f4a623]' : 'text-[#868f97]'}`}>
              {ipAsMarketCapPct.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/[0.05] p-4 rounded-lg text-center">
            <p className="text-[#868f97] text-sm">Market Cap</p>
            <p className="text-2xl font-bold">{formatCurrency(marketCap)}</p>
          </div>
          <div className="bg-white/[0.05] p-4 rounded-lg text-center">
            <p className="text-[#868f97] text-sm">IP Assets Found</p>
            <p className="text-2xl font-bold">{ipAssets.length}</p>
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-4 rounded-lg mb-6 ${ipAsMarketCapPct > 30 ? 'bg-[#4ebe96]/10 border border-[#4ebe96]/30' : ipAsMarketCapPct > 15 ? 'bg-[#f4a623]/10 border border-[#f4a623]/30' : 'bg-white/[0.05] border border-white/[0.08]'}`}>
          <p className="font-bold mb-1">
            {ipAsMarketCapPct > 30 ? '🛡️ Strong IP Moat' : ipAsMarketCapPct > 15 ? '⚡ Moderate IP Value' : '⚠️ Low IP Attribution'}
          </p>
          <p className="text-[#868f97] text-sm">
            {ipAsMarketCapPct > 30
              ? `${ticker}'s intellectual property accounts for ${ipAsMarketCapPct.toFixed(0)}% of market cap - indicating a strong competitive moat built on proprietary technology.`
              : ipAsMarketCapPct > 15
              ? `IP represents ${ipAsMarketCapPct.toFixed(0)}% of market cap. This company has meaningful intellectual property but may rely on other competitive advantages.`
              : `IP only accounts for ${ipAsMarketCapPct.toFixed(0)}% of market cap. Value may be driven by brand, scale, or other factors rather than proprietary technology.`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* IP Value by Segment Pie Chart */}
          <div>
            <p className="text-sm text-[#868f97] mb-2">IP Value by Segment</p>
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
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    formatter={(value: number) => [formatCurrency(value), 'IP Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IP Value Bar Chart */}
          <div>
            <p className="text-sm text-[#868f97] mb-2">IP Value by Segment</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ipAssets} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} stroke="#868f97" />
                  <YAxis type="category" dataKey="segment" stroke="#868f97" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    formatter={(value: number) => [formatCurrency(value), 'IP Value']}
                  />
                  <Bar dataKey="value" fill="#4ebe96" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* IP Assets Table */}
        <div className="overflow-x-auto">
          <p className="text-sm text-[#868f97] mb-2">Discovered IP Assets</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="p-3 text-left">Segment</th>
                <th className="p-3 text-left">IP Type</th>
                <th className="p-3 text-right">Revenue Attribution</th>
                <th className="p-3 text-right">Royalty Rate</th>
                <th className="p-3 text-right">IP Value</th>
              </tr>
            </thead>
            <tbody>
              {ipAssets.map((asset, i) => (
                <tr key={i} className="border-b border-white/[0.08]/50">
                  <td className="p-3 font-medium">{asset.segment}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      asset.type === 'patent' ? 'bg-[#479ffa]/20 text-[#479ffa]' :
                      asset.type === 'trademark' ? 'bg-purple-500/20 text-purple-500' :
                      asset.type === 'trade_secret' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-[#4ebe96]/20 text-[#4ebe96]'
                    }`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatPercent(asset.attributionPct)}</td>
                  <td className="p-3 text-right">{formatPercent(asset.royaltyRate)}</td>
                  <td className="p-3 text-right font-bold text-[#4ebe96]">{formatCurrency(asset.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/[0.05]">
                <td className="p-3 font-bold" colSpan={4}>Total IP Portfolio Value</td>
                <td className="p-3 text-right font-bold text-[#4ebe96]">{formatCurrency(totalIPValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Methodology Note */}
        <div className="mt-6 p-4 bg-white/[0.05] rounded-lg text-sm text-[#868f97]">
          <p className="font-medium text-white mb-1">Valuation Methodology: Relief from Royalty</p>
          <p>IP value is calculated using industry-standard royalty rates applied to segment revenues, discounted at 10% WACC over a 15-year IP protection period. Tax rate assumed at 21%.</p>
        </div>
      </CardContent>
    </Card>
  )
}
