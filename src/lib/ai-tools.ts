import { tool } from 'ai'
import { z } from 'zod'

// Stock Quote Tool
export const getStockQuote = tool({
  description: 'Get real-time stock quote for a ticker symbol. Use this when user asks about current price, market data, or stock information.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol like AAPL, MSFT, NVDA'),
  }),
  execute: async ({ ticker }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/quote?ticker=${ticker.toUpperCase()}`)
    if (!response.ok) return { error: `Failed to fetch quote for ${ticker}` }
    return response.json()
  },
})

// Financial Statements Tool
export const getFinancials = tool({
  description: 'Get financial statements (income statement, balance sheet, cash flow) for a company. Use for fundamental analysis.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    statement: z.enum(['income', 'balance', 'cashflow', 'all']).describe('Type of financial statement'),
    period: z.enum(['annual', 'quarterly']).default('annual'),
  }),
  execute: async ({ ticker, statement, period }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(
      `${baseUrl}/api/financials?ticker=${ticker.toUpperCase()}&statement=${statement}&period=${period}`
    )
    if (!response.ok) return { error: `Failed to fetch financials for ${ticker}` }
    return response.json()
  },
})

// SEC Filings Tool
export const getSECFilings = tool({
  description: 'Get SEC filings (10-K, 10-Q, 8-K) for a company. Use for regulatory filings and disclosures.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    filingType: z.enum(['10-K', '10-Q', '8-K', 'all']).default('all'),
    limit: z.number().default(5),
  }),
  execute: async ({ ticker, filingType, limit }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(
      `${baseUrl}/api/sec-filings?ticker=${ticker.toUpperCase()}&type=${filingType}&limit=${limit}`
    )
    if (!response.ok) return { error: `Failed to fetch SEC filings for ${ticker}` }
    return response.json()
  },
})

// Earnings Data Tool
export const getEarnings = tool({
  description: 'Get earnings history and upcoming earnings dates. Use for earnings analysis and calendar.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/earnings?ticker=${ticker.toUpperCase()}`)
    if (!response.ok) return { error: `Failed to fetch earnings for ${ticker}` }
    return response.json()
  },
})

// Insider Trading Tool
export const getInsiderTrades = tool({
  description: 'Get insider trading activity (Form 4 filings) for a company. Shows buys/sells by executives.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    limit: z.number().default(20),
  }),
  execute: async ({ ticker, limit }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(
      `${baseUrl}/api/insider-trading?ticker=${ticker.toUpperCase()}&limit=${limit}`
    )
    if (!response.ok) return { error: `Failed to fetch insider trades for ${ticker}` }
    return response.json()
  },
})

// Short Interest Tool
export const getShortInterest = tool({
  description: 'Get short interest and short volume data for a stock. Use for short squeeze analysis.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/short-interest?ticker=${ticker.toUpperCase()}`)
    if (!response.ok) return { error: `Failed to fetch short interest for ${ticker}` }
    return response.json()
  },
})

// Options Chain Tool
export const getOptionsChain = tool({
  description: 'Get options chain data including calls and puts with Greeks. Use for options analysis.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    expiration: z.string().optional().describe('Expiration date YYYY-MM-DD'),
  }),
  execute: async ({ ticker, expiration }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    let url = `${baseUrl}/api/options?ticker=${ticker.toUpperCase()}`
    if (expiration) url += `&expiration=${expiration}`
    const response = await fetch(url)
    if (!response.ok) return { error: `Failed to fetch options for ${ticker}` }
    return response.json()
  },
})

