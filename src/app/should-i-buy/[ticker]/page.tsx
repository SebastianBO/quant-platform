import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { LastUpdatedStatic } from '@/components/seo/LastUpdated'
import PeerComparison from '@/components/PeerComparison'
import { UpcomingCatalysts, CatalystEvent } from '@/components/UpcomingCatalysts'
import { generateEventSchemas } from '@/lib/event-schemas'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getStockFAQsExtended,
  getCorporationSchema,
  getAggregateRatingSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// ISR with 5 minute revalidation - balances freshness with crawl reliability
export const revalidate = 300

// Fetch stock data for rich metadata
async function getStockDataForMeta(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Generate verdict based on PE ratio for meta
function getVerdictForMeta(peRatio: number | null | undefined): string {
  if (!peRatio || peRatio <= 0) return 'ANALYZE'
  if (peRatio < 15) return 'BUY'
  if (peRatio < 25) return 'HOLD'
  return 'CAUTION'
}

// Generate metadata for SEO with dynamic data for CTR
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
  const currentDay = new Date().getDate()

  // Fetch real data for compelling meta description
  const stockData = await getStockDataForMeta(symbol)
  const price = stockData?.snapshot?.price
  const pe = stockData?.metrics?.price_to_earnings_ratio
  const dayChangePercent = stockData?.snapshot?.day_change_percent
  const analystCount = stockData?.analystRatings?.length || 0
  const companyName = stockData?.companyFacts?.name || symbol

  // Get AI verdict
  const verdict = getVerdictForMeta(pe)

  // Build dynamic title (under 60 chars)
  let title = `Should I Buy ${symbol}? ${currentYear} Expert Analysis`
  if (title.length > 60) {
    title = `Should I Buy ${symbol}? ${currentYear} Analysis`
  }

  // Build dynamic description (155-160 chars max)
  let description = `Should you buy ${symbol} stock in ${currentYear}? AI analysis with price targets, analyst ratings & verdict. Updated ${currentMonth} ${currentDay}.`

  if (price) {
    const priceStr = `${symbol} at $${price.toFixed(0)}`
    const peStr = pe && pe > 0 ? `, PE ${pe.toFixed(0)}` : ''
    const changeStr = dayChangePercent !== undefined ? ` (${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(1)}% today)` : ''
    const verdictStr = `. Verdict: ${verdict}`
    const analystStr = analystCount > 0 ? `. ${analystCount} analyst ratings` : ''
    const ctaStr = `. Full analysis inside.`

    description = `${priceStr}${peStr}${changeStr}${verdictStr}${analystStr}${ctaStr}`
    if (description.length > 160) {
      description = `${priceStr}${peStr}${verdictStr}${analystStr}${ctaStr}`
    }
    if (description.length > 160) {
      description = `${priceStr}${peStr}${verdictStr}. Expert analysis & price targets. Updated ${currentMonth} ${currentDay}.`
    }
  }

  return {
    title,
    description,
    keywords: [
      `should i buy ${symbol}`,
      `${symbol} stock buy or sell`,
      `${symbol} stock analysis`,
      `${symbol} price prediction`,
      `${symbol} investment advice`,
      `${symbol} earnings date`,
      `is ${symbol} a good investment`
    ],
    openGraph: {
      title: `Should I Buy ${symbol} Stock? | ${companyName}`,
      description,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/should-i-buy/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Sector peer mapping for better alternatives
const SECTOR_PEERS: Record<string, string[]> = {
  Technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AMD', 'CRM', 'ADBE', 'ORCL', 'INTC'],
  Healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT', 'BMY', 'AMGN'],
  Financials: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'AXP', 'V', 'MA'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'BKNG', 'CMG'],
  'Consumer Defensive': ['WMT', 'PG', 'KO', 'PEP', 'COST', 'PM', 'MO', 'CL', 'KMB', 'GIS'],
  Energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL'],
  Industrials: ['UNP', 'CAT', 'BA', 'HON', 'RTX', 'GE', 'LMT', 'DE', 'UPS', 'FDX'],
  'Communication Services': ['GOOGL', 'META', 'NFLX', 'DIS', 'VZ', 'T', 'TMUS', 'CMCSA', 'EA', 'TTWO'],
  'Real Estate': ['PLD', 'AMT', 'EQIX', 'CCI', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'AVB'],
  Utilities: ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'WEC'],
  Materials: ['LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'DD', 'DOW', 'NUE', 'VMC'],
}

// Build initial catalyst events from stock data
function buildInitialEvents(ticker: string, companyName: string, snapshot: any): CatalystEvent[] {
  const events: CatalystEvent[] = []

  if (snapshot?.earningsDate) {
    const earningsDate = new Date(snapshot.earningsDate)
    if (earningsDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `earnings-${snapshot.earningsDate}-${ticker}`,
        type: 'earnings',
        title: `${ticker} Quarterly Earnings Report`,
        description: `${companyName} is scheduled to report quarterly financial results. Consider timing your purchase around this event.`,
        date: snapshot.earningsDate,
        isConfirmed: true,
        importance: 'high',
      })
    }
  }

  if (snapshot?.exDividendDate) {
    const exDivDate = new Date(snapshot.exDividendDate)
    if (exDivDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      events.push({
        id: `ex-dividend-${snapshot.exDividendDate}-${ticker}`,
        type: 'ex_dividend',
        title: `${ticker} Ex-Dividend Date`,
        description: snapshot.dividendShare
          ? `Buy before this date to receive the $${snapshot.dividendShare.toFixed(2)} dividend.`
          : `Buy before this date to receive the upcoming dividend.`,
        date: snapshot.exDividendDate,
        isConfirmed: true,
        importance: 'medium',
      })
    }
  }

  return events
}

