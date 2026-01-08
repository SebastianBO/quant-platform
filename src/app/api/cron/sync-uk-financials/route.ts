import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync UK Financial Statements from Companies House
// Uses Filing History API to get accounts filings
// For bulk data: download from https://download.companieshouse.gov.uk/en_accountsdata.html

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || ''

const API_BASE = 'https://api.company-information.service.gov.uk'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface UKFilingData {
  companyNumber: string
  filingDate: string
  accountingPeriodEnd: string
  accountsType: string
}

interface UKFinancials {
  companyNumber: string
  periodEnd: string
  // Income Statement (from iXBRL)
  turnover?: number
  grossProfit?: number
  operatingProfit?: number
  profitBeforeTax?: number
  taxExpense?: number
  profitAfterTax?: number
  // Balance Sheet
  fixedAssets?: number
  currentAssets?: number
  totalAssets?: number
  shareholdersFunds?: number
  totalLiabilities?: number
  netAssets?: number
  // Additional
  employees?: number
  dividends?: number
}

// Make authenticated request to Companies House API
async function apiRequest(endpoint: string): Promise<any | null> {
  if (!COMPANIES_HOUSE_API_KEY) {
    return null
  }

  try {
    const auth = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64')

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      }
    })

    if (response.status === 429) {
      return { rateLimited: true }
    }

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed:`, error)
    return null
  }
}

// Get filing history for a company
async function getFilingHistory(companyNumber: string): Promise<UKFilingData[]> {
  const data = await apiRequest(`/company/${companyNumber}/filing-history?category=accounts`)
  if (!data || data.rateLimited || !data.items) return []

  return data.items
    .filter((item: any) => item.category === 'accounts')
    .slice(0, 5) // Last 5 years of accounts
    .map((item: any) => ({
      companyNumber,
      filingDate: item.date,
      accountingPeriodEnd: item.description_values?.made_up_date || item.date,
      accountsType: item.type,
    }))
}

// Get company profile with accounts info
async function getCompanyAccounts(companyNumber: string): Promise<any | null> {
  const data = await apiRequest(`/company/${companyNumber}`)
  if (!data || data.rateLimited) return null

  return {
    companyNumber: data.company_number,
    companyName: data.company_name,
    accounts: data.accounts,
    lastAccounts: data.accounts?.last_accounts,
    nextDue: data.accounts?.next_due,
  }
}

// Parse simple accounts data from profile (basic financials)
function extractBasicFinancials(accountsInfo: any): Partial<UKFinancials> | null {
  if (!accountsInfo?.lastAccounts) return null

  return {
    companyNumber: accountsInfo.companyNumber,
    periodEnd: accountsInfo.lastAccounts.made_up_to,
    // Most detailed financials require parsing the iXBRL document
    // This provides basic metadata
  }
}

// Save financials to EU tables
async function saveUKFinancials(companyNumber: string, periodEnd: string, financials: Partial<UKFinancials>): Promise<boolean> {
  const reportPeriod = periodEnd
  const fiscalYear = parseInt(periodEnd.split('-')[0])

  // Only save if we have meaningful data
  const hasIncomeData = financials.turnover || financials.profitBeforeTax || financials.profitAfterTax
  const hasBalanceData = financials.totalAssets || financials.shareholdersFunds

  if (hasIncomeData) {
    const incomeRecord = {
      org_number: companyNumber,
      country_code: 'GB',
      report_period: reportPeriod,
      fiscal_year: fiscalYear,
      period: 'annual',
      currency: 'GBP',
      revenue: financials.turnover,
      gross_profit: financials.grossProfit,
      operating_profit: financials.operatingProfit,
      profit_before_tax: financials.profitBeforeTax,
      income_tax_expense: financials.taxExpense,
      profit_for_the_year: financials.profitAfterTax,
      source: 'COMPANIES_HOUSE',
      updated_at: new Date().toISOString(),
    }

    await getSupabase()
      .from('eu_income_statements')
      .upsert(incomeRecord, { onConflict: 'org_number,country_code,report_period,period' })
  }

  if (hasBalanceData) {
    const balanceRecord = {
      org_number: companyNumber,
      country_code: 'GB',
      report_period: reportPeriod,
      fiscal_year: fiscalYear,
      period: 'annual',
      currency: 'GBP',
      non_current_assets: financials.fixedAssets,
      current_assets: financials.currentAssets,
      total_assets: financials.totalAssets,
      total_equity: financials.shareholdersFunds,
      total_liabilities: financials.totalLiabilities,
      source: 'COMPANIES_HOUSE',
      updated_at: new Date().toISOString(),
    }

    await getSupabase()
      .from('eu_balance_sheets')
      .upsert(balanceRecord, { onConflict: 'org_number,country_code,report_period,period' })
  }

  return !!(hasIncomeData || hasBalanceData)
}

// Get companies from eu_companies that need financials
async function getCompaniesNeedingFinancials(limit: number, offset: number): Promise<string[]> {
  const { data: companies, error } = await getSupabase()
    .from('eu_companies')
    .select('org_number')
    .eq('country_code', 'GB')
    .order('revenue_latest', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error || !companies) return []

  return companies.map(c => c.org_number)
}

// FTSE 100 + Notable UK companies
const PRIORITY_COMPANIES = [
  '00102498', // Shell
  '02017060', // Unilever
  '00445790', // HSBC
  '02191894', // BP
  '00968721', // Barclays
  '00109535', // BAE Systems
  '00059163', // GSK
  '07796015', // AstraZeneca UK
  '00095527', // Rio Tinto
  '00074219', // Rolls-Royce
  '00151188', // Diageo
  '00214436', // BT Group
  '00020329', // Lloyds
  '00236882', // Aviva
  '00958850', // RELX
  '00896073', // National Grid
  '00086124', // Tesco
  '00111876', // Sainsbury
  '00519110', // M&S
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const companyNumber = searchParams.get('company')
  const mode = searchParams.get('mode') || 'priority'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  if (!COMPANIES_HOUSE_API_KEY) {
    return NextResponse.json({
      error: 'Companies House API key not configured',
      setup: 'Get free API key from https://developer.company-information.service.gov.uk/',
      bulkDataAlternative: {
        description: 'For bulk financial data, download XBRL files directly',
        dailyUrl: 'https://download.companieshouse.gov.uk/en_accountsdata.html',
        monthlyUrl: 'https://download.companieshouse.gov.uk/en_monthlyaccountsdata.html',
        format: 'iXBRL/XBRL containing full financial statements',
        size: '~100MB per day, ~1GB per month',
      }
    }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-uk-financials', async () => {
    // Single company mode
    if (companyNumber) {
      const accountsInfo = await getCompanyAccounts(companyNumber)
      const filings = await getFilingHistory(companyNumber)

      if (!accountsInfo) {
        return NextResponse.json({
          success: false,
          companyNumber,
          error: 'Could not fetch company from Companies House',
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        companyNumber,
        companyName: accountsInfo.companyName,
        lastAccounts: accountsInfo.lastAccounts,
        nextAccountsDue: accountsInfo.nextDue,
        recentFilings: filings.slice(0, 3),
        note: 'Full financial data requires parsing iXBRL documents from bulk download',
        bulkDataUrl: 'https://download.companieshouse.gov.uk/en_accountsdata.html',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode - get filing info for companies
    let companyNumbers: string[]

    if (mode === 'priority') {
      companyNumbers = PRIORITY_COMPANIES.slice(offset, offset + limit)
    } else {
      companyNumbers = await getCompaniesNeedingFinancials(limit, offset)
    }

    if (companyNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to process',
        mode,
        duration: Date.now() - startTime,
      })
    }

    const rateLimiter = new RateLimiter(2) // 600 req/5min = 2/sec
    const results: Array<{
      companyNumber: string
      companyName?: string
      lastAccountsDate?: string
      success: boolean
    }> = []
    let successCount = 0

    for (const num of companyNumbers) {
      await rateLimiter.wait()

      try {
        const accountsInfo = await getCompanyAccounts(num)

        if (accountsInfo) {
          results.push({
            companyNumber: num,
            companyName: accountsInfo.companyName,
            lastAccountsDate: accountsInfo.lastAccounts?.made_up_to,
            success: true
          })
          successCount++
        } else {
          results.push({ companyNumber: num, success: false })
        }
      } catch (error) {
        results.push({ companyNumber: num, success: false })
      }
    }

    return NextResponse.json({
      success: true,
      source: 'COMPANIES_HOUSE',
      country: 'GB',
      summary: {
        mode,
        companiesProcessed: companyNumbers.length,
        successCount,
        duration: Date.now() - startTime,
      },
      note: 'Full financial statements require parsing iXBRL from bulk download',
      bulkData: {
        dailyUrl: 'https://download.companieshouse.gov.uk/en_accountsdata.html',
        monthlyUrl: 'https://download.companieshouse.gov.uk/en_monthlyaccountsdata.html',
        pythonParser: 'pip install stream-read-xbrl',
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + limit,
      },
      results: results.slice(0, 10),
    })
  })
}
