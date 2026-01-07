/**
 * Lician Score - Comprehensive Stock Rating System
 *
 * A composite 1-10 rating for stocks based on five key dimensions:
 * - Value: Valuation metrics relative to sector/market
 * - Growth: Revenue and earnings growth trajectory
 * - Quality: Profitability, margins, and balance sheet strength
 * - Momentum: Price trends and analyst sentiment
 * - Safety: Risk metrics including volatility and leverage
 *
 * Each dimension is scored 1-10, and the overall score is a weighted average.
 */

// ============================================================================
// Types
// ============================================================================

export interface IncomeStatement {
  ticker: string
  report_period: string
  fiscal_period?: string
  period?: string
  currency?: string
  revenue: number | null
  cost_of_revenue?: number | null
  gross_profit: number | null
  operating_expense?: number | null
  operating_income: number | null
  interest_expense?: number | null
  ebit?: number | null
  net_income: number | null
  earnings_per_share?: number | null
  earnings_per_share_diluted?: number | null
}

export interface BalanceSheet {
  ticker: string
  report_period: string
  fiscal_period?: string
  period?: string
  currency?: string
  total_assets: number | null
  current_assets?: number | null
  cash_and_equivalents?: number | null
  total_liabilities: number | null
  current_liabilities?: number | null
  total_debt?: number | null
  current_debt?: number | null
  non_current_debt?: number | null
  shareholders_equity: number | null
  retained_earnings?: number | null
}

export interface CashFlowStatement {
  ticker: string
  report_period: string
  fiscal_period?: string
  period?: string
  net_cash_flow_from_operations?: number | null
  capital_expenditure?: number | null
  free_cash_flow?: number | null
}

export interface FinancialMetrics {
  ticker: string
  report_period: string
  period?: string
  // Valuation
  market_cap?: number | null
  enterprise_value?: number | null
  price_to_earnings_ratio?: number | null
  price_to_book_ratio?: number | null
  price_to_sales_ratio?: number | null
  enterprise_value_to_ebitda_ratio?: number | null
  peg_ratio?: number | null
  // Profitability
  gross_margin?: number | null
  operating_margin?: number | null
  net_margin?: number | null
  return_on_equity?: number | null
  return_on_assets?: number | null
  return_on_invested_capital?: number | null
  // Growth
  revenue_growth?: number | null
  earnings_growth?: number | null
  earnings_per_share_growth?: number | null
  free_cash_flow_growth?: number | null
  // Leverage
  debt_to_equity?: number | null
  debt_to_assets?: number | null
  interest_coverage?: number | null
  // Liquidity
  current_ratio?: number | null
  quick_ratio?: number | null
}

export interface PriceData {
  ticker: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adj_close?: number | null
}

export interface AnalystRating {
  ticker: string
  rating: string
  rating_prior?: string
  action?: string
  price_target?: number | null
  price_target_prior?: number | null
  rating_date: string
}

export interface SectorMedians {
  pe_ratio: number
  pb_ratio: number
  ps_ratio: number
  gross_margin: number
  operating_margin: number
  net_margin: number
  roe: number
  debt_to_equity: number
  revenue_growth: number
}

// Score breakdown for each dimension
export interface DimensionScore {
  score: number           // 1-10 score
  weight: number          // Weight in overall calculation
  dataPoints: number      // Number of data points used
  maxDataPoints: number   // Maximum possible data points
  confidence: number      // 0-1 confidence based on data availability
  explanation: string     // Human-readable explanation
  factors: ScoreFactor[]  // Individual factors that contributed
}

export interface ScoreFactor {
  name: string
  value: number | null
  benchmark?: number | null
  contribution: number    // How much this factor contributed (-5 to +5)
  interpretation: string
}

export interface LicianScore {
  ticker: string
  overallScore: number
  confidence: number
  calculatedAt: string
  dimensions: {
    value: DimensionScore
    growth: DimensionScore
    quality: DimensionScore
    momentum: DimensionScore
    safety: DimensionScore
  }
  summary: string
  dataQuality: {
    hasIncomeStatements: boolean
    hasBalanceSheets: boolean
    hasCashFlowStatements: boolean
    hasMetrics: boolean
    hasPriceHistory: boolean
    hasAnalystData: boolean
    quartersOfData: number
  }
}

// ============================================================================
// Default Sector Medians (Market averages when sector data unavailable)
// ============================================================================

const DEFAULT_MEDIANS: SectorMedians = {
  pe_ratio: 20,
  pb_ratio: 3,
  ps_ratio: 2.5,
  gross_margin: 0.35,
  operating_margin: 0.12,
  net_margin: 0.08,
  roe: 0.15,
  debt_to_equity: 0.8,
  revenue_growth: 0.08
}