// Calculate decision score from metrics (1-10)
function calculateDecisionScore(metrics: any, snapshot: any, insiderTrades: any[]): {
  score: number
  breakdown: { factor: string; score: number; weight: number; reason: string }[]
} {
  const breakdown: { factor: string; score: number; weight: number; reason: string }[] = []

  // 1. Valuation Score (weight: 20%)
  const pe = metrics?.price_to_earnings_ratio || 0
  let valuationScore = 5
  let valuationReason = 'P/E data not available'
  if (pe > 0) {
    if (pe < 10) { valuationScore = 9; valuationReason = `Very low P/E of ${pe.toFixed(1)} suggests undervaluation` }
    else if (pe < 15) { valuationScore = 8; valuationReason = `Attractive P/E of ${pe.toFixed(1)}` }
    else if (pe < 20) { valuationScore = 7; valuationReason = `Reasonable P/E of ${pe.toFixed(1)}` }
    else if (pe < 25) { valuationScore = 6; valuationReason = `Fair P/E of ${pe.toFixed(1)}` }
    else if (pe < 35) { valuationScore = 5; valuationReason = `Elevated P/E of ${pe.toFixed(1)}` }
    else if (pe < 50) { valuationScore = 3; valuationReason = `High P/E of ${pe.toFixed(1)} indicates premium` }
    else { valuationScore = 2; valuationReason = `Very high P/E of ${pe.toFixed(1)} suggests overvaluation` }
  }
  breakdown.push({ factor: 'Valuation', score: valuationScore, weight: 0.20, reason: valuationReason })

  // 2. Growth Score (weight: 20%)
  const revenueGrowth = metrics?.revenue_growth || 0
  const earningsGrowth = metrics?.earnings_growth || 0
  let growthScore = 5
  let growthReason = 'Growth data limited'
  if (revenueGrowth !== 0 || earningsGrowth !== 0) {
    const avgGrowth = (revenueGrowth + earningsGrowth) / 2
    if (avgGrowth > 0.30) { growthScore = 10; growthReason = `Exceptional growth of ${(avgGrowth * 100).toFixed(0)}%` }
    else if (avgGrowth > 0.20) { growthScore = 9; growthReason = `Strong growth of ${(avgGrowth * 100).toFixed(0)}%` }
    else if (avgGrowth > 0.10) { growthScore = 7; growthReason = `Solid growth of ${(avgGrowth * 100).toFixed(0)}%` }
    else if (avgGrowth > 0.05) { growthScore = 6; growthReason = `Moderate growth of ${(avgGrowth * 100).toFixed(0)}%` }
    else if (avgGrowth > 0) { growthScore = 5; growthReason = `Slow growth of ${(avgGrowth * 100).toFixed(0)}%` }
    else if (avgGrowth > -0.10) { growthScore = 3; growthReason = `Declining ${(avgGrowth * 100).toFixed(0)}%` }
    else { growthScore = 1; growthReason = `Severe decline of ${(avgGrowth * 100).toFixed(0)}%` }
  }
  breakdown.push({ factor: 'Growth', score: growthScore, weight: 0.20, reason: growthReason })

  // 3. Profitability Score (weight: 20%)
  const profitMargin = metrics?.profit_margin || metrics?.net_margin || 0
  const roic = metrics?.return_on_invested_capital || metrics?.return_on_equity || 0
  let profitScore = 5
  let profitReason = 'Profitability data limited'
  if (profitMargin !== 0 || roic !== 0) {
    if (profitMargin > 0.25 || roic > 0.25) { profitScore = 10; profitReason = `Excellent margins (${(profitMargin * 100).toFixed(0)}% net)` }
    else if (profitMargin > 0.15 || roic > 0.15) { profitScore = 8; profitReason = `Strong margins (${(profitMargin * 100).toFixed(0)}% net)` }
    else if (profitMargin > 0.08 || roic > 0.10) { profitScore = 6; profitReason = `Decent margins (${(profitMargin * 100).toFixed(0)}% net)` }
    else if (profitMargin > 0) { profitScore = 4; profitReason = `Thin margins (${(profitMargin * 100).toFixed(0)}% net)` }
    else { profitScore = 2; profitReason = 'Currently unprofitable' }
  }
  breakdown.push({ factor: 'Profitability', score: profitScore, weight: 0.20, reason: profitReason })

  // 4. Financial Health Score (weight: 15%)
  const debtToEquity = metrics?.debt_to_equity || 0
  const currentRatio = metrics?.current_ratio || 0
  let healthScore = 5
  let healthReason = 'Financial health data limited'
  if (debtToEquity !== 0 || currentRatio !== 0) {
    let debtScore = 5
    if (debtToEquity < 0.3) debtScore = 10
    else if (debtToEquity < 0.5) debtScore = 8
    else if (debtToEquity < 1.0) debtScore = 6
    else if (debtToEquity < 1.5) debtScore = 4
    else if (debtToEquity < 2.0) debtScore = 2
    else debtScore = 1

    let liquidityScore = 5
    if (currentRatio > 2.0) liquidityScore = 9
    else if (currentRatio > 1.5) liquidityScore = 7
    else if (currentRatio > 1.0) liquidityScore = 5
    else liquidityScore = 3

    healthScore = Math.round((debtScore + liquidityScore) / 2)
    healthReason = `D/E: ${debtToEquity.toFixed(2)}, Current Ratio: ${currentRatio.toFixed(2)}`
  }
  breakdown.push({ factor: 'Financial Health', score: healthScore, weight: 0.15, reason: healthReason })

  // 5. Cash Flow Score (weight: 15%)
  const fcfYield = metrics?.free_cash_flow_yield || 0
  let fcfScore = 5
  let fcfReason = 'Cash flow data limited'
  if (fcfYield !== 0) {
    if (fcfYield > 0.08) { fcfScore = 10; fcfReason = `Excellent FCF yield of ${(fcfYield * 100).toFixed(1)}%` }
    else if (fcfYield > 0.05) { fcfScore = 8; fcfReason = `Strong FCF yield of ${(fcfYield * 100).toFixed(1)}%` }
    else if (fcfYield > 0.03) { fcfScore = 6; fcfReason = `Decent FCF yield of ${(fcfYield * 100).toFixed(1)}%` }
    else if (fcfYield > 0) { fcfScore = 4; fcfReason = `Low FCF yield of ${(fcfYield * 100).toFixed(1)}%` }
    else { fcfScore = 2; fcfReason = 'Negative free cash flow' }
  }
  breakdown.push({ factor: 'Cash Flow', score: fcfScore, weight: 0.15, reason: fcfReason })

  // 6. Insider Activity Score (weight: 10%)
  let insiderScore = 5
  let insiderReason = 'No recent insider activity'
  if (insiderTrades?.length > 0) {
    const recentTrades = insiderTrades.slice(0, 10)
    const buyCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('buy') ||
      t.transaction_type?.toLowerCase().includes('purchase')
    ).length
    const sellCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('sell') ||
      t.transaction_type?.toLowerCase().includes('sale')
    ).length

    if (buyCount > sellCount * 2) { insiderScore = 9; insiderReason = `Strong insider buying (${buyCount} buys vs ${sellCount} sells)` }
    else if (buyCount > sellCount) { insiderScore = 7; insiderReason = `Net insider buying (${buyCount} buys vs ${sellCount} sells)` }
    else if (buyCount === sellCount) { insiderScore = 5; insiderReason = 'Balanced insider activity' }
    else if (sellCount > buyCount * 2) { insiderScore = 2; insiderReason = `Heavy insider selling (${sellCount} sells vs ${buyCount} buys)` }
    else { insiderScore = 4; insiderReason = `Net insider selling (${sellCount} sells vs ${buyCount} buys)` }
  }
  breakdown.push({ factor: 'Insider Activity', score: insiderScore, weight: 0.10, reason: insiderReason })

  const totalScore = breakdown.reduce((sum, item) => sum + (item.score * item.weight), 0)

  return { score: Math.round(totalScore * 10) / 10, breakdown }
}

