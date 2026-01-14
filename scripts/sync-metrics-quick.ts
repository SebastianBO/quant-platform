import { createClient } from '@supabase/supabase-js'

const EODHD_API_KEY = process.env.EODHD_API_KEY || "685d904ef1c904.48487943"
const supabase = createClient(
  "https://wcckhqxkmhyzfpynthte.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY2tocXhrbWh5emZweW50aHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4MzMyMiwiZXhwIjoyMDYxMDU5MzIyfQ.JpvVhcIJsWFrEJntLhKBba0E0F4M-pJzFocIUw3O_N4"
)

const PRIORITY_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
  "JPM", "V", "JNJ", "UNH", "HD", "PG", "MA", "XOM", "CVX", "BAC",
  "ABBV", "KO", "PFE", "MRK", "PEP", "COST", "TMO", "WMT", "DIS",
  "CSCO", "ABT", "VZ", "CRM", "INTC", "NFLX", "AMD", "QCOM", "TXN",
  "GME", "AMC", "PLTR", "SOFI", "RIVN", "COIN", "HOOD", "MARA",
]

interface EODHDData {
  General?: { Name?: string; Sector?: string; Industry?: string }
  Highlights?: {
    MarketCapitalization?: number
    PERatio?: number
    PEGRatio?: number
    ProfitMargin?: number
    OperatingMarginTTM?: number
    ReturnOnEquityTTM?: number
    ReturnOnAssetsTTM?: number
    QuarterlyRevenueGrowthYOY?: number
    QuarterlyEarningsGrowthYOY?: number
    EarningsShare?: number
    BookValue?: number
    DividendYield?: number
    EPSEstimateCurrentQuarter?: number
    EPSEstimateNextQuarter?: number
    EPSEstimateCurrentYear?: number
    EPSEstimateNextYear?: number
  }
  Valuation?: {
    EnterpriseValue?: number
    ForwardPE?: number
    PriceBookMRQ?: number
    PriceSalesTTM?: number
    EnterpriseValueEbitda?: number
    EnterpriseValueRevenue?: number
  }
  Technicals?: { Beta?: number }
  AnalystRatings?: {
    Rating?: number
    TargetPrice?: number
    StrongBuy?: number
    Buy?: number
    Hold?: number
    Sell?: number
    StrongSell?: number
  }
  error?: string
}

// Cache CIK lookups
const cikCache: Record<string, string> = {}

async function getCikForTicker(ticker: string): Promise<string> {
  if (cikCache[ticker]) return cikCache[ticker]

  const { data } = await supabase
    .from("income_statements")
    .select("cik")
    .eq("ticker", ticker)
    .limit(1)
    .single()

  const rawCik = data?.cik || `EODHD_${ticker}` // Fallback to unique placeholder
  const cik = rawCik.substring(0, 10) // Truncate to fit varchar(10)
  cikCache[ticker] = cik
  return cik
}

async function fetchAndSave(ticker: string): Promise<{ ticker: string; success: boolean; error?: string }> {
  const url = `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`
  const response = await fetch(url)
  const data: EODHDData = await response.json()

  if (data.error || !data.General) {
    return { ticker, success: false, error: "No data" }
  }

  const today = new Date().toISOString().split("T")[0]
  const h = data.Highlights || {}
  const v = data.Valuation || {}
  const t = data.Technicals || {}

  // Get CIK from our database
  const cik = await getCikForTicker(ticker)

  // Save to financial_metrics (only columns that exist in schema)
  const metrics = {
    ticker,
    cik, // From our income_statements or placeholder
    report_period: today,
    fiscal_period: "TTM",
    period: "ttm",
    currency: "USD",
    // Valuation
    market_cap: h.MarketCapitalization,
    enterprise_value: v.EnterpriseValue,
    price_to_earnings_ratio: h.PERatio,
    peg_ratio: h.PEGRatio,
    price_to_book_ratio: v.PriceBookMRQ,
    price_to_sales_ratio: v.PriceSalesTTM,
    enterprise_value_to_ebitda_ratio: v.EnterpriseValueEbitda,
    enterprise_value_to_revenue_ratio: v.EnterpriseValueRevenue,
    // Profitability
    operating_margin: h.OperatingMarginTTM,
    net_margin: h.ProfitMargin,
    return_on_equity: h.ReturnOnEquityTTM,
    return_on_assets: h.ReturnOnAssetsTTM,
    // Growth
    revenue_growth: h.QuarterlyRevenueGrowthYOY,
    earnings_growth: h.QuarterlyEarningsGrowthYOY,
    // Per Share
    earnings_per_share: h.EarningsShare,
    book_value_per_share: h.BookValue,
    // Source
    source: "EODHD",
    updated_at: new Date().toISOString(),
  }

  // Delete existing by ticker and CIK (both unique constraints)
  await supabase
    .from("financial_metrics")
    .delete()
    .eq("ticker", ticker)
    .eq("report_period", today)
    .eq("period", "ttm")

  await supabase
    .from("financial_metrics")
    .delete()
    .eq("cik", cik)
    .eq("report_period", today)
    .eq("period", "ttm")

  const { error: metricsError } = await supabase
    .from("financial_metrics")
    .insert(metrics)

  if (metricsError) {
    return { ticker, success: false, error: metricsError.message }
  }

  // Save analyst estimates
  const estimates: Array<{ticker: string; fiscal_period: string; period: string; eps_estimate: number; source: string; updated_at: string}> = []

  if (h.EPSEstimateCurrentQuarter) {
    estimates.push({ ticker, fiscal_period: "current_quarter", period: "quarterly", eps_estimate: h.EPSEstimateCurrentQuarter, source: "EODHD", updated_at: new Date().toISOString() })
  }
  if (h.EPSEstimateNextQuarter) {
    estimates.push({ ticker, fiscal_period: "next_quarter", period: "quarterly", eps_estimate: h.EPSEstimateNextQuarter, source: "EODHD", updated_at: new Date().toISOString() })
  }
  if (h.EPSEstimateCurrentYear) {
    estimates.push({ ticker, fiscal_period: "current_year", period: "annual", eps_estimate: h.EPSEstimateCurrentYear, source: "EODHD", updated_at: new Date().toISOString() })
  }
  if (h.EPSEstimateNextYear) {
    estimates.push({ ticker, fiscal_period: "next_year", period: "annual", eps_estimate: h.EPSEstimateNextYear, source: "EODHD", updated_at: new Date().toISOString() })
  }

  if (estimates.length > 0) {
    await supabase.from("analyst_estimates").upsert(estimates, { onConflict: "ticker,fiscal_period,period" })
  }

  return { ticker, success: true }
}

async function main() {
  console.log("Syncing", PRIORITY_TICKERS.length, "priority tickers from EODHD...")
  let success = 0
  let fail = 0

  for (const ticker of PRIORITY_TICKERS) {
    const result = await fetchAndSave(ticker)
    if (result.success) {
      success++
      process.stdout.write(".")
    } else {
      fail++
      process.stdout.write("x")
      console.log(`\n  ${ticker}: ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 200)) // Rate limit
  }

  console.log(`\n\nDone! Success: ${success} | Failed: ${fail}`)

  // Check counts
  const { count: metricsCount } = await supabase.from("financial_metrics").select("*", { count: "exact", head: true })
  const { count: estimatesCount } = await supabase.from("analyst_estimates").select("*", { count: "exact", head: true })

  console.log(`\nfinancial_metrics: ${metricsCount}`)
  console.log(`analyst_estimates: ${estimatesCount}`)
}

main().catch(console.error)