// Dimension weights (must sum to 1.0)
const DIMENSION_WEIGHTS = {
  value: 0.20,
  growth: 0.25,
  quality: 0.25,
  momentum: 0.15,
  safety: 0.15
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Convert a percentile (0-100) to a 1-10 score
 */
function percentileToScore(percentile: number): number {
  return clamp(Math.round(percentile / 10), 1, 10)
}

/**
 * Score a metric where lower is better (e.g., P/E ratio)
 * Returns a score contribution from -5 to +5
 */
function scoreLowerIsBetter(
  value: number | null | undefined,
  benchmark: number,
  sensitivity: number = 1
): number {
  if (value === null || value === undefined || isNaN(value)) return 0
  if (value <= 0) return 2 // Negative values (e.g., negative P/E) are neutral to slightly positive

  const ratio = benchmark / value // Higher ratio = value is lower = better
  const score = (ratio - 1) * sensitivity * 5
  return clamp(score, -5, 5)
}

/**
 * Score a metric where higher is better (e.g., ROE, margins)
 * Returns a score contribution from -5 to +5
 */
function scoreHigherIsBetter(
  value: number | null | undefined,
  benchmark: number,
  sensitivity: number = 1
): number {
  if (value === null || value === undefined || isNaN(value)) return 0

  const ratio = value / benchmark // Higher ratio = value is higher = better
  const score = (ratio - 1) * sensitivity * 5
  return clamp(score, -5, 5)
}

/**
 * Score a metric where a specific range is optimal
 * Returns a score contribution from -5 to +5
 */
function scoreOptimalRange(
  value: number | null | undefined,
  optimalLow: number,
  optimalHigh: number,
  tolerance: number = 0.5
): number {
  if (value === null || value === undefined || isNaN(value)) return 0

  if (value >= optimalLow && value <= optimalHigh) {
    return 5 // Perfect range
  }

  const distanceFromRange = value < optimalLow
    ? (optimalLow - value) / optimalLow
    : (value - optimalHigh) / optimalHigh

  const penalty = distanceFromRange / tolerance * 5
  return clamp(-penalty, -5, 5)
}

/**
 * Calculate growth rate between two values
 */
function calculateGrowth(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null
  return (current - previous) / Math.abs(previous)
}

/**
 * Calculate simple moving average
 */
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null
  const slice = prices.slice(0, period)
  return slice.reduce((sum, p) => sum + p, 0) / period
}

/**
 * Interpret a score for human readability
 */
function interpretScore(score: number): string {
  if (score >= 8) return 'Excellent'
  if (score >= 6) return 'Good'
  if (score >= 4) return 'Average'
  if (score >= 2) return 'Below Average'
  return 'Poor'
}

// ============================================================================
// Dimension Scoring Functions
// ============================================================================

/**
 * Calculate Value Score
 * Measures how attractively priced the stock is relative to fundamentals
 */
export function calculateValueScore(
  metrics: FinancialMetrics | null,
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  medians: SectorMedians = DEFAULT_MEDIANS
): DimensionScore {
  const factors: ScoreFactor[] = []
  let totalContribution = 0
  let dataPoints = 0
  const maxDataPoints = 5

  // P/E Ratio (lower is better for value)
  const peRatio = metrics?.price_to_earnings_ratio
  if (peRatio !== null && peRatio !== undefined && peRatio > 0) {
    const contribution = scoreLowerIsBetter(peRatio, medians.pe_ratio, 0.8)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'P/E Ratio',
      value: peRatio,
      benchmark: medians.pe_ratio,
      contribution,
      interpretation: peRatio < medians.pe_ratio
        ? `Trading at ${((1 - peRatio/medians.pe_ratio) * 100).toFixed(0)}% discount to sector`
        : `Trading at ${((peRatio/medians.pe_ratio - 1) * 100).toFixed(0)}% premium to sector`
    })
  }

  // P/B Ratio (lower is better for value)
  const pbRatio = metrics?.price_to_book_ratio
  if (pbRatio !== null && pbRatio !== undefined && pbRatio > 0) {
    const contribution = scoreLowerIsBetter(pbRatio, medians.pb_ratio, 0.6)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'P/B Ratio',
      value: pbRatio,
      benchmark: medians.pb_ratio,
      contribution,
      interpretation: pbRatio < medians.pb_ratio
        ? `Book value undervalued vs sector`
        : `Book value premium vs sector`
    })
  }

  // P/S Ratio (lower is better for value)
  const psRatio = metrics?.price_to_sales_ratio
  if (psRatio !== null && psRatio !== undefined && psRatio > 0) {
    const contribution = scoreLowerIsBetter(psRatio, medians.ps_ratio, 0.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'P/S Ratio',
      value: psRatio,
      benchmark: medians.ps_ratio,
      contribution,
      interpretation: psRatio < medians.ps_ratio
        ? `Revenue-based valuation attractive`
        : `Revenue-based valuation expensive`
    })
  }

  // EV/EBITDA (lower is better for value)
  const evEbitda = metrics?.enterprise_value_to_ebitda_ratio
  if (evEbitda !== null && evEbitda !== undefined && evEbitda > 0 && evEbitda < 100) {
    const benchmark = 12 // Typical healthy EV/EBITDA
    const contribution = scoreLowerIsBetter(evEbitda, benchmark, 0.4)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'EV/EBITDA',
      value: evEbitda,
      benchmark,
      contribution,
      interpretation: evEbitda < benchmark
        ? `Enterprise value attractive relative to cash flow`
        : `Enterprise value expensive relative to cash flow`
    })
  }

  // PEG Ratio (lower is better, but only if positive)
  const pegRatio = metrics?.peg_ratio
  if (pegRatio !== null && pegRatio !== undefined && pegRatio > 0 && pegRatio < 5) {
    const benchmark = 1.5 // PEG < 1 is considered undervalued
    const contribution = scoreLowerIsBetter(pegRatio, benchmark, 1.2)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'PEG Ratio',
      value: pegRatio,
      benchmark,
      contribution,
      interpretation: pegRatio < 1
        ? `Growth-adjusted valuation very attractive (PEG < 1)`
        : pegRatio < benchmark
          ? `Growth-adjusted valuation attractive`
          : `Expensive relative to growth rate`
    })
  }

  // Calculate final score (base of 5, adjusted by contributions)
  const avgContribution = dataPoints > 0 ? totalContribution / dataPoints : 0
  const rawScore = 5 + avgContribution
  const score = clamp(Math.round(rawScore), 1, 10)
  const confidence = dataPoints / maxDataPoints

  return {
    score,
    weight: DIMENSION_WEIGHTS.value,
    dataPoints,
    maxDataPoints,
    confidence,
    explanation: generateValueExplanation(score, factors),
    factors
  }
}