// Generate reasons to buy based on actual metrics
function generateReasonsToBuy(
  metrics: any,
  snapshot: any,
  companyFacts: any,
  insiderTrades: any[]
): { reason: string; detail: string; strength: 'strong' | 'moderate' | 'weak' }[] {
  const reasons: { reason: string; detail: string; strength: 'strong' | 'moderate' | 'weak' }[] = []

  const pe = metrics?.price_to_earnings_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || metrics?.net_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const roic = metrics?.return_on_invested_capital || metrics?.return_on_equity || 0
  const debtToEquity = metrics?.debt_to_equity || 0
  const currentRatio = metrics?.current_ratio || 0
  const fcfYield = metrics?.free_cash_flow_yield || 0
  const dividendYield = metrics?.dividend_yield || 0
  const marketCap = snapshot?.market_cap || 0

  if (pe > 0 && pe < 15) {
    reasons.push({
      reason: `Attractively valued at ${pe.toFixed(1)}x earnings`,
      detail: `A P/E ratio of ${pe.toFixed(1)} is below the market average of ~20x, suggesting the stock may be undervalued.`,
      strength: pe < 10 ? 'strong' : 'moderate'
    })
  }

  if (revenueGrowth > 0.15) {
    reasons.push({
      reason: `Revenue growing ${(revenueGrowth * 100).toFixed(0)}% year-over-year`,
      detail: `Strong top-line growth indicates robust demand and expanding market opportunity.`,
      strength: revenueGrowth > 0.25 ? 'strong' : 'moderate'
    })
  } else if (revenueGrowth > 0.05) {
    reasons.push({
      reason: `Steady revenue growth of ${(revenueGrowth * 100).toFixed(0)}%`,
      detail: `Consistent revenue growth demonstrates business stability and market share maintenance.`,
      strength: 'weak'
    })
  }

  if (profitMargin > 0.20) {
    reasons.push({
      reason: `Exceptional profit margins of ${(profitMargin * 100).toFixed(0)}%`,
      detail: `Net margins above 20% indicate strong pricing power and competitive advantages.`,
      strength: 'strong'
    })
  } else if (profitMargin > 0.10) {
    reasons.push({
      reason: `Healthy profit margins of ${(profitMargin * 100).toFixed(0)}%`,
      detail: `Double-digit profit margins suggest sustainable competitive positioning.`,
      strength: 'moderate'
    })
  }

  if (grossMargin > 0.50) {
    reasons.push({
      reason: `High gross margins of ${(grossMargin * 100).toFixed(0)}%`,
      detail: `Gross margins above 50% typically indicate strong brand value or intellectual property moats.`,
      strength: grossMargin > 0.70 ? 'strong' : 'moderate'
    })
  }

  if (roic > 0.20) {
    reasons.push({
      reason: `Strong return on capital of ${(roic * 100).toFixed(0)}%`,
      detail: `ROIC above 20% demonstrates excellent capital allocation, a hallmark of quality businesses.`,
      strength: 'strong'
    })
  } else if (roic > 0.12) {
    reasons.push({
      reason: `Solid return on capital of ${(roic * 100).toFixed(0)}%`,
      detail: `Returns above cost of capital indicate value creation for shareholders.`,
      strength: 'moderate'
    })
  }

  if (debtToEquity > 0 && debtToEquity < 0.5) {
    reasons.push({
      reason: `Conservative debt levels (D/E: ${debtToEquity.toFixed(2)})`,
      detail: `Low leverage provides financial flexibility and reduces risk during downturns.`,
      strength: debtToEquity < 0.3 ? 'strong' : 'moderate'
    })
  }

  if (currentRatio > 1.5) {
    reasons.push({
      reason: `Strong liquidity (Current Ratio: ${currentRatio.toFixed(2)})`,
      detail: `Current ratio above 1.5 indicates the company can easily meet short-term obligations.`,
      strength: currentRatio > 2.0 ? 'strong' : 'moderate'
    })
  }

  if (fcfYield > 0.05) {
    reasons.push({
      reason: `High free cash flow yield of ${(fcfYield * 100).toFixed(1)}%`,
      detail: `FCF yield above 5% means substantial cash generation for dividends, buybacks, or reinvestment.`,
      strength: fcfYield > 0.08 ? 'strong' : 'moderate'
    })
  }

  if (dividendYield > 0.03) {
    reasons.push({
      reason: `Attractive dividend yield of ${(dividendYield * 100).toFixed(1)}%`,
      detail: `Dividend yield above 3% provides meaningful income and signals management confidence.`,
      strength: dividendYield > 0.04 ? 'strong' : 'moderate'
    })
  }

  if (marketCap > 100e9) {
    reasons.push({
      reason: 'Large-cap stability and market leadership',
      detail: `With market cap over $100B, this company has established leadership and resources to weather cycles.`,
      strength: 'moderate'
    })
  }

  if (insiderTrades?.length > 0) {
    const recentTrades = insiderTrades.slice(0, 10)
    const buyCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('buy') ||
      t.transaction_type?.toLowerCase().includes('purchase')
    ).length
    const sellCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('sell') ||
      t.transaction_type?.toLowerCase().includes('sale')
    ).length

    if (buyCount > sellCount) {
      reasons.push({
        reason: `Net insider buying (${buyCount} purchases recently)`,
        detail: 'Insiders with non-public information are buying, suggesting they believe the stock is undervalued.',
        strength: buyCount > sellCount * 2 ? 'strong' : 'moderate'
      })
    }
  }

  const strengthOrder = { strong: 0, moderate: 1, weak: 2 }
  return reasons.sort((a, b) => strengthOrder[a.strength] - strengthOrder[b.strength]).slice(0, 5)
}

