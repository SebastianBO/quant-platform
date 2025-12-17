"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"

interface QuantAnalysisProps {
  ticker: string
  dataSource?: 'supabase' | 'financialdatasets.ai' | string
  metrics: {
    // Valuation
    price_to_earnings_ratio?: number
    price_to_book_ratio?: number
    price_to_sales_ratio?: number
    enterprise_value_to_ebitda_ratio?: number
    peg_ratio?: number
    free_cash_flow_yield?: number
    // Profitability
    gross_margin?: number
    operating_margin?: number
    net_margin?: number
    return_on_equity?: number
    return_on_assets?: number
    return_on_invested_capital?: number
    // Growth
    revenue_growth?: number
    earnings_growth?: number
    free_cash_flow_growth?: number
    // Health
    debt_to_equity?: number
    current_ratio?: number
    interest_coverage?: number
  }
  currentPrice: number
}

interface StageResult {
  stage: number
  name: string
  grade: string
  score: number
  maxScore: number
  ratings: { metric: string; value: number | string; rating: string; emoji: string }[]
  flags: string[]
}

// Guard Rails - Institutional Thresholds
const GUARD_RAILS = {
  valuation: {
    pe: { excellent: 15, good: 25, fair: 35, expensive: 50 },
    peg: { excellent: 1.0, good: 1.5, fair: 2.0, expensive: 3.0 },
    ps: { excellent: 2, good: 5, fair: 10, expensive: 15 },
    pb: { excellent: 1, good: 3, fair: 5, expensive: 10 },
    evEbitda: { excellent: 8, good: 12, fair: 18, expensive: 25 }
  },
  profitability: {
    grossMargin: { excellent: 60, good: 40, acceptable: 25, poor: 15 },
    operatingMargin: { excellent: 25, good: 15, acceptable: 8, poor: 3 },
    netMargin: { excellent: 20, good: 12, acceptable: 6, poor: 2 },
    roic: { excellent: 20, good: 12, acceptable: 8, poor: 4 }
  },
  health: {
    debtToEquity: { excellent: 0.3, good: 0.7, acceptable: 1.5, warning: 2.5 },
    currentRatio: { excellent: 2.5, good: 1.8, acceptable: 1.2, warning: 1.0 },
    interestCoverage: { excellent: 10, good: 5, acceptable: 2.5, warning: 1.5 }
  },
  growth: {
    revenueGrowth: { excellent: 20, good: 10, acceptable: 5, poor: 0 },
    earningsGrowth: { excellent: 15, good: 8, acceptable: 3, poor: 0 },
    fcfGrowth: { excellent: 20, good: 10, acceptable: 5, poor: 0 }
  }
}