function generateValueExplanation(score: number, factors: ScoreFactor[]): string {
  if (factors.length === 0) {
    return 'Insufficient valuation data available'
  }

  const positives = factors.filter(f => f.contribution > 1)
  const negatives = factors.filter(f => f.contribution < -1)

  if (score >= 7) {
    return `Stock appears undervalued${positives.length > 0 ? `. Key strengths: ${positives.map(f => f.name).join(', ')}` : ''}`
  } else if (score <= 3) {
    return `Stock appears overvalued${negatives.length > 0 ? `. Concerns: ${negatives.map(f => f.name).join(', ')}` : ''}`
  }
  return 'Valuation is roughly in line with sector averages'
}

/**
 * Calculate Growth Score
 * Measures revenue and earnings growth trajectory
 */
export function calculateGrowthScore(
  metrics: FinancialMetrics | null,
  incomeStatements: IncomeStatement[],
  medians: SectorMedians = DEFAULT_MEDIANS
): DimensionScore {
  const factors: ScoreFactor[] = []
  let totalContribution = 0
  let dataPoints = 0
  const maxDataPoints = 5

  // Revenue Growth (from metrics)
  const revenueGrowth = metrics?.revenue_growth
  if (revenueGrowth !== null && revenueGrowth !== undefined) {
    const contribution = scoreHigherIsBetter(revenueGrowth, medians.revenue_growth, 2)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Revenue Growth',
      value: revenueGrowth,
      benchmark: medians.revenue_growth,
      contribution,
      interpretation: revenueGrowth > 0.15
        ? `Strong revenue growth of ${(revenueGrowth * 100).toFixed(1)}%`
        : revenueGrowth > 0
          ? `Moderate revenue growth of ${(revenueGrowth * 100).toFixed(1)}%`
          : `Revenue declining ${(revenueGrowth * 100).toFixed(1)}%`
    })
  }

  // Earnings Growth (from metrics)
  const earningsGrowth = metrics?.earnings_growth
  if (earningsGrowth !== null && earningsGrowth !== undefined && Math.abs(earningsGrowth) < 5) {
    const contribution = scoreHigherIsBetter(earningsGrowth, 0.10, 1.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Earnings Growth',
      value: earningsGrowth,
      benchmark: 0.10,
      contribution,
      interpretation: earningsGrowth > 0.20
        ? `Strong earnings growth of ${(earningsGrowth * 100).toFixed(1)}%`
        : earningsGrowth > 0
          ? `Positive earnings growth of ${(earningsGrowth * 100).toFixed(1)}%`
          : `Earnings declining ${(earningsGrowth * 100).toFixed(1)}%`
    })
  }

  // EPS Growth (from metrics)
  const epsGrowth = metrics?.earnings_per_share_growth
  if (epsGrowth !== null && epsGrowth !== undefined && Math.abs(epsGrowth) < 5) {
    const contribution = scoreHigherIsBetter(epsGrowth, 0.10, 1.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'EPS Growth',
      value: epsGrowth,
      benchmark: 0.10,
      contribution,
      interpretation: epsGrowth > 0.15
        ? `Healthy EPS growth of ${(epsGrowth * 100).toFixed(1)}%`
        : epsGrowth > 0
          ? `Positive EPS growth of ${(epsGrowth * 100).toFixed(1)}%`
          : `EPS declining`
    })
  }

  // Calculate YoY revenue growth from income statements
  if (incomeStatements.length >= 5) {
    const current = incomeStatements[0]?.revenue
    const yearAgo = incomeStatements[4]?.revenue // 4 quarters ago
    const yoyGrowth = calculateGrowth(current, yearAgo)

    if (yoyGrowth !== null && Math.abs(yoyGrowth) < 5) {
      const contribution = scoreHigherIsBetter(yoyGrowth, medians.revenue_growth, 1.5)
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: 'YoY Revenue Growth (Calculated)',
        value: yoyGrowth,
        benchmark: medians.revenue_growth,
        contribution,
        interpretation: `Year-over-year revenue change: ${(yoyGrowth * 100).toFixed(1)}%`
      })
    }
  }

  // Revenue consistency (are they growing consistently?)
  if (incomeStatements.length >= 4) {
    let growthQuarters = 0
    for (let i = 0; i < Math.min(4, incomeStatements.length - 1); i++) {
      const current = incomeStatements[i]?.revenue
      const previous = incomeStatements[i + 1]?.revenue
      if (current && previous && current > previous) {
        growthQuarters++
      }
    }
    const consistency = growthQuarters / Math.min(4, incomeStatements.length - 1)
    const contribution = (consistency - 0.5) * 6 // 0.5 = neutral, 1.0 = +3, 0 = -3
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Growth Consistency',
      value: consistency,
      benchmark: 0.75,
      contribution,
      interpretation: `Revenue grew in ${growthQuarters} of last ${Math.min(4, incomeStatements.length - 1)} quarters`
    })
  }

  // Calculate final score
  const avgContribution = dataPoints > 0 ? totalContribution / dataPoints : 0
  const rawScore = 5 + avgContribution
  const score = clamp(Math.round(rawScore), 1, 10)
  const confidence = dataPoints / maxDataPoints

  return {
    score,
    weight: DIMENSION_WEIGHTS.growth,
    dataPoints,
    maxDataPoints,
    confidence,
    explanation: generateGrowthExplanation(score, factors),
    factors
  }
}

