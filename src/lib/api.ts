// API Configuration - Use environment variables
const FINANCIAL_DATASETS_API_KEY = process.env.FINANCIAL_DATASETS_API_KEY || ""
const EODHD_API_KEY = process.env.EODHD_API_KEY || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

const FD_BASE_URL = "https://api.financialdatasets.ai"
const EODHD_BASE_URL = "https://eodhd.com/api"

// Financial Datasets API
export async function fetchFinancialDatasets(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${FD_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    headers: { "X-API-KEY": FINANCIAL_DATASETS_API_KEY },
    next: { revalidate: 300 } // Cache for 5 minutes
  })

  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json()
}

// EODHD API
export async function fetchEODHD(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${EODHD_BASE_URL}/${endpoint}`)
  url.searchParams.append("api_token", EODHD_API_KEY)
  url.searchParams.append("fmt", "json")
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 }
  })

  if (!response.ok) throw new Error(`EODHD API error: ${response.status}`)
  return response.json()
}

// Specific API functions
export async function getStockSnapshot(ticker: string) {
  return fetchFinancialDatasets("/prices/snapshot/", { ticker })
}

export async function getIncomeStatements(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/financials/income-statements/", { ticker, period: "annual", limit: limit.toString() })
}

export async function getBalanceSheets(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/financials/balance-sheets/", { ticker, period: "annual", limit: limit.toString() })
}

export async function getCashFlows(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/financials/cash-flow-statements/", { ticker, period: "annual", limit: limit.toString() })
}

export async function getFinancialMetrics(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/financial-metrics/", { ticker, period: "annual", limit: limit.toString() })
}

export async function getInsiderTrades(ticker: string, limit = 20) {
  return fetchFinancialDatasets("/insider-trades/", { ticker, limit: limit.toString() })
}

export async function getAnalystEstimates(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/analyst-estimates/", { ticker, limit: limit.toString() })
}

export async function getSegmentedRevenues(ticker: string, limit = 5) {
  return fetchFinancialDatasets("/financials/segmented-revenues/", { ticker, period: "annual", limit: limit.toString() })
}

export async function getEarningsCalendar(from: string, to: string) {
  return fetchEODHD("calendar/earnings", { from, to })
}

export async function getStockFundamentals(ticker: string) {
  return fetchEODHD(`fundamentals/${ticker}.US`)
}

export async function getHistoricalPrices(ticker: string, from: string, to: string) {
  return fetchEODHD(`eod/${ticker}.US`, { from, to, period: "d" })
}

export async function getNewsWithSentiment(ticker: string, limit = 50) {
  return fetchEODHD("news", { s: `${ticker}.US`, limit: limit.toString() })
}

// OpenAI for AI analysis
export async function generateAIAnalysis(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a senior quantitative analyst at a top hedge fund." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