export default function QuantAnalysis({ ticker, metrics, currentPrice, dataSource }: QuantAnalysisProps) {
  const [stages, setStages] = useState<StageResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Check if we have actual metrics data (not empty object)
  const hasMetrics = metrics && Object.keys(metrics).length > 0 && (
    metrics.price_to_earnings_ratio !== undefined ||
    metrics.debt_to_equity !== undefined ||
    metrics.revenue_growth !== undefined ||
    metrics.gross_margin !== undefined ||
    metrics.return_on_equity !== undefined
  )

  // Count how many metrics we have
  const metricsCount = metrics ? Object.values(metrics).filter(v => v !== undefined && v !== null).length : 0

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setStages([])

    const results: StageResult[] = []

    // Stage 1: Financial Health
    await delay(300)
    results.push(analyzeFinancialHealth())
    setStages([...results])

    // Stage 2: Growth Analysis
    await delay(300)
    results.push(analyzeGrowth())
    setStages([...results])

    // Stage 3: Profitability
    await delay(300)
    results.push(analyzeProfitability())
    setStages([...results])

    // Stage 4: Valuation
    await delay(300)
    results.push(analyzeValuation())
    setStages([...results])

    // Stage 5: Cash Flow Quality
    await delay(300)
    results.push(analyzeCashFlow())
    setStages([...results])

    // Stage 6: Competitive Edge
    await delay(300)
    results.push(analyzeCompetitiveEdge())
    setStages([...results])

    // Stage 7: Final Recommendation
    await delay(300)
    results.push(generateRecommendation(results))
    setStages([...results])

    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const analyzeFinancialHealth = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // Debt to Equity
    const de = metrics.debt_to_equity || 0
    if (de <= GUARD_RAILS.health.debtToEquity.excellent) {
      ratings.push({ metric: 'Debt/Equity', value: de.toFixed(2), rating: 'Excellent', emoji: '✅' })
      score += 4
    } else if (de <= GUARD_RAILS.health.debtToEquity.good) {
      ratings.push({ metric: 'Debt/Equity', value: de.toFixed(2), rating: 'Good', emoji: '✓' })
      score += 3
    } else if (de <= GUARD_RAILS.health.debtToEquity.acceptable) {
      ratings.push({ metric: 'Debt/Equity', value: de.toFixed(2), rating: 'Moderate', emoji: '⚠️' })
      score += 2
    } else {
      ratings.push({ metric: 'Debt/Equity', value: de.toFixed(2), rating: 'High Risk', emoji: '🚨' })
      flags.push('High debt levels - bankruptcy risk')
      score += 1
    }

    // Current Ratio
    const cr = metrics.current_ratio || 0
    if (cr >= GUARD_RAILS.health.currentRatio.excellent) {
      ratings.push({ metric: 'Current Ratio', value: cr.toFixed(2), rating: 'Excellent', emoji: '✅' })
      score += 4
    } else if (cr >= GUARD_RAILS.health.currentRatio.good) {
      ratings.push({ metric: 'Current Ratio', value: cr.toFixed(2), rating: 'Good', emoji: '✓' })
      score += 3
    } else if (cr >= GUARD_RAILS.health.currentRatio.acceptable) {
      ratings.push({ metric: 'Current Ratio', value: cr.toFixed(2), rating: 'Acceptable', emoji: '⚠️' })
      score += 2
    } else {
      ratings.push({ metric: 'Current Ratio', value: cr.toFixed(2), rating: 'Liquidity Risk', emoji: '🚨' })
      flags.push('Low liquidity - may struggle to pay short-term obligations')
      score += 1
    }

    const grade = getGrade(score, 8)

    return {
      stage: 1,
      name: 'Financial Health',
      grade,
      score,
      maxScore: 8,
      ratings,
      flags
    }
  }

  const analyzeGrowth = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // Revenue Growth
    const rg = (metrics.revenue_growth || 0) * 100
    if (rg >= GUARD_RAILS.growth.revenueGrowth.excellent) {
      ratings.push({ metric: 'Revenue Growth', value: `${rg.toFixed(1)}%`, rating: 'Excellent', emoji: '🚀' })
      score += 4
    } else if (rg >= GUARD_RAILS.growth.revenueGrowth.good) {
      ratings.push({ metric: 'Revenue Growth', value: `${rg.toFixed(1)}%`, rating: 'Good', emoji: '✅' })
      score += 3
    } else if (rg >= GUARD_RAILS.growth.revenueGrowth.acceptable) {
      ratings.push({ metric: 'Revenue Growth', value: `${rg.toFixed(1)}%`, rating: 'Moderate', emoji: '✓' })
      score += 2
    } else {
      ratings.push({ metric: 'Revenue Growth', value: `${rg.toFixed(1)}%`, rating: 'Slow', emoji: '⚠️' })
      flags.push('Slow revenue growth')
      score += 1
    }

    // Earnings Growth
    const eg = (metrics.earnings_growth || 0) * 100
    if (eg >= GUARD_RAILS.growth.earningsGrowth.excellent) {
      ratings.push({ metric: 'Earnings Growth', value: `${eg.toFixed(1)}%`, rating: 'Excellent', emoji: '🚀' })
      score += 4
    } else if (eg >= GUARD_RAILS.growth.earningsGrowth.good) {
      ratings.push({ metric: 'Earnings Growth', value: `${eg.toFixed(1)}%`, rating: 'Good', emoji: '✅' })
      score += 3
    } else if (eg >= GUARD_RAILS.growth.earningsGrowth.acceptable) {
      ratings.push({ metric: 'Earnings Growth', value: `${eg.toFixed(1)}%`, rating: 'Moderate', emoji: '✓' })
      score += 2
    } else {
      ratings.push({ metric: 'Earnings Growth', value: `${eg.toFixed(1)}%`, rating: 'Weak', emoji: '⚠️' })
      flags.push('Weak earnings growth')
      score += 1
    }

    const grade = getGrade(score, 8)

    return {
      stage: 2,
      name: 'Growth Analysis',
      grade,
      score,
      maxScore: 8,
      ratings,
      flags
    }
  }

  const analyzeProfitability = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // Gross Margin
    const gm = (metrics.gross_margin || 0) * 100
    if (gm >= GUARD_RAILS.profitability.grossMargin.excellent) {
      ratings.push({ metric: 'Gross Margin', value: `${gm.toFixed(1)}%`, rating: 'Premium Business', emoji: '💎' })
      score += 4
    } else if (gm >= GUARD_RAILS.profitability.grossMargin.good) {
      ratings.push({ metric: 'Gross Margin', value: `${gm.toFixed(1)}%`, rating: 'Strong', emoji: '✅' })
      score += 3
    } else if (gm >= GUARD_RAILS.profitability.grossMargin.acceptable) {
      ratings.push({ metric: 'Gross Margin', value: `${gm.toFixed(1)}%`, rating: 'Average', emoji: '✓' })
      score += 2
    } else {
      ratings.push({ metric: 'Gross Margin', value: `${gm.toFixed(1)}%`, rating: 'Weak', emoji: '⚠️' })
      flags.push('Low gross margins - pricing power concerns')
      score += 1
    }

    // ROIC
    const roic = (metrics.return_on_invested_capital || 0) * 100
    if (roic >= GUARD_RAILS.profitability.roic.excellent) {
      ratings.push({ metric: 'ROIC', value: `${roic.toFixed(1)}%`, rating: 'Exceptional', emoji: '💎' })
      score += 4
    } else if (roic >= GUARD_RAILS.profitability.roic.good) {
      ratings.push({ metric: 'ROIC', value: `${roic.toFixed(1)}%`, rating: 'Good', emoji: '✅' })
      score += 3
    } else if (roic >= GUARD_RAILS.profitability.roic.acceptable) {
      ratings.push({ metric: 'ROIC', value: `${roic.toFixed(1)}%`, rating: 'Acceptable', emoji: '✓' })
      score += 2
    } else {
      ratings.push({ metric: 'ROIC', value: `${roic.toFixed(1)}%`, rating: 'Poor Capital Allocation', emoji: '🚨' })
      flags.push('Low ROIC - poor capital allocation')
      score += 1
    }

    // Operating Margin
    const om = (metrics.operating_margin || 0) * 100
    if (om >= GUARD_RAILS.profitability.operatingMargin.excellent) {
      ratings.push({ metric: 'Operating Margin', value: `${om.toFixed(1)}%`, rating: 'Excellent', emoji: '✅' })
      score += 4
    } else if (om >= GUARD_RAILS.profitability.operatingMargin.good) {
      ratings.push({ metric: 'Operating Margin', value: `${om.toFixed(1)}%`, rating: 'Good', emoji: '✓' })
      score += 3
    } else {
      ratings.push({ metric: 'Operating Margin', value: `${om.toFixed(1)}%`, rating: 'Below Average', emoji: '⚠️' })
      score += 2
    }

    const grade = getGrade(score, 12)

    return {
      stage: 3,
      name: 'Profitability',
      grade,
      score,
      maxScore: 12,
      ratings,
      flags
    }
  }

  const analyzeValuation = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // P/E Ratio
    const pe = metrics.price_to_earnings_ratio || 0
    if (pe > 0 && pe <= GUARD_RAILS.valuation.pe.excellent) {
      ratings.push({ metric: 'P/E Ratio', value: pe.toFixed(1), rating: 'Cheap', emoji: '💰' })
      score += 4
    } else if (pe <= GUARD_RAILS.valuation.pe.good) {
      ratings.push({ metric: 'P/E Ratio', value: pe.toFixed(1), rating: 'Fair', emoji: '✓' })
      score += 3
    } else if (pe <= GUARD_RAILS.valuation.pe.fair) {
      ratings.push({ metric: 'P/E Ratio', value: pe.toFixed(1), rating: 'Expensive', emoji: '⚠️' })
      score += 2
    } else {
      ratings.push({ metric: 'P/E Ratio', value: pe.toFixed(1), rating: 'Very Expensive', emoji: '🚨' })
      flags.push('High P/E - expensive valuation')
      score += 1
    }

    // PEG Ratio
    const peg = metrics.peg_ratio || 0
    if (peg > 0 && peg <= GUARD_RAILS.valuation.peg.excellent) {
      ratings.push({ metric: 'PEG Ratio', value: peg.toFixed(2), rating: 'Undervalued', emoji: '💎' })
      score += 4
    } else if (peg <= GUARD_RAILS.valuation.peg.good) {
      ratings.push({ metric: 'PEG Ratio', value: peg.toFixed(2), rating: 'Fair', emoji: '✓' })
      score += 3
    } else if (peg <= GUARD_RAILS.valuation.peg.fair) {
      ratings.push({ metric: 'PEG Ratio', value: peg.toFixed(2), rating: 'Overvalued', emoji: '⚠️' })
      score += 2
    } else {
      ratings.push({ metric: 'PEG Ratio', value: peg.toFixed(2), rating: 'Expensive', emoji: '🚨' })
      score += 1
    }

    // FCF Yield
    const fcfYield = (metrics.free_cash_flow_yield || 0) * 100
    if (fcfYield >= 5) {
      ratings.push({ metric: 'FCF Yield', value: `${fcfYield.toFixed(1)}%`, rating: 'Attractive', emoji: '💰' })
      score += 4
    } else if (fcfYield >= 3) {
      ratings.push({ metric: 'FCF Yield', value: `${fcfYield.toFixed(1)}%`, rating: 'Fair', emoji: '✓' })
      score += 3
    } else {
      ratings.push({ metric: 'FCF Yield', value: `${fcfYield.toFixed(1)}%`, rating: 'Low', emoji: '⚠️' })
      score += 2
    }

    const grade = getGrade(score, 12)

    return {
      stage: 4,
      name: 'Valuation',
      grade,
      score,
      maxScore: 12,
      ratings,
      flags
    }
  }

  const analyzeCashFlow = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // FCF Growth
    const fcfGrowth = (metrics.free_cash_flow_growth || 0) * 100
    if (fcfGrowth >= 20) {
      ratings.push({ metric: 'FCF Growth', value: `${fcfGrowth.toFixed(1)}%`, rating: 'Excellent', emoji: '🚀' })
      score += 4
    } else if (fcfGrowth >= 10) {
      ratings.push({ metric: 'FCF Growth', value: `${fcfGrowth.toFixed(1)}%`, rating: 'Good', emoji: '✅' })
      score += 3
    } else if (fcfGrowth >= 0) {
      ratings.push({ metric: 'FCF Growth', value: `${fcfGrowth.toFixed(1)}%`, rating: 'Stable', emoji: '✓' })
      score += 2
    } else {
      ratings.push({ metric: 'FCF Growth', value: `${fcfGrowth.toFixed(1)}%`, rating: 'Declining', emoji: '🚨' })
      flags.push('Declining free cash flow')
      score += 1
    }

    // FCF Yield as cash quality proxy
    const fcfYield = (metrics.free_cash_flow_yield || 0) * 100
    if (fcfYield >= 6) {
      ratings.push({ metric: 'Cash Generation', value: 'Strong', rating: 'High Quality', emoji: '💰' })
      score += 4
    } else if (fcfYield >= 3) {
      ratings.push({ metric: 'Cash Generation', value: 'Moderate', rating: 'Acceptable', emoji: '✓' })
      score += 3
    } else {
      ratings.push({ metric: 'Cash Generation', value: 'Weak', rating: 'Low Quality', emoji: '⚠️' })
      score += 2
    }

    const grade = getGrade(score, 8)

    return {
      stage: 5,
      name: 'Cash Flow Quality',
      grade,
      score,
      maxScore: 8,
      ratings,
      flags
    }
  }

  const analyzeCompetitiveEdge = (): StageResult => {
    const ratings: StageResult['ratings'] = []
    const flags: string[] = []
    let score = 0

    // Use ROIC as moat proxy
    const roic = (metrics.return_on_invested_capital || 0) * 100
    if (roic >= 25) {
      ratings.push({ metric: 'Competitive Moat', value: 'Wide', rating: 'Strong Moat', emoji: '🏰' })
      score += 4
    } else if (roic >= 15) {
      ratings.push({ metric: 'Competitive Moat', value: 'Moderate', rating: 'Some Moat', emoji: '✅' })
      score += 3
    } else if (roic >= 8) {
      ratings.push({ metric: 'Competitive Moat', value: 'Narrow', rating: 'Weak Moat', emoji: '⚠️' })
      score += 2
    } else {
      ratings.push({ metric: 'Competitive Moat', value: 'None', rating: 'No Moat', emoji: '🚨' })
      flags.push('No sustainable competitive advantage')
      score += 1
    }

    // Gross margin as pricing power proxy
    const gm = (metrics.gross_margin || 0) * 100
    if (gm >= 50) {
      ratings.push({ metric: 'Pricing Power', value: 'Strong', rating: 'Premium Brand', emoji: '💎' })
      score += 4
    } else if (gm >= 35) {
      ratings.push({ metric: 'Pricing Power', value: 'Moderate', rating: 'Some Power', emoji: '✓' })
      score += 3
    } else {
      ratings.push({ metric: 'Pricing Power', value: 'Weak', rating: 'Commodity', emoji: '⚠️' })
      score += 2
    }

    const grade = getGrade(score, 8)

    return {
      stage: 6,
      name: 'Competitive Edge',
      grade,
      score,
      maxScore: 8,
      ratings,
      flags
    }
  }

  const generateRecommendation = (results: StageResult[]): StageResult => {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0)
    const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0)
    const avgPct = (totalScore / maxScore) * 100

    let recommendation = ''
    let emoji = ''

    if (avgPct >= 80) {
      recommendation = 'STRONG BUY'
      emoji = '🚀'
    } else if (avgPct >= 65) {
      recommendation = 'BUY'
      emoji = '✅'
    } else if (avgPct >= 50) {
      recommendation = 'HOLD'
      emoji = '⚠️'
    } else if (avgPct >= 35) {
      recommendation = 'SELL'
      emoji = '🔴'
    } else {
      recommendation = 'STRONG SELL'
      emoji = '🚨'
    }

    const allFlags = results.flatMap(r => r.flags)

    return {
      stage: 7,
      name: 'Final Recommendation',
      grade: recommendation,
      score: totalScore,
      maxScore: maxScore,
      ratings: [
        { metric: 'Overall Score', value: `${avgPct.toFixed(0)}%`, rating: recommendation, emoji },
        { metric: 'Confidence', value: allFlags.length === 0 ? 'High' : allFlags.length <= 2 ? 'Medium' : 'Low', rating: `${allFlags.length} red flags`, emoji: allFlags.length === 0 ? '✅' : '⚠️' }
      ],
      flags: allFlags
    }
  }

  const getGrade = (score: number, maxScore: number): string => {
    const pct = (score / maxScore) * 100
    if (pct >= 90) return 'A+'
    if (pct >= 85) return 'A'
    if (pct >= 80) return 'A-'
    if (pct >= 75) return 'B+'
    if (pct >= 70) return 'B'
    if (pct >= 65) return 'B-'
    if (pct >= 60) return 'C+'
    if (pct >= 55) return 'C'
    if (pct >= 50) return 'C-'
    if (pct >= 45) return 'D+'
    if (pct >= 40) return 'D'
    return 'F'
  }

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'text-emerald-400'
    if (grade.startsWith('B')) return 'text-blue-400'
    if (grade.startsWith('C')) return 'text-yellow-400'
    if (grade.startsWith('D')) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            7-Stage Quant Analysis - {ticker}
            {hasMetrics && dataSource && (
              <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                dataSource === 'supabase'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {dataSource === 'supabase' ? 'Cached' : 'API'}
              </span>
            )}
          </CardTitle>
          {!analysisComplete && hasMetrics && (
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-secondary rounded-lg font-medium transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {stages.length === 0 && !isAnalyzing && !hasMetrics && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-muted-foreground">No financial metrics available for {ticker}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Metrics will be synced automatically when SEC filings are processed.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Data syncs every 5 minutes from SEC EDGAR
            </p>
          </div>
        )}

        {stages.length === 0 && !isAnalyzing && hasMetrics && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Click "Run Analysis" to perform institutional-grade quantitative analysis</p>
            <p className="text-sm mt-2">7 stages with 30+ guard rails • {metricsCount} metrics available</p>
          </div>
        )}

        {/* Stage Results */}
        <div className="space-y-4">
          {stages.map((stage, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                stage.stage === 7
                  ? stage.grade === 'STRONG BUY' || stage.grade === 'BUY'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : stage.grade === 'HOLD'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                  : 'bg-secondary/30 border-border/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Stage {stage.stage}</span>
                  <span className="font-bold">{stage.name}</span>
                </div>
                <span className={`text-xl font-bold ${getGradeColor(stage.grade)}`}>
                  {stage.grade}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {stage.ratings.map((r, j) => (
                  <div key={j} className="flex items-center justify-between p-2 bg-secondary/50 rounded text-sm">
                    <span className="text-muted-foreground">{r.metric}</span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{r.value}</span>
                      <span>{r.emoji}</span>
                    </span>
                  </div>
                ))}
              </div>

              {stage.flags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-red-500 text-sm font-medium">Red Flags:</p>
                  <ul className="text-sm text-muted-foreground mt-1">
                    {stage.flags.map((flag, j) => (
                      <li key={j}>🚨 {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {isAnalyzing && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 mr-3"></div>
            <span>Analyzing Stage {stages.length + 1} of 7...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
