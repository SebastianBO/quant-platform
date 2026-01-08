import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Swedish Listed Companies (Stockholm Exchange - ST)
// Primary: Yahoo Finance (FREE) - works well for Swedish stocks
// Fallback: EODHD (requires All-In-One package for EU fundamentals)
// Exchange code: ST (Nasdaq Stockholm)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EODHD_API_KEY = process.env.EODHD_API_KEY || ''

// Yahoo Finance API - works for Swedish stocks with .ST suffix
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote'
const YAHOO_FUNDAMENTALS_URL = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary'

// Cache for Yahoo crumb and cookies (valid for ~1 hour)
let yahooCrumb: string | null = null
let yahooCookies: string | null = null
let crumbTimestamp: number = 0
const CRUMB_TTL = 3600000 // 1 hour

// Get Yahoo Finance crumb and cookies for authentication
async function getYahooCrumb(): Promise<{ crumb: string; cookies: string } | null> {
  // Return cached if still valid
  if (yahooCrumb && yahooCookies && Date.now() - crumbTimestamp < CRUMB_TTL) {
    return { crumb: yahooCrumb, cookies: yahooCookies }
  }

  try {
    // Step 1: Get initial cookies from Yahoo Finance homepage
    const homepageRes = await fetch('https://finance.yahoo.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    // Extract Set-Cookie headers
    const setCookies = homepageRes.headers.get('set-cookie') || ''
    const cookies = setCookies
      .split(',')
      .map(c => c.split(';')[0].trim())
      .filter(c => c.includes('='))
      .join('; ')

    // Step 2: Get crumb from Yahoo's crumb endpoint
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Cookie': cookies,
      },
    })

    if (!crumbRes.ok) {
      console.log('Failed to get Yahoo crumb:', crumbRes.status)
      return null
    }

    const crumb = await crumbRes.text()
    if (!crumb || crumb.includes('error')) {
      console.log('Invalid crumb response:', crumb)
      return null
    }

    // Cache the crumb and cookies
    yahooCrumb = crumb
    yahooCookies = cookies
    crumbTimestamp = Date.now()

    console.log('Got Yahoo crumb successfully')
    return { crumb, cookies }
  } catch (error) {
    console.error('Error getting Yahoo crumb:', error)
    return null
  }
}

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface EODHDFundamentals {
  General?: {
    Name?: string
    Code?: string
    ISIN?: string
    CIK?: string
    CurrencyCode?: string
    Sector?: string
    Industry?: string
    Address?: string
    Phone?: string
    WebURL?: string
    FullTimeEmployees?: number
    Description?: string
    CountryISO?: string
  }
  Highlights?: {
    MarketCapitalization?: number
    EBITDA?: number
    PERatio?: number
    PEGRatio?: number
    BookValue?: number
    DividendShare?: number
    DividendYield?: number
    EarningsShare?: number
    ProfitMargin?: number
    OperatingMarginTTM?: number
    ReturnOnAssetsTTM?: number
    ReturnOnEquityTTM?: number
    RevenueTTM?: number
    RevenuePerShareTTM?: number
    GrossProfitTTM?: number
    QuarterlyRevenueGrowthYOY?: number
    QuarterlyEarningsGrowthYOY?: number
  }
  Financials?: {
    Income_Statement?: {
      yearly?: Record<string, IncomeStatementData>
      quarterly?: Record<string, IncomeStatementData>
    }
    Balance_Sheet?: {
      yearly?: Record<string, BalanceSheetData>
      quarterly?: Record<string, BalanceSheetData>
    }
  }
}

interface IncomeStatementData {
  totalRevenue?: string
  costOfRevenue?: string
  grossProfit?: string
  operatingExpenses?: string
  operatingIncome?: string
  netInterestIncome?: string
  interestExpense?: string
  incomeBeforeTax?: string
  incomeTaxExpense?: string
  netIncome?: string
  ebit?: string
  ebitda?: string
}

interface BalanceSheetData {
  totalAssets?: string
  totalCurrentAssets?: string
  totalNonCurrentAssets?: string
  totalLiab?: string
  totalCurrentLiabilities?: string
  nonCurrentLiabilitiesTotal?: string
  totalStockholderEquity?: string
  retainedEarnings?: string
  cash?: string
  shortTermDebt?: string
  longTermDebt?: string
}

