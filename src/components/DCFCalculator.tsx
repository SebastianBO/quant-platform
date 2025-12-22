"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart, Bar, ReferenceLine } from "recharts"

interface DCFProps {
  ticker: string
  currentPrice: number
  freeCashFlow: number
  revenueGrowth: number
  shares: number
  beta?: number
  debtToEquity?: number
  marketCap?: number
  totalDebt?: number
  cashAndEquivalents?: number
  eps?: number
  bookValue?: number
  dividendYield?: number
}

// Format large numbers with B/M/K
function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "N/A"
  const absNum = Math.abs(num)
  if (absNum >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (absNum >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (absNum >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (absNum >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return "N/A"
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
}

export default function DCFCalculator({
  ticker,
  currentPrice,
  freeCashFlow,
  revenueGrowth,
  shares,
  beta = 1.0,
  debtToEquity = 0.5,
  marketCap,
  totalDebt = 0,
  cashAndEquivalents = 0,
  eps = 0,
  bookValue = 0,
  dividendYield = 0
}: DCFProps) {
  // WACC Components (CAPM-based)
  const [riskFreeRate, setRiskFreeRate] = useState(4.5) // 10Y Treasury
  const [equityRiskPremium, setEquityRiskPremium] = useState(5.5) // Historical ERP
  const [terminalGrowth, setTerminalGrowth] = useState(2.5)
  const [growthRate, setGrowthRate] = useState(Math.max(0, Math.min(revenueGrowth * 100, 25)))
  const [years, setYears] = useState(10)
  const [marginOfSafety, setMarginOfSafety] = useState(25)
  const [monteCarloRuns] = useState(1000)

  // Calculate WACC using CAPM
  const waccCalculation = useMemo(() => {
    // Cost of Equity (CAPM): Re = Rf + Beta * (Rm - Rf)
    const costOfEquity = riskFreeRate + beta * equityRiskPremium

    // Cost of Debt (approximation based on credit risk)
    const baseCostOfDebt = riskFreeRate + 1.5 // Spread over risk-free
    const costOfDebt = baseCostOfDebt * 0.75 // After-tax (assuming 25% tax rate)

    // Capital weights
    const equityWeight = 1 / (1 + debtToEquity)
    const debtWeight = debtToEquity / (1 + debtToEquity)

    // WACC = E/V * Re + D/V * Rd * (1-T)
    const wacc = equityWeight * costOfEquity + debtWeight * costOfDebt

    return {
      costOfEquity,
      costOfDebt,
      equityWeight,
      debtWeight,
      wacc,
      taxRate: 0.25
    }
  }, [riskFreeRate, equityRiskPremium, beta, debtToEquity])

  // Main DCF Calculation
  const dcfResults = useMemo(() => {
    if (!freeCashFlow || freeCashFlow <= 0 || !shares || shares <= 0) {
      return null
    }

    const wacc = waccCalculation.wacc / 100
    const tg = terminalGrowth / 100
    const gr = growthRate / 100

    const projections = []
    let fcf = freeCashFlow
    let totalPV = 0

    // Project cash flows
    for (let i = 1; i <= years; i++) {
      // Apply growth decay (growth rate decreases toward terminal growth over time)
      const decayFactor = 1 - (i / years) * 0.3 // Gradual decay
      const yearGrowth = gr * decayFactor + tg * (1 - decayFactor)
      fcf = fcf * (1 + yearGrowth)

      const discountFactor = Math.pow(1 + wacc, i)
      const pv = fcf / discountFactor
      totalPV += pv

      projections.push({
        year: i,
        fcf,
        pv,
        cumulative: totalPV,
        growthRate: yearGrowth * 100
      })
    }

    // Terminal value using Gordon Growth Model
    const terminalFCF = fcf * (1 + tg)
    const terminalValue = terminalFCF / (wacc - tg)
    const terminalPV = terminalValue / Math.pow(1 + wacc, years)

    // Enterprise Value components
    const pvOfFCF = totalPV
    const enterpriseValue = pvOfFCF + terminalPV

    // Equity Value = EV - Net Debt
    const netDebt = totalDebt - cashAndEquivalents
    const equityValue = enterpriseValue - netDebt

    // Per share value
    const fairValuePerShare = equityValue / shares
    const withMarginOfSafety = fairValuePerShare * (1 - marginOfSafety / 100)

    // Upside calculation
    const upside = ((fairValuePerShare - currentPrice) / currentPrice) * 100
    const upsideWithMOS = ((withMarginOfSafety - currentPrice) / currentPrice) * 100

    return {
      projections,
      pvOfFCF,
      terminalValue,
      terminalPV,
      enterpriseValue,
      netDebt,
      equityValue,
      fairValuePerShare,
      withMarginOfSafety,
      upside,
      upsideWithMOS,
      terminalValuePercent: (terminalPV / enterpriseValue) * 100
    }
  }, [freeCashFlow, shares, waccCalculation.wacc, terminalGrowth, growthRate, years, marginOfSafety, totalDebt, cashAndEquivalents, currentPrice])

  // Monte Carlo Simulation
  const monteCarloResults = useMemo(() => {
    if (!dcfResults) return null

    const results: number[] = []
    const wacc = waccCalculation.wacc / 100
    const baseGrowth = growthRate / 100
    const baseTG = terminalGrowth / 100

    for (let run = 0; run < monteCarloRuns; run++) {
      // Random variations (normal distribution approximation using Box-Muller)
      const u1 = Math.random()
      const u2 = Math.random()
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2)

      // Vary WACC by +/- 2%, growth by +/- 5%, terminal growth by +/- 1%
      const runWacc = wacc + (z1 * 0.02)
      const runGrowth = baseGrowth + (z2 * 0.05)
      const runTG = baseTG + (Math.random() - 0.5) * 0.02

      if (runWacc <= runTG || runWacc < 0.01) continue // Skip invalid scenarios

      let fcf = freeCashFlow
      let totalPV = 0

      for (let i = 1; i <= years; i++) {
        const decayFactor = 1 - (i / years) * 0.3
        const yearGrowth = runGrowth * decayFactor + runTG * (1 - decayFactor)
        fcf = fcf * (1 + yearGrowth)
        totalPV += fcf / Math.pow(1 + runWacc, i)
      }

      const terminalFCF = fcf * (1 + runTG)
      const terminalValue = terminalFCF / (runWacc - runTG)
      const terminalPV = terminalValue / Math.pow(1 + runWacc, years)

      const ev = totalPV + terminalPV
      const equity = ev - (totalDebt - cashAndEquivalents)
      const fairValue = equity / shares

      if (isFinite(fairValue) && fairValue > 0) {
        results.push(fairValue)
      }
    }

    results.sort((a, b) => a - b)
    const n = results.length

    if (n < 10) return null

    return {
      min: results[0],
      p10: results[Math.floor(n * 0.1)],
      p25: results[Math.floor(n * 0.25)],
      median: results[Math.floor(n * 0.5)],
      p75: results[Math.floor(n * 0.75)],
      p90: results[Math.floor(n * 0.9)],
      max: results[n - 1],
      mean: results.reduce((a, b) => a + b, 0) / n,
      distribution: results
    }
  }, [dcfResults, freeCashFlow, shares, waccCalculation.wacc, growthRate, terminalGrowth, years, monteCarloRuns, totalDebt, cashAndEquivalents])

  // Alternative Valuation Methods
  const alternativeValuations = useMemo(() => {
    const results: { method: string; value: number; description: string }[] = []

    // 1. Graham Formula: V = EPS × (8.5 + 2g)
    if (eps > 0) {
      const grahamValue = eps * (8.5 + 2 * (growthRate || 5))
      results.push({
        method: "Graham Formula",
        value: grahamValue,
        description: "V = EPS × (8.5 + 2g)"
      })
    }

    // 2. Book Value with premium/discount
    if (bookValue > 0) {
      const pbRatio = currentPrice / bookValue
      const fairPB = pbRatio > 3 ? 2.5 : pbRatio > 1 ? 1.5 : 1.0
      const bookBasedValue = bookValue * fairPB
      results.push({
        method: "Book Value",
        value: bookBasedValue,
        description: `Book × ${fairPB.toFixed(1)}x`
      })
    }

    // 3. Dividend Discount Model (if pays dividends)
    if (dividendYield > 0 && currentPrice > 0) {
      const dividend = currentPrice * dividendYield / 100
      const requiredReturn = waccCalculation.costOfEquity / 100
      const ddmValue = dividend * (1 + terminalGrowth / 100) / (requiredReturn - terminalGrowth / 100)
      if (isFinite(ddmValue) && ddmValue > 0) {
        results.push({
          method: "DDM",
          value: ddmValue,
          description: "Dividend Discount Model"
        })
      }
    }

    // 4. Earnings Power Value
    if (eps > 0 && waccCalculation.wacc > 0) {
      const epv = eps / (waccCalculation.wacc / 100)
      results.push({
        method: "EPV",
        value: epv,
        description: "Earnings Power Value"
      })
    }

    return results
  }, [eps, bookValue, growthRate, currentPrice, dividendYield, waccCalculation, terminalGrowth])

  // Sensitivity Analysis
  const sensitivityData = useMemo(() => {
    if (!dcfResults) return []

    const wacc = waccCalculation.wacc
    const data: { wacc: number; growth: number; value: number }[] = []

    for (let w = wacc - 2; w <= wacc + 2; w += 1) {
      for (let g = terminalGrowth - 1; g <= terminalGrowth + 1; g += 0.5) {
        const waccDecimal = w / 100
        const tgDecimal = g / 100

        if (waccDecimal <= tgDecimal) continue

        let fcf = freeCashFlow
        let totalPV = 0

        for (let i = 1; i <= years; i++) {
          const gr = growthRate / 100
          const decayFactor = 1 - (i / years) * 0.3
          const yearGrowth = gr * decayFactor + tgDecimal * (1 - decayFactor)
          fcf = fcf * (1 + yearGrowth)
          totalPV += fcf / Math.pow(1 + waccDecimal, i)
        }

        const terminalFCF = fcf * (1 + tgDecimal)
        const tv = terminalFCF / (waccDecimal - tgDecimal)
        const tvPV = tv / Math.pow(1 + waccDecimal, years)
        const ev = totalPV + tvPV
        const equity = ev - (totalDebt - cashAndEquivalents)
        const fv = equity / shares

        if (isFinite(fv) && fv > 0) {
          data.push({ wacc: w, growth: g, value: fv })
        }
      }
    }

    return data
  }, [dcfResults, waccCalculation.wacc, terminalGrowth, freeCashFlow, growthRate, years, totalDebt, cashAndEquivalents, shares])

  // Create distribution histogram data
  const histogramData = useMemo(() => {
    if (!monteCarloResults) return []

    const { distribution } = monteCarloResults
    const min = distribution[0]
    const max = distribution[distribution.length - 1]
    const bucketCount = 20
    const bucketSize = (max - min) / bucketCount

    const buckets: { price: string; count: number; range: string }[] = []

    for (let i = 0; i < bucketCount; i++) {
      const bucketMin = min + i * bucketSize
      const bucketMax = bucketMin + bucketSize
      const count = distribution.filter(v => v >= bucketMin && v < bucketMax).length
      buckets.push({
        price: `$${bucketMin.toFixed(0)}`,
        count,
        range: `$${bucketMin.toFixed(0)}-$${bucketMax.toFixed(0)}`
      })
    }

    return buckets
  }, [monteCarloResults])

  if (!dcfResults) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">DCF Valuation - {ticker}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm sm:text-base">Insufficient data for DCF analysis. Requires positive free cash flow and shares outstanding.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <span className="text-2xl">📊</span>
          DCF Valuation - {ticker}
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">Institutional-Grade Discounted Cash Flow Analysis</p>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
        {/* WACC Derivation */}
        <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg border border-border">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-blue-500">📐</span> WACC Calculation (CAPM)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Risk-Free Rate (10Y Treasury)</label>
              <input
                type="range"
                min="2"
                max="7"
                step="0.25"
                value={riskFreeRate}
                onChange={(e) => setRiskFreeRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-blue-500 font-mono text-xs sm:text-sm block mt-1">{riskFreeRate.toFixed(2)}%</span>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Equity Risk Premium</label>
              <input
                type="range"
                min="3"
                max="8"
                step="0.25"
                value={equityRiskPremium}
                onChange={(e) => setEquityRiskPremium(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-blue-500 font-mono text-xs sm:text-sm block mt-1">{equityRiskPremium.toFixed(2)}%</span>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Beta (Market Risk)</label>
              <span className="block text-blue-500 font-mono text-xs sm:text-sm mt-1">{beta.toFixed(2)}</span>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">D/E Ratio</label>
              <span className="block text-blue-500 font-mono text-xs sm:text-sm mt-1">{debtToEquity.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs sm:text-sm">
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Cost of Equity</p>
              <p className="text-blue-500 font-mono text-xs sm:text-sm">{waccCalculation.costOfEquity.toFixed(2)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Cost of Debt</p>
              <p className="text-blue-500 font-mono text-xs sm:text-sm">{waccCalculation.costOfDebt.toFixed(2)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Equity Weight</p>
              <p className="text-blue-500 font-mono text-xs sm:text-sm">{(waccCalculation.equityWeight * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Debt Weight</p>
              <p className="text-blue-500 font-mono text-xs sm:text-sm">{(waccCalculation.debtWeight * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <p className="text-muted-foreground text-xs">Tax Rate</p>
              <p className="text-blue-500 font-mono text-xs sm:text-sm">{(waccCalculation.taxRate * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-emerald-500/20 p-2 rounded border border-emerald-500/50">
              <p className="text-foreground text-xs font-bold">WACC</p>
              <p className="text-emerald-500 font-mono font-bold text-xs sm:text-sm">{waccCalculation.wacc.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* DCF Assumptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Growth Rate (Year 1)</label>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-emerald-500 font-mono text-xs sm:text-sm block mt-1">{growthRate.toFixed(0)}%</span>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Terminal Growth</label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.25"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-emerald-500 font-mono text-xs sm:text-sm block mt-1">{terminalGrowth.toFixed(2)}%</span>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Projection Years</label>
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-emerald-500 font-mono text-xs sm:text-sm block mt-1">{years} years</span>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground block mb-1">Margin of Safety</label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={marginOfSafety}
              onChange={(e) => setMarginOfSafety(parseInt(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <span className="text-yellow-500 font-mono text-xs sm:text-sm block mt-1">{marginOfSafety}%</span>
          </div>
        </div>

        {/* Main Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-center border border-border">
            <p className="text-muted-foreground text-xs sm:text-sm">Current Price</p>
            <p className="text-xl sm:text-2xl font-bold font-mono">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-center border border-border">
            <p className="text-muted-foreground text-xs sm:text-sm">DCF Fair Value</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${dcfResults.fairValuePerShare > currentPrice ? 'text-emerald-500' : 'text-red-500'}`}>
              ${dcfResults.fairValuePerShare.toFixed(2)}
            </p>
          </div>
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-center border border-border">
            <p className="text-muted-foreground text-xs sm:text-sm">With {marginOfSafety}% MOS</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${dcfResults.withMarginOfSafety > currentPrice ? 'text-yellow-500' : 'text-red-500'}`}>
              ${dcfResults.withMarginOfSafety.toFixed(2)}
            </p>
          </div>
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-center border border-border">
            <p className="text-muted-foreground text-xs sm:text-sm">Upside/Downside</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${dcfResults.upside > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatPercent(dcfResults.upside)}
            </p>
          </div>
        </div>

        {/* Enterprise Value Breakdown */}
        <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg border border-border">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Enterprise Value Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-center text-xs sm:text-sm">
            <div className="bg-secondary/50 p-2 sm:p-3 rounded">
              <p className="text-muted-foreground text-xs">PV of FCF</p>
              <p className="text-emerald-500 font-mono font-bold text-xs sm:text-sm">{formatNumber(dcfResults.pvOfFCF)}</p>
              <p className="text-muted-foreground/60 text-xs">{(100 - dcfResults.terminalValuePercent).toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 sm:p-3 rounded">
              <p className="text-muted-foreground text-xs">Terminal Value PV</p>
              <p className="text-blue-500 font-mono font-bold text-xs sm:text-sm">{formatNumber(dcfResults.terminalPV)}</p>
              <p className="text-muted-foreground/60 text-xs">{dcfResults.terminalValuePercent.toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/50 p-2 sm:p-3 rounded">
              <p className="text-muted-foreground text-xs">Enterprise Value</p>
              <p className="text-foreground font-mono font-bold text-xs sm:text-sm">{formatNumber(dcfResults.enterpriseValue)}</p>
            </div>
            <div className="bg-secondary/50 p-2 sm:p-3 rounded">
              <p className="text-muted-foreground text-xs">Net Debt</p>
              <p className={`font-mono font-bold text-xs sm:text-sm ${dcfResults.netDebt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {dcfResults.netDebt > 0 ? '-' : '+'}{formatNumber(Math.abs(dcfResults.netDebt))}
              </p>
            </div>
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded border border-emerald-500/50">
              <p className="text-foreground text-xs font-bold">Equity Value</p>
              <p className="text-emerald-500 font-mono font-bold text-xs sm:text-sm">{formatNumber(dcfResults.equityValue)}</p>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={`p-3 sm:p-4 rounded-lg ${
          dcfResults.upside > 30 ? 'bg-emerald-500/20 border border-emerald-500/50' :
          dcfResults.upside > 10 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          dcfResults.upside > -10 ? 'bg-yellow-500/20 border border-yellow-500/50' :
          'bg-red-500/20 border border-red-500/50'
        }`}>
          <p className="text-base sm:text-lg font-bold mb-1">
            {dcfResults.upside > 30 ? '🟢 SIGNIFICANTLY UNDERVALUED' :
             dcfResults.upside > 10 ? '🟢 UNDERVALUED' :
             dcfResults.upside > -10 ? '🟡 FAIRLY VALUED' :
             '🔴 OVERVALUED'}
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {dcfResults.upside > 30
              ? `${ticker} appears significantly undervalued with ${dcfResults.upside.toFixed(1)}% upside to DCF fair value. The margin of safety buy price is $${dcfResults.withMarginOfSafety.toFixed(2)}.`
              : dcfResults.upside > 10
              ? `${ticker} trades at a discount to intrinsic value with ${dcfResults.upside.toFixed(1)}% upside potential.`
              : dcfResults.upside > -10
              ? `${ticker} is trading close to fair value. Consider waiting for a better entry point below $${dcfResults.withMarginOfSafety.toFixed(2)}.`
              : `${ticker} appears overvalued by ${Math.abs(dcfResults.upside).toFixed(1)}%. Exercise caution.`
            }
          </p>
          <p className="text-muted-foreground/70 text-xs mt-2">
            Terminal value represents {dcfResults.terminalValuePercent.toFixed(1)}% of total value.
            {dcfResults.terminalValuePercent > 75 && " Warning: High terminal value dependence increases uncertainty."}
          </p>
        </div>

        {/* Monte Carlo Results */}
        {monteCarloResults && (
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg border border-border">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-purple-500">🎲</span> Monte Carlo Simulation ({monteCarloRuns} runs)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs sm:text-sm mb-4">
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">10th %ile</p>
                <p className="text-red-500 font-mono text-xs sm:text-sm">${monteCarloResults.p10.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">25th %ile</p>
                <p className="text-orange-500 font-mono text-xs sm:text-sm">${monteCarloResults.p25.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">Median</p>
                <p className="text-yellow-500 font-mono text-xs sm:text-sm">${monteCarloResults.median.toFixed(2)}</p>
              </div>
              <div className="bg-purple-500/20 p-2 rounded border border-purple-500/50">
                <p className="text-foreground text-xs font-bold">Mean</p>
                <p className="text-purple-500 font-mono font-bold text-xs sm:text-sm">${monteCarloResults.mean.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">75th %ile</p>
                <p className="text-lime-500 font-mono text-xs sm:text-sm">${monteCarloResults.p75.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">90th %ile</p>
                <p className="text-emerald-500 font-mono text-xs sm:text-sm">${monteCarloResults.p90.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <p className="text-muted-foreground text-xs">Range</p>
                <p className="text-muted-foreground font-mono text-xs">${monteCarloResults.min.toFixed(0)}-${monteCarloResults.max.toFixed(0)}</p>
              </div>
            </div>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={histogramData}>
                  <XAxis dataKey="price" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 9 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(label) => `Price: ${label}`}
                    formatter={(value: number, name: string) => [value, 'Scenarios']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" opacity={0.8} />
                  <ReferenceLine x={`$${currentPrice.toFixed(0)}`} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Current', fill: '#ef4444', fontSize: 9 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-muted-foreground/70 text-xs mt-2 text-center">
              Probability current price is undervalued: {((monteCarloResults.distribution.filter(v => v > currentPrice).length / monteCarloResults.distribution.length) * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {/* Cash Flow Projections Chart */}
        <div className="h-56 sm:h-64">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Projected Free Cash Flow (with growth decay)</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dcfResults.projections}>
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => [formatNumber(value), name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="fcf" stroke="#10b981" strokeWidth={2} name="FCF" dot={{ fill: '#10b981' }} />
              <Line type="monotone" dataKey="pv" stroke="#6366f1" strokeWidth={2} name="Present Value" dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alternative Valuations */}
        {alternativeValuations.length > 0 && (
          <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg border border-border">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Alternative Valuation Methods</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {alternativeValuations.map((alt) => (
                <div key={alt.method} className="bg-secondary/50 p-3 rounded text-center">
                  <p className="text-muted-foreground text-xs">{alt.method}</p>
                  <p className={`text-lg sm:text-xl font-bold font-mono ${alt.value > currentPrice ? 'text-emerald-500' : 'text-red-500'}`}>
                    ${alt.value.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground/60 text-xs">{alt.description}</p>
                  <p className={`text-xs ${alt.value > currentPrice ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatPercent(((alt.value - currentPrice) / currentPrice) * 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensitivity Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Sensitivity Analysis (Fair Value by WACC vs Terminal Growth)</p>
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-2 text-left whitespace-nowrap">WACC \ Growth</th>
                  {[terminalGrowth - 1, terminalGrowth - 0.5, terminalGrowth, terminalGrowth + 0.5, terminalGrowth + 1].map(g => (
                    <th key={g} className="p-2 text-center whitespace-nowrap">{g.toFixed(1)}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[waccCalculation.wacc - 2, waccCalculation.wacc - 1, waccCalculation.wacc, waccCalculation.wacc + 1, waccCalculation.wacc + 2].map(w => (
                  <tr key={w} className="border-b border-border/50">
                    <td className="p-2 font-medium whitespace-nowrap">{w.toFixed(1)}%</td>
                    {[terminalGrowth - 1, terminalGrowth - 0.5, terminalGrowth, terminalGrowth + 0.5, terminalGrowth + 1].map(g => {
                      const match = sensitivityData.find(s => Math.abs(s.wacc - w) < 0.01 && Math.abs(s.growth - g) < 0.01)
                      const fv = match?.value || 0
                      const isHighlight = Math.abs(w - waccCalculation.wacc) < 0.01 && Math.abs(g - terminalGrowth) < 0.01
                      return (
                        <td
                          key={`${w}-${g}`}
                          className={`p-2 text-center font-mono whitespace-nowrap ${isHighlight ? 'bg-emerald-500/20 font-bold' : ''} ${fv > currentPrice ? 'text-emerald-500' : 'text-red-500'}`}
                        >
                          ${fv.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="text-xs text-muted-foreground/70 border-t border-border pt-4 space-y-1">
          <p><strong className="text-foreground">Methodology:</strong> Two-stage DCF with CAPM-derived WACC. Growth rate decays linearly toward terminal growth over projection period. Monte Carlo varies WACC (±2%), growth (±5%), and terminal growth (±1%) using Box-Muller normal distribution.</p>
          <p><strong className="text-foreground">Limitations:</strong> Model assumes predictable cash flows and perpetual growth. Terminal value typically represents 60-80% of total value, introducing significant uncertainty. Always combine with other valuation methods and qualitative analysis.</p>
        </div>
      </CardContent>
    </Card>
  )
}
