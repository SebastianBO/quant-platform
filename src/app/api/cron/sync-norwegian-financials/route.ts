import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'
import { logger } from '@/lib/logger'

// Sync Norwegian Financial Statements from Regnskapsregisteret (FREE!)
// API: https://data.brreg.no/regnskapsregisteret/regnskap/
// Contains full income statements, balance sheets for Norwegian companies

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const API_BASE = 'https://data.brreg.no/regnskapsregisteret/regnskap'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface NorwegianFinancials {
  orgNumber: string
  year: number
  currency: string
  // Income Statement
  operatingRevenue?: number
  operatingExpenses?: number
  operatingProfit?: number
  financeIncome?: number
  financeExpenses?: number
  profitBeforeTax?: number
  taxExpense?: number
  netIncome?: number
  // Balance Sheet - Assets
  fixedAssets?: number
  currentAssets?: number
  totalAssets?: number
  // Balance Sheet - Equity & Liabilities
  equity?: number
  retainedEarnings?: number
  longTermDebt?: number
  shortTermDebt?: number
  totalDebt?: number
  totalEquityAndLiabilities?: number
  // Metadata
  isAudited?: boolean
  accountingStandard?: string
}

// Fetch financial statements from Regnskapsregisteret
async function fetchFinancials(orgNumber: string): Promise<NorwegianFinancials | null> {
  try {
    const cleanOrg = orgNumber.replace(/\s/g, '')
    if (cleanOrg.length !== 9) return null

    const response = await fetch(`${API_BASE}/${cleanOrg}`, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (response.status === 404) {
      // No financials available for this company
      return null
    }

    if (response.status === 429) {
      logger.warn('Regnskapsregisteret rate limited')
      return null
    }

    if (!response.ok) {
      logger.info('Regnskapsregisteret returned error', { status: response.status, orgNumber })
      return null
    }

    const data = await response.json()

    // The API returns an array directly, get the latest year
    const regnskap = Array.isArray(data) ? data[0] : data
    if (!regnskap || !regnskap.regnskapsperiode) return null

    const period = regnskap.regnskapsperiode
    const result = regnskap.resultatregnskapResultat || {}
    const balance = regnskap.eiendeler || {} // Assets
    const equityDebt = regnskap.egenkapitalGjeld || {} // Equity & Liabilities

    return {
      orgNumber: cleanOrg,
      year: parseInt(period.fraDato?.split('-')[0] || period.tilDato?.split('-')[0]),
      currency: regnskap.valuta || 'NOK',
      // Income Statement (IFRS terminology)
      operatingRevenue: result.driftsresultat?.driftsinntekter?.sumDriftsinntekter,
      operatingExpenses: result.driftsresultat?.driftskostnad?.sumDriftskostnad,
      operatingProfit: result.driftsresultat?.driftsresultat,
      financeIncome: result.finansresultat?.finansinntekt?.sumFinansinntekter,
      financeExpenses: result.finansresultat?.finanskostnad?.sumFinanskostnad,
      profitBeforeTax: result.ordinaertResultatFoerSkattekostnad,
      taxExpense: result.skattekostnadOrdinaertResultat,
      netIncome: result.aarsresultat,
      // Balance Sheet - Assets
      fixedAssets: balance.anleggsmidler?.sumAnleggsmidler,
      currentAssets: balance.omloepsmidler?.sumOmloepsmidler,
      totalAssets: balance.sumEiendeler,
      // Balance Sheet - Equity & Liabilities
      equity: equityDebt.egenkapital?.sumEgenkapital,
      retainedEarnings: equityDebt.egenkapital?.opptjentEgenkapital?.sumOpptjentEgenkapital,
      longTermDebt: equityDebt.gjeldOversikt?.langsiktigGjeld?.sumLangsiktigGjeld,
      shortTermDebt: equityDebt.gjeldOversikt?.kortsiktigGjeld?.sumKortsiktigGjeld,
      totalDebt: equityDebt.gjeldOversikt?.sumGjeld,
      totalEquityAndLiabilities: equityDebt.sumEgenkapitalGjeld,
      // Metadata
      isAudited: regnskap.revispilogrupsjon?.revipilogrupsjon === 'fullpilosjon',
      accountingStandard: regnskap.regnskapstype,
    }
  } catch (error) {
    logger.error('Error fetching financials', { orgNumber, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Save financials to EU tables
async function saveFinancials(financials: NorwegianFinancials): Promise<{ income: boolean; balance: boolean }> {
  const reportPeriod = `${financials.year}-12-31`

  // Save Income Statement
  const incomeRecord = {
    org_number: financials.orgNumber,
    country_code: 'NO',
    report_period: reportPeriod,
    fiscal_year: financials.year,
    period: 'annual',
    currency: financials.currency,
    // IFRS format fields
    revenue: financials.operatingRevenue,
    operating_profit: financials.operatingProfit,
    finance_income: financials.financeIncome,
    finance_costs: financials.financeExpenses,
    profit_before_tax: financials.profitBeforeTax,
    income_tax_expense: financials.taxExpense,
    profit_for_the_year: financials.netIncome,
    // Source
    source: 'REGNSKAPSREGISTERET',
    updated_at: new Date().toISOString(),
  }

  const { error: incomeError } = await getSupabase()
    .from('eu_income_statements')
    .upsert(incomeRecord, {
      onConflict: 'org_number,country_code,report_period,period',
      ignoreDuplicates: false
    })

  // Save Balance Sheet
  const balanceRecord = {
    org_number: financials.orgNumber,
    country_code: 'NO',
    report_period: reportPeriod,
    fiscal_year: financials.year,
    period: 'annual',
    currency: financials.currency,
    // IFRS format fields
    non_current_assets: financials.fixedAssets,
    current_assets: financials.currentAssets,
    total_assets: financials.totalAssets,
    total_equity: financials.equity,
    retained_earnings: financials.retainedEarnings,
    non_current_liabilities: financials.longTermDebt,
    current_liabilities: financials.shortTermDebt,
    total_liabilities: financials.totalDebt,
    // Source
    source: 'REGNSKAPSREGISTERET',
    updated_at: new Date().toISOString(),
  }

  const { error: balanceError } = await getSupabase()
    .from('eu_balance_sheets')
    .upsert(balanceRecord, {
      onConflict: 'org_number,country_code,report_period,period',
      ignoreDuplicates: false
    })

  if (incomeError) logger.error('Income save error', { orgNumber: financials.orgNumber, error: incomeError.message })
  if (balanceError) logger.error('Balance save error', { orgNumber: financials.orgNumber, error: balanceError.message })

  return {
    income: !incomeError,
    balance: !balanceError
  }
}

// Get companies from eu_companies that need financials
async function getCompaniesNeedingFinancials(limit: number, offset: number): Promise<string[]> {
  // Get Norwegian companies from eu_companies
  const { data: companies, error } = await getSupabase()
    .from('eu_companies')
    .select('org_number')
    .eq('country_code', 'NO')
    .order('revenue_latest', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error || !companies) {
    logger.error('Failed to get companies', { error: error?.message })
    return []
  }

  return companies.map(c => c.org_number)
}

// Major Norwegian companies to prioritize
const PRIORITY_COMPANIES = [
  '923609016', // Equinor
  '910747711', // DNB
  '976389387', // Telenor
  '985985325', // Norsk Hydro
  '911382008', // Orkla
  '966748085', // Yara International
  '923470298', // Mowi
  '991681086', // Aker BP
  '977041545', // Kongsberg Gruppen
  '960216687', // Storebrand
  '982463718', // Subsea 7
  '988375218', // Schibsted
  '983373804', // TGS-NOPEC
  '812656272', // SalMar
  '980007460', // Veidekke
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orgNumber = searchParams.get('org')
  const mode = searchParams.get('mode') || 'priority' // 'priority', 'continue', 'all'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-norwegian-financials', async () => {
    // Single company mode
    if (orgNumber) {
      const financials = await fetchFinancials(orgNumber)

      if (!financials) {
        return NextResponse.json({
          success: false,
          orgNumber,
          error: 'Could not fetch financials from Regnskapsregisteret',
        }, { status: 404 })
      }

      const saved = await saveFinancials(financials)

      return NextResponse.json({
        success: saved.income || saved.balance,
        orgNumber: financials.orgNumber,
        year: financials.year,
        financials: {
          revenue: financials.operatingRevenue,
          operatingProfit: financials.operatingProfit,
          netIncome: financials.netIncome,
          totalAssets: financials.totalAssets,
          equity: financials.equity,
        },
        saved,
        source: 'REGNSKAPSREGISTERET',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let orgNumbers: string[]

    if (mode === 'priority') {
      orgNumbers = PRIORITY_COMPANIES.slice(offset, offset + limit)
    } else if (mode === 'continue') {
      orgNumbers = await getCompaniesNeedingFinancials(limit, offset)
    } else {
      // 'all' mode - get from existing eu_companies
      orgNumbers = await getCompaniesNeedingFinancials(limit, offset)
    }

    if (orgNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync financials for',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Rate limit: be respectful (2 req/sec)
    const rateLimiter = new RateLimiter(2)
    const results: Array<{
      orgNumber: string
      year?: number
      success: boolean
      error?: string
    }> = []
    let successCount = 0
    let failCount = 0
    let incomeCount = 0
    let balanceCount = 0

    for (const org of orgNumbers) {
      await rateLimiter.wait()

      try {
        const financials = await fetchFinancials(org)

        if (financials) {
          const saved = await saveFinancials(financials)

          if (saved.income || saved.balance) {
            successCount++
            if (saved.income) incomeCount++
            if (saved.balance) balanceCount++
            results.push({
              orgNumber: org,
              year: financials.year,
              success: true
            })
          } else {
            failCount++
            results.push({ orgNumber: org, success: false, error: 'Save failed' })
          }
        } else {
          // No financials available (could be new company or non-reporting)
          results.push({ orgNumber: org, success: false, error: 'No financials available' })
          failCount++
        }
      } catch (error) {
        failCount++
        results.push({
          orgNumber: org,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync
    await getSupabase().from('eu_sync_log').insert({
      source: 'REGNSKAPSREGISTERET',
      country_code: 'NO',
      sync_type: 'FINANCIALS',
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      financials_synced: successCount,
      errors: failCount,
      last_offset: offset + orgNumbers.length,
      details: { mode, incomeStatements: incomeCount, balanceSheets: balanceCount }
    })

    return NextResponse.json({
      success: true,
      source: 'REGNSKAPSREGISTERET',
      country: 'NO',
      apiNote: 'FREE - Full financial statements!',
      summary: {
        mode,
        companiesProcessed: orgNumbers.length,
        successCount,
        failCount,
        incomeStatementsSaved: incomeCount,
        balanceSheetsSaved: balanceCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + orgNumbers.length,
      },
      results: results.slice(0, 10),
    })
  })
}