// Major Swedish listed companies (Nasdaq Stockholm)
const SWEDISH_TICKERS = [
  // OMX Stockholm 30 (Large Cap)
  'VOLV-B.ST',   // Volvo
  'ERIC-B.ST',  // Ericsson
  'HM-B.ST',    // H&M
  'SEB-A.ST',   // SEB
  'SKF-B.ST',   // SKF
  'SAND.ST',    // Sandvik
  'ESSITY-B.ST', // Essity
  'ELUX-B.ST',  // Electrolux
  'SHB-A.ST',   // Handelsbanken
  'SWED-A.ST',  // Swedbank
  'TELIA.ST',   // Telia Company
  'INVE-B.ST',  // Investor
  'INDU-C.ST',  // Industrivärden
  'ATCO-A.ST',  // Atlas Copco
  'ABB.ST',     // ABB
  'NDA-SE.ST',  // Nordea
  'ASSA-B.ST',  // Assa Abloy
  'ALFA.ST',    // Alfa Laval
  'BOL.ST',     // Boliden
  'HEXA-B.ST',  // Hexagon
  'KINV-B.ST',  // Kinnevik
  'GETI-B.ST',  // Getinge
  'NIBE-B.ST',  // NIBE
  'SINCH.ST',   // Sinch
  'EVO.ST',     // Evolution Gaming
  'SAAB-B.ST',  // SAAB
  // Tech
  'SPOT.ST',    // Spotify
  // Note: Many Swedish stocks trade on .ST suffix
  // Klarna is private, Northvolt is private
  // Mid Cap
  'ADDV-B.ST',  // Addvise
  'BALD-B.ST',  // Balco
  'CAST.ST',    // Castellum
  'DUNI.ST',    // Duni
  'FABG.ST',    // Fabege
  'HUFV-A.ST',  // Hufvudstaden
  'LIFCO-B.ST', // Lifco
  'SAGA-B.ST',  // Sagax
  'SWEC-B.ST',  // Sweco
  'WALL-B.ST',  // Wallenstam
  'WIHL.ST',    // Wihlborgs
]

// Fetch company data from Yahoo Finance v8 API (works without auth!)
async function fetchFromYahoo(ticker: string): Promise<EODHDFundamentals | null> {
  try {
    // Use the v8 chart API which works without authentication
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1d`

    const chartRes = await fetch(chartUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })

    if (!chartRes.ok) {
      console.log(`Yahoo v8 returned ${chartRes.status} for ${ticker}`)
      return null
    }

    const chartData = await chartRes.json()
    const meta = chartData?.chart?.result?.[0]?.meta
    if (!meta) return null

    // Try to get more data from quote endpoint
    const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`
    let quote: any = {}

    try {
      const quoteRes = await fetch(quoteUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      })
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json()
        quote = quoteData?.quoteResponse?.result?.[0] || {}
      }
    } catch (e) {
      // Quote endpoint failed, continue with chart data
    }

    // Build fundamentals from available data
    const fundamentals: EODHDFundamentals = {
      General: {
        Name: meta.shortName || meta.longName || quote.shortName || ticker.replace('.ST', ''),
        Code: ticker.replace('.ST', ''),
        Sector: quote.sector,
        Industry: quote.industry,
        CountryISO: 'SE',
      },
      Highlights: {
        MarketCapitalization: quote.marketCap,
        PERatio: quote.trailingPE,
        DividendYield: quote.trailingAnnualDividendYield,
        EarningsShare: quote.epsTrailingTwelveMonths,
        BookValue: quote.bookValue,
      },
      Financials: {
        Income_Statement: { yearly: {} },
        Balance_Sheet: { yearly: {} },
      },
    }

    return fundamentals
  } catch (error) {
    console.error(`Error fetching ${ticker} from Yahoo:`, error)
    return null
  }
}

