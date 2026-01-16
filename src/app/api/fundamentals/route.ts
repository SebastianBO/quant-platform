import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Fetch EODHD fundamentals and institutional ownership in parallel
    const [eohdFundamentals, institutionalData, priceHistory] = await Promise.all([
      fetch(
        `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`,
        { next: { revalidate: 3600 } }
      ).then(r => r.ok ? r.json() : null).catch(() => null),

      fetch(
        `https://api.financialdatasets.ai/institutional-ownership/?ticker=${ticker}&limit=50`,
        {
          headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
          next: { revalidate: 3600 }
        }
      ).then(r => r.ok ? r.json() : null).catch(() => null),

      fetch(
        `https://api.financialdatasets.ai/prices/?ticker=${ticker}&interval=day&interval_multiplier=1&start_date=${getDateMonthsAgo(12)}&end_date=${getTodayDate()}`,
        {
          headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
          next: { revalidate: 300 }
        }
      ).then(r => r.ok ? r.json() : null).catch(() => null),
    ])

    // Extract technicals
    const technicals = eohdFundamentals?.Technicals || {}
    const valuation = eohdFundamentals?.Valuation || {}
    const highlights = eohdFundamentals?.Highlights || {}
    const analystRatings = eohdFundamentals?.AnalystRatings || {}
    const sharesStats = eohdFundamentals?.SharesStats || {}
    const general = eohdFundamentals?.General || {}

    // Calculate risk metrics from price history
    const prices = priceHistory?.prices || []
    const riskMetrics = calculateRiskMetrics(prices)

    // Calculate quality scores (Altman Z-Score, Piotroski F-Score)
    const qualityScores = calculateQualityScores(eohdFundamentals)

    // Process institutional ownership
    const institutions = (institutionalData?.institutional_ownership || [])
      .sort((a: any, b: any) => b.market_value - a.market_value)
      .slice(0, 20)

    const totalInstitutionalValue = institutions.reduce((sum: number, i: any) => sum + (i.market_value || 0), 0)
    const totalInstitutionalShares = institutions.reduce((sum: number, i: any) => sum + (i.shares || 0), 0)

    return NextResponse.json({
      // Technical Analysis
      technicals: {
        beta: technicals.Beta,
        fiftyTwoWeekHigh: technicals['52WeekHigh'],
        fiftyTwoWeekLow: technicals['52WeekLow'],
        fiftyDayMA: technicals['50DayMA'],
        twoHundredDayMA: technicals['200DayMA'],
        sharesShort: technicals.SharesShort,
        sharesShortPriorMonth: technicals.SharesShortPriorMonth,
        shortRatio: technicals.ShortRatio,
        shortPercent: technicals.ShortPercent,
      },

      // Valuation
      valuation: {
        trailingPE: valuation.TrailingPE,
        forwardPE: valuation.ForwardPE,
        priceSales: valuation.PriceSalesTTM,
        priceBook: valuation.PriceBookMRQ,
        enterpriseValue: valuation.EnterpriseValue,
        evRevenue: valuation.EnterpriseValueRevenue,
        evEbitda: valuation.EnterpriseValueEbitda,
      },

      // Highlights
      highlights: {
        marketCap: highlights.MarketCapitalization,
        ebitda: highlights.EBITDA,
        peRatio: highlights.PERatio,
        pegRatio: highlights.PEGRatio,
        wallStreetTargetPrice: highlights.WallStreetTargetPrice,
        bookValue: highlights.BookValue,
        dividendShare: highlights.DividendShare,
        dividendYield: highlights.DividendYield,
        eps: highlights.EarningsShare,
        epsEstimateCurrentYear: highlights.EPSEstimateCurrentYear,
        epsEstimateNextYear: highlights.EPSEstimateNextYear,
        profitMargin: highlights.ProfitMargin,
        operatingMargin: highlights.OperatingMarginTTM,
        roa: highlights.ReturnOnAssetsTTM,
        roe: highlights.ReturnOnEquityTTM,
        revenueTTM: highlights.RevenueTTM,
        revenuePerShare: highlights.RevenuePerShareTTM,
        quarterlyRevenueGrowth: highlights.QuarterlyRevenueGrowthYOY,
        quarterlyEarningsGrowth: highlights.QuarterlyEarningsGrowthYOY,
      },

      // Analyst Ratings
      analystRatings: {
        rating: analystRatings.Rating,
        targetPrice: analystRatings.TargetPrice,
        strongBuy: analystRatings.StrongBuy || 0,
        buy: analystRatings.Buy || 0,
        hold: analystRatings.Hold || 0,
        sell: analystRatings.Sell || 0,
        strongSell: analystRatings.StrongSell || 0,
        totalAnalysts: (analystRatings.StrongBuy || 0) + (analystRatings.Buy || 0) +
                       (analystRatings.Hold || 0) + (analystRatings.Sell || 0) + (analystRatings.StrongSell || 0),
      },

      // Shares Stats
      sharesStats: {
        sharesOutstanding: sharesStats.SharesOutstanding,
        sharesFloat: sharesStats.SharesFloat,
        percentInsiders: sharesStats.PercentInsiders,
        percentInstitutions: sharesStats.PercentInstitutions,
        sharesShort: sharesStats.SharesShort,
        shortRatio: sharesStats.ShortRatio,
        shortPercentOutstanding: sharesStats.ShortPercentOfFloat,
      },

      // Company Info
      company: {
        name: general.Name,
        description: general.Description,
        sector: general.Sector,
        industry: general.Industry,
        gicSector: general.GicSector,
        gicIndustry: general.GicIndustry,
        address: general.Address,
        website: general.WebURL,
        ipoDate: general.IPODate,
        officers: Object.values(general.Officers || {}).slice(0, 5),
      },

      // Risk Metrics (calculated)
      riskMetrics,

      // Quality Scores (calculated)
      qualityScores,

      // Institutional Ownership
      institutionalOwnership: {
        totalValue: totalInstitutionalValue,
        totalShares: totalInstitutionalShares,
        topHolders: institutions,
      },

      // Price History (for charting)
      priceHistory: prices.slice(-90), // Last 90 days
    })
  } catch (error) {
    logger.error('Fundamentals API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Failed to fetch fundamentals' }, { status: 500 })
  }
}