function generateGrowthExplanation(score: number, factors: ScoreFactor[]): string {
  if (factors.length === 0) {
    return 'Insufficient growth data available'
  }

  const revenueGrowth = factors.find(f => f.name === 'Revenue Growth')
  const earningsGrowth = factors.find(f => f.name === 'Earnings Growth')

  if (score >= 7) {
    return `Strong growth profile with ${revenueGrowth?.value ? `${(Number(revenueGrowth.value) * 100).toFixed(0)}% revenue growth` : 'robust fundamentals'}`
  } else if (score <= 3) {
    return `Weak growth trajectory - revenue and/or earnings declining`
  }
  return 'Moderate growth in line with market expectations'
}

/**
 * Calculate Quality Score
 * Measures profitability, margins, and balance sheet strength
 */
export function calculateQualityScore(
  metrics: FinancialMetrics | null,
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  medians: SectorMedians = DEFAULT_MEDIANS
): DimensionScore {
  const factors: ScoreFactor[] = []
  let totalContribution = 0
  let dataPoints = 0
  const maxDataPoints = 7

  // Return on Equity (higher is better)
  const roe = metrics?.return_on_equity
  if (roe !== null && roe !== undefined && Math.abs(roe) < 2) {
    const contribution = scoreHigherIsBetter(roe, medians.roe, 1.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Return on Equity',
      value: roe,
      benchmark: medians.roe,
      contribution,
      interpretation: roe > 0.20
        ? `Excellent ROE of ${(roe * 100).toFixed(1)}% indicates efficient capital use`
        : roe > medians.roe
          ? `Good ROE of ${(roe * 100).toFixed(1)}%`
          : roe > 0
            ? `Below-average ROE of ${(roe * 100).toFixed(1)}%`
            : `Negative ROE indicates losses`
    })
  }

  // Return on Assets (higher is better)
  const roa = metrics?.return_on_assets
  if (roa !== null && roa !== undefined && Math.abs(roa) < 1) {
    const benchmark = 0.06 // 6% is decent ROA
    const contribution = scoreHigherIsBetter(roa, benchmark, 2)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Return on Assets',
      value: roa,
      benchmark,
      contribution,
      interpretation: roa > 0.10
        ? `Strong asset efficiency with ${(roa * 100).toFixed(1)}% ROA`
        : roa > 0
          ? `ROA of ${(roa * 100).toFixed(1)}%`
          : `Negative ROA`
    })
  }

  // Gross Margin (higher is better)
  const grossMargin = metrics?.gross_margin
  if (grossMargin !== null && grossMargin !== undefined) {
    const contribution = scoreHigherIsBetter(grossMargin, medians.gross_margin, 1.2)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Gross Margin',
      value: grossMargin,
      benchmark: medians.gross_margin,
      contribution,
      interpretation: grossMargin > 0.50
        ? `High gross margin of ${(grossMargin * 100).toFixed(1)}% suggests pricing power`
        : grossMargin > medians.gross_margin
          ? `Healthy gross margin of ${(grossMargin * 100).toFixed(1)}%`
          : `Below-average gross margin of ${(grossMargin * 100).toFixed(1)}%`
    })
  }

  // Operating Margin (higher is better)
  const operatingMargin = metrics?.operating_margin
  if (operatingMargin !== null && operatingMargin !== undefined) {
    const contribution = scoreHigherIsBetter(operatingMargin, medians.operating_margin, 1.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Operating Margin',
      value: operatingMargin,
      benchmark: medians.operating_margin,
      contribution,
      interpretation: operatingMargin > 0.20
        ? `Strong operating margin of ${(operatingMargin * 100).toFixed(1)}%`
        : operatingMargin > 0
          ? `Operating margin of ${(operatingMargin * 100).toFixed(1)}%`
          : `Negative operating margin indicates operational challenges`
    })
  }

  // Net Margin (higher is better)
  const netMargin = metrics?.net_margin
  if (netMargin !== null && netMargin !== undefined) {
    const contribution = scoreHigherIsBetter(netMargin, medians.net_margin, 1.5)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Net Margin',
      value: netMargin,
      benchmark: medians.net_margin,
      contribution,
      interpretation: netMargin > 0.15
        ? `Excellent net margin of ${(netMargin * 100).toFixed(1)}%`
        : netMargin > 0
          ? `Net margin of ${(netMargin * 100).toFixed(1)}%`
          : `Company is currently unprofitable`
    })
  }

  // Debt to Equity (lower is better for quality)
  const debtToEquity = metrics?.debt_to_equity
  if (debtToEquity !== null && debtToEquity !== undefined && debtToEquity >= 0) {
    const contribution = scoreOptimalRange(debtToEquity, 0, 1.0, 1.0)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Debt to Equity',
      value: debtToEquity,
      benchmark: medians.debt_to_equity,
      contribution,
      interpretation: debtToEquity < 0.5
        ? `Conservative leverage with D/E of ${debtToEquity.toFixed(2)}`
        : debtToEquity < 1.0
          ? `Moderate leverage with D/E of ${debtToEquity.toFixed(2)}`
          : `High leverage with D/E of ${debtToEquity.toFixed(2)}`
    })
  }

  // Calculate margin trend from income statements
  if (incomeStatements.length >= 4) {
    const margins = incomeStatements.slice(0, 4).map(stmt => {
      if (stmt.revenue && stmt.gross_profit) {
        return stmt.gross_profit / stmt.revenue
      }
      return null
    }).filter((m): m is number => m !== null)

    if (margins.length >= 2) {
      const recentMargin = margins[0]
      const olderMargin = margins[margins.length - 1]
      const marginTrend = recentMargin - olderMargin
      const contribution = marginTrend > 0.02 ? 3 : marginTrend < -0.02 ? -3 : 0
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: 'Margin Trend',
        value: marginTrend,
        benchmark: 0,
        contribution,
        interpretation: marginTrend > 0
          ? `Margins expanding by ${(marginTrend * 100).toFixed(1)}pp`
          : marginTrend < 0
            ? `Margins contracting by ${(Math.abs(marginTrend) * 100).toFixed(1)}pp`
            : `Margins stable`
      })
    }
  }

  // Calculate final score
  const avgContribution = dataPoints > 0 ? totalContribution / dataPoints : 0
  const rawScore = 5 + avgContribution
  const score = clamp(Math.round(rawScore), 1, 10)
  const confidence = dataPoints / maxDataPoints

  return {
    score,
    weight: DIMENSION_WEIGHTS.quality,
    dataPoints,
    maxDataPoints,
    confidence,
    explanation: generateQualityExplanation(score, factors),
    factors
  }
}

