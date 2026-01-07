/**
 * EODHD Fundamentals Sync
 * Syncs financial statements from EODHD API to Supabase
 * Supports international stocks (EU, UK, Nordic, Asia, etc.)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ''
const EODHD_BASE_URL = 'https://eodhd.com/api'

// Supabase client singleton
let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

// ============================================================================
// Types
// ============================================================================

interface SyncResult {
  success: boolean
  ticker: string
  exchange: string
  incomeStatements: number
  balanceSheets: number
  cashFlowStatements: number
  errors: string[]
  duration: number
}

interface EODHDFinancials {
  Income_Statement: {
    yearly: Record<string, EODHDIncomeStatement>
    quarterly: Record<string, EODHDIncomeStatement>
  }
  Balance_Sheet: {
    yearly: Record<string, EODHDBalanceSheet>
    quarterly: Record<string, EODHDBalanceSheet>
  }
  Cash_Flow: {
    yearly: Record<string, EODHDCashFlow>
    quarterly: Record<string, EODHDCashFlow>
  }
}

interface EODHDIncomeStatement {
  date: string
  filing_date: string
  currency_symbol: string
  totalRevenue: number | null
  costOfRevenue: number | null
  grossProfit: number | null
  totalOperatingExpenses: number | null
  sellingGeneralAdministrative: number | null
  researchDevelopment: number | null
  depreciationAndAmortization: number | null
  operatingIncome: number | null
  interestExpense: number | null
  interestIncome: number | null
  incomeBeforeTax: number | null
  incomeTaxExpense: number | null
  netIncome: number | null
  netIncomeApplicableToCommonShares: number | null
  ebit: number | null
  ebitda: number | null
}

interface EODHDBalanceSheet {
  date: string
  filing_date: string
  currency_symbol: string
  totalAssets: number | null
  totalCurrentAssets: number | null
  cashAndEquivalents: number | null
  shortTermInvestments: number | null
  inventory: number | null
  netReceivables: number | null
  propertyPlantEquipment: number | null
  goodWill: number | null
  intangibleAssets: number | null
  longTermInvestments: number | null
  nonCurrentAssetsTotal: number | null
  totalLiab: number | null
  totalCurrentLiabilities: number | null
  accountsPayable: number | null
  shortTermDebt: number | null
  longTermDebt: number | null
  longTermDebtTotal: number | null
  nonCurrentLiabilitiesTotal: number | null
  totalStockholderEquity: number | null
  commonStock: number | null
  retainedEarnings: number | null
  treasuryStock: number | null
  accumulatedOtherComprehensiveIncome: number | null
  commonStockSharesOutstanding: number | null
}

interface EODHDCashFlow {
  date: string
  filing_date: string
  currency_symbol: string
  netIncome: number | null
  depreciation: number | null
  stockBasedCompensation: number | null
  changeInWorkingCapital: number | null
  totalCashFromOperatingActivities: number | null
  capitalExpenditures: number | null
  totalCashflowsFromInvestingActivities: number | null
  totalCashFromFinancingActivities: number | null
  dividendsPaid: number | null
  salePurchaseOfStock: number | null
  netBorrowings: number | null
  beginPeriodCashFlow: number | null
  endPeriodCashFlow: number | null
  freeCashFlow: number | null
  exchangeRateChanges: number | null
  changeInCash: number | null
}

// ============================================================================
// EODHD API Client
// ============================================================================

async function fetchEODHDFundamentals(symbol: string): Promise<{
  general: Record<string, unknown>
  financials: EODHDFinancials | null
} | null> {
  try {
    const url = `${EODHD_BASE_URL}/fundamentals/${symbol}?api_token=${EODHD_API_KEY}&fmt=json`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Lician contact@lician.com' }
    })

    if (!response.ok) {
      console.error(`EODHD API error for ${symbol}: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      general: data.General || {},
      financials: data.Financials || null
    }
  } catch (error) {
    console.error(`Failed to fetch EODHD data for ${symbol}:`, error)
    return null
  }
}

// ============================================================================
// Data Mapping Functions
// ============================================================================

function mapIncomeStatement(
  ticker: string,
  exchange: string,
  data: EODHDIncomeStatement,
  periodType: 'annual' | 'quarterly'
): Record<string, unknown> {
  // For international stocks, we use ticker as the identifier (no CIK)
  const cik = `EODHD_${ticker.replace('.', '_')}`

  return {
    cik,
    ticker,
    report_period: data.date,
    fiscal_period: periodType === 'quarterly' ? 'Q' : 'FY',
    period: periodType,
    currency: data.currency_symbol || 'USD',
    revenue: data.totalRevenue,
    cost_of_revenue: data.costOfRevenue,
    gross_profit: data.grossProfit,
    operating_expense: data.totalOperatingExpenses,
    selling_general_and_administrative_expenses: data.sellingGeneralAdministrative,
    research_and_development: data.researchDevelopment,
    depreciation_and_amortization: data.depreciationAndAmortization,
    operating_income: data.operatingIncome,
    interest_expense: data.interestExpense,
    interest_income: data.interestIncome,
    income_before_tax: data.incomeBeforeTax,
    income_tax_expense: data.incomeTaxExpense,
    net_income: data.netIncome,
    net_income_common_stock: data.netIncomeApplicableToCommonShares,
    ebit: data.ebit,
    ebitda: data.ebitda,
    filing_date: data.filing_date,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }
}

function mapBalanceSheet(
  ticker: string,
  exchange: string,
  data: EODHDBalanceSheet,
  periodType: 'annual' | 'quarterly'
): Record<string, unknown> {
  const cik = `EODHD_${ticker.replace('.', '_')}`

  return {
    cik,
    ticker,
    report_period: data.date,
    fiscal_period: periodType === 'quarterly' ? 'Q' : 'FY',
    period: periodType,
    currency: data.currency_symbol || 'USD',
    total_assets: data.totalAssets,
    current_assets: data.totalCurrentAssets,
    cash_and_equivalents: data.cashAndEquivalents,
    short_term_investments: data.shortTermInvestments,
    inventory: data.inventory,
    accounts_receivable: data.netReceivables,
    non_current_assets: data.nonCurrentAssetsTotal,
    property_plant_and_equipment: data.propertyPlantEquipment,
    goodwill: data.goodWill,
    intangible_assets: data.intangibleAssets,
    investments: data.longTermInvestments,
    total_liabilities: data.totalLiab,
    current_liabilities: data.totalCurrentLiabilities,
    accounts_payable: data.accountsPayable,
    current_debt: data.shortTermDebt,
    non_current_liabilities: data.nonCurrentLiabilitiesTotal,
    long_term_debt: data.longTermDebt,
    total_debt: (data.shortTermDebt || 0) + (data.longTermDebtTotal || 0),
    shareholders_equity: data.totalStockholderEquity,
    common_stock: data.commonStock,
    retained_earnings: data.retainedEarnings,
    treasury_stock: data.treasuryStock,
    accumulated_other_comprehensive_income: data.accumulatedOtherComprehensiveIncome,
    outstanding_shares: data.commonStockSharesOutstanding,
    filing_date: data.filing_date,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }
}

function mapCashFlow(
  ticker: string,
  exchange: string,
  data: EODHDCashFlow,
  periodType: 'annual' | 'quarterly'
): Record<string, unknown> {
  const cik = `EODHD_${ticker.replace('.', '_')}`

  return {
    cik,
    ticker,
    report_period: data.date,
    fiscal_period: periodType === 'quarterly' ? 'Q' : 'FY',
    period: periodType,
    currency: data.currency_symbol || 'USD',
    net_income: data.netIncome,
    depreciation_and_amortization: data.depreciation,
    share_based_compensation: data.stockBasedCompensation,
    change_in_working_capital: data.changeInWorkingCapital,
    net_cash_flow_from_operations: data.totalCashFromOperatingActivities,
    capital_expenditure: data.capitalExpenditures,
    net_cash_flow_from_investing: data.totalCashflowsFromInvestingActivities,
    net_cash_flow_from_financing: data.totalCashFromFinancingActivities,
    dividends_paid: data.dividendsPaid,
    common_stock_repurchase: data.salePurchaseOfStock,
    debt_issuance: data.netBorrowings && data.netBorrowings > 0 ? data.netBorrowings : null,
    debt_repayment: data.netBorrowings && data.netBorrowings < 0 ? Math.abs(data.netBorrowings) : null,
    effect_of_exchange_rate_changes: data.exchangeRateChanges,
    change_in_cash_and_equivalents: data.changeInCash,
    beginning_cash_balance: data.beginPeriodCashFlow,
    ending_cash_balance: data.endPeriodCashFlow,
    free_cash_flow: data.freeCashFlow,
    filing_date: data.filing_date,
    source: 'EODHD',
    updated_at: new Date().toISOString(),
  }
}

// ============================================================================
// Main Sync Function
// ============================================================================

export async function syncEODHDFinancials(
  ticker: string,
  exchange: string
): Promise<SyncResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let incomeCount = 0
  let balanceCount = 0
  let cashFlowCount = 0

  const fullSymbol = `${ticker}.${exchange}`

  try {
    // Fetch fundamentals from EODHD
    const data = await fetchEODHDFundamentals(fullSymbol)

    if (!data || !data.financials) {
      return {
        success: false,
        ticker,
        exchange,
        incomeStatements: 0,
        balanceSheets: 0,
        cashFlowStatements: 0,
        errors: [`No financial data found for ${fullSymbol}`],
        duration: Date.now() - startTime,
      }
    }

    const { financials } = data
    const db = getSupabase()

    // Process Income Statements (yearly)
    if (financials.Income_Statement?.yearly) {
      for (const [date, stmt] of Object.entries(financials.Income_Statement.yearly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapIncomeStatement(ticker, exchange, stmt, 'annual')
        const { error } = await db
          .from('income_statements')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`Income ${date}: ${error.message}`)
        } else {
          incomeCount++
        }
      }
    }

    // Process Income Statements (quarterly)
    if (financials.Income_Statement?.quarterly) {
      for (const [date, stmt] of Object.entries(financials.Income_Statement.quarterly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapIncomeStatement(ticker, exchange, stmt, 'quarterly')
        const { error } = await db
          .from('income_statements')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`Income Q ${date}: ${error.message}`)
        } else {
          incomeCount++
        }
      }
    }

    // Process Balance Sheets (yearly)
    if (financials.Balance_Sheet?.yearly) {
      for (const [date, stmt] of Object.entries(financials.Balance_Sheet.yearly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapBalanceSheet(ticker, exchange, stmt, 'annual')
        const { error } = await db
          .from('balance_sheets')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`Balance ${date}: ${error.message}`)
        } else {
          balanceCount++
        }
      }
    }

    // Process Balance Sheets (quarterly)
    if (financials.Balance_Sheet?.quarterly) {
      for (const [date, stmt] of Object.entries(financials.Balance_Sheet.quarterly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapBalanceSheet(ticker, exchange, stmt, 'quarterly')
        const { error } = await db
          .from('balance_sheets')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`Balance Q ${date}: ${error.message}`)
        } else {
          balanceCount++
        }
      }
    }

    // Process Cash Flow Statements (yearly)
    if (financials.Cash_Flow?.yearly) {
      for (const [date, stmt] of Object.entries(financials.Cash_Flow.yearly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapCashFlow(ticker, exchange, stmt, 'annual')
        const { error } = await db
          .from('cash_flow_statements')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`CashFlow ${date}: ${error.message}`)
        } else {
          cashFlowCount++
        }
      }
    }

    // Process Cash Flow Statements (quarterly)
    if (financials.Cash_Flow?.quarterly) {
      for (const [date, stmt] of Object.entries(financials.Cash_Flow.quarterly)) {
        if (!stmt || !stmt.date) continue

        const mapped = mapCashFlow(ticker, exchange, stmt, 'quarterly')
        const { error } = await db
          .from('cash_flow_statements')
          .upsert(mapped, { onConflict: 'cik,report_period,period' })

        if (error) {
          errors.push(`CashFlow Q ${date}: ${error.message}`)
        } else {
          cashFlowCount++
        }
      }
    }

    // Log the sync
    await db.from('financial_sync_log').insert({
      sync_type: 'EODHD_TICKER',
      ticker: fullSymbol,
      status: errors.length === 0 ? 'COMPLETED' : 'PARTIAL',
      completed_at: new Date().toISOString(),
      statements_created: incomeCount + balanceCount + cashFlowCount,
      error_count: errors.length,
      error_message: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
      parameters: { source: 'EODHD', exchange }
    })

    return {
      success: errors.length === 0,
      ticker,
      exchange,
      incomeStatements: incomeCount,
      balanceSheets: balanceCount,
      cashFlowStatements: cashFlowCount,
      errors,
      duration: Date.now() - startTime,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      ticker,
      exchange,
      incomeStatements: incomeCount,
      balanceSheets: balanceCount,
      cashFlowStatements: cashFlowCount,
      errors: [...errors, errorMessage],
      duration: Date.now() - startTime,
    }
  }
}

// ============================================================================
// Batch Sync Function
// ============================================================================

export async function syncEODHDBatch(
  stocks: Array<{ ticker: string; exchange: string }>,
  options?: { delayMs?: number }
): Promise<{
  total: number
  successful: number
  failed: number
  results: SyncResult[]
}> {
  const results: SyncResult[] = []
  const delayMs = options?.delayMs || 200 // Rate limit: 5 req/sec

  for (const stock of stocks) {
    const result = await syncEODHDFinancials(stock.ticker, stock.exchange)
    results.push(result)

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  return {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}
