'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface Holding {
  id: string
  name: string
  ticker: string
  value: number
  sector: string
  assetClass: string
}

const SECTORS = [
  'Technology',
  'Healthcare',
  'Financials',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Industrials',
  'Materials',
  'Utilities',
  'Real Estate',
  'Communication Services',
  'Cash & Equivalents',
]

const ASSET_CLASSES = [
  'US Large Cap',
  'US Mid Cap',
  'US Small Cap',
  'International Developed',
  'Emerging Markets',
  'Bonds',
  'REITs',
  'Commodities',
  'Cash',
  'Crypto',
]

const DIVERSIFICATION_THRESHOLDS = {
  excellent: 0.85,
  good: 0.70,
  moderate: 0.50,
  poor: 0.30,
}

export default function PortfolioDiversificationCalculator() {
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: '1', name: 'Apple Inc', ticker: 'AAPL', value: 15000, sector: 'Technology', assetClass: 'US Large Cap' },
    { id: '2', name: 'Microsoft', ticker: 'MSFT', value: 12000, sector: 'Technology', assetClass: 'US Large Cap' },
    { id: '3', name: 'JP Morgan', ticker: 'JPM', value: 8000, sector: 'Financials', assetClass: 'US Large Cap' },
    { id: '4', name: 'Johnson & Johnson', ticker: 'JNJ', value: 6000, sector: 'Healthcare', assetClass: 'US Large Cap' },
    { id: '5', name: 'Vanguard Total Bond', ticker: 'BND', value: 10000, sector: 'Cash & Equivalents', assetClass: 'Bonds' },
  ])

  const [newHolding, setNewHolding] = useState({
    name: '',
    ticker: '',
    value: 0,
    sector: 'Technology',
    assetClass: 'US Large Cap',
  })

  const addHolding = () => {
    if (newHolding.name && newHolding.value > 0) {
      setHoldings([
        ...holdings,
        {
          ...newHolding,
          id: Date.now().toString(),
        },
      ])
      setNewHolding({
        name: '',
        ticker: '',
        value: 0,
        sector: 'Technology',
        assetClass: 'US Large Cap',
      })
    }
  }

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter((h) => h.id !== id))
  }

  const analysis = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    if (totalValue === 0) {
      return null
    }

    // Calculate sector allocation
    const sectorAllocation: Record<string, number> = {}
    holdings.forEach((h) => {
      sectorAllocation[h.sector] = (sectorAllocation[h.sector] || 0) + h.value
    })

    // Calculate asset class allocation
    const assetClassAllocation: Record<string, number> = {}
    holdings.forEach((h) => {
      assetClassAllocation[h.assetClass] = (assetClassAllocation[h.assetClass] || 0) + h.value
    })

    // Calculate concentration metrics
    const holdingConcentrations = holdings.map((h) => (h.value / totalValue) * 100).sort((a, b) => b - a)
    const top5Concentration = holdingConcentrations.slice(0, 5).reduce((sum, c) => sum + c, 0)
    const largestHoldingPct = holdingConcentrations[0] || 0

    // Herfindahl-Hirschman Index (HHI) for diversification
    const hhi = holdingConcentrations.reduce((sum, c) => sum + Math.pow(c, 2), 0)
    const normalizedHHI = hhi / 10000 // Normalize to 0-1 scale

    // Calculate number of unique sectors and asset classes
    const uniqueSectors = Object.keys(sectorAllocation).length
    const uniqueAssetClasses = Object.keys(assetClassAllocation).length

    // Diversification Score (0-100)
    // Based on: sector diversity, asset class diversity, concentration, and HHI
    const sectorScore = Math.min(uniqueSectors / 6, 1) * 25 // Max 25 points for 6+ sectors
    const assetClassScore = Math.min(uniqueAssetClasses / 4, 1) * 25 // Max 25 points for 4+ asset classes
    const concentrationScore = Math.max(0, (1 - largestHoldingPct / 50)) * 25 // Max 25 points if no holding > 50%
    const hhiScore = Math.max(0, (1 - normalizedHHI)) * 25 // Max 25 points for low HHI

    const diversificationScore = sectorScore + assetClassScore + concentrationScore + hhiScore

    // Determine rating
    let rating: string
    let ratingColor: string
    if (diversificationScore >= 85) {
      rating = 'Excellent'
      ratingColor = 'text-green-400'
    } else if (diversificationScore >= 70) {
      rating = 'Good'
      ratingColor = 'text-blue-400'
    } else if (diversificationScore >= 50) {
      rating = 'Moderate'
      ratingColor = 'text-yellow-400'
    } else {
      rating = 'Poor'
      ratingColor = 'text-red-400'
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (largestHoldingPct > 20) {
      recommendations.push(`Your largest position (${largestHoldingPct.toFixed(1)}%) exceeds 20%. Consider trimming to reduce single-stock risk.`)
    }

    if (uniqueSectors < 5) {
      recommendations.push(`You're only invested in ${uniqueSectors} sectors. Aim for 5+ sectors for better diversification.`)
    }

    if (uniqueAssetClasses < 3) {
      recommendations.push(`Consider adding more asset classes. You currently have ${uniqueAssetClasses}. Adding bonds, international, or REITs can reduce correlation.`)
    }

    if (top5Concentration > 70) {
      recommendations.push(`Your top 5 holdings represent ${top5Concentration.toFixed(1)}% of your portfolio. Consider spreading risk across more positions.`)
    }

    const techPct = ((sectorAllocation['Technology'] || 0) / totalValue) * 100
    if (techPct > 40) {
      recommendations.push(`Technology allocation (${techPct.toFixed(1)}%) is high. Consider diversifying into defensive sectors like Healthcare or Consumer Staples.`)
    }

    if (!assetClassAllocation['Bonds'] && !assetClassAllocation['Cash']) {
      recommendations.push('Consider adding bonds or cash equivalents to reduce portfolio volatility.')
    }

    if (!assetClassAllocation['International Developed'] && !assetClassAllocation['Emerging Markets']) {
      recommendations.push('Your portfolio lacks international exposure. Consider adding developed or emerging market funds for geographic diversification.')
    }

    return {
      totalValue,
      sectorAllocation,
      assetClassAllocation,
      holdingsCount: holdings.length,
      uniqueSectors,
      uniqueAssetClasses,
      largestHoldingPct,
      top5Concentration,
      hhi,
      diversificationScore,
      rating,
      ratingColor,
      recommendations,
    }
  }, [holdings])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm mb-8">
            <ol className="flex items-center space-x-2">
              <li><Link href="/" className="text-zinc-400 hover:text-white">Home</Link></li>
              <li className="text-zinc-600">/</li>
              <li><Link href="/calculators" className="text-zinc-400 hover:text-white">Calculators</Link></li>
              <li className="text-zinc-600">/</li>
              <li className="text-white">Portfolio Diversification</li>
            </ol>
          </nav>

          <h1 className="text-4xl font-bold mb-4">Portfolio Diversification Analyzer</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Analyze your portfolio&apos;s diversification across sectors and asset classes.
            Get a diversification score and actionable recommendations to reduce risk.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Holdings Input */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Add Holdings</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Name / Description</label>
                    <input
                      type="text"
                      value={newHolding.name}
                      onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                      placeholder="e.g., Apple Inc"
                      className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Ticker (optional)</label>
                    <input
                      type="text"
                      value={newHolding.ticker}
                      onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                      placeholder="e.g., AAPL"
                      className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Value ($)</label>
                    <input
                      type="number"
                      value={newHolding.value || ''}
                      onChange={(e) => setNewHolding({ ...newHolding, value: Number(e.target.value) })}
                      placeholder="10000"
                      className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Sector</label>
                    <select
                      value={newHolding.sector}
                      onChange={(e) => setNewHolding({ ...newHolding, sector: e.target.value })}
                      className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Asset Class</label>
                    <select
                      value={newHolding.assetClass}
                      onChange={(e) => setNewHolding({ ...newHolding, assetClass: e.target.value })}
                      className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ASSET_CLASSES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addHolding}
                      className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 font-semibold transition-colors"
                    >
                      Add Holding
                    </button>
                  </div>
                </div>
              </div>

              {/* Holdings List */}
              <div className="bg-zinc-900 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Your Holdings ({holdings.length})</h2>

                {holdings.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No holdings added yet. Add your first holding above.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-400 border-b border-zinc-700">
                          <th className="text-left py-3 px-2">Name</th>
                          <th className="text-left py-3 px-2">Ticker</th>
                          <th className="text-right py-3 px-2">Value</th>
                          <th className="text-left py-3 px-2">Sector</th>
                          <th className="text-left py-3 px-2">Asset Class</th>
                          <th className="text-right py-3 px-2">%</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h) => (
                          <tr key={h.id} className="border-b border-zinc-800">
                            <td className="py-3 px-2">{h.name}</td>
                            <td className="py-3 px-2 text-zinc-400">{h.ticker || '—'}</td>
                            <td className="text-right py-3 px-2">{formatCurrency(h.value)}</td>
                            <td className="py-3 px-2 text-zinc-400">{h.sector}</td>
                            <td className="py-3 px-2 text-zinc-400">{h.assetClass}</td>
                            <td className="text-right py-3 px-2">
                              {analysis ? ((h.value / analysis.totalValue) * 100).toFixed(1) : 0}%
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => removeHolding(h.id)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {analysis && (
                        <tfoot>
                          <tr className="font-semibold">
                            <td className="py-3 px-2">Total</td>
                            <td className="py-3 px-2"></td>
                            <td className="text-right py-3 px-2">{formatCurrency(analysis.totalValue)}</td>
                            <td className="py-3 px-2"></td>
                            <td className="py-3 px-2"></td>
                            <td className="text-right py-3 px-2">100%</td>
                            <td className="py-3 px-2"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Diversification Score</h2>
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${analysis.ratingColor}`}>
                        {analysis.diversificationScore.toFixed(0)}
                      </div>
                      <div className={`text-lg ${analysis.ratingColor}`}>{analysis.rating}</div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-3 mb-4">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          analysis.diversificationScore >= 85 ? 'bg-green-500' :
                          analysis.diversificationScore >= 70 ? 'bg-blue-500' :
                          analysis.diversificationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.diversificationScore}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-zinc-400">Holdings</div>
                        <div className="font-semibold">{analysis.holdingsCount}</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Sectors</div>
                        <div className="font-semibold">{analysis.uniqueSectors}</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Largest Position</div>
                        <div className="font-semibold">{analysis.largestHoldingPct.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Top 5 Concentration</div>
                        <div className="font-semibold">{analysis.top5Concentration.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Sector Breakdown */}
                  <div className="bg-zinc-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
                    <div className="space-y-3">
                      {Object.entries(analysis.sectorAllocation)
                        .sort(([, a], [, b]) => b - a)
                        .map(([sector, value]) => {
                          const pct = (value / analysis.totalValue) * 100
                          return (
                            <div key={sector}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{sector}</span>
                                <span>{pct.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-zinc-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Asset Class Breakdown */}
                  <div className="bg-zinc-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Asset Class Allocation</h3>
                    <div className="space-y-3">
                      {Object.entries(analysis.assetClassAllocation)
                        .sort(([, a], [, b]) => b - a)
                        .map(([assetClass, value]) => {
                          const pct = (value / analysis.totalValue) * 100
                          return (
                            <div key={assetClass}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{assetClass}</span>
                                <span>{pct.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-zinc-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">Recommendations</h3>
                      <ul className="space-y-3">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="text-yellow-400">•</span>
                            <span className="text-zinc-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-zinc-900 rounded-xl p-6 text-center text-zinc-500">
                  Add holdings to see your diversification analysis
                </div>
              )}
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Why Diversification Matters</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Diversification is the practice of spreading investments across different asset classes,
                sectors, and geographies to reduce risk. As the saying goes, &quot;Don&apos;t put all your eggs
                in one basket.&quot; When one investment falls, others may rise or stay stable, smoothing
                out overall portfolio returns.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 rounded-lg p-4">
                  <h3 className="font-semibold text-green-400 mb-2">Reduce Risk</h3>
                  <p className="text-sm text-zinc-400">Spreading investments reduces the impact of any single position losing value.</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">Smoother Returns</h3>
                  <p className="text-sm text-zinc-400">Different assets perform well at different times, reducing volatility.</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-400 mb-2">Peace of Mind</h3>
                  <p className="text-sm text-zinc-400">A well-diversified portfolio lets you sleep better at night.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Diversification Best Practices</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Position Sizing</h3>
                  <p className="text-zinc-400 text-sm">
                    No single stock should represent more than 5-10% of your portfolio. Large positions
                    create concentration risk—if that company has problems, your portfolio suffers disproportionately.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Sector Allocation</h3>
                  <p className="text-zinc-400 text-sm">
                    Aim for exposure across 5+ sectors. Technology-heavy portfolios performed well recently
                    but suffered during the 2022 tech crash. Balance growth sectors with defensive ones.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Asset Classes</h3>
                  <p className="text-zinc-400 text-sm">
                    Include stocks, bonds, and potentially alternatives (REITs, commodities). Stocks and bonds
                    often move in opposite directions, providing natural hedging.
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-5">
                  <h3 className="font-semibold text-lg mb-2">Geographic Diversification</h3>
                  <p className="text-zinc-400 text-sm">
                    Don&apos;t limit yourself to US stocks. International markets provide exposure to different
                    economic cycles and currency movements. Consider 20-40% international allocation.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    How many stocks do I need for diversification?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Research suggests 20-30 stocks across different sectors provides substantial diversification
                    benefits. Beyond that, additional holdings have diminishing returns. For most investors,
                    low-cost index funds or ETFs offer instant diversification with a single purchase.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    What is correlation and why does it matter?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Correlation measures how two investments move relative to each other. Perfectly correlated
                    assets (correlation = 1) move together, offering no diversification benefit. Negatively
                    correlated or uncorrelated assets (-1 to 0) provide the best diversification.
                    Stocks and bonds, for example, often have low or negative correlation.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    Can you be over-diversified?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Yes, &quot;diworsification&quot; occurs when adding positions dilutes returns without meaningful
                    risk reduction. Owning 5 tech ETFs doesn&apos;t diversify—you&apos;re just holding the same thing
                    multiple ways. Focus on assets with genuinely different characteristics.
                  </p>
                </details>
                <details className="bg-zinc-900 rounded-lg p-5 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    How often should I rebalance?
                    <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-zinc-400 mt-3">
                    Rebalance annually or when allocations drift more than 5% from targets. More frequent
                    rebalancing increases trading costs and taxes. Many advisors recommend checking quarterly
                    and only rebalancing when necessary.
                  </p>
                </details>
              </div>
            </section>

            {/* Related Resources */}
            <section className="border-t border-zinc-800 pt-8">
              <h2 className="text-xl font-bold mb-4">Related Resources</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/calculators/position-size" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">Position Size Calculator</h3>
                  <p className="text-sm text-zinc-400">Calculate optimal position sizes based on risk</p>
                </Link>
                <Link href="/etfs" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">ETF Directory</h3>
                  <p className="text-sm text-zinc-400">Find diversified ETFs for your portfolio</p>
                </Link>
                <Link href="/screener" className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                  <h3 className="font-semibold mb-1">Stock Screener</h3>
                  <p className="text-sm text-zinc-400">Find stocks by sector and fundamentals</p>
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