function generateQualityExplanation(score: number, factors: ScoreFactor[]): string {
  if (factors.length === 0) {
    return 'Insufficient quality data available'
  }

  const roe = factors.find(f => f.name === 'Return on Equity')
  const margin = factors.find(f => f.name === 'Net Margin')

  if (score >= 7) {
    return `High-quality business with strong profitability and efficient operations`
  } else if (score <= 3) {
    return `Quality concerns - weak profitability or high leverage`
  }
  return 'Average quality metrics relative to peers'
}

/**
 * Calculate Momentum Score
 * Measures price trends and analyst sentiment
 */
export function calculateMomentumScore(
  prices: PriceData[],
  analystRatings: AnalystRating[]
): DimensionScore {
  const factors: ScoreFactor[] = []
  let totalContribution = 0
  let dataPoints = 0
  const maxDataPoints = 5

  if (prices.length > 0) {
    const closePrices = prices.map(p => p.adj_close || p.close)
    const currentPrice = closePrices[0]

    // 20-day SMA trend
    const sma20 = calculateSMA(closePrices, 20)
    if (sma20 !== null && currentPrice) {
      const pctAboveSMA20 = (currentPrice - sma20) / sma20
      const contribution = scoreHigherIsBetter(pctAboveSMA20, 0, 3)
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: '20-Day Trend',
        value: pctAboveSMA20,
        benchmark: 0,
        contribution,
        interpretation: pctAboveSMA20 > 0.05
          ? `Price ${(pctAboveSMA20 * 100).toFixed(1)}% above 20-day average - strong short-term momentum`
          : pctAboveSMA20 < -0.05
            ? `Price ${(Math.abs(pctAboveSMA20) * 100).toFixed(1)}% below 20-day average - weak short-term momentum`
            : `Price near 20-day average`
      })
    }

    // 50-day SMA trend
    const sma50 = calculateSMA(closePrices, 50)
    if (sma50 !== null && currentPrice) {
      const pctAboveSMA50 = (currentPrice - sma50) / sma50
      const contribution = scoreHigherIsBetter(pctAboveSMA50, 0, 2.5)
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: '50-Day Trend',
        value: pctAboveSMA50,
        benchmark: 0,
        contribution,
        interpretation: pctAboveSMA50 > 0.05
          ? `Price above 50-day average - medium-term uptrend`
          : pctAboveSMA50 < -0.05
            ? `Price below 50-day average - medium-term downtrend`
            : `Price consolidating around 50-day average`
      })
    }

    // 200-day SMA trend (long-term)
    const sma200 = calculateSMA(closePrices, 200)
    if (sma200 !== null && currentPrice) {
      const pctAboveSMA200 = (currentPrice - sma200) / sma200
      const contribution = scoreHigherIsBetter(pctAboveSMA200, 0, 2)
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: '200-Day Trend',
        value: pctAboveSMA200,
        benchmark: 0,
        contribution,
        interpretation: pctAboveSMA200 > 0
          ? `Price above 200-day average - long-term bullish`
          : `Price below 200-day average - long-term bearish`
      })
    }

    // Golden/Death Cross indicator (50 vs 200 SMA)
    if (sma50 !== null && sma200 !== null) {
      const crossSignal = sma50 > sma200 ? 1 : -1
      const contribution = crossSignal * 2
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: 'Moving Average Cross',
        value: crossSignal,
        benchmark: 0,
        contribution,
        interpretation: sma50 > sma200
          ? `Golden cross pattern (50 SMA > 200 SMA) - bullish signal`
          : `Death cross pattern (50 SMA < 200 SMA) - bearish signal`
      })
    }
  }

  // Analyst rating momentum
  if (analystRatings.length > 0) {
    // Count upgrades vs downgrades in recent ratings
    let upgrades = 0
    let downgrades = 0
    const recentRatings = analystRatings.slice(0, 10) // Last 10 ratings

    for (const rating of recentRatings) {
      if (rating.action?.toLowerCase().includes('upgrade') ||
          rating.action?.toLowerCase().includes('initiated') ||
          rating.action?.toLowerCase().includes('raised')) {
        upgrades++
      } else if (rating.action?.toLowerCase().includes('downgrade') ||
                 rating.action?.toLowerCase().includes('lowered')) {
        downgrades++
      }
    }

    const netSentiment = (upgrades - downgrades) / Math.max(recentRatings.length, 1)
    const contribution = netSentiment * 5
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Analyst Sentiment',
      value: netSentiment,
      benchmark: 0,
      contribution,
      interpretation: upgrades > downgrades
        ? `Net positive analyst momentum: ${upgrades} upgrades vs ${downgrades} downgrades`
        : downgrades > upgrades
          ? `Net negative analyst momentum: ${downgrades} downgrades vs ${upgrades} upgrades`
          : `Mixed analyst sentiment`
    })
  }

  // Calculate final score
  const avgContribution = dataPoints > 0 ? totalContribution / dataPoints : 0
  const rawScore = 5 + avgContribution
  const score = clamp(Math.round(rawScore), 1, 10)
  const confidence = dataPoints / maxDataPoints

  return {
    score,
    weight: DIMENSION_WEIGHTS.momentum,
    dataPoints,
    maxDataPoints,
    confidence,
    explanation: generateMomentumExplanation(score, factors),
    factors
  }
}

