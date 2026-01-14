import { createClient } from '@supabase/supabase-js'

const EODHD_API_KEY = process.env.EODHD_API_KEY || "685d904ef1c904.48487943"
const supabase = createClient(
  "https://wcckhqxkmhyzfpynthte.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjY2tocXhrbWh5emZweW50aHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQ4MzMyMiwiZXhwIjoyMDYxMDU5MzIyfQ.JpvVhcIJsWFrEJntLhKBba0E0F4M-pJzFocIUw3O_N4"
)

// Memory management
const BATCH_SIZE = 100
const DELAY_MS = 150 // ~6.5 requests/second

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
  }
  Valuation?: {
    EnterpriseValue?: number
    ForwardPE?: number
    PriceBookMRQ?: number
    PriceSalesTTM?: number
    EnterpriseValueEbitda?: number
    EnterpriseValueRevenue?: number
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

  const rawCik = data?.cik || `EODHD_${ticker}`
  const cik = rawCik.substring(0, 10)
  cikCache[ticker] = cik
  return cik
}

async function fetchAndSave(ticker: string): Promise<boolean> {
  try {
    const url = `https://eodhd.com/api/fundamentals/${ticker}.US?api_token=${EODHD_API_KEY}&fmt=json`
    const response = await fetch(url)
    const data: EODHDData = await response.json()

    if (data.error || !data.General) {
      return false
    }

    const today = new Date().toISOString().split("T")[0]
    const h = data.Highlights || {}
    const v = data.Valuation || {}
    const cik = await getCikForTicker(ticker)

    const metrics = {
      ticker,
      cik,
      report_period: today,
      fiscal_period: "TTM",
      period: "ttm",
      currency: "USD",
      market_cap: h.MarketCapitalization,
      enterprise_value: v.EnterpriseValue,
      price_to_earnings_ratio: h.PERatio,
      peg_ratio: h.PEGRatio,
      price_to_book_ratio: v.PriceBookMRQ,
      price_to_sales_ratio: v.PriceSalesTTM,
      enterprise_value_to_ebitda_ratio: v.EnterpriseValueEbitda,
      enterprise_value_to_revenue_ratio: v.EnterpriseValueRevenue,
      operating_margin: h.OperatingMarginTTM,
      net_margin: h.ProfitMargin,
      return_on_equity: h.ReturnOnEquityTTM,
      return_on_assets: h.ReturnOnAssetsTTM,
      revenue_growth: h.QuarterlyRevenueGrowthYOY,
      earnings_growth: h.QuarterlyEarningsGrowthYOY,
      earnings_per_share: h.EarningsShare,
      book_value_per_share: h.BookValue,
      source: "EODHD",
      updated_at: new Date().toISOString(),
    }

    // Delete existing
    await supabase.from("financial_metrics").delete().eq("ticker", ticker).eq("report_period", today).eq("period", "ttm")
    await supabase.from("financial_metrics").delete().eq("cik", cik).eq("report_period", today).eq("period", "ttm")

    const { error } = await supabase.from("financial_metrics").insert(metrics)
    return !error
  } catch {
    return false
  }
}

async function getAllTickers(): Promise<string[]> {
  console.log("Fetching all tickers from income_statements...")
  let allTickers: Set<string> = new Set()
  let offset = 0
  const limit = 1000

  while (offset < 400000) {
    const { data } = await supabase
      .from("income_statements")
      .select("ticker")
      .not("ticker", "is", null)
      .range(offset, offset + limit - 1)

    if (!data || data.length === 0) break
    data.forEach(d => allTickers.add(d.ticker))
    offset += limit
  }

  return [...allTickers].sort()
}

async function main() {
  const startTime = Date.now()
  const allTickers = await getAllTickers()
  console.log(`Found ${allTickers.length} unique tickers\n`)

  // Get tickers that already have metrics from today
  const today = new Date().toISOString().split("T")[0]
  const { data: existingMetrics } = await supabase
    .from("financial_metrics")
    .select("ticker")
    .eq("report_period", today)
    .eq("period", "ttm")

  const existingTickers = new Set(existingMetrics?.map(m => m.ticker) || [])
  const tickersToSync = allTickers.filter(t => !existingTickers.has(t))

  console.log(`Already have metrics for ${existingTickers.size} tickers`)
  console.log(`Need to sync ${tickersToSync.length} tickers\n`)

  if (tickersToSync.length === 0) {
    console.log("All tickers already have metrics!")
    return
  }

  let success = 0
  let fail = 0
  let processed = 0

  for (const ticker of tickersToSync) {
    const result = await fetchAndSave(ticker)
    if (result) {
      success++
    } else {
      fail++
    }
    processed++

    // Progress logging every 100 tickers
    if (processed % BATCH_SIZE === 0) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = processed / elapsed
      const remaining = tickersToSync.length - processed
      const eta = Math.round(remaining / rate / 60)
      console.log(`Progress: ${processed}/${tickersToSync.length} (${(processed/tickersToSync.length*100).toFixed(1)}%) | Success: ${success} | Failed: ${fail} | ETA: ${eta}min`)
    }

    await new Promise(r => setTimeout(r, DELAY_MS))
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60)
  console.log(`\n=== COMPLETE ===`)
  console.log(`Total: ${processed} tickers in ${totalTime} minutes`)
  console.log(`Success: ${success} | Failed: ${fail}`)

  // Final counts
  const { count: metricsCount } = await supabase.from("financial_metrics").select("*", { count: "exact", head: true })
  console.log(`\nfinancial_metrics table now has ${metricsCount} records`)
}

main().catch(console.error)
