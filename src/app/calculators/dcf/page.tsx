'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface YearlyProjection {
  year: number
  freeCashFlow: number
  discountFactor: number
  presentValue: number
}

export default function DCFCalculator() {
  const [currentFCF, setCurrentFCF] = useState<number>(5000000000) // $5B default
  const [growthRate, setGrowthRate] = useState<number>(10) // 10% growth
  const [projectionYears, setProjectionYears] = useState<number>(10)
  const [discountRate, setDiscountRate] = useState<number>(10) // WACC
  const [terminalGrowthRate, setTerminalGrowthRate] = useState<number>(2.5) // Long-term GDP growth
  const [sharesOutstanding, setSharesOutstanding] = useState<number>(1000000000) // 1B shares
  const [marginOfSafety, setMarginOfSafety] = useState<number>(25) // 25% margin

  const results = useMemo(() => {
    const growth = growthRate / 100
    const discount = discountRate / 100
    const terminalGrowth = terminalGrowthRate / 100
    const margin = marginOfSafety / 100

    // Project future cash flows
    const projections: YearlyProjection[] = []
    let totalPresentValue = 0

    for (let year = 1; year <= projectionYears; year++) {
      const fcf = currentFCF * Math.pow(1 + growth, year)
      const discountFactor = Math.pow(1 + discount, year)
      const presentValue = fcf / discountFactor

      projections.push({
        year,
        freeCashFlow: fcf,
        discountFactor,
        presentValue,
      })

      totalPresentValue += presentValue
    }

    // Calculate terminal value using Gordon Growth Model
    const finalYearFCF = currentFCF * Math.pow(1 + growth, projectionYears)
    const terminalValue = (finalYearFCF * (1 + terminalGrowth)) / (discount - terminalGrowth)
    const terminalPresentValue = terminalValue / Math.pow(1 + discount, projectionYears)

    // Total enterprise value
    const enterpriseValue = totalPresentValue + terminalPresentValue

    // Intrinsic value per share
    const intrinsicValuePerShare = enterpriseValue / sharesOutstanding

    // Fair value with margin of safety
    const fairValueWithMargin = intrinsicValuePerShare * (1 - margin)

    return {
      projections,
      totalPresentValueOfCashFlows: totalPresentValue,
      terminalValue,
      terminalPresentValue,
      enterpriseValue,
      intrinsicValuePerShare,
      fairValueWithMargin,
    }
  }, [currentFCF, growthRate, projectionYears, discountRate, terminalGrowthRate, sharesOutstanding, marginOfSafety])

  const formatCurrency = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    }
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm mb-8">
            <ol className="flex items-center space-x-2">
              <li><Link href="/" className="text-zinc-400 hover:text-white">Home</Link></li>
              <li className="text-zinc-600">/</li>
              <li><Link href="/calculators" className="text-zinc-400 hover:text-white">Calculators</Link></li>
              <li className="text-zinc-600">/</li>
              <li className="text-white">DCF Valuation</li>
            </ol>
          </nav>

          <h1 className="text-4xl font-bold mb-4">DCF Valuation Calculator</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Calculate intrinsic stock value using the Discounted Cash Flow (DCF) method.
            Project future free cash flows, apply a discount rate, and determine fair value per share.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Cash Flow Inputs</h2>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Current Free Cash Flow (Annual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="number"
                      value={currentFCF}
                      onChange={(e) => setCurrentFCF(Number(e.target.value))}
                      className="w-full bg-zinc-800 rounded-lg px-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Find this in the Cash Flow Statement</p>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Expected Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Historical growth rate or analyst estimate</p>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Projection Period (Years)
                  </label>
                  <input
                    type="number"
                    value={projectionYears}
                    onChange={(e) => setProjectionYears(Number(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Discount & Terminal Value</h2>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Discount Rate / WACC (%)
                  </label>
                  <input
                    type="number"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                    min={1}
                    max={30}
                    step={0.5}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">8-12% typical for stocks</p>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Terminal Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={terminalGrowthRate}
                    onChange={(e) => setTerminalGrowthRate(Number(e.target.value))}
                    min={0}
                    max={5}
                    step={0.25}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Long-term GDP growth (2-3% typical)</p>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Per-Share Calculation</h2>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Shares Outstanding
                  </label>
                  <input
                    type="number"
                    value={sharesOutstanding}
                    onChange={(e) => setSharesOutstanding(Number(e.target.value))}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Margin of Safety (%)
                  </label>
                  <input
                    type="number"
                    value={marginOfSafety}
                    onChange={(e) => setMarginOfSafety(Number(e.target.value))}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Warren Buffett uses 25-50%</p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Valuation Results</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                    <span className="text-zinc-400">PV of Cash Flows</span>
                    <span className="text-xl font-semibold">{formatCurrency(results.totalPresentValueOfCashFlows)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                    <span className="text-zinc-400">Terminal Value</span>
                    <span className="text-xl font-semibold">{formatCurrency(results.terminalValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                    <span className="text-zinc-400">PV of Terminal Value</span>
                    <span className="text-xl font-semibold">{formatCurrency(results.terminalPresentValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-700">
                    <span className="text-zinc-400">Enterprise Value</span>
                    <span className="text-2xl font-bold text-green-400">{formatCurrency(results.enterpriseValue)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/30 border border-green-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Intrinsic Value Per Share</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  ${results.intrinsicValuePerShare.toFixed(2)}
                </div>
                <p className="text-zinc-400 text-sm">Based on {formatNumber(sharesOutstanding)} shares outstanding</p>

                <div className="mt-4 pt-4 border-t border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">With {marginOfSafety}% Margin of Safety:</span>
                    <span className="text-2xl font-bold text-yellow-400">${results.fairValueWithMargin.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Buy below this price for extra protection</p>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Small changes in discount rate significantly impact valuation:
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-zinc-800 rounded p-3 text-center">
                    <div className="text-zinc-500">{discountRate - 2}% WACC</div>
                    <div className="font-semibold text-green-400">
                      ${(results.enterpriseValue / sharesOutstanding * (discountRate / (discountRate - 2))).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-blue-900/50 rounded p-3 text-center">
                    <div className="text-zinc-400">{discountRate}% WACC</div>
                    <div className="font-semibold">${results.intrinsicValuePerShare.toFixed(2)}</div>
                  </div>
                  <div className="bg-zinc-800 rounded p-3 text-center">
                    <div className="text-zinc-500">{discountRate + 2}% WACC</div>
                    <div className="font-semibold text-red-400">
                      ${(results.enterpriseValue / sharesOutstanding * (discountRate / (discountRate + 2))).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Flow Projections Table */}
          <div className="mt-8 bg-zinc-900 rounded-xl p-6 overflow-x-auto">
            <h3 className="text-xl font-semibold mb-4">Projected Free Cash Flows</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-right py-3 px-4">Free Cash Flow</th>
                  <th className="text-right py-3 px-4">Discount Factor</th>
                  <th className="text-right py-3 px-4">Present Value</th>
                </tr>
              </thead>
              <tbody>
                {results.projections.map((row) => (
                  <tr key={row.year} className="border-b border-zinc-800">
                    <td className="py-3 px-4">{row.year}</td>
                    <td className="text-right py-3 px-4">{formatCurrency(row.freeCashFlow)}</td>
                    <td className="text-right py-3 px-4">{row.discountFactor.toFixed(3)}</td>
                    <td className="text-right py-3 px-4 text-green-400">{formatCurrency(row.presentValue)}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-800/50 font-semibold">
                  <td className="py-3 px-4">Terminal</td>
                  <td className="text-right py-3 px-4">{formatCurrency(results.terminalValue)}</td>
                  <td className="text-right py-3 px-4">—</td>
                  <td className="text-right py-3 px-4 text-green-400">{formatCurrency(results.terminalPresentValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Educational Content */}
          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">How DCF Valuation Works</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Discounted Cash Flow (DCF) analysis is a valuation method that estimates the intrinsic value
                of an investment based on its expected future cash flows. The core principle: a dollar today
                is worth more than a dollar tomorrow, so future cash flows must be &quot;discounted&quot; to present value.
              </p>
              <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm">
                <p className="text-zinc-500 mb-2">DCF Formula:</p>
                <p>Intrinsic Value = Σ [FCF<sub>t</sub> / (1 + r)<sup>t</sup>] + Terminal Value / (1 + r)<sup>n</sup></p>
                <p className="text-zinc-500 mt-2">Where FCF = Free Cash Flow, r = Discount Rate (WACC), t = Year</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Key Inputs Explained</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Free Cash Flow (FCF)</h3>
                  <p className="text-zinc-400 text-sm">
                    Cash generated after capital expenditures. Find this on the Cash Flow Statement:
                    Operating Cash Flow minus Capital Expenditures.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Discount Rate (WACC)</h3>
                  <p className="text-zinc-400 text-sm">
                    Weighted Average Cost of Capital represents the required return. Higher risk = higher
                    discount rate. Typical range: 8-12% for stocks.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Growth Rate</h3>
                  <p className="text-zinc-400 text-sm">
                    Expected annual growth in FCF. Use historical growth, analyst estimates, or industry
                    averages. Be conservative—high growth is hard to sustain.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Terminal Value</h3>
                  <p className="text-zinc-400 text-sm">
                    Value beyond the projection period, assuming perpetual growth. Uses the Gordon Growth
                    Model: FCF × (1 + g) / (r - g). Terminal growth should not exceed GDP growth (2-3%).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Margin of Safety</h2>
              <p className="text-zinc-400 leading-relaxed">
                Benjamin Graham and Warren Buffett emphasize buying below intrinsic value to provide a
                &quot;margin of safety.&quot; A 25% margin means only buying if the stock trades at 75% or less of
                its calculated intrinsic value. This protects against estimation errors and unforeseen risks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Limitations of DCF Analysis</h2>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex gap-3">
                  <span className="text-red-400">•</span>
                  <span><strong>Garbage in, garbage out:</strong> Results are only as good as your assumptions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400">•</span>
                  <span><strong>Terminal value dominance:</strong> Often 60-80% of total value comes from terminal value</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400">•</span>
                  <span><strong>Sensitivity to discount rate:</strong> Small changes drastically alter valuations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400">•</span>
                  <span><strong>Doesn&apos;t work for unprofitable companies:</strong> Negative FCF makes DCF challenging</span>
                </li>
              </ul>
            </section>

            {/* FAQ Section */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    What discount rate should I use?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    The discount rate should reflect the risk of the investment. For stable large-cap stocks,
                    8-10% is common. For riskier growth stocks, 10-15%. The discount rate represents your
                    required rate of return—use a higher rate for riskier investments.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    Where do I find Free Cash Flow?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Free Cash Flow is found on the Cash Flow Statement. Calculate it as: Operating Cash Flow
                    minus Capital Expenditures (CapEx). Many financial sites report FCF directly. For Lician,
                    visit the stock&apos;s &quot;Financials&quot; tab to see Cash Flow data.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    Why is terminal value so large?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Terminal value captures all cash flows beyond your projection period—potentially decades
                    of growth. It&apos;s typically 60-80% of total DCF value, which is why conservative terminal
                    growth assumptions (2-3%) are critical. Never use terminal growth above long-term GDP growth.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    How accurate is DCF valuation?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    DCF is more of a thinking framework than a precise calculator. The value comes from
                    understanding the drivers: What growth rate is implied? What&apos;s the market pricing in?
                    Use DCF alongside other methods (P/E comparables, P/S ratios) for a complete picture.
                  </p>
                </details>
              </div>
            </section>

            {/* Related Resources */}
            <section className="border-t border-zinc-800 pt-8">
              <h2 className="text-xl font-bold mb-4">Related Resources</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/learn/dcf-valuation" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">DCF Valuation Guide</h3>
                  <p className="text-sm text-zinc-400">In-depth DCF methodology</p>
                </Link>
                <Link href="/learn/reading-financial-statements" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">Reading Financial Statements</h3>
                  <p className="text-sm text-zinc-400">Find FCF and analyze statements</p>
                </Link>
                <Link href="/calculators/compound-interest" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
                  <p className="text-sm text-zinc-400">See how investments grow</p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