function getDateMonthsAgo(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function calculateRiskMetrics(prices: any[]): any {
  if (!prices || prices.length < 20) {
    return {
      volatility: null,
      sharpeRatio: null,
      maxDrawdown: null,
      avgVolume: null,
    }
  }

  // Calculate daily returns
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i].close - prices[i - 1].close) / prices[i - 1].close
    returns.push(dailyReturn)
  }

  // Volatility (annualized standard deviation)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const dailyVolatility = Math.sqrt(variance)
  const annualizedVolatility = dailyVolatility * Math.sqrt(252)

  // Sharpe Ratio (assuming risk-free rate of 5%)
  const riskFreeRate = 0.05 / 252 // Daily risk-free rate
  const excessReturn = avgReturn - riskFreeRate
  const sharpeRatio = dailyVolatility > 0 ? (excessReturn / dailyVolatility) * Math.sqrt(252) : 0

  // Maximum Drawdown
  let maxDrawdown = 0
  let peak = prices[0].close
  for (const price of prices) {
    if (price.close > peak) peak = price.close
    const drawdown = (peak - price.close) / peak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }

  // Average Volume
  const avgVolume = prices.reduce((sum, p) => sum + (p.volume || 0), 0) / prices.length

  return {
    volatility: annualizedVolatility,
    sharpeRatio,
    maxDrawdown,
    avgVolume,
    totalReturn: prices.length > 0 ? (prices[prices.length - 1].close - prices[0].close) / prices[0].close : 0,
  }
}

function calculateQualityScores(fundamentals: any): any {
  if (!fundamentals) {
    return { altmanZScore: null, piotroskiFScore: null }
  }

  const highlights = fundamentals.Highlights || {}
  const valuation = fundamentals.Valuation || {}

  // Simplified Altman Z-Score (for non-manufacturing)
  // Z = 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
  // This is a simplified version - would need full balance sheet for accurate calculation
  const workingCapitalRatio = 0.1 // Placeholder
  const retainedEarningsRatio = highlights.ProfitMargin || 0
  const ebitRatio = highlights.OperatingMarginTTM || 0
  const bookToDebt = 1 / (valuation.PriceBookMRQ || 1)

  const altmanZScore = 6.56 * workingCapitalRatio + 3.26 * retainedEarningsRatio +
                       6.72 * ebitRatio + 1.05 * bookToDebt

  // Piotroski F-Score (0-9, higher is better)
  // Simplified version based on available data
  let fScore = 0

  // Profitability
  if ((highlights.ReturnOnAssetsTTM || 0) > 0) fScore++ // Positive ROA
  if ((highlights.ProfitMargin || 0) > 0) fScore++ // Positive operating cash flow
  if ((highlights.QuarterlyEarningsGrowthYOY || 0) > 0) fScore++ // Improving ROA

  // Leverage/Liquidity
  if ((valuation.PriceBookMRQ || 999) < 3) fScore++ // Reasonable P/B

  // Operating Efficiency
  if ((highlights.OperatingMarginTTM || 0) > 0.1) fScore++ // Good operating margin
  if ((highlights.QuarterlyRevenueGrowthYOY || 0) > 0) fScore++ // Revenue growth
  if ((highlights.PEGRatio || 999) < 2) fScore++ // Reasonable PEG

  return {
    altmanZScore: Math.max(0, Math.min(10, altmanZScore)), // Normalized 0-10
    piotroskiFScore: fScore,
    altmanInterpretation: altmanZScore > 2.6 ? 'Safe' : altmanZScore > 1.1 ? 'Grey Zone' : 'Distress',
    piotroskiInterpretation: fScore >= 7 ? 'Strong' : fScore >= 4 ? 'Average' : 'Weak',
  }
}