// Fetch company fundamentals from EODHD (FALLBACK - requires paid plan)
async function fetchFromEODHD(ticker: string): Promise<EODHDFundamentals | null> {
  if (!EODHD_API_KEY) {
    return null
  }

  try {
    const response = await fetch(
      `https://eodhd.com/api/fundamentals/${ticker}?api_token=${EODHD_API_KEY}&fmt=json`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      console.log(`EODHD returned ${response.status} for ${ticker}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${ticker} from EODHD:`, error)
    return null
  }
}

// Combined fetch - Yahoo primary, EODHD fallback
async function fetchFundamentals(ticker: string): Promise<{ data: EODHDFundamentals | null; source: string }> {
  // Try Yahoo first (FREE)
  const yahooData = await fetchFromYahoo(ticker)
  if (yahooData?.General?.Name || Object.keys(yahooData?.Financials?.Income_Statement?.yearly || {}).length > 0) {
    return { data: yahooData, source: 'YAHOO' }
  }

  // Try EODHD as fallback
  const eodhData = await fetchFromEODHD(ticker)
  if (eodhData?.General?.Name) {
    return { data: eodhData, source: 'EODHD' }
  }

  return { data: null, source: 'NONE' }
}

// Save company to Supabase
async function saveCompany(ticker: string, data: EODHDFundamentals, source: string = 'YAHOO'): Promise<boolean> {
  const general = data.General || {}
  const highlights = data.Highlights || {}

  // Use ticker as org number for Swedish stocks (we don't always have ISIN)
  const orgNumber = ticker.replace('.ST', '').replace('-', '')

  const record = {
    org_number: orgNumber,
    country_code: 'SE',
    name: general.Name || ticker.replace('.ST', ''),
    ticker: ticker.replace('.ST', ''),
    exchange: 'NASDAQ_STOCKHOLM',
    isin: general.ISIN,
    industry_code: general.Sector,
    industry_description: general.Industry,
    address_street: general.Address,
    address_country: 'Sweden',
    employees: general.FullTimeEmployees,
    revenue_latest: highlights.RevenueTTM,
    is_listed: true,
    is_active: true,
    source: source,
    source_url: general.WebURL,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save company ${ticker}:`, error)
    return false
  }

  return true
}

// Save financial statements
async function saveFinancials(ticker: string, data: EODHDFundamentals, source: string = 'YAHOO'): Promise<{ income: boolean; balance: boolean }> {
  const financials = data.Financials
  const general = data.General || {}

  // Use ticker as org number for Swedish stocks
  const orgNumber = ticker.replace('.ST', '').replace('-', '')

  let incomeSuccess = false
  let balanceSuccess = false

  // Save yearly income statements
  if (financials?.Income_Statement?.yearly) {
    for (const [date, income] of Object.entries(financials.Income_Statement.yearly)) {
      const year = parseInt(date.split('-')[0])
      if (isNaN(year) || year < 2018) continue

      const record = {
        org_number: orgNumber,
        country_code: 'SE',
        report_period: date,
        fiscal_year: year,
        period: 'annual',
        currency: general.CurrencyCode || 'SEK',
        revenue: income.totalRevenue ? parseFloat(income.totalRevenue) : null,
        cost_of_revenue: income.costOfRevenue ? parseFloat(income.costOfRevenue) : null,
        gross_profit: income.grossProfit ? parseFloat(income.grossProfit) : null,
        operating_expenses: income.operatingExpenses ? parseFloat(income.operatingExpenses) : null,
        operating_profit: income.operatingIncome ? parseFloat(income.operatingIncome) : null,
        profit_before_tax: income.incomeBeforeTax ? parseFloat(income.incomeBeforeTax) : null,
        income_tax_expense: income.incomeTaxExpense ? parseFloat(income.incomeTaxExpense) : null,
        profit_for_the_year: income.netIncome ? parseFloat(income.netIncome) : null,
        ebitda: income.ebitda ? parseFloat(income.ebitda) : null,
        source: source,
        updated_at: new Date().toISOString(),
      }

      const { error } = await getSupabase()
        .from('eu_income_statements')
        .upsert(record, {
          onConflict: 'org_number,country_code,report_period,period',
          ignoreDuplicates: false
        })

      if (!error) incomeSuccess = true
    }
  }

  // Save yearly balance sheets
  if (financials?.Balance_Sheet?.yearly) {
    for (const [date, balance] of Object.entries(financials.Balance_Sheet.yearly)) {
      const year = parseInt(date.split('-')[0])
      if (isNaN(year) || year < 2018) continue

      const record = {
        org_number: orgNumber,
        country_code: 'SE',
        report_period: date,
        fiscal_year: year,
        period: 'annual',
        currency: general.CurrencyCode || 'SEK',
        total_assets: balance.totalAssets ? parseFloat(balance.totalAssets) : null,
        current_assets: balance.totalCurrentAssets ? parseFloat(balance.totalCurrentAssets) : null,
        non_current_assets: balance.totalNonCurrentAssets ? parseFloat(balance.totalNonCurrentAssets) : null,
        total_liabilities: balance.totalLiab ? parseFloat(balance.totalLiab) : null,
        current_liabilities: balance.totalCurrentLiabilities ? parseFloat(balance.totalCurrentLiabilities) : null,
        non_current_liabilities: balance.nonCurrentLiabilitiesTotal ? parseFloat(balance.nonCurrentLiabilitiesTotal) : null,
        total_equity: balance.totalStockholderEquity ? parseFloat(balance.totalStockholderEquity) : null,
        retained_earnings: balance.retainedEarnings ? parseFloat(balance.retainedEarnings) : null,
        cash_and_equivalents: balance.cash ? parseFloat(balance.cash) : null,
        short_term_debt: balance.shortTermDebt ? parseFloat(balance.shortTermDebt) : null,
        long_term_debt: balance.longTermDebt ? parseFloat(balance.longTermDebt) : null,
        source: source,
        updated_at: new Date().toISOString(),
      }

      const { error } = await getSupabase()
        .from('eu_balance_sheets')
        .upsert(record, {
          onConflict: 'org_number,country_code,report_period,period',
          ignoreDuplicates: false
        })

      if (!error) balanceSuccess = true
    }
  }

  return { income: incomeSuccess, balance: balanceSuccess }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const mode = searchParams.get('mode') || 'known'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-swedish-stocks', async () => {
    // Single ticker mode
    if (ticker) {
      const fullTicker = ticker.includes('.ST') ? ticker : `${ticker}.ST`
      const { data, source } = await fetchFundamentals(fullTicker)

      if (!data || (!data.General?.Name && Object.keys(data.Financials?.Income_Statement?.yearly || {}).length === 0)) {
        return NextResponse.json({
          success: false,
          ticker: fullTicker,
          error: 'Could not fetch data from Yahoo or EODHD',
        }, { status: 404 })
      }

      const saved = await saveCompany(fullTicker, data, source)
      const financials = await saveFinancials(fullTicker, data, source)

      return NextResponse.json({
        success: saved,
        ticker: fullTicker,
        company: {
          name: data.General?.Name || fullTicker.replace('.ST', ''),
          sector: data.General?.Sector,
          industry: data.General?.Industry,
          revenue: data.Highlights?.RevenueTTM,
          marketCap: data.Highlights?.MarketCapitalization,
        },
        financials: financials,
        source: source,
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    const tickers = SWEDISH_TICKERS.slice(offset, offset + limit)

    if (tickers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tickers to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Rate limit: Yahoo allows ~2 req/sec to be safe
    const rateLimiter = new RateLimiter(2)
    const results: Array<{
      ticker: string
      name?: string
      success: boolean
      source?: string
      financials?: { income: boolean; balance: boolean }
      error?: string
    }> = []
    let successCount = 0
    let failCount = 0
    let incomeCount = 0
    let balanceCount = 0
    let yahooCount = 0
    let eodhCount = 0

    for (const tick of tickers) {
      await rateLimiter.wait()

      try {
        const { data, source } = await fetchFundamentals(tick)

        if (data && (data.General?.Name || Object.keys(data.Financials?.Income_Statement?.yearly || {}).length > 0)) {
          const saved = await saveCompany(tick, data, source)
          const financials = await saveFinancials(tick, data, source)

          if (saved) {
            successCount++
            if (source === 'YAHOO') yahooCount++
            else if (source === 'EODHD') eodhCount++
            if (financials.income) incomeCount++
            if (financials.balance) balanceCount++
            results.push({
              ticker: tick,
              name: data.General?.Name || tick.replace('.ST', ''),
              success: true,
              source,
              financials
            })
          } else {
            failCount++
            results.push({ ticker: tick, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ ticker: tick, success: false, error: 'Fetch failed or no data' })
        }
      } catch (error) {
        failCount++
        results.push({
          ticker: tick,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync
    await getSupabase().from('eu_sync_log').insert({
      source: 'YAHOO_FINANCE',
      country_code: 'SE',
      sync_type: 'STOCKS',
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      financials_synced: incomeCount + balanceCount,
      errors: failCount,
      last_offset: offset + tickers.length,
      details: { mode, incomeStatements: incomeCount, balanceSheets: balanceCount, fromYahoo: yahooCount, fromEODHD: eodhCount }
    })

    return NextResponse.json({
      success: true,
      source: 'YAHOO_FINANCE',
      country: 'SE',
      exchange: 'NASDAQ_STOCKHOLM',
      apiNote: 'FREE - Uses Yahoo Finance (primary) with EODHD fallback',
      summary: {
        mode,
        tickersProcessed: tickers.length,
        successCount,
        failCount,
        fromYahoo: yahooCount,
        fromEODHD: eodhCount,
        incomeStatementsSaved: incomeCount,
        balanceSheetsSaved: balanceCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        totalTickers: SWEDISH_TICKERS.length,
        nextOffset: offset + tickers.length,
      },
      results: results.slice(0, 10),
    })
  })
}
