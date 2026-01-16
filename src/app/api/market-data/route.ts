import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

// Define all market categories and their ETFs
const MARKET_CATEGORIES = {
  us_equities: {
    name: "U.S. Equities",
    symbols: [
      { symbol: "SPY.US", name: "S&P 500" },
      { symbol: "DIA.US", name: "DJIA" },
      { symbol: "QQQ.US", name: "NASDAQ 100" },
      { symbol: "MDY.US", name: "Mid Cap" },
      { symbol: "IJR.US", name: "Small Cap" },
      { symbol: "IWC.US", name: "Micro Cap" },
    ]
  },
  us_sectors: {
    name: "U.S. Equity Sectors",
    symbols: [
      { symbol: "XLK.US", name: "Technology" },
      { symbol: "XLV.US", name: "Healthcare" },
      { symbol: "XLP.US", name: "Consumer Staples" },
      { symbol: "XLU.US", name: "Utilities" },
      { symbol: "XLY.US", name: "Consumer Discr." },
      { symbol: "XLC.US", name: "Communication Svcs" },
      { symbol: "XLB.US", name: "Basic Materials" },
      { symbol: "XLF.US", name: "Financial Services" },
      { symbol: "XLI.US", name: "Industrials" },
      { symbol: "XLE.US", name: "Energy" },
      { symbol: "XLRE.US", name: "Real Estate" },
    ]
  },
  us_factors: {
    name: "U.S. Equity Factors",
    symbols: [
      { symbol: "IUSV.US", name: "Value" },
      { symbol: "IUSG.US", name: "Growth" },
      { symbol: "QUAL.US", name: "Quality" },
      { symbol: "USMV.US", name: "Low Volatility" },
      { symbol: "VYM.US", name: "High Dividend Yield" },
      { symbol: "MTUM.US", name: "Momentum" },
      { symbol: "DGRO.US", name: "Dividend Growth" },
      { symbol: "RSP.US", name: "Equal Weight" },
    ]
  },
  global_equities: {
    name: "Global Equities",
    symbols: [
      { symbol: "ACWI.US", name: "World Equities" },
      { symbol: "IEMG.US", name: "Emerging Markets" },
      { symbol: "SPDW.US", name: "World ex-US" },
      { symbol: "VEA.US", name: "Developed Markets" },
      { symbol: "IEFA.US", name: "EAFE" },
    ]
  },
  countries: {
    name: "Countries",
    symbols: [
      { symbol: "EWZ.US", name: "Brazil" },
      { symbol: "EWQ.US", name: "France" },
      { symbol: "EWU.US", name: "U.K." },
      { symbol: "EWG.US", name: "Germany" },
      { symbol: "VTI.US", name: "U.S." },
      { symbol: "EWJ.US", name: "Japan" },
      { symbol: "MCHI.US", name: "China" },
    ]
  },
  bonds: {
    name: "Bonds",
    symbols: [
      { symbol: "TLT.US", name: "20+ Year Treasury Bonds" },
      { symbol: "BND.US", name: "Aggregate Bonds - US" },
      { symbol: "TIP.US", name: "TIPS - US" },
      { symbol: "HYG.US", name: "High Yield Bonds - US" },
      { symbol: "BWX.US", name: "International Govt. Bonds" },
      { symbol: "VCSH.US", name: "Short Term Corporate" },
    ]
  },
  commodities: {
    name: "Commodities",
    symbols: [
      { symbol: "DBB.US", name: "Industrial Metals" },
      { symbol: "GLD.US", name: "Gold" },
      { symbol: "SLV.US", name: "Silver" },
      { symbol: "PPLT.US", name: "Platinum" },
      { symbol: "DBA.US", name: "Agricultural Commodities" },
      { symbol: "USO.US", name: "Oil" },
      { symbol: "UNG.US", name: "Natural Gas" },
    ]
  },
  currencies: {
    name: "Currencies",
    symbols: [
      { symbol: "UUP.US", name: "US Dollar" },
      { symbol: "FXB.US", name: "British Pound" },
      { symbol: "FXE.US", name: "Euro" },
      { symbol: "FXY.US", name: "Japanese Yen" },
    ]
  }
}

interface QuoteData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  dayLow: number
  dayHigh: number
  week52Low: number
  week52High: number
  volume: number
}

interface HistoricalReturns {
  day5: number
  month1: number
  ytd: number
  year1: number
  year3: number
}

