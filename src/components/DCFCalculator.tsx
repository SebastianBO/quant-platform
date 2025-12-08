"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface DCFProps {
  ticker: string
  currentPrice: number
  freeCashFlow: number
  revenueGrowth: number
  shares: number
}

export default function DCFCalculator({ ticker, currentPrice, freeCashFlow, revenueGrowth, shares }: DCFProps) {
  const [wacc, setWacc] = useState(10)
  const [terminalGrowth, setTerminalGrowth] = useState(2.5)
  const [growthRate, setGrowthRate] = useState(Math.min(revenueGrowth * 100, 25))
  const [years, setYears] = useState(10)

  // Calculate DCF
  const calculateDCF = () => {
    const projections = []
    let fcf = freeCashFlow
    let totalPV = 0

    // Project cash flows
    for (let i = 1; i <= years; i++) {
      fcf = fcf * (1 + growthRate / 100)
      const discountFactor = Math.pow(1 + wacc / 100, i)
      const pv = fcf / discountFactor
      totalPV += pv

      projections.push({
        year: i,
        fcf: fcf,
        pv: pv,
        cumulative: totalPV
      })
    }

    // Terminal value
    const terminalFCF = fcf * (1 + terminalGrowth / 100)
    const terminalValue = terminalFCF / ((wacc / 100) - (terminalGrowth / 100))
    const terminalPV = terminalValue / Math.pow(1 + wacc / 100, years)

    const enterpriseValue = totalPV + terminalPV
    const equityValue = enterpriseValue // Simplified (should subtract debt)
    const fairValue = equityValue / (shares / 1e9) // Per share

    return {
      projections,
      terminalValue,
      terminalPV,
      enterpriseValue,
      fairValue,
      upside: ((fairValue - currentPrice) / currentPrice) * 100
    }
  }

  const dcf = calculateDCF()

  // Sensitivity analysis
  const sensitivities: { wacc: number; growth: number; fairValue: number }[] = []
  for (let w = wacc - 2; w <= wacc + 2; w += 1) {
    for (let g = terminalGrowth - 1; g <= terminalGrowth + 1; g += 0.5) {
      const tempWacc = w
      const tempGrowth = g
      let fcf = freeCashFlow
      let totalPV = 0

      for (let i = 1; i <= years; i++) {
        fcf = fcf * (1 + growthRate / 100)
        totalPV += fcf / Math.pow(1 + tempWacc / 100, i)
      }

      const terminalFCF = fcf * (1 + tempGrowth / 100)
      const tv = terminalFCF / ((tempWacc / 100) - (tempGrowth / 100))
      const tvPV = tv / Math.pow(1 + tempWacc / 100, years)
      const ev = totalPV + tvPV
      const fv = ev / (shares / 1e9)

      sensitivities.push({ wacc: w, growth: g, fairValue: fv })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          DCF Valuation - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Input Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm text-zinc-400">WACC (%)</label>
            <input
              type="range"
              min="6"
              max="15"
              step="0.5"
              value={wacc}
              onChange={(e) => setWacc(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-emerald-400 font-bold">{wacc}%</span>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Terminal Growth (%)</label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.25"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-emerald-400 font-bold">{terminalGrowth}%</span>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Growth Rate (%)</label>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-emerald-400 font-bold">{growthRate}%</span>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Projection Years</label>
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-emerald-400 font-bold">{years} years</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <p className="text-zinc-400 text-sm">Current Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <p className="text-zinc-400 text-sm">Fair Value</p>
            <p className={`text-2xl font-bold ${dcf.fairValue > currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>
              ${dcf.fairValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <p className="text-zinc-400 text-sm">Upside/Downside</p>
            <p className={`text-2xl font-bold ${dcf.upside > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {dcf.upside > 0 ? '+' : ''}{dcf.upside.toFixed(1)}%
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
            <p className="text-zinc-400 text-sm">Enterprise Value</p>
            <p className="text-2xl font-bold">{formatCurrency(dcf.enterpriseValue)}</p>
          </div>
        </div>

        {/* Verdict */}
        <div className={`p-4 rounded-lg mb-6 ${dcf.upside > 20 ? 'bg-emerald-900/30 border border-emerald-600' : dcf.upside > 0 ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-red-900/30 border border-red-600'}`}>
          <p className="text-lg font-bold">
            {dcf.upside > 20 ? '🟢 UNDERVALUED - Strong Buy' : dcf.upside > 0 ? '🟡 FAIRLY VALUED - Hold' : '🔴 OVERVALUED - Caution'}
          </p>
          <p className="text-zinc-300">
            {dcf.upside > 20
              ? `Based on DCF analysis, ${ticker} appears significantly undervalued with ${dcf.upside.toFixed(0)}% upside potential.`
              : dcf.upside > 0
              ? `${ticker} is trading close to its intrinsic value. Limited upside from current levels.`
              : `${ticker} appears overvalued. Consider waiting for a better entry point.`
            }
          </p>
        </div>

        {/* Cash Flow Projections Chart */}
        <div className="h-64 mb-6">
          <p className="text-sm text-zinc-400 mb-2">Projected Free Cash Flow</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dcf.projections}>
              <XAxis dataKey="year" stroke="#71717a" />
              <YAxis stroke="#71717a" tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Line type="monotone" dataKey="fcf" stroke="#10b981" strokeWidth={2} name="FCF" />
              <Line type="monotone" dataKey="pv" stroke="#6366f1" strokeWidth={2} name="Present Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sensitivity Table */}
        <div className="overflow-x-auto">
          <p className="text-sm text-zinc-400 mb-2">Sensitivity Analysis (Fair Value by WACC vs Terminal Growth)</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-2 text-left">WACC \ Growth</th>
                {[terminalGrowth - 1, terminalGrowth - 0.5, terminalGrowth, terminalGrowth + 0.5, terminalGrowth + 1].map(g => (
                  <th key={g} className="p-2 text-center">{g.toFixed(1)}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[wacc - 2, wacc - 1, wacc, wacc + 1, wacc + 2].map(w => (
                <tr key={w} className="border-b border-zinc-800">
                  <td className="p-2 font-medium">{w}%</td>
                  {[terminalGrowth - 1, terminalGrowth - 0.5, terminalGrowth, terminalGrowth + 0.5, terminalGrowth + 1].map(g => {
                    const match = sensitivities.find(s => s.wacc === w && s.growth === g)
                    const fv = match?.fairValue || 0
                    const isHighlight = w === wacc && g === terminalGrowth
                    return (
                      <td
                        key={`${w}-${g}`}
                        className={`p-2 text-center ${isHighlight ? 'bg-emerald-900/30 font-bold' : ''} ${fv > currentPrice ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        ${fv.toFixed(0)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