function generateMomentumExplanation(score: number, factors: ScoreFactor[]): string {
  if (factors.length === 0) {
    return 'Insufficient price/analyst data for momentum analysis'
  }

  const trend200 = factors.find(f => f.name === '200-Day Trend')
  const analystSentiment = factors.find(f => f.name === 'Analyst Sentiment')

  if (score >= 7) {
    return `Strong momentum with bullish price trends${analystSentiment?.contribution && analystSentiment.contribution > 0 ? ' and positive analyst revisions' : ''}`
  } else if (score <= 3) {
    return `Weak momentum - price in downtrend${analystSentiment?.contribution && analystSentiment.contribution < 0 ? ' with negative analyst sentiment' : ''}`
  }
  return 'Neutral momentum with mixed signals'
}

/**
 * Calculate Safety Score
 * Measures risk metrics including volatility and leverage
 */
export function calculateSafetyScore(
  metrics: FinancialMetrics | null,
  balanceSheets: BalanceSheet[],
  prices: PriceData[]
): DimensionScore {
  const factors: ScoreFactor[] = []
  let totalContribution = 0
  let dataPoints = 0
  const maxDataPoints = 5

  // Interest Coverage (higher is better - ability to pay interest)
  const interestCoverage = metrics?.interest_coverage
  if (interestCoverage !== null && interestCoverage !== undefined && interestCoverage > 0) {
    const contribution = interestCoverage > 10 ? 4 : interestCoverage > 5 ? 2 : interestCoverage > 2 ? 0 : -3
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Interest Coverage',
      value: interestCoverage,
      benchmark: 5,
      contribution,
      interpretation: interestCoverage > 10
        ? `Excellent interest coverage of ${interestCoverage.toFixed(1)}x`
        : interestCoverage > 5
          ? `Healthy interest coverage of ${interestCoverage.toFixed(1)}x`
          : interestCoverage > 2
            ? `Adequate interest coverage of ${interestCoverage.toFixed(1)}x`
            : `Weak interest coverage - may struggle to service debt`
    })
  }

  // Current Ratio (liquidity - optimal around 1.5-2.0)
  const currentRatio = metrics?.current_ratio
  if (currentRatio !== null && currentRatio !== undefined && currentRatio > 0) {
    const contribution = scoreOptimalRange(currentRatio, 1.2, 2.5, 0.8)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Current Ratio',
      value: currentRatio,
      benchmark: 1.5,
      contribution,
      interpretation: currentRatio > 2
        ? `Strong liquidity with current ratio of ${currentRatio.toFixed(2)}`
        : currentRatio > 1
          ? `Adequate liquidity with current ratio of ${currentRatio.toFixed(2)}`
          : `Liquidity concerns with current ratio below 1`
    })
  }

  // Quick Ratio (more stringent liquidity test)
  const quickRatio = metrics?.quick_ratio
  if (quickRatio !== null && quickRatio !== undefined && quickRatio > 0) {
    const contribution = scoreOptimalRange(quickRatio, 0.8, 2.0, 0.6)
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Quick Ratio',
      value: quickRatio,
      benchmark: 1.0,
      contribution,
      interpretation: quickRatio > 1
        ? `Good quick ratio of ${quickRatio.toFixed(2)} - can meet short-term obligations`
        : `Quick ratio below 1 may indicate liquidity stress`
    })
  }

  // Debt to Assets (lower is safer)
  const debtToAssets = metrics?.debt_to_assets
  if (debtToAssets !== null && debtToAssets !== undefined && debtToAssets >= 0) {
    const contribution = debtToAssets < 0.3 ? 3 : debtToAssets < 0.5 ? 1 : debtToAssets < 0.7 ? -1 : -3
    totalContribution += contribution
    dataPoints++
    factors.push({
      name: 'Debt to Assets',
      value: debtToAssets,
      benchmark: 0.4,
      contribution,
      interpretation: debtToAssets < 0.3
        ? `Conservative balance sheet with ${(debtToAssets * 100).toFixed(0)}% debt/assets`
        : debtToAssets < 0.5
          ? `Moderate leverage with ${(debtToAssets * 100).toFixed(0)}% debt/assets`
          : `High leverage with ${(debtToAssets * 100).toFixed(0)}% debt/assets`
    })
  }

  // Price Volatility (calculated from price data)
  if (prices.length >= 30) {
    const returns = []
    for (let i = 0; i < Math.min(60, prices.length - 1); i++) {
      const current = prices[i].adj_close || prices[i].close
      const previous = prices[i + 1].adj_close || prices[i + 1].close
      if (current && previous) {
        returns.push((current - previous) / previous)
      }
    }

    if (returns.length >= 20) {
      const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
      const dailyVol = Math.sqrt(variance)
      const annualizedVol = dailyVol * Math.sqrt(252) // Annualize

      // Lower volatility is safer
      const contribution = annualizedVol < 0.20 ? 3 : annualizedVol < 0.30 ? 1 : annualizedVol < 0.50 ? -1 : -3
      totalContribution += contribution
      dataPoints++
      factors.push({
        name: 'Price Volatility',
        value: annualizedVol,
        benchmark: 0.25,
        contribution,
        interpretation: annualizedVol < 0.20
          ? `Low volatility stock (${(annualizedVol * 100).toFixed(0)}% annualized)`
          : annualizedVol < 0.35
            ? `Moderate volatility (${(annualizedVol * 100).toFixed(0)}% annualized)`
            : `High volatility (${(annualizedVol * 100).toFixed(0)}% annualized) - higher risk`
      })
    }
  }

  // Calculate final score
  const avgContribution = dataPoints > 0 ? totalContribution / dataPoints : 0
  const rawScore = 5 + avgContribution
  const score = clamp(Math.round(rawScore), 1, 10)
  const confidence = dataPoints / maxDataPoints

  return {
    score,
    weight: DIMENSION_WEIGHTS.safety,
    dataPoints,
    maxDataPoints,
    confidence,
    explanation: generateSafetyExplanation(score, factors),
    factors
  }
}