// Biotech Catalysts Tool
export const getBiotechCatalysts = tool({
  description: 'Get clinical trial catalysts and FDA dates for biotech companies. Use for biotech analysis.',
  inputSchema: z.object({
    ticker: z.string().describe('Biotech stock ticker symbol'),
  }),
  execute: async ({ ticker }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/biotech-catalysts?ticker=${ticker.toUpperCase()}`)
    if (!response.ok) return { error: `Failed to fetch biotech catalysts for ${ticker}` }
    return response.json()
  },
})

// Stock Screener Tool
export const screenStocks = tool({
  description: 'Screen stocks by various criteria like market cap, PE ratio, growth, etc.',
  inputSchema: z.object({
    minMarketCap: z.number().optional().describe('Minimum market cap in billions'),
    maxPE: z.number().optional().describe('Maximum P/E ratio'),
    minRevenueGrowth: z.number().optional().describe('Minimum revenue growth %'),
    sector: z.string().optional().describe('Sector filter'),
    limit: z.number().default(20),
  }),
  execute: async ({ minMarketCap, maxPE, minRevenueGrowth, sector, limit }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const params = new URLSearchParams()
    if (minMarketCap) params.set('minMarketCap', String(minMarketCap * 1e9))
    if (maxPE) params.set('maxPE', String(maxPE))
    if (minRevenueGrowth) params.set('minRevenueGrowth', String(minRevenueGrowth))
    if (sector) params.set('sector', sector)
    params.set('limit', String(limit))

    const response = await fetch(`${baseUrl}/api/screener?${params}`)
    if (!response.ok) return { error: 'Failed to screen stocks' }
    return response.json()
  },
})

// Market Overview Tool
export const getMarketOverview = tool({
  description: 'Get market overview including indices, top gainers, losers, and most active stocks.',
  inputSchema: z.object({
    type: z.enum(['gainers', 'losers', 'active', 'indices', 'all']).default('all'),
  }),
  execute: async ({ type }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/market-overview?type=${type}`)
    if (!response.ok) return { error: 'Failed to fetch market overview' }
    return response.json()
  },
})

// Technical Analysis Tool
export const getTechnicalAnalysis = tool({
  description: 'Get technical indicators (RSI, MACD, moving averages) for a stock.',
  inputSchema: z.object({
    ticker: z.string().describe('Stock ticker symbol'),
    indicators: z.array(z.enum(['rsi', 'macd', 'sma', 'ema', 'bollinger'])).default(['rsi', 'macd', 'sma']),
  }),
  execute: async ({ ticker, indicators }) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(
      `${baseUrl}/api/technicals?ticker=${ticker.toUpperCase()}&indicators=${indicators.join(',')}`
    )
    if (!response.ok) return { error: `Failed to fetch technicals for ${ticker}` }
    return response.json()
  },
})

// Calculator Tool for financial calculations
export const calculate = tool({
  description: 'Perform financial calculations like DCF, WACC, ratios. Use for valuation analysis.',
  inputSchema: z.object({
    calculation: z.enum(['dcf', 'wacc', 'ev_ebitda', 'peg', 'margin_of_safety']),
    inputs: z.record(z.number()).describe('Input values for the calculation'),
  }),
  execute: async ({ calculation, inputs }) => {
    switch (calculation) {
      case 'dcf': {
        const { fcf, growthRate = 0.1, discountRate = 0.1, terminalGrowth = 0.02, years = 5 } = inputs
        if (!fcf) return { error: 'FCF required for DCF calculation' }

        let npv = 0
        for (let i = 1; i <= years; i++) {
          const projectedFCF = fcf * Math.pow(1 + growthRate, i)
          npv += projectedFCF / Math.pow(1 + discountRate, i)
        }
        const terminalValue = (fcf * Math.pow(1 + growthRate, years) * (1 + terminalGrowth)) /
                             (discountRate - terminalGrowth)
        const pvTerminal = terminalValue / Math.pow(1 + discountRate, years)

        return {
          intrinsicValue: npv + pvTerminal,
          npvCashFlows: npv,
          terminalValue: pvTerminal,
          assumptions: { growthRate, discountRate, terminalGrowth, years }
        }
      }
      case 'peg': {
        const { pe, growthRate } = inputs
        if (!pe || !growthRate) return { error: 'P/E and growth rate required' }
        return { peg: pe / (growthRate * 100), interpretation: pe / (growthRate * 100) < 1 ? 'Undervalued' : 'Overvalued' }
      }
      default:
        return { error: `Calculation ${calculation} not implemented` }
    }
  },
})

// All tools export
export const financialTools = {
  getStockQuote,
  getFinancials,
  getSECFilings,
  getEarnings,
  getInsiderTrades,
  getShortInterest,
  getOptionsChain,
  getBiotechCatalysts,
  screenStocks,
  getMarketOverview,
  getTechnicalAnalysis,
  calculate,
}
