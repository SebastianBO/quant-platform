// SEC EDGAR Data Sync
// Orchestrates data ingestion from SEC to Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  getCompanySubmissions,
  getCompanyFacts,
  parse13FFiling,
  parseForm4Filing,
} from './client'
import {
  parseIncomeStatements,
  parseBalanceSheets,
  parseCashFlowStatements,
} from './financial-parser'
import { SyncResult, SyncOptions } from './types'

// ============================================================================
// Supabase Client Setup
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: SupabaseClient<any, any> | null = null

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
// Financial Statements Sync
// ============================================================================

/**
 * Sync financial statements for a company
 */
export async function syncCompanyFinancials(
  cik: string,
  ticker?: string,
  options?: SyncOptions
): Promise<SyncResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let itemsProcessed = 0
  let itemsCreated = 0
  let itemsUpdated = 0

  try {
    // Get company facts from SEC
    const facts = await getCompanyFacts(cik)

    // Parse all financial statements
    const incomeStatements = parseIncomeStatements(facts, ticker)
    const balanceSheets = parseBalanceSheets(facts, ticker)
    const cashFlowStatements = parseCashFlowStatements(facts, ticker)

    itemsProcessed = incomeStatements.length + balanceSheets.length + cashFlowStatements.length

    // Upsert income statements
    for (const stmt of incomeStatements) {
      const { error } = await getSupabase()
        .from('income_statements')
        .upsert(
          {
            cik: stmt.cik,
            ticker: stmt.ticker,
            report_period: stmt.reportPeriod,
            fiscal_period: stmt.fiscalPeriod,
            period: stmt.period,
            currency: stmt.currency,
            revenue: stmt.revenue,
            cost_of_revenue: stmt.costOfRevenue,
            gross_profit: stmt.grossProfit,
            operating_expense: stmt.operatingExpense,
            selling_general_and_administrative_expenses: stmt.sgaExpenses,
            research_and_development: stmt.researchAndDevelopment,
            depreciation_and_amortization: stmt.depreciationAndAmortization,
            operating_income: stmt.operatingIncome,
            interest_expense: stmt.interestExpense,
            interest_income: stmt.interestIncome,
            other_income_expense: stmt.otherIncomeExpense,
            income_before_tax: stmt.incomeBeforeTax,
            income_tax_expense: stmt.incomeTaxExpense,
            net_income: stmt.netIncome,
            net_income_common_stock: stmt.netIncomeCommonStock,
            earnings_per_share: stmt.eps,
            earnings_per_share_diluted: stmt.epsDiluted,
            dividends_per_common_share: stmt.dividendsPerShare,
            weighted_average_shares: stmt.weightedAvgShares,
            weighted_average_shares_diluted: stmt.weightedAvgSharesDiluted,
            source: 'SEC_EDGAR',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cik,report_period,period' }
        )

      if (error) {
        errors.push(`Income statement ${stmt.reportPeriod}: ${error.message}`)
      } else {
        itemsCreated++
      }
    }

    // Upsert balance sheets
    for (const stmt of balanceSheets) {
      const { error } = await getSupabase()
        .from('balance_sheets')
        .upsert(
          {
            cik: stmt.cik,
            ticker: stmt.ticker,
            report_period: stmt.reportPeriod,
            fiscal_period: stmt.fiscalPeriod,
            period: stmt.period,
            currency: stmt.currency,
            total_assets: stmt.totalAssets,
            current_assets: stmt.currentAssets,
            cash_and_equivalents: stmt.cashAndEquivalents,
            short_term_investments: stmt.shortTermInvestments,
            inventory: stmt.inventory,
            accounts_receivable: stmt.accountsReceivable,
            non_current_assets: stmt.nonCurrentAssets,
            property_plant_and_equipment: stmt.ppe,
            goodwill: stmt.goodwill,
            intangible_assets: stmt.intangibleAssets,
            investments: stmt.investments,
            total_liabilities: stmt.totalLiabilities,
            current_liabilities: stmt.currentLiabilities,
            accounts_payable: stmt.accountsPayable,
            current_debt: stmt.currentDebt,
            deferred_revenue: stmt.deferredRevenue,
            non_current_liabilities: stmt.nonCurrentLiabilities,
            long_term_debt: stmt.longTermDebt,
            total_debt: stmt.totalDebt,
            shareholders_equity: stmt.shareholdersEquity,
            common_stock: stmt.commonStock,
            retained_earnings: stmt.retainedEarnings,
            treasury_stock: stmt.treasuryStock,
            accumulated_other_comprehensive_income: stmt.accumulatedOCI,
            outstanding_shares: stmt.outstandingShares,
            source: 'SEC_EDGAR',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cik,report_period,period' }
        )

      if (error) {
        errors.push(`Balance sheet ${stmt.reportPeriod}: ${error.message}`)
      } else {
        itemsCreated++
      }
    }

    // Upsert cash flow statements
    for (const stmt of cashFlowStatements) {
      const { error } = await getSupabase()
        .from('cash_flow_statements')
        .upsert(
          {
            cik: stmt.cik,
            ticker: stmt.ticker,
            report_period: stmt.reportPeriod,
            fiscal_period: stmt.fiscalPeriod,
            period: stmt.period,
            currency: stmt.currency,
            net_income: stmt.netIncome,
            depreciation_and_amortization: stmt.depreciationAndAmortization,
            share_based_compensation: stmt.shareBasedCompensation,
            change_in_working_capital: stmt.changeInWorkingCapital,
            net_cash_flow_from_operations: stmt.netCashFromOperations,
            capital_expenditure: stmt.capitalExpenditure,
            acquisitions: stmt.acquisitions,
            purchases_of_investments: stmt.purchasesOfInvestments,
            sales_of_investments: stmt.salesOfInvestments,
            net_cash_flow_from_investing: stmt.netCashFromInvesting,
            debt_issuance: stmt.debtIssuance,
            debt_repayment: stmt.debtRepayment,
            common_stock_issuance: stmt.stockIssuance,
            common_stock_repurchase: stmt.stockRepurchase,
            dividends_paid: stmt.dividendsPaid,
            net_cash_flow_from_financing: stmt.netCashFromFinancing,
            effect_of_exchange_rate_changes: stmt.effectOfFxChanges,
            change_in_cash_and_equivalents: stmt.netChangeInCash,
            ending_cash_balance: stmt.endingCash,
            free_cash_flow: stmt.freeCashFlow,
            source: 'SEC_EDGAR',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cik,report_period,period' }
        )

      if (error) {
        errors.push(`Cash flow ${stmt.reportPeriod}: ${error.message}`)
      } else {
        itemsCreated++
      }
    }

    // Log the sync
    await getSupabase().from('financial_sync_log').insert({
      sync_type: 'TICKER',
      cik,
      ticker,
      status: errors.length === 0 ? 'COMPLETED' : 'PARTIAL',
      completed_at: new Date().toISOString(),
      filings_processed: itemsProcessed,
      statements_created: itemsCreated,
      error_count: errors.length,
      error_message: errors.length > 0 ? errors.join('; ') : null,
    })

  } catch (error) {
    errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return {
    success: errors.length === 0,
    itemsProcessed,
    itemsCreated,
    itemsUpdated,
    errors,
    duration: Date.now() - startTime,
  }
}

// ============================================================================
// 13F Institutional Holdings Sync
// ============================================================================

/**
 * Sync 13F holdings for an institutional investor
 */
export async function sync13FHoldings(
  investorCik: string,
  options?: SyncOptions
): Promise<SyncResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let itemsProcessed = 0
  let itemsCreated = 0
  let itemsUpdated = 0

  try {
    // Get company submissions to find 13F filings
    const submissions = await getCompanySubmissions(investorCik)

    // Find recent 13F-HR filings
    const filings = submissions.filings.recent
    const form13FIndices: number[] = []

    for (let i = 0; i < filings.form.length; i++) {
      if (filings.form[i] === '13F-HR' && !filings.form[i].includes('/A')) {
        form13FIndices.push(i)
        if (form13FIndices.length >= (options?.limit || 4)) break
      }
    }

    // Ensure investor exists
    await getSupabase()
      .from('institutional_investors')
      .upsert(
        {
          cik: investorCik,
          name: submissions.name,
          normalized_name: submissions.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'cik' }
      )

    // Process each 13F filing
    for (const idx of form13FIndices) {
      const accessionNumber = filings.accessionNumber[idx]
      const filingDate = filings.filingDate[idx]
      const reportDate = filings.reportDate[idx]

      itemsProcessed++

      // Check if already processed
      const { data: existing } = await getSupabase()
        .from('institutional_filings')
        .select('id, processed')
        .eq('accession_number', accessionNumber)
        .single()

      if (existing?.processed && !options?.forceRefresh) {
        continue
      }

      // Create or update filing record
      const { data: filing, error: filingError } = await getSupabase()
        .from('institutional_filings')
        .upsert(
          {
            investor_cik: investorCik,
            accession_number: accessionNumber,
            filing_date: filingDate,
            report_date: reportDate,
            form_type: '13F-HR',
            is_amendment: false,
            processed: false,
          },
          { onConflict: 'accession_number' }
        )
        .select('id')
        .single()

      if (filingError) {
        errors.push(`Filing ${accessionNumber}: ${filingError.message}`)
        continue
      }

      // Parse the 13F filing
      const parsed = await parse13FFiling(investorCik, accessionNumber)
      if (!parsed || parsed.holdings.length === 0) {
        errors.push(`Filing ${accessionNumber}: No holdings found`)
        continue
      }

      // Get CUSIP to ticker mappings
      const cusips = parsed.holdings.map(h => h.cusip)
      const { data: cusipMappings } = await getSupabase()
        .from('cusip_mappings')
        .select('cusip, ticker')
        .in('cusip', cusips)

      const cusipToTicker = new Map(cusipMappings?.map(m => [m.cusip, m.ticker]) || [])

      // Insert holdings
      const holdingsData = parsed.holdings.map(h => ({
        filing_id: filing.id,
        investor_cik: investorCik,
        cusip: h.cusip,
        ticker: cusipToTicker.get(h.cusip) || null,
        issuer_name: h.issuerName,
        title_of_class: h.titleOfClass,
        report_date: reportDate,
        shares: h.shares,
        market_value: h.value,
        share_type: h.shareType,
        price: h.shares > 0 ? h.value / h.shares : null,
        investment_discretion: h.investmentDiscretion,
        voting_sole: h.votingSole,
        voting_shared: h.votingShared,
        voting_none: h.votingNone,
        put_call: h.putCall || null,
      }))

      const { error: holdingsError } = await getSupabase()
        .from('institutional_holdings')
        .insert(holdingsData)

      if (holdingsError) {
        errors.push(`Holdings ${accessionNumber}: ${holdingsError.message}`)
      } else {
        itemsCreated += holdingsData.length
      }

      // Mark filing as processed
      await getSupabase()
        .from('institutional_filings')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          total_value: parsed.totalValue,
          total_positions: parsed.totalPositions,
        })
        .eq('id', filing.id)

      // Update investor stats
      await getSupabase().rpc('update_investor_stats', { p_cik: investorCik })
    }

    // Calculate position changes
    await getSupabase().rpc('calculate_investor_changes', { p_investor_cik: investorCik })

    // Log sync
    await getSupabase().from('institutional_sync_log').insert({
      sync_type: 'INVESTOR',
      status: errors.length === 0 ? 'COMPLETED' : 'PARTIAL',
      completed_at: new Date().toISOString(),
      investors_processed: 1,
      filings_processed: itemsProcessed,
      holdings_processed: itemsCreated,
      error_count: errors.length,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      parameters: { investor_cik: investorCik },
    })

  } catch (error) {
    errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return {
    success: errors.length === 0,
    itemsProcessed,
    itemsCreated,
    itemsUpdated,
    errors,
    duration: Date.now() - startTime,
  }
}

// ============================================================================
// Form 4 Insider Trading Sync
// ============================================================================

/**
 * Sync Form 4 insider trades for a company
 */
export async function syncInsiderTrades(
  companyCik: string,
  ticker?: string,
  options?: SyncOptions
): Promise<SyncResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let itemsProcessed = 0
  let itemsCreated = 0
  let itemsUpdated = 0

  try {
    // Get company submissions to find Form 4 filings
    const submissions = await getCompanySubmissions(companyCik)

    // Find recent Form 4 filings
    const filings = submissions.filings.recent
    const form4Indices: number[] = []

    for (let i = 0; i < filings.form.length; i++) {
      if (filings.form[i] === '4') {
        form4Indices.push(i)
        if (form4Indices.length >= (options?.limit || 50)) break
      }
    }

    // Process each Form 4 filing
    for (const idx of form4Indices) {
      const accessionNumber = filings.accessionNumber[idx]
      const filingDate = filings.filingDate[idx]

      itemsProcessed++

      // Check if already processed
      const { data: existing } = await getSupabase()
        .from('form4_filings')
        .select('id')
        .eq('accession_number', accessionNumber)
        .single()

      if (existing && !options?.forceRefresh) {
        continue
      }

      // Parse the Form 4 filing
      const parsed = await parseForm4Filing(companyCik, accessionNumber)
      if (!parsed || parsed.transactions.length === 0) {
        continue // Skip filings with no transactions
      }

      // Ensure insider exists
      await getSupabase()
        .from('insiders')
        .upsert(
          {
            cik: parsed.ownerCik,
            name: parsed.ownerName,
            normalized_name: parsed.ownerName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cik' }
        )

      // Create or update filing record
      const { data: filing, error: filingError } = await getSupabase()
        .from('form4_filings')
        .upsert(
          {
            accession_number: accessionNumber,
            insider_cik: parsed.ownerCik,
            insider_name: parsed.ownerName,
            company_cik: companyCik,
            company_name: parsed.issuerName,
            ticker: parsed.issuerTicker || ticker,
            filing_date: filingDate,
            is_director: parsed.isDirector,
            is_officer: parsed.isOfficer,
            is_ten_percent_owner: parsed.isTenPercentOwner,
            is_other: parsed.isOther,
            officer_title: parsed.officerTitle,
            processed: true,
            processed_at: new Date().toISOString(),
          },
          { onConflict: 'accession_number' }
        )
        .select('id')
        .single()

      if (filingError) {
        errors.push(`Filing ${accessionNumber}: ${filingError.message}`)
        continue
      }

      // Insert trades
      const tradesData = parsed.transactions
        .filter(t => t.transactionShares && t.transactionShares > 0)
        .map(t => ({
          filing_id: filing.id,
          accession_number: accessionNumber,
          ticker: parsed.issuerTicker || ticker,
          company_cik: companyCik,
          issuer: parsed.issuerName,
          insider_cik: parsed.ownerCik,
          name: parsed.ownerName,
          title: parsed.officerTitle,
          is_board_director: parsed.isDirector,
          transaction_date: t.transactionDate,
          transaction_code: t.transactionCode,
          transaction_type: getTransactionType(t.transactionCode),
          transaction_shares: t.transactionShares,
          transaction_price_per_share: t.transactionPricePerShare,
          transaction_value: t.transactionShares && t.transactionPricePerShare
            ? t.transactionShares * t.transactionPricePerShare
            : null,
          shares_owned_after_transaction: t.sharesOwnedAfterTransaction,
          security_title: t.securityTitle,
          acquired_disposed_code: t.acquiredDisposed,
          ownership_nature: t.directOrIndirect,
          indirect_ownership_explanation: t.indirectOwnershipExplanation,
          filing_date: filingDate,
        }))

      if (tradesData.length > 0) {
        const { error: tradesError } = await getSupabase()
          .from('insider_trades')
          .insert(tradesData)

        if (tradesError) {
          errors.push(`Trades ${accessionNumber}: ${tradesError.message}`)
        } else {
          itemsCreated += tradesData.length
        }
      }
    }

    // Log sync
    await getSupabase().from('insider_sync_log').insert({
      sync_type: 'TICKER',
      status: errors.length === 0 ? 'COMPLETED' : 'PARTIAL',
      completed_at: new Date().toISOString(),
      filings_processed: itemsProcessed,
      trades_created: itemsCreated,
      error_count: errors.length,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      parameters: { company_cik: companyCik, ticker },
    })

  } catch (error) {
    errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return {
    success: errors.length === 0,
    itemsProcessed,
    itemsCreated,
    itemsUpdated,
    errors,
    duration: Date.now() - startTime,
  }
}

// Helper function to get transaction type from code
function getTransactionType(code: string): string {
  const types: Record<string, string> = {
    P: 'Buy',
    S: 'Sell',
    A: 'Grant',
    D: 'Disposition',
    F: 'Tax Payment',
    M: 'Exercise',
    C: 'Conversion',
    G: 'Gift',
  }
  return types[code] || 'Other'
}

// ============================================================================
// Bulk Sync Functions
// ============================================================================

/**
 * Sync all data for a ticker
 */
export async function syncTicker(ticker: string): Promise<{
  financials: SyncResult
  insiderTrades: SyncResult
}> {
  // First, look up CIK from ticker
  // For now, use a hardcoded mapping or search
  const tickerToCik: Record<string, string> = {
    AAPL: '320193',
    MSFT: '789019',
    GOOGL: '1652044',
    AMZN: '1018724',
    NVDA: '1045810',
    TSLA: '1318605',
    META: '1326801',
    BRK: '1067983',
    JPM: '19617',
    V: '1403161',
    // Add more as needed
  }

  const cik = tickerToCik[ticker.toUpperCase()]
  if (!cik) {
    return {
      financials: { success: false, itemsProcessed: 0, itemsCreated: 0, itemsUpdated: 0, errors: [`Unknown ticker: ${ticker}`], duration: 0 },
      insiderTrades: { success: false, itemsProcessed: 0, itemsCreated: 0, itemsUpdated: 0, errors: [`Unknown ticker: ${ticker}`], duration: 0 },
    }
  }

  const financials = await syncCompanyFinancials(cik, ticker)
  const insiderTrades = await syncInsiderTrades(cik, ticker)

  return { financials, insiderTrades }
}

/**
 * Sync top institutional holders
 */
export async function syncTopInstitutions(limit: number = 20): Promise<SyncResult[]> {
  const topInvestors = [
    '102909', // Vanguard
    '1364742', // BlackRock
    '93751', // State Street
    '315066', // FMR (Fidelity)
    '1067983', // Berkshire Hathaway
    '19617', // JPMorgan
    '895421', // Morgan Stanley
    '886982', // Goldman Sachs
    '1423053', // Citadel
    '1350694', // Bridgewater
    '1037389', // Renaissance
    '1179392', // Two Sigma
    '1029160', // Soros
    '1336528', // Pershing Square
    '1167483', // Tiger Global
    '1040273', // Third Point
    '1048445', // Elliott
    '1510199', // D.E. Shaw
    '1582202', // Norges Bank
    '909012', // T. Rowe Price
  ].slice(0, limit)

  const results: SyncResult[] = []

  for (const cik of topInvestors) {
    const result = await sync13FHoldings(cik)
    results.push(result)

    // Rate limit: wait 1 second between investors
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}