function generateSafetyExplanation(score: number, factors: ScoreFactor[]): string {
  if (factors.length === 0) {
    return 'Insufficient data for safety analysis'
  }

  if (score >= 7) {
    return `Low-risk profile with strong balance sheet and moderate volatility`
  } else if (score <= 3) {
    return `Higher risk profile - watch leverage and volatility`
  }
  return 'Average risk profile relative to market'
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate the complete Lician Score for a stock
 */
export function calculateLicianScore(
  ticker: string,
  incomeStatements: IncomeStatement[],
  balanceSheets: BalanceSheet[],
  cashFlowStatements: CashFlowStatement[],
  metrics: FinancialMetrics | null,
  prices: PriceData[],
  analystRatings: AnalystRating[],
  sectorMedians: SectorMedians = DEFAULT_MEDIANS
): LicianScore {
  // Calculate each dimension
  const valueScore = calculateValueScore(metrics, incomeStatements, balanceSheets, sectorMedians)
  const growthScore = calculateGrowthScore(metrics, incomeStatements, sectorMedians)
  const qualityScore = calculateQualityScore(metrics, incomeStatements, balanceSheets, sectorMedians)
  const momentumScore = calculateMomentumScore(prices, analystRatings)
  const safetyScore = calculateSafetyScore(metrics, balanceSheets, prices)

  // Calculate weighted overall score
  const weightedSum =
    valueScore.score * valueScore.weight +
    growthScore.score * growthScore.weight +
    qualityScore.score * qualityScore.weight +
    momentumScore.score * momentumScore.weight +
    safetyScore.score * safetyScore.weight

  const overallScore = clamp(Math.round(weightedSum), 1, 10)

  // Calculate overall confidence
  const avgConfidence = (
    valueScore.confidence * valueScore.weight +
    growthScore.confidence * growthScore.weight +
    qualityScore.confidence * qualityScore.weight +
    momentumScore.confidence * momentumScore.weight +
    safetyScore.confidence * safetyScore.weight
  )

  // Data quality summary
  const dataQuality = {
    hasIncomeStatements: incomeStatements.length > 0,
    hasBalanceSheets: balanceSheets.length > 0,
    hasCashFlowStatements: cashFlowStatements.length > 0,
    hasMetrics: metrics !== null,
    hasPriceHistory: prices.length > 0,
    hasAnalystData: analystRatings.length > 0,
    quartersOfData: Math.max(incomeStatements.length, balanceSheets.length)
  }

  // Generate overall summary
  const summary = generateOverallSummary(
    ticker,
    overallScore,
    { value: valueScore, growth: growthScore, quality: qualityScore, momentum: momentumScore, safety: safetyScore }
  )

  return {
    ticker: ticker.toUpperCase(),
    overallScore,
    confidence: avgConfidence,
    calculatedAt: new Date().toISOString(),
    dimensions: {
      value: valueScore,
      growth: growthScore,
      quality: qualityScore,
      momentum: momentumScore,
      safety: safetyScore
    },
    summary,
    dataQuality
  }
}

function generateOverallSummary(
  ticker: string,
  overallScore: number,
  dimensions: {
    value: DimensionScore
    growth: DimensionScore
    quality: DimensionScore
    momentum: DimensionScore
    safety: DimensionScore
  }
): string {
  const scores = [
    { name: 'Value', score: dimensions.value.score },
    { name: 'Growth', score: dimensions.growth.score },
    { name: 'Quality', score: dimensions.quality.score },
    { name: 'Momentum', score: dimensions.momentum.score },
    { name: 'Safety', score: dimensions.safety.score }
  ]

  const strengths = scores.filter(s => s.score >= 7).map(s => s.name)
  const weaknesses = scores.filter(s => s.score <= 3).map(s => s.name)

  let summary = `${ticker} has a Lician Score of ${overallScore}/10 (${interpretScore(overallScore)}). `

  if (strengths.length > 0) {
    summary += `Strengths: ${strengths.join(', ')}. `
  }
  if (weaknesses.length > 0) {
    summary += `Areas of concern: ${weaknesses.join(', ')}. `
  }
  if (strengths.length === 0 && weaknesses.length === 0) {
    summary += `The stock shows average characteristics across all dimensions.`
  }

  return summary.trim()
}

// ============================================================================
// Sector Medians Lookup (can be expanded with actual sector data)
// ============================================================================

const SECTOR_MEDIANS: Record<string, SectorMedians> = {
  'Technology': {
    pe_ratio: 25,
    pb_ratio: 5,
    ps_ratio: 5,
    gross_margin: 0.55,
    operating_margin: 0.18,
    net_margin: 0.15,
    roe: 0.18,
    debt_to_equity: 0.5,
    revenue_growth: 0.12
  },
  'Healthcare': {
    pe_ratio: 22,
    pb_ratio: 4,
    ps_ratio: 3,
    gross_margin: 0.60,
    operating_margin: 0.15,
    net_margin: 0.10,
    roe: 0.14,
    debt_to_equity: 0.6,
    revenue_growth: 0.08
  },
  'Financial Services': {
    pe_ratio: 12,
    pb_ratio: 1.2,
    ps_ratio: 2,
    gross_margin: 0.45,
    operating_margin: 0.25,
    net_margin: 0.18,
    roe: 0.12,
    debt_to_equity: 2.0,
    revenue_growth: 0.06
  },
  'Consumer Cyclical': {
    pe_ratio: 18,
    pb_ratio: 3,
    ps_ratio: 1.2,
    gross_margin: 0.35,
    operating_margin: 0.10,
    net_margin: 0.06,
    roe: 0.15,
    debt_to_equity: 0.8,
    revenue_growth: 0.07
  },
  'Consumer Defensive': {
    pe_ratio: 20,
    pb_ratio: 4,
    ps_ratio: 1.5,
    gross_margin: 0.35,
    operating_margin: 0.12,
    net_margin: 0.08,
    roe: 0.20,
    debt_to_equity: 0.9,
    revenue_growth: 0.04
  },
  'Industrials': {
    pe_ratio: 18,
    pb_ratio: 3,
    ps_ratio: 1.5,
    gross_margin: 0.30,
    operating_margin: 0.10,
    net_margin: 0.07,
    roe: 0.15,
    debt_to_equity: 0.8,
    revenue_growth: 0.06
  },
  'Energy': {
    pe_ratio: 10,
    pb_ratio: 1.5,
    ps_ratio: 1.0,
    gross_margin: 0.40,
    operating_margin: 0.15,
    net_margin: 0.08,
    roe: 0.12,
    debt_to_equity: 0.6,
    revenue_growth: 0.05
  },
  'Utilities': {
    pe_ratio: 18,
    pb_ratio: 1.8,
    ps_ratio: 2,
    gross_margin: 0.45,
    operating_margin: 0.20,
    net_margin: 0.12,
    roe: 0.10,
    debt_to_equity: 1.2,
    revenue_growth: 0.03
  },
  'Real Estate': {
    pe_ratio: 35,
    pb_ratio: 2,
    ps_ratio: 8,
    gross_margin: 0.55,
    operating_margin: 0.30,
    net_margin: 0.20,
    roe: 0.08,
    debt_to_equity: 1.0,
    revenue_growth: 0.05
  },
  'Basic Materials': {
    pe_ratio: 12,
    pb_ratio: 1.8,
    ps_ratio: 1.2,
    gross_margin: 0.25,
    operating_margin: 0.12,
    net_margin: 0.08,
    roe: 0.12,
    debt_to_equity: 0.5,
    revenue_growth: 0.05
  },
  'Communication Services': {
    pe_ratio: 20,
    pb_ratio: 3,
    ps_ratio: 3,
    gross_margin: 0.50,
    operating_margin: 0.18,
    net_margin: 0.12,
    roe: 0.14,
    debt_to_equity: 0.7,
    revenue_growth: 0.08
  }
}

export function getSectorMedians(sector: string | null | undefined): SectorMedians {
  if (!sector) return DEFAULT_MEDIANS

  // Try to match sector name
  const normalizedSector = sector.trim()
  if (SECTOR_MEDIANS[normalizedSector]) {
    return SECTOR_MEDIANS[normalizedSector]
  }

  // Try partial matching
  for (const [key, value] of Object.entries(SECTOR_MEDIANS)) {
    if (normalizedSector.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedSector.toLowerCase())) {
      return value
    }
  }

  return DEFAULT_MEDIANS
}