async function fetchQuote(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `https://eodhd.com/api/real-time/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`,
      { next: { revalidate: 60 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}

async function fetchHistoricalData(symbol: string): Promise<any[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 3)

    const response = await fetch(
      `https://eodhd.com/api/eod/${symbol}?api_token=${EODHD_API_KEY}&fmt=json&from=${startDate.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    return []
  }
}

interface CalculatedData {
  returns: HistoricalReturns
  week52High: number
  week52Low: number
}

function calculateReturnsAndRange(history: any[], currentPrice: number): CalculatedData {
  if (!history || history.length === 0) {
    return {
      returns: { day5: 0, month1: 0, ytd: 0, year1: 0, year3: 0 },
      week52High: currentPrice,
      week52Low: currentPrice
    }
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0]

  // Calculate 52-week high/low
  let week52High = currentPrice
  let week52Low = currentPrice

  for (const day of history) {
    if (day.date >= oneYearAgoStr) {
      if (day.high > week52High) week52High = day.high
      if (day.low < week52Low) week52Low = day.low
    }
  }

  // Find prices at different points
  const findPriceAtDaysAgo = (days: number) => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - days)
    const targetStr = targetDate.toISOString().split('T')[0]

    // Find closest date
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].date <= targetStr) {
        return history[i].close
      }
    }
    return history[0]?.close || currentPrice
  }

  const findYTDPrice = () => {
    const ytdStart = `${currentYear}-01-01`
    for (let i = 0; i < history.length; i++) {
      if (history[i].date >= ytdStart) {
        return history[i].close
      }
    }
    return history[0]?.close || currentPrice
  }

  const price5d = findPriceAtDaysAgo(5)
  const price1m = findPriceAtDaysAgo(30)
  const priceYtd = findYTDPrice()
  const price1y = findPriceAtDaysAgo(365)
  const price3y = findPriceAtDaysAgo(365 * 3)

  return {
    returns: {
      day5: price5d ? ((currentPrice - price5d) / price5d) * 100 : 0,
      month1: price1m ? ((currentPrice - price1m) / price1m) * 100 : 0,
      ytd: priceYtd ? ((currentPrice - priceYtd) / priceYtd) * 100 : 0,
      year1: price1y ? ((currentPrice - price1y) / price1y) * 100 : 0,
      year3: price3y ? ((currentPrice - price3y) / price3y) * 100 : 0,
    },
    week52High,
    week52Low
  }
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || 'all'

  try {
    let categoriesToFetch: string[]

    if (category === 'all') {
      categoriesToFetch = Object.keys(MARKET_CATEGORIES)
    } else {
      categoriesToFetch = [category]
    }

    const results: Record<string, any> = {}

    for (const cat of categoriesToFetch) {
      const categoryData = MARKET_CATEGORIES[cat as keyof typeof MARKET_CATEGORIES]
      if (!categoryData) continue

      const symbolData = await Promise.all(
        categoryData.symbols.map(async ({ symbol, name }) => {
          const [quote, history] = await Promise.all([
            fetchQuote(symbol),
            fetchHistoricalData(symbol)
          ])

          if (!quote) {
            return {
              symbol: symbol.replace('.US', ''),
              name,
              price: 0,
              changeToday: 0,
              changeTodayPercent: 0,
              change5d: 0,
              change1m: 0,
              changeYtd: 0,
              change1y: 0,
              change3y: 0,
              dayLow: 0,
              dayHigh: 0,
              week52Low: 0,
              week52High: 0,
            }
          }

          const currentPrice = quote.close || quote.previousClose || 0
          const calculated = calculateReturnsAndRange(history, currentPrice)

          return {
            symbol: symbol.replace('.US', ''),
            name,
            price: currentPrice,
            changeToday: quote.change || 0,
            changeTodayPercent: quote.change_p || 0,
            change5d: calculated.returns.day5,
            change1m: calculated.returns.month1,
            changeYtd: calculated.returns.ytd,
            change1y: calculated.returns.year1,
            change3y: calculated.returns.year3,
            dayLow: quote.low || 0,
            dayHigh: quote.high || 0,
            week52Low: calculated.week52Low,
            week52High: calculated.week52High,
          }
        })
      )

      results[cat] = {
        name: categoryData.name,
        data: symbolData
      }
    }

    return NextResponse.json({
      categories: results,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Market data API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