// Generate reasons NOT to buy based on actual metrics
function generateReasonsNotToBuy(
  metrics: any,
  snapshot: any,
  insiderTrades: any[]
): { reason: string; detail: string; severity: 'high' | 'medium' | 'low' }[] {
  const reasons: { reason: string; detail: string; severity: 'high' | 'medium' | 'low' }[] = []

  const pe = metrics?.price_to_earnings_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || metrics?.net_margin || 0
  const grossMargin = metrics?.gross_margin || 0
  const debtToEquity = metrics?.debt_to_equity || 0
  const currentRatio = metrics?.current_ratio || 0
  const fcfYield = metrics?.free_cash_flow_yield || 0
  const marketCap = snapshot?.market_cap || 0
  const pegRatio = metrics?.peg_ratio || 0

  if (pe > 40) {
    reasons.push({
      reason: `Expensive valuation at ${pe.toFixed(0)}x earnings`,
      detail: `P/E of ${pe.toFixed(0)} is significantly above averages. High expectations leave little room for disappointment.`,
      severity: pe > 60 ? 'high' : 'medium'
    })
  } else if (pe > 30) {
    reasons.push({
      reason: `Premium valuation at ${pe.toFixed(0)}x earnings`,
      detail: `P/E of ${pe.toFixed(0)} requires sustained growth to justify. Multiple compression risk exists.`,
      severity: 'medium'
    })
  }

  if (pe < 0 || (pe === 0 && profitMargin < 0)) {
    reasons.push({
      reason: 'Company is not profitable',
      detail: 'Currently losing money. May need to raise capital or cut operations.',
      severity: 'high'
    })
  }

  if (revenueGrowth < 0) {
    reasons.push({
      reason: `Revenue declining ${(Math.abs(revenueGrowth) * 100).toFixed(0)}%`,
      detail: `Shrinking revenue suggests loss of market share or weakening demand. Turnarounds are difficult.`,
      severity: revenueGrowth < -0.10 ? 'high' : 'medium'
    })
  } else if (revenueGrowth < 0.03 && revenueGrowth >= 0) {
    reasons.push({
      reason: 'Minimal revenue growth',
      detail: `Growth of ${(revenueGrowth * 100).toFixed(1)}% barely keeps pace with inflation.`,
      severity: 'low'
    })
  }

  if (profitMargin < 0.05 && profitMargin > 0) {
    reasons.push({
      reason: `Thin profit margins of ${(profitMargin * 100).toFixed(1)}%`,
      detail: 'Low margins provide little cushion against cost increases or pricing pressure.',
      severity: profitMargin < 0.03 ? 'high' : 'medium'
    })
  }

  if (grossMargin > 0 && grossMargin < 0.30) {
    reasons.push({
      reason: `Low gross margins of ${(grossMargin * 100).toFixed(0)}%`,
      detail: 'Margins below 30% indicate commodity-like pricing and input cost vulnerability.',
      severity: 'medium'
    })
  }

  if (debtToEquity > 1.5) {
    reasons.push({
      reason: `High debt levels (D/E: ${debtToEquity.toFixed(2)})`,
      detail: `D/E above 1.5 creates financial risk, especially if rates rise or earnings decline.`,
      severity: debtToEquity > 2.0 ? 'high' : 'medium'
    })
  }

  if (currentRatio > 0 && currentRatio < 1.0) {
    reasons.push({
      reason: `Weak liquidity (Current Ratio: ${currentRatio.toFixed(2)})`,
      detail: 'Current ratio below 1.0 means short-term liabilities exceed assets.',
      severity: currentRatio < 0.8 ? 'high' : 'medium'
    })
  }

  if (fcfYield < 0) {
    reasons.push({
      reason: 'Negative free cash flow',
      detail: 'Burning cash creates funding risk and limits shareholder returns.',
      severity: 'high'
    })
  } else if (fcfYield > 0 && fcfYield < 0.02) {
    reasons.push({
      reason: `Low free cash flow yield of ${(fcfYield * 100).toFixed(1)}%`,
      detail: 'Limited cash generation means most value comes from future growth expectations.',
      severity: 'low'
    })
  }

  if (marketCap > 0 && marketCap < 2e9) {
    reasons.push({
      reason: 'Small-cap volatility risk',
      detail: `Market cap under $2B means higher volatility and lower liquidity.`,
      severity: marketCap < 500e6 ? 'high' : 'medium'
    })
  }

  if (insiderTrades?.length > 0) {
    const recentTrades = insiderTrades.slice(0, 10)
    const buyCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('buy') ||
      t.transaction_type?.toLowerCase().includes('purchase')
    ).length
    const sellCount = recentTrades.filter((t: any) =>
      t.transaction_type?.toLowerCase().includes('sell') ||
      t.transaction_type?.toLowerCase().includes('sale')
    ).length

    if (sellCount > buyCount * 2 && sellCount > 3) {
      reasons.push({
        reason: `Heavy insider selling (${sellCount} sales recently)`,
        detail: 'Significant insider selling may indicate concerns about near-term performance.',
        severity: 'medium'
      })
    }
  }

  if (pegRatio > 2) {
    reasons.push({
      reason: `High PEG ratio of ${pegRatio.toFixed(1)}`,
      detail: `PEG above 2 suggests expensive relative to growth rate.`,
      severity: pegRatio > 3 ? 'high' : 'medium'
    })
  }

  const severityOrder = { high: 0, medium: 1, low: 2 }
  return reasons.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 5)
}

// Generate investor profile matching
function generateInvestorProfiles(metrics: any, snapshot: any, decisionScore: number): {
  bestFor: { profile: string; reason: string }[]
  notSuitableFor: { profile: string; reason: string }[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  timeHorizon: string
} {
  const bestFor: { profile: string; reason: string }[] = []
  const notSuitableFor: { profile: string; reason: string }[] = []

  const pe = metrics?.price_to_earnings_ratio || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || metrics?.net_margin || 0
  const dividendYield = metrics?.dividend_yield || 0
  const debtToEquity = metrics?.debt_to_equity || 0
  const marketCap = snapshot?.market_cap || 0

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' = 'Medium'
  if (marketCap < 2e9 || debtToEquity > 2 || profitMargin < 0) riskLevel = 'Very High'
  else if (marketCap < 10e9 || debtToEquity > 1.5 || pe > 50) riskLevel = 'High'
  else if (marketCap > 100e9 && debtToEquity < 0.5 && profitMargin > 0.10) riskLevel = 'Low'

  let timeHorizon = '3-5 years'
  if (revenueGrowth > 0.20 && pe > 30) timeHorizon = '5+ years (growth story needs time)'
  else if (dividendYield > 0.03 && revenueGrowth < 0.10) timeHorizon = '1-3 years or long-term income'
  else if (profitMargin < 0) timeHorizon = '5+ years (turnaround required)'

  if (revenueGrowth > 0.15) {
    bestFor.push({ profile: 'Growth Investors', reason: `${(revenueGrowth * 100).toFixed(0)}% revenue growth aligns with growth strategies` })
  } else {
    notSuitableFor.push({ profile: 'Growth Investors', reason: `Limited ${(revenueGrowth * 100).toFixed(0)}% growth may disappoint` })
  }

  if (pe > 0 && pe < 18 && profitMargin > 0) {
    bestFor.push({ profile: 'Value Investors', reason: `P/E of ${pe.toFixed(1)} offers margin of safety` })
  } else if (pe > 30) {
    notSuitableFor.push({ profile: 'Value Investors', reason: `Premium P/E of ${pe.toFixed(0)} doesn't fit value criteria` })
  }

  if (dividendYield > 0.025) {
    bestFor.push({ profile: 'Income Investors', reason: `${(dividendYield * 100).toFixed(1)}% yield provides regular income` })
  } else {
    notSuitableFor.push({ profile: 'Income-Focused Retirees', reason: dividendYield > 0 ? `Low ${(dividendYield * 100).toFixed(1)}% yield` : 'No dividend paid' })
  }

  if (marketCap > 50e9 && debtToEquity < 0.8 && profitMargin > 0.10) {
    bestFor.push({ profile: 'Conservative Investors', reason: 'Large-cap stability with solid balance sheet' })
  } else if (riskLevel === 'High' || riskLevel === 'Very High') {
    notSuitableFor.push({ profile: 'Risk-Averse Investors', reason: `${riskLevel} risk may cause uncomfortable volatility` })
  }

  if (profitMargin > 0.15 && revenueGrowth > 0.05) {
    bestFor.push({ profile: 'Long-Term Holders', reason: 'Quality metrics suggest durable advantages' })
  }

  if (pe > 40 || revenueGrowth > 0.30) {
    bestFor.push({ profile: 'Momentum Traders', reason: 'High-growth profile attracts momentum' })
  }

  if (marketCap < 10e9) {
    notSuitableFor.push({ profile: 'Large Position Traders', reason: 'Lower liquidity may impact execution' })
  }

  return { bestFor: bestFor.slice(0, 4), notSuitableFor: notSuitableFor.slice(0, 4), riskLevel, timeHorizon }
}

// Decision Score Gauge Component
function DecisionScoreGauge({ score, breakdown }: { score: number; breakdown: { factor: string; score: number; weight: number; reason: string }[] }) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-500'
    if (s >= 6) return 'text-emerald-500'
    if (s >= 5) return 'text-yellow-500'
    if (s >= 3) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreLabel = (s: number) => {
    if (s >= 8) return 'Strong Buy'
    if (s >= 6.5) return 'Buy'
    if (s >= 5) return 'Hold'
    if (s >= 3.5) return 'Weak'
    return 'Avoid'
  }

  const getScoreBgColor = (s: number) => {
    if (s >= 8) return 'bg-green-500'
    if (s >= 6) return 'bg-emerald-500'
    if (s >= 5) return 'bg-yellow-500'
    if (s >= 3) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const percentage = (score / 10) * 100

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Decision Score</h2>
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/20" />
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" strokeDasharray={`${percentage * 3.52} 352`} className={getScoreColor(score)} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        </div>
        <div>
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
          <p className="text-muted-foreground text-sm mt-1">Based on 6 fundamental factors</p>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Score Breakdown:</p>
        {breakdown.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.factor} ({(item.weight * 100).toFixed(0)}%)</span>
              <span className={`font-medium ${getScoreColor(item.score)}`}>{item.score}/10</span>
            </div>
            <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <div className={`h-full ${getScoreBgColor(item.score)} rounded-full transition-all`} style={{ width: `${item.score * 10}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ShouldIBuyPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()
  const dataFetchTime = new Date()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, analystEstimates, insiderTrades } = stockData
  const price = snapshot.price || 0
  const peRatio = metrics?.price_to_earnings_ratio || 0

  // Calculate decision score
  const { score: decisionScore, breakdown: scoreBreakdown } = calculateDecisionScore(metrics, snapshot, insiderTrades || [])

  // Generate dynamic content
  const reasonsToBuy = generateReasonsToBuy(metrics, snapshot, companyFacts, insiderTrades || [])
  const reasonsNotToBuy = generateReasonsNotToBuy(metrics, snapshot, insiderTrades || [])
  const investorProfiles = generateInvestorProfiles(metrics, snapshot, decisionScore)

  // Get sector peers for alternatives
  const sector = companyFacts?.sector || 'Technology'
  const sectorPeers = (SECTOR_PEERS[sector] || SECTOR_PEERS['Technology']).filter(t => t !== symbol).slice(0, 5)

  // Build initial catalyst events
  const companyName = companyFacts?.name || symbol
  const initialEvents = buildInitialEvents(symbol, companyName, snapshot)

  // Recommendation based on score
  const getRecommendation = () => {
    if (decisionScore >= 7) return { verdict: 'BUY', reason: 'Strong fundamentals across multiple factors' }
    if (decisionScore >= 5.5) return { verdict: 'HOLD', reason: 'Mixed signals - suitable for existing holders' }
    if (decisionScore >= 4) return { verdict: 'CAUTION', reason: 'Several concerns warrant careful consideration' }
    return { verdict: 'AVOID', reason: 'Significant risks outweigh potential rewards' }
  }

  const recommendation = getRecommendation()
  const pageUrl = `${SITE_URL}/should-i-buy/${ticker.toLowerCase()}`
  const industry = companyFacts?.industry
  const description = companyFacts?.description || `${companyName} (${symbol}) common stock`

  const metricsData = {
    price_to_earnings_ratio: metrics?.price_to_earnings_ratio,
    price_to_book_ratio: metrics?.price_to_book_ratio,
    market_cap: snapshot?.market_cap,
    earnings_per_share: metrics?.earnings_per_share,
    dividend_yield: metrics?.dividend_yield,
    revenue_growth: metrics?.revenue_growth,
    profit_margin: metrics?.profit_margin,
  }

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `Should I Buy ${symbol}?`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `Should I Buy ${symbol} Stock in ${currentYear}?`,
    description: `Expert analysis and AI prediction for ${symbol} (${companyName}) stock investment decision.`,
    url: pageUrl,
    dateModified: dataFetchTime.toISOString(),
    keywords: [`should i buy ${symbol}`, `${symbol} stock buy or sell`, `${symbol} stock analysis`, `${symbol} investment advice`],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: description.slice(0, 200),
    sector,
    industry,
    url: pageUrl,
  })

  let aggregateRatingSchema = null
  if (stockData?.analystRatings?.length > 0) {
    const ratings = stockData.analystRatings
    const ratingMap = { 'Strong Buy': 5, 'Buy': 4, 'Hold': 3, 'Sell': 2, 'Strong Sell': 1 }
    const avgRating = ratings.reduce((sum: number, r: any) => sum + (ratingMap[r.rating as keyof typeof ratingMap] || 3), 0) / ratings.length
    aggregateRatingSchema = getAggregateRatingSchema({ ticker: symbol, ratingValue: avgRating, ratingCount: ratings.length, url: pageUrl })
  }

  const extendedFaqs = getStockFAQsExtended(symbol, companyName, price, metricsData)
  const faqSchema = getFAQSchema(extendedFaqs)
  const eventSchemas = generateEventSchemas(symbol, companyName, initialEvents, SITE_URL)

  const schemas: object[] = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema, ...eventSchemas]
  if (aggregateRatingSchema) schemas.push(aggregateRatingSchema)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>Should I Buy {symbol}?</span>
          </nav>

          {/* Main Title */}
          <h1 className="text-4xl font-bold mb-4">Should I Buy {symbol} Stock in {currentYear}?</h1>
          <p className="text-xl text-muted-foreground mb-4">Data-driven analysis and honest assessment for {companyName}</p>
          <LastUpdatedStatic timestamp={dataFetchTime} className="mb-8" prefix="Analysis Updated" />

          {/* Quick Answer Box */}
          <div className={`p-6 rounded-xl mb-8 ${
            recommendation.verdict === 'BUY' ? 'bg-green-500/20 border border-green-500/30' :
            recommendation.verdict === 'HOLD' ? 'bg-yellow-500/20 border border-yellow-500/30' :
            recommendation.verdict === 'CAUTION' ? 'bg-orange-500/20 border border-orange-500/30' :
            'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-3xl font-bold ${
                recommendation.verdict === 'BUY' ? 'text-green-500' :
                recommendation.verdict === 'HOLD' ? 'text-yellow-500' :
                recommendation.verdict === 'CAUTION' ? 'text-orange-500' :
                'text-red-500'
              }`}>{recommendation.verdict}</span>
              <span className="text-lg">{recommendation.reason}</span>
            </div>
            <p className="text-muted-foreground">
              Current Price: <span className="font-bold text-foreground">${price.toFixed(2)}</span>
              {peRatio > 0 && <span className="ml-4">P/E: <span className="font-bold text-foreground">{peRatio.toFixed(1)}</span></span>}
            </p>
          </div>

          {/* Two-column layout for score and key metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <DecisionScoreGauge score={decisionScore} breakdown={scoreBreakdown} />
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Key Investment Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">${price.toFixed(2)}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">P/E Ratio</p>
                  <p className="text-2xl font-bold">{peRatio > 0 ? peRatio.toFixed(2) : 'N/A'}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                  <p className={`text-2xl font-bold ${(metrics?.revenue_growth || 0) > 0 ? 'text-green-500' : (metrics?.revenue_growth || 0) < 0 ? 'text-red-500' : ''}`}>
                    {metrics?.revenue_growth ? `${(metrics.revenue_growth * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className={`text-2xl font-bold ${(metrics?.profit_margin || metrics?.net_margin || 0) > 0.10 ? 'text-green-500' : ''}`}>
                    {metrics?.profit_margin || metrics?.net_margin ? `${((metrics?.profit_margin || metrics?.net_margin) * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">{snapshot.market_cap ? `$${(snapshot.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Dividend Yield</p>
                  <p className="text-2xl font-bold">{metrics?.dividend_yield ? `${(metrics.dividend_yield * 100).toFixed(2)}%` : 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How {symbol} Compares to Competitors</h2>
            <p className="text-muted-foreground mb-4">
              Understanding how {symbol} stacks up against peers helps inform your investment decision.
            </p>
            <PeerComparison
              ticker={symbol}
              companyName={companyName}
              sector={sector}
              industry={industry}
              marketCap={snapshot?.market_cap || 0}
              pe={peRatio}
              revenueGrowth={metrics?.revenue_growth || 0}
              profitMargin={metrics?.profit_margin || 0}
              price={price}
              variant="full"
            />
          </section>

          {/* Upcoming Catalysts */}
          <section className="mb-12">
            <UpcomingCatalysts ticker={symbol} companyName={companyName} earningsDate={snapshot?.earningsDate} exDividendDate={snapshot?.exDividendDate} dividendAmount={snapshot?.dividendShare} initialEvents={initialEvents} />
          </section>

          {/* Reasons TO Buy and NOT to Buy - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <section className="bg-card border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">+</span>
                5 Reasons TO Buy {symbol}
              </h2>
              {reasonsToBuy.length > 0 ? (
                <div className="space-y-4">
                  {reasonsToBuy.map((item, index) => (
                    <div key={index} className="border-l-2 border-green-500/50 pl-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-green-400">{index + 1}. {item.reason}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.strength === 'strong' ? 'bg-green-500/30 text-green-400' :
                          item.strength === 'moderate' ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-gray-500/30 text-gray-400'
                        }`}>{item.strength}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Limited data available to identify compelling buy reasons. Consider this a yellow flag.</p>
              )}
            </section>

            <section className="bg-card border border-red-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">-</span>
                5 Reasons NOT to Buy {symbol}
              </h2>
              {reasonsNotToBuy.length > 0 ? (
                <div className="space-y-4">
                  {reasonsNotToBuy.map((item, index) => (
                    <div key={index} className="border-l-2 border-red-500/50 pl-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-red-400">{index + 1}. {item.reason}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.severity === 'high' ? 'bg-red-500/30 text-red-400' :
                          item.severity === 'medium' ? 'bg-orange-500/30 text-orange-400' :
                          'bg-yellow-500/30 text-yellow-400'
                        }`}>{item.severity} risk</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No significant red flags identified based on available data.</p>
              )}
            </section>
          </div>

          {/* Who Should Buy Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Who Should Buy {symbol}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">Investment Profile</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className={`text-xl font-bold ${
                      investorProfiles.riskLevel === 'Low' ? 'text-green-500' :
                      investorProfiles.riskLevel === 'Medium' ? 'text-yellow-500' :
                      investorProfiles.riskLevel === 'High' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>{investorProfiles.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended Holding Period</p>
                    <p className="text-lg font-medium">{investorProfiles.timeHorizon}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-green-500/30 rounded-xl p-6">
                <h3 className="font-bold mb-4 text-green-400">Best For:</h3>
                <ul className="space-y-3">
                  {investorProfiles.bestFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <div>
                        <p className="font-medium">{item.profile}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-red-500/30 rounded-xl p-6">
                <h3 className="font-bold mb-4 text-red-400">Not Suitable For:</h3>
                <ul className="space-y-3">
                  {investorProfiles.notSuitableFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">&#10007;</span>
                      <div>
                        <p className="font-medium">{item.profile}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Better Alternatives Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Consider These Alternatives</h2>
            <p className="text-muted-foreground mb-6">If you're interested in {symbol}, compare these {sector || 'sector'} peers:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sectorPeers.map((peer) => (
                <Link key={peer} href={`/should-i-buy/${peer.toLowerCase()}`} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors text-center">
                  <p className="font-bold text-lg">{peer}</p>
                  <p className="text-sm text-muted-foreground">View Analysis</p>
                </Link>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span> Compare {symbol} directly with competitors using our{' '}
                <Link href={`/compare/${symbol.toLowerCase()}-vs-${sectorPeers[0]?.toLowerCase()}`} className="text-primary hover:underline">comparison tool</Link>
                {' '}to see which stock better fits your criteria.
              </p>
            </div>
          </section>

          {/* Analyst Estimates */}
          {analystEstimates?.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Wall Street Expectations</h2>
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">Analyst estimates for {symbol} provide insight into market expectations:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analystEstimates.slice(0, 4).map((est: any, i: number) => (
                    <div key={i} className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">{est.period}</p>
                      <p className="text-xl font-bold">EPS: ${est.eps_estimate_avg?.toFixed(2) || 'N/A'}</p>
                      {est.revenue_estimate_avg && <p className="text-sm text-muted-foreground">Rev: ${(est.revenue_estimate_avg / 1e9).toFixed(1)}B</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get the Full Picture</h2>
            <p className="text-muted-foreground mb-6">Access AI-powered insights, DCF valuations, insider trading data, and real-time analysis for {symbol}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={`/dashboard?ticker=${symbol}&tab=ai`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">View AI Analysis</Link>
              <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-card hover:bg-muted border border-border text-foreground px-8 py-3 rounded-lg font-medium transition-colors">Full Stock Profile</Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {extendedFaqs.slice(0, 8).map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="should-i-buy" companyName={companyName} />

          {/* Disclaimer */}
          <div className="mt-12 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Disclaimer</p>
            <p>This analysis is for informational purposes only and should not be considered financial advice. The decision score and recommendations are based on quantitative factors and do not account for all risks, your personal financial situation, or qualitative factors. Always do your own research and consider consulting with a financial advisor before making investment decisions.</p>
          </div>
        </div>
      </main>
    </>
  )
}
